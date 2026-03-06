package com.civicpulse.controller;

import com.civicpulse.dto.MessageResponse;
import com.civicpulse.model.Complaint;
import com.civicpulse.model.Feedback;
import com.civicpulse.model.User;
import com.civicpulse.repository.ComplaintRepository;
import com.civicpulse.repository.FeedbackRepository;
import com.civicpulse.repository.UserRepository;
import com.civicpulse.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    @PostMapping("/{complaintId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> submitFeedback(@PathVariable Long complaintId, @RequestBody Map<String, Object> payload) {
        User user = getCurrentUser();
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Error: Complaint not found."));

        // Only the user who filed the complaint can give feedback
        if (!complaint.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403)
                    .body(new MessageResponse("Error: Unauthorized. Only the reporter can provide feedback."));
        }

        // Only resolved complaints can have feedback
        if (complaint.getStatus() != Complaint.Status.RESOLVED) {
            return ResponseEntity.status(400)
                    .body(new MessageResponse("Error: Feedback can only be provided for resolved complaints."));
        }

        // Check if feedback already exists
        if (feedbackRepository.findByComplaintId(complaintId).isPresent()) {
            return ResponseEntity.status(400)
                    .body(new MessageResponse("Error: Feedback already submitted for this complaint."));
        }

        Feedback feedback = new Feedback();
        feedback.setComplaint(complaint);
        feedback.setUser(user);
        feedback.setRating((int) payload.get("rating"));
        feedback.setComments((String) payload.get("comments"));
        feedback.setCreatedAt(LocalDateTime.now());

        feedbackRepository.save(feedback);

        return ResponseEntity.ok(new MessageResponse("Feedback submitted successfully!"));
    }

    @GetMapping("/{complaintId}")
    public ResponseEntity<?> getFeedback(@PathVariable Long complaintId) {
        return feedbackRepository.findByComplaintId(complaintId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllFeedback() {
        return ResponseEntity.ok(feedbackRepository.findAll());
    }
}
