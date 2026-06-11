package com.rehan.journalApp.service;

import com.rehan.journalApp.entity.User;
import com.rehan.journalApp.repository.JournalEntryRepository;
import com.rehan.journalApp.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Arrays;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void registerUser(User user){
        user.setRoles(Arrays.asList("USER"));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public void registerAdmin(User user){
        user.setRoles(Arrays.asList("USER","ADMIN"));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    // For internal updates (like linking journal entries)
    public void saveUser(User user) {
        userRepository.save(user); // Saves directly without re-encoding!
    }

    // Safely update user profile
    public void updateUser(String currentUserName, User updatedFields) {
        User existingUser = userRepository.findByUserName(currentUserName);

        if (existingUser != null) {
            // 1. If they specified a new, non-empty username, update it
            if (updatedFields.getUserName() != null && !updatedFields.getUserName().isEmpty()) {
                existingUser.setUserName(updatedFields.getUserName().trim());
            }

            // 2. Only encode if a new password was actually passed in the request
            if (updatedFields.getPassword() != null
                    && !updatedFields.getPassword().isEmpty()
                    && !updatedFields.getPassword().startsWith("UNCHANGED__")) {
                existingUser.setPassword(passwordEncoder.encode(updatedFields.getPassword()));
            }

            // 3. Map the sentiment analysis checkbox preference
            existingUser.setSentimentAnalysis(updatedFields.isSentimentAnalysis());

            userRepository.save(existingUser);
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUserById(ObjectId id) {
        userRepository.deleteById(id);
    }

    @Transactional
    public void deleteByUserName(String userName) {
        User user = userRepository.findByUserName(userName);
        if (user != null) {
            // 1. Wipe out all the actual journal entry documents first
            if (user.getJournalEntries() != null && !user.getJournalEntries().isEmpty()) {
                journalEntryRepository.deleteAll(user.getJournalEntries());
            }
            // 2. Now delete the user document safely
            userRepository.deleteByUserName(userName);
        }
    }

    public User findUserName(String userName) {
        return userRepository.findByUserName(userName);
    }
}