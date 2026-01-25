package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.Signalement;
import com.example.travauxroutiers.repository.SignalementRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SignalementService implements GenericService<Signalement, Long> {
    private final SignalementRepository repo;
    private final ValidationService validationService;

    public SignalementService(SignalementRepository repo, ValidationService validationService) {
        this.repo = repo;
        this.validationService = validationService;
    }

    public List<Signalement> listAll() { return repo.findAll(); }

    public List<Signalement> listByValidationStatusName(String statusName) {
        if (statusName == null || statusName.trim().isEmpty()) return repo.findAll();
        return repo.findByValidationStatusName(statusName.trim().toUpperCase());
    }
    public Optional<Signalement> get(Long id) { return repo.findById(id); }
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
            existing.setDescription(t.getDescription()); existing.setLatitude(t.getLatitude()); existing.setLongitude(t.getLongitude()); existing.setStatus(t.getStatus()); existing.setEntreprise(t.getEntreprise());
            existing.setSurfaceArea(t.getSurfaceArea()); existing.setBudget(t.getBudget()); existing.setPhotoUrl(t.getPhotoUrl());
            return repo.save(existing);
        }).orElseGet(() -> { t.setId(id); return repo.save(t); });
    }
    public void delete(Long id) { repo.deleteById(id); }
}
