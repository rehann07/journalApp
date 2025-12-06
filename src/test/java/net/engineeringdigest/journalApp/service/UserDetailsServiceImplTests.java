package net.engineeringdigest.journalApp.service;

import net.engineeringdigest.journalApp.entity.User;
import net.engineeringdigest.journalApp.repostiory.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;

import static org.mockito.Mockito.*;
import org.springframework.boot.test.mock.mockito.MockBean;

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
