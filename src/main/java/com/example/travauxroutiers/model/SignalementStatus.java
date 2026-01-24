package com.example.travauxroutiers.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class SignalementStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "signalement_id")
    private Signalement signalement;

    @ManyToOne(optional = false)
    @JoinColumn(name = "status_id")
    private Status status;

    @ManyToOne
    @JoinColumn(name = "changed_by")
    private User changedBy;

    @Column(name = "date_status")
    private LocalDateTime dateStatus = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String comment;

    // ...getters/setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Signalement getSignalement() { return signalement; }
    public void setSignalement(Signalement signalement) { this.signalement = signalement; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public User getChangedBy() { return changedBy; }
    public void setChangedBy(User changedBy) { this.changedBy = changedBy; }
    public LocalDateTime getDateStatus() { return dateStatus; }
    public void setDateStatus(LocalDateTime dateStatus) { this.dateStatus = dateStatus; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
