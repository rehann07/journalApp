package com.rehan.journalApp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.rehan.journalApp.cache.AppCache;
import com.rehan.journalApp.entity.User;
import com.rehan.journalApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@Tag(name = "Admin APIs", description = "Administrative operations for user management and system maintenance")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private AppCache appCache;

    @GetMapping("/all-users")
    @Operation(summary = "Get all users", description = "Retrieve a list of all registered users in the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Users fetched successfully"),
            @ApiResponse(responseCode = "404", description = "No users found in database")
    })
    public ResponseEntity<?> getAllUsers(){
        List<User> allUsers = userService.getAllUsers();
        if (allUsers!=null && !allUsers.isEmpty()){
            return new ResponseEntity<>(allUsers, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/create-admin-user")
    @Operation(summary = "Create Admin", description = "Register a new user with administrative privileges.")
    @ApiResponse(responseCode = "200", description = "Admin user created successfully")
    public void createUser(@RequestBody User user){
        userService.registerAdmin(user);
    }

    @GetMapping("clear-app-cache")
    @Operation(summary = "Clear App Cache", description = "Force a re-initialization of the in-memory application cache (e.g., configuration settings).")
    @ApiResponse(responseCode = "200", description = "Cache cleared and re-initialized")
    public void clearAppCache(){
        appCache.init();
    }

}
