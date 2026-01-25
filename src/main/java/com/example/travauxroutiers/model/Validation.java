package com.example.travauxroutiers.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Validation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "signalement_id", nullable = false, unique = true)
    @JsonIgnore
    private Signalement signalement;

    @ManyToOne(optional = false)
    @JoinColumn(name = "validation_status_id")
    private ValidationStatus status;

    @ManyToOne
    @JoinColumn(name = "validated_by_id")
    private User validatedBy;

    private LocalDateTime validatedAt;

    @Column(columnDefinition = "TEXT")
    private String note;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Signalement getSignalement() { return signalement; }
    public void setSignalement(Signalement signalement) { this.signalement = signalement; }
    public ValidationStatus getStatus() { return status; }
    public void setStatus(ValidationStatus status) { this.status = status; }
    public User getValidatedBy() { return validatedBy; }
    public void setValidatedBy(User validatedBy) { this.validatedBy = validatedBy; }
    public LocalDateTime getValidatedAt() { return validatedAt; }
    public void setValidatedAt(LocalDateTime validatedAt) { this.validatedAt = validatedAt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
