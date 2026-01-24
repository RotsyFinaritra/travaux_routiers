package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.Entreprise;
import com.example.travauxroutiers.repository.EntrepriseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EntrepriseService implements GenericService<Entreprise, Long> {
    private final EntrepriseRepository repo;

    public EntrepriseService(EntrepriseRepository repo) { this.repo = repo; }

    public List<Entreprise> listAll() { return repo.findAll(); }
    public Optional<Entreprise> get(Long id) { return repo.findById(id); }
    public Entreprise create(Entreprise t) { return repo.save(t); }
    public Entreprise update(Long id, Entreprise t) {
        return repo.findById(id).map(existing -> {
            existing.setName(t.getName()); existing.setAddress(t.getAddress()); existing.setPhone(t.getPhone()); existing.setEmail(t.getEmail());
            return repo.save(existing);
        }).orElseGet(() -> { t.setId(id); return repo.save(t); });
    }
    public void delete(Long id) { repo.deleteById(id); }
}
