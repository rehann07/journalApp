package com.rehan.journalApp.scheduler;

import com.rehan.journalApp.entity.JournalEntry;
import com.rehan.journalApp.entity.User;
import com.rehan.journalApp.enums.Sentiment;
import com.rehan.journalApp.model.SentimentData;
import com.rehan.journalApp.repository.UserRepositoryImpl;
import com.rehan.journalApp.service.EmailService;
import com.rehan.journalApp.service.SentimentAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserScheduler {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepositoryImpl userRepository;

    @Autowired
    private SentimentAiService sentimentAiService;

    @Autowired
    private KafkaTemplate<String,SentimentData> kafkaTemplate;

    @Scheduled(cron = "0 0 9 * * SUN")
    public void fetchUsersAndSendSaMail() {
        List<User> users = userRepository.getUserForSA();

        for (User user : users) {
            List<JournalEntry> journalEntries = user.getJournalEntries();

            // 1. Filter out only the journal entries written in the last 7 days
            List<JournalEntry> weeklyEntries = journalEntries.stream()
                    .filter(entry -> entry.getDate().isAfter(LocalDateTime.now().minus(7, ChronoUnit.DAYS)))
                    .collect(Collectors.toList());

            // 2. If the user didn't write anything this week, don't burn AI tokens or send an empty email
            if (weeklyEntries.isEmpty()) {
                continue;
            }

            // 3. Concatenate all journal text contents into a single block of text
            String compiledWeeklyText = weeklyEntries.stream()
                    .map(entry -> "- " + entry.getContent())
                    .collect(Collectors.joining("\n\n"));

            // 4. Send the compiled text block to Groq to generate a deep emotional synthesis
            String aiWeeklySummaryReport = sentimentAiService.generateWeeklyReport(user.getUserName(), compiledWeeklyText);

            // 5. Package the AI response and ship it to your Kafka ecosystem
            if (aiWeeklySummaryReport != null && !aiWeeklySummaryReport.isEmpty()) {
                SentimentData sentimentData = new SentimentData();
                sentimentData.setEmail(user.getEmail());
                sentimentData.setSentiment(aiWeeklySummaryReport);

                try {
                    kafkaTemplate.send("weekly-sentiments", sentimentData.getEmail(), sentimentData);
                } catch (Exception e) {
                    // Fallback to sending direct email if Kafka breaks
                    emailService.sendEmail(
                            sentimentData.getEmail(),
                            "Your Weekly AI Mindset & Sentiment Synthesis",
                            sentimentData.getSentiment()
                    );
                }
            }
        }
    }

}
