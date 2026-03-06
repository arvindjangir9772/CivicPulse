package com.civicpulse.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "complaint_logs")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // The user (admin or worker) who performed the action
    private User performer;

    private String action; // e.g. "CREATED", "ASSIGNED", "STATUS_UPDATED", "ESCALATED"

    @Column(length = 500)
    private String notes;

    @Column(updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
}
