package com.rehan.journalApp.service;

import com.rehan.journalApp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class UserServiceTests {

    @Autowired
    UserRepository userRepository;

    @Test
    public void testAdd(){
        assertEquals(10,4+6);
    }

    @BeforeEach
    public void setUp(){
        System.out.println("Before each");
    }

    @Disabled
    @Test
    public void testFindByUserName(){
        assertNotNull(userRepository.findByUserName("rehan"));
    }

    @ParameterizedTest
    @CsvSource({
            "1,1,2",
            "10,5,15",
            "3,3,6"
    })
    public void test(int a,int b,int expected){
        assertEquals(expected,a+b);
    }
}
