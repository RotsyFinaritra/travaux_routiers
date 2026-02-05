package com.example.travauxroutiers.service;

import com.example.travauxroutiers.model.Signalement;
import com.example.travauxroutiers.model.SignalementPhoto;
import com.example.travauxroutiers.repository.SignalementPhotoRepository;
import com.example.travauxroutiers.repository.SignalementRepository; // Suppose que tu as ce repo
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PhotoService {

    @Autowired
    private SignalementPhotoRepository photoRepository;

    @Autowired
    private SignalementRepository signalementRepository;

    @Value("${upload.dir}") // Ajoute ça dans application.properties : upload.dir=/path/to/uploads
    private String uploadDir;

    public List<SignalementPhoto> uploadPhotos(Long signalementId, List<MultipartFile> files) throws IOException {
        Signalement signalement = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));

        List<SignalementPhoto> photos = new ArrayList<>();
        Path signalementUploadPath = Paths.get(uploadDir, "signalements", signalementId.toString());
        Files.createDirectories(signalementUploadPath); // Crée le dossier si absent

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            // Génère un nom unique pour le fichier
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = signalementUploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            // Sauvegarde en base
            SignalementPhoto photo = new SignalementPhoto();
            photo.setSignalement(signalement);
            photo.setPhotoUrl("/uploads/signalements/" + signalementId + "/" + fileName); // URL relative
            photos.add(photoRepository.save(photo));
        }

        return photos;
    }
}