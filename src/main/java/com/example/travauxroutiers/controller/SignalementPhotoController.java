package com.example.travauxroutiers.controller;

import com.example.travauxroutiers.dto.UploadPhotosDto;
import com.example.travauxroutiers.model.Signalement;
import com.example.travauxroutiers.model.SignalementPhoto;
import com.example.travauxroutiers.repository.SignalementPhotoRepository;
import com.example.travauxroutiers.repository.SignalementRepository;
import com.example.travauxroutiers.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/signalements/{id}/photos")
@Tag(name = "Photos de Signalements", description = "Gestion des photos multiples pour les signalements")
public class SignalementPhotoController {
    private static final Logger logger = LoggerFactory.getLogger(SignalementPhotoController.class);

    private final SignalementRepository signalementRepository;
    private final SignalementPhotoRepository photoRepository;
    private final FileStorageService fileStorageService;

    public SignalementPhotoController(
            SignalementRepository signalementRepository,
            SignalementPhotoRepository photoRepository,
            FileStorageService fileStorageService) {
        this.signalementRepository = signalementRepository;
        this.photoRepository = photoRepository;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    @Operation(summary = "Uploader plusieurs photos pour un signalement")
    public ResponseEntity<List<String>> uploadPhotos(
            @PathVariable Long id,
            @RequestParam("photos") List<MultipartFile> photos) {
        Optional<Signalement> optionalSignalement = signalementRepository.findById(id);
        if (optionalSignalement.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Signalement signalement = optionalSignalement.get();
        List<String> uploadedUrls = new ArrayList<>();

        try {
            for (MultipartFile photo : photos) {
                String fileName = fileStorageService.storeFile(photo);
                String photoUrl = "/uploads/signalements/" + fileName; // Adaptez selon votre config de serving
                SignalementPhoto signalementPhoto = new SignalementPhoto(signalement, photoUrl);
                photoRepository.save(signalementPhoto);
                uploadedUrls.add(photoUrl);
            }
            return ResponseEntity.ok(uploadedUrls);
        } catch (Exception ex) {
            logger.error("Erreur lors de l'upload des photos pour signalement {}", id, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    @Operation(summary = "Lister les photos d'un signalement")
    public ResponseEntity<List<SignalementPhoto>> listPhotos(@PathVariable Long id) {
        List<SignalementPhoto> photos = photoRepository.findBySignalementId(id);
        return ResponseEntity.ok(photos);
    }

    @DeleteMapping("/{photoId}")
    @Operation(summary = "Supprimer une photo")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long id, @PathVariable Long photoId) {
        Optional<SignalementPhoto> optionalPhoto = photoRepository.findById(photoId);
        if (optionalPhoto.isEmpty() || !optionalPhoto.get().getSignalement().getId().equals(id)) {
            return ResponseEntity.notFound().build();
        }

        SignalementPhoto photo = optionalPhoto.get();
        fileStorageService.deleteFile(photo.getPhotoUrl().replace("/uploads/signalements/", ""));
        photoRepository.delete(photo);
        return ResponseEntity.noContent().build();
    }
}