package com.example.travauxroutiers.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

@Entity
public class Signalement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "status_id")
    private Status status;

    @ManyToOne
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "date_signalement")
    private LocalDateTime dateSignalement = LocalDateTime.now();

    @Column(name = "surface_area", precision = 10, scale = 2)
    private BigDecimal surfaceArea;

    @Column(precision = 15, scale = 2)
    private BigDecimal budget;

    @OneToMany(mappedBy = "signalement", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<SignalementPhoto> photos = new ArrayList<>();

    @Column(name = "firebase_doc_id", unique = true, length = 64)
    private String firebaseDocId;
    
    @Column(name = "user_uid", length = 128)
    private String userUid;

    @OneToOne(mappedBy = "signalement", cascade = CascadeType.ALL)
    private Validation validation;

    // ...getters/setters...
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

    /**
     * Ajoute une photo au signalement et établit la relation bidirectionnelle.
     */
    public void addPhoto(SignalementPhoto photo) {
        photos.add(photo);
        photo.setSignalement(this);
    }

    /**
     * Supprime une photo du signalement.
     */
    public void removePhoto(SignalementPhoto photo) {
        photos.remove(photo);
        photo.setSignalement(null);
    }

    /**
     * Remplace toutes les photos par une nouvelle liste d'URLs.
     */
    public void replacePhotoUrls(List<String> urls) {
        this.photos.clear();
        if (urls != null) {
            for (String url : urls) {
                if (url != null && !url.isBlank()) {
                    addPhoto(new SignalementPhoto(url));
                }
            }
        }
    }

    public String getFirebaseDocId() {
        return firebaseDocId;
    }

    public void setFirebaseDocId(String firebaseDocId) {
        this.firebaseDocId = firebaseDocId;
    }
    
    public String getUserUid() {
        return userUid;
    }
    
    public void setUserUid(String userUid) {
        this.userUid = userUid;
    }

    public Validation getValidation() {
        return validation;
    }

    public void setValidation(Validation validation) {
        this.validation = validation;
    }

    // Méthode pour compatibilité avec les statistiques
    public LocalDateTime getCreatedAt() {
        return dateSignalement;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.dateSignalement = createdAt;
    }
}
