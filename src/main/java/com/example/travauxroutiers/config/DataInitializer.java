package com.example.travauxroutiers.config;

import com.example.travauxroutiers.model.TypeUser;
import com.example.travauxroutiers.repository.TypeUserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final TypeUserRepository typeUserRepository;

    public DataInitializer(TypeUserRepository typeUserRepository) {
        this.typeUserRepository = typeUserRepository;
    }

    @PostConstruct
    public void init() {
        List<String> defaults = List.of("USER", "MANAGER");
        for (String name : defaults) {
            typeUserRepository.findByName(name).orElseGet(() -> {
                TypeUser t = new TypeUser();
                t.setName(name);
                logger.info("Creating default TypeUser: {}", name);
                return typeUserRepository.save(t);
            });
        }
    }
}
