package com.example.travauxroutiers.config;

import com.example.travauxroutiers.model.TypeUser;
import com.example.travauxroutiers.model.Status;
import com.example.travauxroutiers.model.ValidationStatus;
import com.example.travauxroutiers.repository.StatusRepository;
import com.example.travauxroutiers.repository.ValidationStatusRepository;
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
    private final StatusRepository statusRepository;
    private final ValidationStatusRepository validationStatusRepository;

    public DataInitializer(TypeUserRepository typeUserRepository,
                           StatusRepository statusRepository,
                           ValidationStatusRepository validationStatusRepository) {
        this.typeUserRepository = typeUserRepository;
        this.statusRepository = statusRepository;
        this.validationStatusRepository = validationStatusRepository;
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

        // Seed progression statuses (signalement lifecycle)
        List<Status> existing = statusRepository.findAll();
        List<String> progression = List.of("NOUVEAU", "EN_COURS", "TERMINE");
        for (String sname : progression) {
            boolean exists = existing.stream().anyMatch(s -> sname.equalsIgnoreCase(s.getName()));
            if (!exists) {
                Status st = new Status();
                st.setName(sname);
                String desc = switch (sname) {
                    case "NOUVEAU" -> "Signalement nouvellement créé";
                    case "EN_COURS" -> "Traitement en cours";
                    case "TERMINE" -> "Travaux terminés";
                    default -> null;
                };
                st.setDescription(desc);
                logger.info("Creating default Status: {}", sname);
                statusRepository.save(st);
            }
        }

        // Seed validation statuses (use canonical codes expected by services)
        validationStatusRepository.findByName("PENDING").orElseGet(() -> {
            ValidationStatus vs = new ValidationStatus();
            vs.setName("PENDING");
            vs.setDescription("En attente de validation");
            logger.info("Creating default ValidationStatus: PENDING");
            return validationStatusRepository.save(vs);
        });
        validationStatusRepository.findByName("APPROVED").orElseGet(() -> {
            ValidationStatus vs = new ValidationStatus();
            vs.setName("APPROVED");
            vs.setDescription("Validé");
            logger.info("Creating default ValidationStatus: APPROVED");
            return validationStatusRepository.save(vs);
        });
        validationStatusRepository.findByName("REJECTED").orElseGet(() -> {
            ValidationStatus vs = new ValidationStatus();
            vs.setName("REJECTED");
            vs.setDescription("Rejeté");
            logger.info("Creating default ValidationStatus: REJECTED");
            return validationStatusRepository.save(vs);
        });
    }
}
