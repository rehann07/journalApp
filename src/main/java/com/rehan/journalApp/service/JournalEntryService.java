package com.rehan.journalApp.service;

import com.rehan.journalApp.entity.JournalEntry;
import com.rehan.journalApp.entity.User;
import com.rehan.journalApp.repostiory.JournalEntryRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class JournalEntryService {
    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public void saveEntry(JournalEntry journalEntry,String userName){
        try {
            User user = userService.findUserName(userName);
            journalEntry.setDate(LocalDateTime.now());
            JournalEntry save = journalEntryRepository.save(journalEntry);
            user.getJournalEntries().add(save);
            userService.updateUser(user);
        } catch (Exception e) {
            System.out.println("Error while saving entry !");
            throw new RuntimeException(e);
        }

    }

    public void saveEntry(JournalEntry journalEntry){
        journalEntryRepository.save(journalEntry);
    }

    @Transactional
    public boolean deleteJournalEntryById(ObjectId id, String userName) {
        boolean removed = false;
        try {
            User user = userService.findUserName(userName);
            removed = user.getJournalEntries().removeIf(x->x.getId().equals(id));
            if (removed){
                userService.updateUser(user);
                journalEntryRepository.deleteById(id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error occurred while deleting entry ");
        }
        return removed;
    }

    public Optional<JournalEntry> findById(ObjectId myId) {
        return journalEntryRepository.findById(myId);
    }

}

//controller --> service --> repository