package com.example.travauxroutiers.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.travauxroutiers.model.Signalement;
import com.example.travauxroutiers.model.Status;
import com.example.travauxroutiers.repository.SignalementRepository;
import com.example.travauxroutiers.repository.StatusRepository;

@Service
public class SignalementService implements GenericService<Signalement, Long> {
    private final SignalementRepository repo;
    private final StatusRepository statusRepository;
    private final ValidationService validationService;

    public SignalementService(SignalementRepository repo, StatusRepository statusRepository,
            ValidationService validationService) {
        this.repo = repo;
        this.statusRepository = statusRepository;
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
        Signalement saved = repo.save(t);
        try {
            validationService.ensureForSignalement(saved);
        } catch (Exception ex) {
            // do not fail create on validation init error; log if needed
        }
        return saved;
    }

    public Signalement update(Long id, Signalement t) {
        return repo.findById(id).map(existing -> {
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
            return repo.save(existing);
        }).orElseGet(() -> {
            t.setId(id);
            return repo.save(t);
        });
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public Signalement updateStatus(Long id, Long statusId) {
        return repo.findById(id).map(signalement -> {
            Status status = statusRepository.findById(statusId)
                    .orElseThrow(() -> new RuntimeException("Status not found: " + statusId));
            signalement.setStatus(status);
            return repo.save(signalement);
        }).orElseThrow(() -> new RuntimeException("Signalement not found: " + id));
    }
}
