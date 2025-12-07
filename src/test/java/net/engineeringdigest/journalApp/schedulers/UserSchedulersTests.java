package net.engineeringdigest.journalApp.schedulers;

import net.engineeringdigest.journalApp.scheduler.UserScheduler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class UserSchedulersTests {

    @Autowired
    private UserScheduler userScheduler;

    @Test
    public void testFetchUsersAndSendSaEmail(){
        userScheduler.fetchUsersAndSendSaMail();
    }
}
