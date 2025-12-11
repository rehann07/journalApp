package com.rehan.journalApp.service;

import com.rehan.journalApp.entity.User;
import com.rehan.journalApp.repostiory.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.core.userdetails.UserDetails;

import static org.mockito.Mockito.*;

import java.util.ArrayList;

//@SpringBootTest
public class UserDetailsServiceImplTests {

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setup(){
        MockitoAnnotations.initMocks(this);
    }

    @Test
    void loadByUsernameTest(){
        User mockUser = new User();
        mockUser.setUserName("rehan");
        mockUser.setPassword("inirick");
        mockUser.setRoles(new ArrayList<>());
        when(userRepository.findByUserName(ArgumentMatchers.anyString())).thenReturn(mockUser);
        UserDetails user = userDetailsService.loadUserByUsername("rehan");
        Assertions.assertNotNull(user);
    }

}
