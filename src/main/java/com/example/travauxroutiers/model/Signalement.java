package com.example.travauxroutiers.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "signalement")
public class Signalement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", nullable = false)
    private Status status;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;
    
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "date_signalement")
    private LocalDateTime dateSignalement;
    
    @Column(name = "surface_area", precision = 10, scale = 2)
    private BigDecimal surfaceArea;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal budget;
    
    // Relation OneToMany avec les photos
    @OneToMany(mappedBy = "signalement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SignalementPhoto> photos = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        dateSignalement = LocalDateTime.now();
    }
    
    // Constructors
    public Signalement() {
    }
    
    // Helper methods pour gérer les photos
    public void addPhoto(SignalementPhoto photo) {
        photos.add(photo);
        photo.setSignalement(this);
    }
    
    public void removePhoto(SignalementPhoto photo) {
        photos.remove(photo);
        photo.setSignalement(null);
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Status getStatus() {
        return status;
    }
    
    public void setStatus(Status status) {
        this.status = status;
    }
    
    public Entreprise getEntreprise() {
        return entreprise;
    }
    
    public void setEntreprise(Entreprise entreprise) {
        this.entreprise = entreprise;
    }
    
    public BigDecimal getLatitude() {
        return latitude;
    }
    
    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }
    
    public BigDecimal getLongitude() {
        return longitude;
    }
    
    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDateTime getDateSignalement() {
        return dateSignalement;
    }
    
    public void setDateSignalement(LocalDateTime dateSignalement) {
        this.dateSignalement = dateSignalement;
    }
    
    public BigDecimal getSurfaceArea() {
        return surfaceArea;
    }
    
    public void setSurfaceArea(BigDecimal surfaceArea) {
        this.surfaceArea = surfaceArea;
    }
    
    public BigDecimal getBudget() {
        return budget;
    }
    
    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }
    
    public List<SignalementPhoto> getPhotos() {
        return photos;
    }
    
    public void setPhotos(List<SignalementPhoto> photos) {
        this.photos = photos;
    }
}