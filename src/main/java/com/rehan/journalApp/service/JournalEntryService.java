package com.rehan.journalApp.service;

import com.rehan.journalApp.entity.JournalEntry;
import com.rehan.journalApp.entity.User;
import com.rehan.journalApp.repository.JournalEntryRepository;
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

    @Autowired
    private SentimentAiService sentimentAiService;

    @Transactional
    public void saveEntry(JournalEntry journalEntry,String userName){
        try {
            User user = userService.findUserName(userName);
            journalEntry.setDate(LocalDateTime.now());
            // Only call the AI engine if the user has actively enabled sentiment analysis!
            if (user != null && user.isSentimentAnalysis()
                    && journalEntry.getContent() != null
                    && !journalEntry.getContent().isEmpty()) {

                journalEntry.setSentiment(sentimentAiService.analyzeSentiment(journalEntry.getContent()));
            }
            JournalEntry save = journalEntryRepository.save(journalEntry);
            if (user != null) {
                user.getJournalEntries().add(save);
                userService.saveUser(user);
            }
        } catch (Exception e) {
            System.out.println("Error while saving entry !");
            throw new RuntimeException(e);
        }

    }

    public void updateEntry(JournalEntry journalEntry, String userName){
        User user = userService.findUserName(userName);
        if (user != null && user.isSentimentAnalysis()
                && journalEntry.getContent() != null
                && !journalEntry.getContent().isEmpty()) {

            journalEntry.setSentiment(sentimentAiService.analyzeSentiment(journalEntry.getContent()));
        } else {
            // Clear any old sentiment tags if the user turned the preference off later
            journalEntry.setSentiment(null);
        }
        journalEntryRepository.save(journalEntry);
    }

    @Transactional
    public boolean deleteJournalEntryById(ObjectId id, String userName) {
        boolean removed = false;
        try {
            User user = userService.findUserName(userName);
            removed = user.getJournalEntries().removeIf(x->x.getId().equals(id));
            if (removed){
                userService.saveUser(user);
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