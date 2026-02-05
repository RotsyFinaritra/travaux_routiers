package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.SignalementPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignalementPhotoRepository extends JpaRepository<SignalementPhoto, Long> {
    
    /**
     * Trouver toutes les photos d'un signalement donné
     */
    List<SignalementPhoto> findBySignalementId(Long signalementId);
    
    /**
     * Compter le nombre de photos d'un signalement
     */
    long countBySignalementId(Long signalementId);
    
    /**
     * Supprimer toutes les photos d'un signalement
     */
    void deleteBySignalementId(Long signalementId);
    
    /**
     * Vérifier si une photo existe par son URL
     */
    boolean existsByPhotoUrl(String photoUrl);
    
    /**
     * Trouver une photo par son URL
     */
    SignalementPhoto findByPhotoUrl(String photoUrl);
}