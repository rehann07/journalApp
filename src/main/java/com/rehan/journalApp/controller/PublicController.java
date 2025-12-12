package com.rehan.journalApp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.rehan.journalApp.dto.UserDTO;
import com.rehan.journalApp.entity.User;
import com.rehan.journalApp.repository.UserRepository;
import com.rehan.journalApp.service.UserDetailsServiceImpl;
import com.rehan.journalApp.service.UserService;
import com.rehan.journalApp.utils.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public")
@Tag(name = "Public APIs", description = "Endpoints for user registration, login, and application health checks")
public class PublicController {

    private static final Logger log = LoggerFactory.getLogger(PublicController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/health-check")
    @Operation(summary = "Health Check", description = "Simple endpoint to verify if the server is running.")
    public String health(){
        log.info("Health is ok !");
        return  "Ok";
    }

    @PostMapping("/signup")
    @Operation(summary = "Register New User", description = "Creates a new user account with username, password, and email preferences.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Username already exists or invalid input")
    })
    public ResponseEntity<UserDTO> signUp(@RequestBody UserDTO user){
        try {
            User newUser = new User();
            newUser.setEmail(user.getEmail());
            newUser.setUserName(user.getUserName());
            newUser.setPassword(user.getPassword());
            newUser.setSentimentAnalysis(user.isSentimentAnalysis());
            userService.registerUser(newUser);
            return new ResponseEntity<>(user, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates a user and returns a JSON Web Token (JWT).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful, returns Bearer Token"),
            @ApiResponse(responseCode = "400", description = "Invalid username or password")
    })
    public ResponseEntity<String> login(@RequestBody User user) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUserName(), user.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            String jwt = jwtUtil.generateToken(userDetails.getUsername());
            return new ResponseEntity<>(jwt, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Exception occurred while createAuthenticationToken ", e);
            e.printStackTrace();
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

}
