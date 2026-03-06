package com.civicpulse.repository;

import com.civicpulse.model.ComplaintLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintLogRepository extends JpaRepository<ComplaintLog, Long> {
    List<ComplaintLog> findByComplaintIdOrderByTimestampDesc(Long complaintId);
}
