package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.*;
import com.example.travauxroutiers.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ValidationService {
    private final ValidationRepository validationRepository;
    private final ValidationStatusRepository statusRepository;
    private final ValidationHistoryRepository historyRepository;
    private final SignalementRepository signalementRepository;
    private final UserRepository userRepository;

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

    public Validation changeStatus(Long signalementId, Long statusId, Long changedByUserId, String note) {
        Signalement s = signalementRepository.findById(signalementId).orElseThrow(() -> new IllegalArgumentException("signalement-not-found"));
        Validation v = validationRepository.findBySignalementId(signalementId).orElseGet(() -> {
            Validation nv = new Validation(); nv.setSignalement(s); return nv;
        });

        ValidationStatus from = v.getStatus();
        ValidationStatus to = statusRepository.findById(statusId).orElseThrow(() -> new IllegalArgumentException("status-not-found"));
        User changer = userRepository.findById(changedByUserId).orElse(null);

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

        return saved;
    }

    public List<ValidationHistory> historyForValidation(Long validationId) {
        return historyRepository.findByValidationIdOrderByChangedAtDesc(validationId);
    }
}
