package com.example.travauxroutiers.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ValidationHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "validation_id")
    @JsonIgnore
    private Validation validation;

    @ManyToOne
    @JoinColumn(name = "changed_by_id")
    private User changedBy;

    private LocalDateTime changedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "from_status_id")
    private ValidationStatus fromStatus;

    @ManyToOne
    @JoinColumn(name = "to_status_id")
    private ValidationStatus toStatus;

    @Column(columnDefinition = "TEXT")
    private String note;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Validation getValidation() { return validation; }
    public void setValidation(Validation validation) { this.validation = validation; }
    public User getChangedBy() { return changedBy; }
    public void setChangedBy(User changedBy) { this.changedBy = changedBy; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
    public ValidationStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(ValidationStatus fromStatus) { this.fromStatus = fromStatus; }
    public ValidationStatus getToStatus() { return toStatus; }
    public void setToStatus(ValidationStatus toStatus) { this.toStatus = toStatus; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
