package com.rehan.journalApp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.rehan.journalApp.api.response.WeatherResponse;
import com.rehan.journalApp.entity.User;
import com.rehan.journalApp.repository.UserRepository;
import com.rehan.journalApp.service.UserService;
import com.rehan.journalApp.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@Tag(name = "User APIs", description = "Operations for managing the authenticated user's profile")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WeatherService weatherService;

    @PutMapping
    @Operation(summary = "Update Profile", description = "Update the username or password for the currently authenticated user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User profile updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found in database")
    })
    public ResponseEntity<?> updateUser(@RequestBody User user){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();

        User userInDb = userService.findUserName(userName);
        if (userInDb == null) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
        userInDb.setUserName(user.getUserName());
        userInDb.setPassword(user.getPassword());

        userService.registerUser(userInDb);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping
    @Operation(summary = "Delete Account", description = "Permanently delete the authenticated user's account and associated data.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Account deleted successfully")
    })
    public ResponseEntity<?> deleteUserById(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        userRepository.deleteByUserName(userName);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping
    @Operation(summary = "Get Greeting & Weather", description = "Returns a personalized greeting message including current weather data for the user's location (Solapur).")
    @ApiResponse(responseCode = "200", description = "Greeting fetched successfully")
    public ResponseEntity<?> greeting(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        String greeting="";
        WeatherResponse weatherResponse = weatherService.getWeather("Solapur", "no");
        if (weatherResponse!=null){
            greeting = ", weather feels like "+ weatherResponse.getCurrent().getFeelslikeC() +" degree C.";
        }
        return new ResponseEntity<>("Hi " + userName + greeting ,HttpStatus.OK);
    }

}
