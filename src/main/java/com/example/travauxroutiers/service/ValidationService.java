package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.*;
import com.example.travauxroutiers.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ValidationService {
    private static final Logger logger = LoggerFactory.getLogger(ValidationService.class);
    
    private final ValidationRepository validationRepository;
    private final ValidationStatusRepository statusRepository;
    private final ValidationHistoryRepository historyRepository;
    private final SignalementRepository signalementRepository;
    private final UserRepository userRepository;
    
    @Autowired(required = false)
    private PushNotificationService pushNotificationService;

    public ValidationService(ValidationRepository validationRepository,
                             ValidationStatusRepository statusRepository,
                             ValidationHistoryRepository historyRepository,
                             SignalementRepository signalementRepository,
                             UserRepository userRepository) {
        this.validationRepository = validationRepository;
        this.statusRepository = statusRepository;
        this.historyRepository = historyRepository;
        this.signalementRepository = signalementRepository;
        this.userRepository = userRepository;
    }

    public Optional<Validation> getBySignalement(Long signalementId) {
        return validationRepository.findBySignalementId(signalementId);
    }

    public Validation ensureForSignalement(Signalement s) {
        return validationRepository.findBySignalementId(s.getId()).orElseGet(() -> {
            Validation v = new Validation();
            v.setSignalement(s);
            ValidationStatus pending = statusRepository.findByName("PENDING").orElseGet(() -> {
                ValidationStatus ps = new ValidationStatus(); ps.setName("PENDING"); ps.setDescription("En attente de validation"); return statusRepository.save(ps);
            });
            v.setStatus(pending);
            v.setNote(null);
            v.setValidatedAt(null);
            return validationRepository.save(v);
        });
    }

    public Validation changeStatus(Long signalementId, Long statusId, Long changedByUserId, String note, Integer niveau) {
        logger.info("[ValidationService] changeStatus called - signalementId: {}, niveau: {}", signalementId, niveau);
        
        Signalement s = signalementRepository.findById(signalementId).orElseThrow(() -> new IllegalArgumentException("signalement-not-found"));
        
        logger.info("[ValidationService] Signalement trouvé - niveau actuel: {}", s.getNiveau());
        
        Validation v = validationRepository.findBySignalementId(signalementId).orElseGet(() -> {
            Validation nv = new Validation(); nv.setSignalement(s); return nv;
        });

        ValidationStatus from = v.getStatus();
        ValidationStatus to = statusRepository.findById(statusId).orElseThrow(() -> new IllegalArgumentException("status-not-found"));
        User changer = userRepository.findById(changedByUserId).orElse(null);

        // Mettre à jour le niveau dans le signalement si fourni
        if (niveau != null) {
            logger.info("[ValidationService] Mise à jour du niveau: {} -> {}", s.getNiveau(), niveau);
            s.setNiveau(niveau);
            Signalement savedSignalement = signalementRepository.save(s);
            logger.info("[ValidationService] Signalement sauvegardé - nouveau niveau: {}", savedSignalement.getNiveau());
        } else {
            logger.info("[ValidationService] Niveau non fourni (null), pas de mise à jour");
        }

        v.setStatus(to);
        v.setValidatedBy(changer);
        v.setValidatedAt(LocalDateTime.now());
        v.setNote(note);
        Validation saved = validationRepository.save(v);

        ValidationHistory hist = new ValidationHistory();
        hist.setValidation(saved);
        hist.setChangedBy(changer);
        hist.setChangedAt(LocalDateTime.now());
        hist.setFromStatus(from);
        hist.setToStatus(to);
        hist.setNote(note);
        historyRepository.save(hist);
        
        // Send push notification if service is available
        if (pushNotificationService != null && !to.getName().equals("PENDING")) {
            String userUid = s.getUserUid();
            if (userUid != null && !userUid.isEmpty()) {
                pushNotificationService.sendValidationStatusChangeNotification(
                    userUid,
                    s.getId(),
                    to.getName(),
                    note
                );
            }
        }

        return saved;
    }

    // Méthode surchargée pour maintenir la compatibilité
    public Validation changeStatus(Long signalementId, Long statusId, Long changedByUserId, String note) {
        return changeStatus(signalementId, statusId, changedByUserId, note, null);
    }

    public List<ValidationHistory> historyForValidation(Long validationId) {
        return historyRepository.findByValidationIdOrderByChangedAtDesc(validationId);
    }

    public void deleteValidationWithHistory(Long validationId) {
        // 1. Supprimer d'abord l'historique de validation
        historyRepository.deleteByValidationId(validationId);
        
        // 2. Supprimer la validation
        validationRepository.deleteById(validationId);
    }
}
