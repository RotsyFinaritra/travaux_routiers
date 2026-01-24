package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.TypeUser;
import com.example.travauxroutiers.repository.TypeUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TypeUserService implements GenericService<TypeUser, Long> {
    private final TypeUserRepository repo;

    public TypeUserService(TypeUserRepository repo) { this.repo = repo; }

    public List<TypeUser> listAll() { return repo.findAll(); }
    public Optional<TypeUser> get(Long id) { return repo.findById(id); }
    public TypeUser create(TypeUser t) { return repo.save(t); }
    public TypeUser update(Long id, TypeUser t) {
        return repo.findById(id).map(existing -> { existing.setName(t.getName()); return repo.save(existing); })
                .orElseGet(() -> { t.setId(id); return repo.save(t); });
    }
    public void delete(Long id) { repo.deleteById(id); }
}
