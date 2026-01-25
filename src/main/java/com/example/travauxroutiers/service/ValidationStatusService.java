package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.ValidationStatus;
import com.example.travauxroutiers.repository.ValidationStatusRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ValidationStatusService {
    private final ValidationStatusRepository repo;

    public ValidationStatusService(ValidationStatusRepository repo) { this.repo = repo; }
    public List<ValidationStatus> listAll() { return repo.findAll(); }
    public Optional<ValidationStatus> get(Long id) { return repo.findById(id); }
    public ValidationStatus create(ValidationStatus t) { return repo.save(t); }
    public ValidationStatus update(Long id, ValidationStatus t) { return repo.findById(id).map(existing -> { existing.setName(t.getName()); existing.setDescription(t.getDescription()); return repo.save(existing); }).orElseGet(() -> { t.setId(id); return repo.save(t); }); }
    public void delete(Long id) { repo.deleteById(id); }
}
