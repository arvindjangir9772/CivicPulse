package com.civicpulse.config;

import com.civicpulse.model.Department;
import com.civicpulse.model.Role;
import com.civicpulse.model.User;
import com.civicpulse.repository.DepartmentRepository;
import com.civicpulse.repository.UserRepository;
import com.civicpulse.repository.ComplaintRepository;
import com.civicpulse.repository.FeedbackRepository;
import com.civicpulse.repository.ComplaintLogRepository;
import com.civicpulse.model.Complaint;
import com.civicpulse.model.Feedback;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;  

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired
    UserRepository userRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    @Autowired
    ComplaintRepository complaintRepository;

    @Autowired
    FeedbackRepository feedbackRepository;

    @Autowired
    ComplaintLogRepository complaintLogRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (departmentRepository.count() == 0) {
            departmentRepository.save(
                    new Department(null, "Roads & Highways", "Handles potholes, damaged roads, and pathway issues."));
            departmentRepository.save(new Department(null, "Sanitation & Waste",
                    "Handles garbage collection, drainage, and waste management."));
            departmentRepository.save(new Department(null, "Water & Electricity",
                    "Handles water supply disruption and street lighting issues."));
            logger.info("Seeded initial departments.");
        }

        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@civicpulse.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);

            User worker = new User();
            worker.setName("John Worker");
            worker.setEmail("worker@civicpulse.com");
            worker.setPassword(passwordEncoder.encode("worker123"));
            worker.setRole(Role.WORKER);
            worker.setDepartment(departmentRepository.findByName("Roads & Highways").orElse(null));
            userRepository.save(worker);

            User citizen = new User();
            citizen.setName("Jane Citizen");
            citizen.setEmail("citizen@civicpulse.com");
            citizen.setPassword(passwordEncoder.encode("citizen123"));
            citizen.setRole(Role.USER);
            userRepository.save(citizen);

            logger.info("Seeded initial users (Admin, Worker, Citizen).");
        }

        seedComplaintsAndFeedback();
    }

    private void seedComplaintsAndFeedback() {
        if (complaintRepository.count() > 0)
            return;

        User citizen = userRepository.findByEmail("citizen@civicpulse.com").orElse(null);
        User worker = userRepository.findByEmail("worker@civicpulse.com").orElse(null);
        Department roads = departmentRepository.findByName("Roads & Highways").orElse(null);
        Department sanitation = departmentRepository.findByName("Sanitation & Waste").orElse(null);

        if (citizen == null || roads == null)
            return;

        // 1. Resolved Complaint with Feedback
        Complaint c1 = new Complaint();
        c1.setUser(citizen);
        c1.setDepartment(roads);
        c1.setWorker(worker);
        c1.setCategory("Pothole");
        c1.setDescription("Large pothole near the main square, causing traffic issues.");
        c1.setStatus(Complaint.Status.RESOLVED);
        c1.setPriority(Complaint.Priority.MEDIUM);
        c1.setResolutionNote("Filled with asphalt and leveled.");
        c1.setCreatedAt(LocalDateTime.now().minusDays(5));
        c1.setResolvedAt(LocalDateTime.now().minusDays(1));
        complaintRepository.save(c1);

        Feedback f1 = new Feedback();
        f1.setComplaint(c1);
        f1.setUser(citizen);
        f1.setRating(5);
        f1.setComments("Fast and clean resolution. Thank you!");
        feedbackRepository.save(f1);

        // 2. Critical/Stale Complaint (for Escalation engine demo)
        Complaint c2 = new Complaint();
        c2.setUser(citizen);
        c2.setDepartment(roads);
        c2.setCategory("Road Damage");
        c2.setDescription("Danger: Bridge railing broken on 5th avenue.");
        c2.setStatus(Complaint.Status.OPEN);
        c2.setPriority(Complaint.Priority.HIGH); // Will escalate to CRITICAL
        c2.setCreatedAt(LocalDateTime.now().minusDays(10));
        complaintRepository.save(c2);

        // 3. In Progress Complaint
        Complaint c3 = new Complaint();
        c3.setUser(citizen);
        c3.setDepartment(sanitation);
        c3.setCategory("Garbage");
        c3.setDescription("Garbage truck missed our block for two weeks.");
        c3.setStatus(Complaint.Status.IN_PROGRESS);
        c3.setPriority(Complaint.Priority.MEDIUM);
        c3.setCreatedAt(LocalDateTime.now().minusDays(2));
        complaintRepository.save(c3);

        logger.info("Seeded mock complaints and feedback.");
    }
}
