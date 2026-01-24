package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.SignalementStatus;
import com.example.travauxroutiers.repository.SignalementStatusRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SignalementStatusService implements GenericService<SignalementStatus, Long> {
    private final SignalementStatusRepository repo;

    public SignalementStatusService(SignalementStatusRepository repo) { this.repo = repo; }

    public List<SignalementStatus> listAll() { return repo.findAll(); }
    public Optional<SignalementStatus> get(Long id) { return repo.findById(id); }
    public SignalementStatus create(SignalementStatus t) { return repo.save(t); }
    public SignalementStatus update(Long id, SignalementStatus t) {
        return repo.findById(id).map(existing -> {
            existing.setStatus(t.getStatus()); existing.setComment(t.getComment()); existing.setChangedBy(t.getChangedBy());
            return repo.save(existing);
        }).orElseGet(() -> { t.setId(id); return repo.save(t); });
    }
    public void delete(Long id) { repo.deleteById(id); }
}
