package com.rehan.journalApp.controller;

import com.rehan.journalApp.service.GoogleAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/auth/google")
public class GoogleAuthController {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthController.class);

    @Autowired
    private GoogleAuthService googleAuthService;

    @GetMapping("/callback")
    public ResponseEntity<Map<String, String>> handleGoogleCallback(@RequestParam String code) {
        try {
            String jwtToken = googleAuthService.processGoogleLogin(code);

            return ResponseEntity.ok(Collections.singletonMap("token", jwtToken));

        } catch (RuntimeException e) {
            // Handle known business errors (e.g., Google refused connection)
            log.error("Authentication failed: ", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Authentication failed"));

        } catch (Exception e) {
            // Handle unexpected system errors
            log.error("Unexpected error during Google Auth", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An unexpected error occurred"));
        }
    }
}
