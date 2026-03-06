package com.civicpulse.controller;

import com.civicpulse.dto.ComplaintDto;
import com.civicpulse.dto.MessageResponse;
import com.civicpulse.model.*;
import com.civicpulse.repository.*;
import com.civicpulse.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.civicpulse.service.FileStorageService;
import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    ComplaintRepository complaintRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    @Autowired
    ComplaintLogRepository complaintLogRepository;

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    FileStorageService fileStorageService;

    // Helper to get logged-in user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    // Auto-detect priority simple logic based on keywords
    private Complaint.Priority detectPriority(String description) {
        if (description == null)
            return Complaint.Priority.LOW;
        String lowerDesc = description.toLowerCase();
        if (lowerDesc.contains("critical") || lowerDesc.contains("danger") || lowerDesc.contains("accident")
                || lowerDesc.contains("emergency")) {
            return Complaint.Priority.CRITICAL;
        } else if (lowerDesc.contains("water") || lowerDesc.contains("electricity") || lowerDesc.contains("urgent")
                || lowerDesc.contains("fire")) {
            return Complaint.Priority.HIGH;
        } else if (lowerDesc.contains("pothole") || lowerDesc.contains("garbage") || lowerDesc.contains("leak")) {
            return Complaint.Priority.MEDIUM;
        }
        return Complaint.Priority.LOW;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('USER') or hasRole('WORKER')")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String path = fileStorageService.save(file);
            return ResponseEntity.ok(new MessageResponse(path));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Could not upload file: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createComplaint(@Valid @RequestBody ComplaintDto complaintDto) {
        User user = getCurrentUser();

        Complaint complaint = new Complaint();
        complaint.setUser(user);
        complaint.setDescription(complaintDto.getDescription());
        complaint.setCategory(complaintDto.getCategory());
        complaint.setLatitude(complaintDto.getLatitude());
        complaint.setLongitude(complaintDto.getLongitude());
        complaint.setImageUrl(complaintDto.getImageUrl());

        // Auto-assign priority based on description keywords
        complaint.setPriority(detectPriority(complaintDto.getDescription()));

        if (complaintDto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(complaintDto.getDepartmentId()).orElse(null);
            complaint.setDepartment(dept);
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Log action
        ComplaintLog log = new ComplaintLog();
        log.setComplaint(savedComplaint);
        log.setPerformer(user);
        log.setAction("CREATED");
        log.setNotes("Complaint submitted by citizen.");
        complaintLogRepository.save(log);

        // Create notification for admin
        userRepository.findByRole(Role.ADMIN).forEach(admin -> {
            notificationRepository.save(new Notification(admin, "New Report",
                    "A new report has been filed: " + savedComplaint.getCategory(), "NEW_REPORT",
                    savedComplaint.getId()));
        });

        return ResponseEntity.ok(savedComplaint);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyComplaints() {
        User user = getCurrentUser();
        List<Complaint> complaints = complaintRepository.findByUserId(user.getId());
        return ResponseEntity.ok(complaints);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WORKER')")
    public ResponseEntity<?> getAllComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category) {
        List<Complaint> complaints = complaintRepository.findAll();

        if (status != null && !status.isEmpty()) {
            complaints = complaints.stream().filter(c -> c.getStatus().name().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }
        if (priority != null && !priority.isEmpty()) {
            complaints = complaints.stream().filter(c -> c.getPriority().name().equalsIgnoreCase(priority))
                    .collect(Collectors.toList());
        }
        if (category != null && !category.isEmpty()) {
            complaints = complaints.stream().filter(c -> c.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/worker")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> getWorkerComplaints() {
        User worker = getCurrentUser();
        List<Complaint> complaints = complaintRepository.findByWorkerId(worker.getId());
        return ResponseEntity.ok(complaints);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('WORKER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody ComplaintDto updateRequest) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Complaint not found."));

        User actor = getCurrentUser();

        if (updateRequest.getStatus() != null) {
            complaint.setStatus(updateRequest.getStatus());
            if (updateRequest.getStatus() == Complaint.Status.RESOLVED) {
                complaint.setResolvedAt(LocalDateTime.now());
                if (updateRequest.getResolutionNote() != null) {
                    complaint.setResolutionNote(updateRequest.getResolutionNote());
                }
                if (updateRequest.getResolutionImageUrl() != null) {
                    complaint.setResolutionImageUrl(updateRequest.getResolutionImageUrl());
                }
            }
        }

        // Auto assign to the worker who is updating it to IN_PROGRESS (if not assigned)
        if (complaint.getStatus() == Complaint.Status.IN_PROGRESS && complaint.getWorker() == null
                && actor.getRole() == Role.WORKER) {
            complaint.setWorker(actor);
        }

        Complaint updatedComplaint = complaintRepository.save(complaint);

        // create log
        ComplaintLog log = new ComplaintLog();
        log.setComplaint(updatedComplaint);
        log.setPerformer(actor);
        log.setAction("STATUS_UPDATED");
        String notes = "Status changed to: " + updatedComplaint.getStatus();
        if (updatedComplaint.getStatus() == Complaint.Status.RESOLVED && updatedComplaint.getResolutionNote() != null) {
            notes += ". Resolution: " + updatedComplaint.getResolutionNote();
        }
        log.setNotes(notes);
        complaintLogRepository.save(log);

        // Notify User
        notificationRepository.save(new Notification(updatedComplaint.getUser(), "Status Updated",
                "Your report #" + updatedComplaint.getId() + " is now "
                        + updatedComplaint.getStatus().name().replace("_", " "),
                "STATUS_CHANGE", updatedComplaint.getId()));

        return ResponseEntity.ok(new MessageResponse("Complaint status updated."));
    }

    @PutMapping("/{id}/assign/{workerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignWorker(@PathVariable Long id, @PathVariable Long workerId) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Complaint not found."));

        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Error: Worker not found."));

        if (worker.getRole() != Role.WORKER) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User is not a worker."));
        }

        complaint.setWorker(worker);
        complaint.setStatus(Complaint.Status.IN_PROGRESS); // Auto transition to in progress when assigned

        Complaint updatedComplaint = complaintRepository.save(complaint);

        User actor = getCurrentUser();

        // create log
        ComplaintLog log = new ComplaintLog();
        log.setComplaint(updatedComplaint);
        log.setPerformer(actor);
        log.setAction("ASSIGNED");
        log.setNotes("Assigned to worker: " + worker.getName());
        complaintLogRepository.save(log);

        // Notify Worker
        notificationRepository.save(new Notification(worker, "New Assignment",
                "You have been assigned to report #" + updatedComplaint.getId(),
                "ASSIGNMENT", updatedComplaint.getId()));

        return ResponseEntity.ok(new MessageResponse("Worker assigned successfully."));
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<?> getComplaintLogs(@PathVariable Long id) {
        List<ComplaintLog> logs = complaintLogRepository.findByComplaintIdOrderByTimestampDesc(id);
        return ResponseEntity.ok(logs);
    }
}
