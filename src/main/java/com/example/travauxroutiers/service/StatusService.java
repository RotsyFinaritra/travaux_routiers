package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.Status;
import com.example.travauxroutiers.repository.StatusRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StatusService implements GenericService<Status, Long> {
    private final StatusRepository repo;

    public StatusService(StatusRepository repo) { this.repo = repo; }

    public List<Status> listAll() { return repo.findAll(); }
    public Optional<Status> get(Long id) { return repo.findById(id); }
    public Status create(Status t) { return repo.save(t); }
    public Status update(Long id, Status t) {
        return repo.findById(id).map(existing -> { existing.setName(t.getName()); existing.setDescription(t.getDescription()); return repo.save(existing); })
                .orElseGet(() -> { t.setId(id); return repo.save(t); });
    }
    public void delete(Long id) { repo.deleteById(id); }
}
