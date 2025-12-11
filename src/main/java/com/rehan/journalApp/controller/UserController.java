package com.rehan.journalApp.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import com.rehan.journalApp.api.response.WeatherResponse;
import com.rehan.journalApp.entity.User;
import com.rehan.journalApp.repostiory.UserRepository;
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
@Tag(name = "User APIs", description = "Read, Update & Delete User")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WeatherService weatherService;

    @PutMapping
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
    public ResponseEntity<?> deleteUserById(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        userRepository.deleteByUserName(userName);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping
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
