package com.rehan.journalApp.service;

import com.rehan.journalApp.enums.Sentiment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class SentimentAiService {

    private static final Logger log = LoggerFactory.getLogger(SentimentAiService.class);
    private final ChatClient chatClient;

    public SentimentAiService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public Sentiment analyzeSentiment(String content) {
        // Strict system prompt to ensure it only returns the exact ENUM strings
        String prompt = "Read the following journal entry and classify the emotion. " +
                "You MUST respond with EXACTLY one of these four words, nothing else: " +
                "HAPPY, SAD, ANGRY, ANXIOUS. \n\nEntry: " + content;

        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            // Clean the AI response and convert it to your Enum
            String cleanResponse = response.replaceAll("[^a-zA-Z]", "").toUpperCase();
            return Sentiment.valueOf(cleanResponse);

        } catch (Exception e) {
            log.error("AI Sentiment Analysis failed. Defaulting to HAPPY.", e);
            return Sentiment.HAPPY; // Safe fallback if the API times out
        }
    }

    public String generateWeeklyReport(String username, String compiledJournalEntries) {
        String prompt = "You are a modern, minimalist UX-focused mental health dashboard widget analyzing a user's weekly journal entries.\n" +
                "Your goal is to write a hyper-concise, visually clean weekly summary. Users hate long paragraphs. Use short, punchy sentences (max 12 words per line).\n\n" +
                "Follow this EXACT structure and format, including the emojis. Do not add intro/outro fluff:\n\n" +
                "📊 WEEKLY VIBE CHECK\n" +
                "• Overarching Mood: [Insert exactly 3 descriptive words, e.g., Overwhelmed, Resilient, Hopeful]\n" +
                "• Weekly Outlook: [Insert exactly 1 short sentence summarizing the emotional trend]\n\n" +
                "🔍 KEY EMOTIONAL DRIVERS\n" +
                "• ⚠️ [Stress Trigger]: [Brief 5-10 word note about what caused anxiety/anger]\n" +
                "• ✨ [Joy Trigger]: [Brief 5-10 word note about what brought happiness]\n" +
                "• 🔄 [Habit/Trend]: [Brief 5-10 word note about sleep, routines, or recurring thoughts]\n\n" +
                "🌱 MINDSET SHIFT FOR NEXT WEEK\n" +
                "• [Insert a single, powerful 2-sentence piece of actionable validation or advice for " + username + "]\n\n" +
                "Strict Rule: Keep the entire response under 100-120 words. Absolutely no long paragraphs.";

        try {
            return chatClient.prompt()
                    .user(prompt + "\n\nHere are the journal entries:\n" + compiledJournalEntries)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Failed to generate weekly AI report for user: " + username, e);
            return "📊 WEEKLY VIBE CHECK\n• Mood: Status Unknown\n• Outlook: Could not reach the AI server. Try checking back later!";
        }
    }
}