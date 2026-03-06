package com.civicpulse.controller;

import com.civicpulse.model.Complaint;
import com.civicpulse.model.Feedback;
import com.civicpulse.repository.ComplaintRepository;
import com.civicpulse.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

        @Autowired
        private ComplaintRepository complaintRepository;

        @Autowired
        private FeedbackRepository feedbackRepository;

        @Autowired
        private com.civicpulse.repository.UserRepository userRepository;

        @GetMapping("/analytics")
        public ResponseEntity<?> getAnalytics() {
                // ... (keep existing code)
                List<Complaint> allComplaints = complaintRepository.findAll();
                List<Feedback> allFeedback = feedbackRepository.findAll();

                long totalComplaints = allComplaints.size();
                long openComplaints = allComplaints.stream().filter(c -> c.getStatus() == Complaint.Status.OPEN)
                                .count();
                long inProgressComplaints = allComplaints.stream()
                                .filter(c -> c.getStatus() == Complaint.Status.IN_PROGRESS).count();
                long resolvedComplaints = allComplaints.stream().filter(c -> c.getStatus() == Complaint.Status.RESOLVED)
                                .count();

                long criticalIssues = allComplaints.stream().filter(c -> c.getPriority() == Complaint.Priority.CRITICAL)
                                .count();
                long highIssues = allComplaints.stream().filter(c -> c.getPriority() == Complaint.Priority.HIGH)
                                .count();

                double averageRating = allFeedback.stream()
                                .mapToInt(Feedback::getRating)
                                .average()
                                .orElse(0.0);

                Map<String, Object> stats = new HashMap<>();
                stats.put("total", totalComplaints);
                stats.put("open", openComplaints);
                stats.put("in_progress", inProgressComplaints);
                stats.put("resolved", resolvedComplaints);
                stats.put("critical_issues", criticalIssues);
                stats.put("high_issues", highIssues);
                stats.put("average_rating", averageRating);
                stats.put("total_feedback", allFeedback.size());

                // Return raw array for heatmap/list mapping
                stats.put("complaints", allComplaints);
                stats.put("feedback", allFeedback);

                return ResponseEntity.ok(stats);
        }

        @GetMapping("/users")
        public ResponseEntity<?> getAllUsers() {
                return ResponseEntity.ok(userRepository.findAll());
        }
}
