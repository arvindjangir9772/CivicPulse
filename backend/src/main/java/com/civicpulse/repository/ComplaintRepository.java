package com.civicpulse.repository;

import com.civicpulse.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserId(Long userId);

    List<Complaint> findByWorkerId(Long workerId);

    List<Complaint> findByDepartmentId(Long departmentId);

    List<Complaint> findByStatus(Complaint.Status status);

    // For escalation engine: Find open/in_progress complaints created before a
    // certain threshold
    List<Complaint> findByStatusNotInAndCreatedAtBefore(List<Complaint.Status> statuses, LocalDateTime date);
}
