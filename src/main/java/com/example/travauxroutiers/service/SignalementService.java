package com.example.travauxroutiers.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.travauxroutiers.model.Signalement;
import com.example.travauxroutiers.model.SignalementStatus;
import com.example.travauxroutiers.model.Status;
import com.example.travauxroutiers.repository.SignalementRepository;
import com.example.travauxroutiers.repository.SignalementStatusRepository;
import com.example.travauxroutiers.repository.StatusRepository;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class SignalementService implements GenericService<Signalement, Long> {
    private final SignalementRepository repo;
    private final StatusRepository statusRepository;
    private final SignalementStatusRepository signalementStatusRepository;
    private final ValidationService validationService;
    
    @Autowired(required = false)
    private PushNotificationService pushNotificationService;

    public SignalementService(SignalementRepository repo, StatusRepository statusRepository,
            SignalementStatusRepository signalementStatusRepository, ValidationService validationService) {
        this.repo = repo;
        this.statusRepository = statusRepository;
        this.signalementStatusRepository = signalementStatusRepository;
        this.validationService = validationService;
    }

    public List<Signalement> listAll() {
        return repo.findAll();
    }

    public List<Signalement> listByValidationStatusName(String statusName) {
        if (statusName == null || statusName.trim().isEmpty())
            return repo.findAll();
        return repo.findByValidationStatusName(statusName.trim().toUpperCase());
    }

    public Optional<Signalement> get(Long id) {
        return repo.findById(id);
    }

    public Signalement create(Signalement t) {
        // S'assurer que createdAt est défini
        if (t.getCreatedAt() == null) {
            t.setCreatedAt(LocalDateTime.now());
        }

        Signalement saved = repo.save(t);
        validationService.ensureForSignalement(saved);

        // Créer une entrée dans signalement_status pour le statut initial
        if (saved.getStatus() != null) {
            SignalementStatus statusEntry = SignalementStatus.createEntry(
                    saved,
                    saved.getStatus(),
                    "Création du signalement");
            signalementStatusRepository.save(statusEntry);
        }

        return saved;
    }

    public Signalement update(Long id, Signalement t) {
        return repo.findById(id).map(existing -> {
            Status oldStatus = existing.getStatus();

            if (t.getDescription() != null)
                existing.setDescription(t.getDescription());
            if (t.getLatitude() != null)
                existing.setLatitude(t.getLatitude());
            if (t.getLongitude() != null)
                existing.setLongitude(t.getLongitude());
            if (t.getStatus() != null)
                existing.setStatus(t.getStatus());
            if (t.getEntreprise() != null)
                existing.setEntreprise(t.getEntreprise());
            if (t.getSurfaceArea() != null)
                existing.setSurfaceArea(t.getSurfaceArea());
            if (t.getBudget() != null)
                existing.setBudget(t.getBudget());
            if (t.getPhotoUrl() != null)
                existing.setPhotoUrl(t.getPhotoUrl());

            Signalement updated = repo.save(existing);

            // Si le statut a changé, créer une entrée dans signalement_status
            if (t.getStatus() != null && (oldStatus == null || !oldStatus.getId().equals(t.getStatus().getId()))) {
                SignalementStatus statusEntry = SignalementStatus.createEntry(
                        updated,
                        t.getStatus(),
                        "Modification du signalement");
                signalementStatusRepository.save(statusEntry);
                
                // Send push notification if service is available
                if (pushNotificationService != null && oldStatus != null) {
                    String userUid = updated.getUserUid();
                    if (userUid != null && !userUid.isEmpty()) {
                        pushNotificationService.sendSignalementStatusChangeNotification(
                            userUid,
                            updated.getId(),
                            oldStatus.getName(),
                            t.getStatus().getName(),
                            updated.getDescription()
                        );
                    }
                }
            }

            return updated;
        }).orElseGet(() -> {
            t.setId(id);
            if (t.getCreatedAt() == null) {
                t.setCreatedAt(LocalDateTime.now());
            }
            return repo.save(t);
        });
    }

    public void delete(Long id) {
        repo.findById(id).ifPresent(signalement -> {
            // 1. Supprimer l'historique de validation s'il existe
            validationService.getBySignalement(id).ifPresent(validation -> {
                validationService.deleteValidationWithHistory(validation.getId());
            });
            
            // 2. Supprimer les entrées de signalement_status
            signalementStatusRepository.deleteBySignalementId(id);
            
            // 3. Supprimer le signalement lui-même
            repo.deleteById(id);
        });
    }

    public Signalement updateStatus(Long id, Long statusId) {
        return repo.findById(id).map(signalement -> {
            Status newStatus = statusRepository.findById(statusId)
                    .orElseThrow(() -> new RuntimeException("Status not found: " + statusId));

            Status oldStatus = signalement.getStatus();
            signalement.setStatus(newStatus);
            Signalement updated = repo.save(signalement);

            // Créer une entrée dans signalement_status pour le changement de statut
            SignalementStatus statusEntry = SignalementStatus.createEntry(
                    updated,
                    newStatus,
                    "Changement de statut via bouton rapide");
            signalementStatusRepository.save(statusEntry);
            
            // Send push notification if service is available
            if (pushNotificationService != null && oldStatus != null) {
                String userUid = updated.getUserUid();
                if (userUid != null && !userUid.isEmpty()) {
                    pushNotificationService.sendSignalementStatusChangeNotification(
                        userUid,
                        updated.getId(),
                        oldStatus.getName(),
                        newStatus.getName(),
                        updated.getDescription()
                    );
                }
            }

            return updated;
        }).orElseThrow(() -> new RuntimeException("Signalement not found: " + id));
    }
}
