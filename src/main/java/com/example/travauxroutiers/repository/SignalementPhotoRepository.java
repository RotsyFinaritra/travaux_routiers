package com.example.travauxroutiers.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.travauxroutiers.model.SignalementPhoto;

public interface SignalementPhotoRepository extends JpaRepository<SignalementPhoto, Long> {
    List<SignalementPhoto> findBySignalementId(Long signalementId);

    void deleteBySignalementId(Long signalementId);
}
