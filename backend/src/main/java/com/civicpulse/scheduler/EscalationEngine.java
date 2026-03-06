package com.civicpulse.scheduler;

import com.civicpulse.model.Complaint;
import com.civicpulse.model.ComplaintLog;
import com.civicpulse.model.User;
import com.civicpulse.repository.ComplaintLogRepository;
import com.civicpulse.repository.ComplaintRepository;
import com.civicpulse.repository.UserRepository;
import com.civicpulse.model.Notification;
import com.civicpulse.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class EscalationEngine {

    private static final Logger logger = LoggerFactory.getLogger(EscalationEngine.class);

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ComplaintLogRepository complaintLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Value("${escalation.thresholdDays:3}")
    private int thresholdDays;

    @Scheduled(cron = "${escalation.cron}")
    @Transactional
    public void runEscalationCheck() {
        System.out.println("DEBUG: Escalation Check Triggered at " + LocalDateTime.now());
        logger.info("Escalation Engine executing: Checking for stale complaints...");

        LocalDateTime thresholdDate = LocalDateTime.now().minusDays(thresholdDays);

        List<Complaint> staleComplaints = complaintRepository.findByStatusNotInAndCreatedAtBefore(
                List.of(Complaint.Status.RESOLVED), thresholdDate);

        User systemAdmin = userRepository.findByEmail("admin@civicpulse.com").orElse(null);

        for (Complaint c : staleComplaints) {
            // Increase Priority logically
            if (c.getPriority() == Complaint.Priority.LOW) {
                c.setPriority(Complaint.Priority.MEDIUM);
            } else if (c.getPriority() == Complaint.Priority.MEDIUM) {
                c.setPriority(Complaint.Priority.HIGH);
            } else if (c.getPriority() == Complaint.Priority.HIGH) {
                c.setPriority(Complaint.Priority.CRITICAL);
            } else {
                continue; // Already Critical
            }

            complaintRepository.save(c);

            // Log Escalation Action
            ComplaintLog log = new ComplaintLog();
            log.setComplaint(c);
            log.setPerformer(systemAdmin);
            log.setAction("ESCALATED");
            log.setNotes("Threshold crossed! Priority increased automatically by Escalation Engine. thresholdDays="
                    + thresholdDays);
            complaintLogRepository.save(log);

            logger.warn("ESCALATION ALERT: Complaint ID {} in Department [{}] has been elevated to {} priority!",
                    c.getId(),
                    c.getDepartment() != null ? c.getDepartment().getName() : "Unassigned",
                    c.getPriority());

            // Notify Admin
            notificationRepository.save(new Notification(systemAdmin, "System Escalation",
                    "Complaint #" + c.getId() + " has been escalated to " + c.getPriority(), "ESCALATION", c.getId()));

            // Notify User
            notificationRepository.save(new Notification(c.getUser(), "Urgency Increased",
                    "Your report #" + c.getId() + " status was escalated due to delay.", "ESCALATION", c.getId()));

            // email mock
            logger.info("Sending mock email to administrators regarding Complaint ID {}...", c.getId());
        }
        logger.info("Escalation Engine execution complete. Processed {} complaints.", staleComplaints.size());
    }
}
