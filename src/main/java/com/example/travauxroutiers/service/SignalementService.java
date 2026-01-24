package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.Signalement;
import com.example.travauxroutiers.repository.SignalementRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SignalementService implements GenericService<Signalement, Long> {
    private final SignalementRepository repo;

    public SignalementService(SignalementRepository repo) { this.repo = repo; }

    public List<Signalement> listAll() { return repo.findAll(); }
    public Optional<Signalement> get(Long id) { return repo.findById(id); }
    public Signalement create(Signalement t) { return repo.save(t); }
    public Signalement update(Long id, Signalement t) {
        return repo.findById(id).map(existing -> {
            existing.setDescription(t.getDescription()); existing.setLatitude(t.getLatitude()); existing.setLongitude(t.getLongitude()); existing.setStatus(t.getStatus()); existing.setEntreprise(t.getEntreprise());
            existing.setSurfaceArea(t.getSurfaceArea()); existing.setBudget(t.getBudget()); existing.setPhotoUrl(t.getPhotoUrl());
            return repo.save(existing);
        }).orElseGet(() -> { t.setId(id); return repo.save(t); });
    }
    public void delete(Long id) { repo.deleteById(id); }
}
