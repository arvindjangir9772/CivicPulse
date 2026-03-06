package com.civicpulse.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import com.civicpulse.model.Complaint;

@Data
public class ComplaintDto {
    private Long id;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private Double latitude;
    private Double longitude;

    private String imageUrl;

    private Complaint.Status status;
    private Complaint.Priority priority;

    private Long departmentId;
    private Long workerId;
    private String workerName;

    private String resolutionNote;
    private String resolutionImageUrl;
}
