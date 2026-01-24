package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.User;
import com.example.travauxroutiers.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService implements GenericService<User, Long> {
    private final UserRepository repo;

    public UserService(UserRepository repo) { this.repo = repo; }

    public List<User> listAll() { return repo.findAll(); }
    public Optional<User> get(Long id) { return repo.findById(id); }
    public User create(User t) { return repo.save(t); }
    public User update(Long id, User t) {
        return repo.findById(id).map(existing -> {
            existing.setUsername(t.getUsername()); existing.setEmail(t.getEmail()); existing.setTypeUser(t.getTypeUser());
            return repo.save(existing);
        }).orElseGet(() -> { t.setId(id); return repo.save(t); });
    }
    public void delete(Long id) { repo.deleteById(id); }
}
