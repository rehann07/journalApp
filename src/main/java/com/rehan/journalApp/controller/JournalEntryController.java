package com.rehan.journalApp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.rehan.journalApp.entity.JournalEntry;
import com.rehan.journalApp.entity.User;
import com.rehan.journalApp.service.JournalEntryService;
import com.rehan.journalApp.service.UserService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/journal")
@Tag(name = "Journal APIs", description = "CRUD operations for managing journal entries")
public class JournalEntryController {

    @Autowired
    private JournalEntryService journalEntryService;

    @Autowired
    private UserService userService;

    @GetMapping
    @Operation(summary = "Get all entries", description = "Fetch all journal entries associated with the currently authenticated user.")
    @ApiResponse(responseCode = "200", description = "Entries fetched successfully")
    public ResponseEntity<?> getAllEntriesOfUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findUserName(userName);
        List<JournalEntry> entries = user.getJournalEntries();
        if (entries != null && !entries.isEmpty()) {
            return new ResponseEntity<>(entries, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    @Operation(summary = "Create a new entry", description = "Save a new journal entry to the database and link it to the user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Entry created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    public ResponseEntity<?> createEntry(@RequestBody JournalEntry myEntry) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userName = authentication.getName();
            journalEntryService.saveEntry(myEntry, userName);
            return new ResponseEntity<>(myEntry, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("id/{myId}")
    @Operation(summary = "Get entry by ID", description = "Fetch a specific journal entry by its unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Entry found"),
            @ApiResponse(responseCode = "404", description = "Entry not found or does not belong to user")
    })
    public ResponseEntity<?> getJournalEntryById(
            @Parameter(description = "The ID of the journal entry", example = "60d5ec9af682fbd39a1b8b9d")
            @PathVariable String myId) {
        ObjectId objectId = new ObjectId(myId);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findUserName(userName);
        List<JournalEntry> collect = user.getJournalEntries().stream().filter(x -> x.getId().equals(objectId)).collect(Collectors.toList());
        if (!collect.isEmpty()) {
            Optional<JournalEntry> journalEntry = journalEntryService.findById(objectId);
            if (journalEntry.isPresent()) {
                return new ResponseEntity<>(journalEntry.get(), HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("id/{myId}")
    @Operation(summary = "Delete entry by ID", description = "Delete a specific journal entry. Returns 204 No Content on success.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Entry not found")
    })
    public ResponseEntity<?> deleteJournalEntryById(
            @Parameter(description = "The ID of the entry to delete") @PathVariable ObjectId myId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        boolean removed = journalEntryService.deleteJournalEntryById(myId, userName);
        if (removed) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/id/{myId}")
    @Operation(summary = "Update entry by ID", description = "Modify the title or content of an existing journal entry.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Entry updated successfully"),
            @ApiResponse(responseCode = "404", description = "Entry not found")
    })
    public ResponseEntity<?> updateJournalEntryById(
            @Parameter(description = "The ID of the entry to update") @PathVariable ObjectId myId,
            @RequestBody JournalEntry newEntry) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findUserName(userName);
        List<JournalEntry> collect = user.getJournalEntries().stream().filter(x -> x.getId().equals(myId)).collect(Collectors.toList());
        if (!collect.isEmpty()) {
            Optional<JournalEntry> journalEntry = journalEntryService.findById(myId);
            if (journalEntry.isPresent()) {
                JournalEntry old = journalEntry.get();
                old.setTitle(newEntry.getTitle() != null && !newEntry.getTitle().equals("") ? newEntry.getTitle() : old.getTitle());
                old.setContent(newEntry.getContent() != null && !newEntry.getContent().equals("") ? newEntry.getContent() : old.getContent());
                journalEntryService.saveEntry(old);
                return new ResponseEntity<>(journalEntry.get(), HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}