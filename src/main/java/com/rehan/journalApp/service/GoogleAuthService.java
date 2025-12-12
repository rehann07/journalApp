package com.rehan.journalApp.service;

import com.rehan.journalApp.entity.User;
import com.rehan.journalApp.repository.UserRepository;
import com.rehan.journalApp.utils.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthService.class);
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    // Best Practice: Move external API URLs to constants or config properties
    private static final String GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USERINFO_ENDPOINT = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    // Make sure this matches exactly what you set in Google Cloud Console
    private static final String REDIRECT_URI = "https://developers.google.com/oauthplayground";

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Orchestrates the Google Login process.
     * @param code The authorization code from the frontend/Google.
     * @return A JWT token for the user.
     * @throws Exception if authentication fails.
     */
    @Transactional // Best Practice: Ensures DB consistency if saving user fails
    public String processGoogleLogin(String code) throws Exception {

        // 1. Exchange Auth Code for ID Token
        String idToken = getGoogleIdToken(code);
        if (idToken == null) {
            throw new RuntimeException("Failed to retrieve ID Token from Google");
        }

        // 2. Get User Details from ID Token
        Map<String, Object> googleUserMap = getGoogleUserInfo(idToken);
        String email = (String) googleUserMap.get("email");

        if (email == null) {
            throw new RuntimeException("Google ID Token did not contain an email address");
        }

        // 3. Find or Create User
        // Best Practice: Use repository check instead of try-catch flow control
        User user = userRepository.findByUserName(email);

        if (user == null) {
            log.info("New Google user detected: {}. Creating account...", email);
            user = createNewGoogleUser(email);
        } else {
            log.info("Existing Google user logged in: {}", email);
        }

        // 4. Generate JWT
        return jwtUtil.generateToken(user.getUserName());
    }

    private String getGoogleIdToken(String code) {
        try {
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("redirect_uri", REDIRECT_URI);
            params.add("grant_type", "authorization_code");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(GOOGLE_TOKEN_ENDPOINT, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("id_token");
            }
        } catch (Exception e) {
            log.error("Error communicating with Google Token Endpoint", e);
        }
        return null;
    }

    private Map<String, Object> getGoogleUserInfo(String idToken) {
        try {
            String url = GOOGLE_USERINFO_ENDPOINT + idToken;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Error validating Google ID Token", e);
        }
        throw new RuntimeException("Failed to validate Google ID token");
    }

    private User createNewGoogleUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setUserName(email);
        // Best Practice: secure random password for OAuth users so they can't be brute-forced via standard login
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRoles(Arrays.asList("USER"));
        return userRepository.save(user);
    }
}