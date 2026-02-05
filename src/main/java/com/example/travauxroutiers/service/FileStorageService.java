package com.example.travauxroutiers.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service pour gérer le stockage des fichiers
 */
@Service
public class FileStorageService {
    
    @Value("${file.upload-dir:uploads/signalements}")
    private String uploadDir;
    
    @Value("${file.max-size:5242880}") // 5MB par défaut
    private long maxFileSize;
    
    private Path fileStorageLocation;
    
    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Impossible de créer le répertoire de stockage des fichiers.", ex);
        }
    }
    
    /**
     * Stocker un fichier et retourner le nom du fichier
     */
    public String storeFile(MultipartFile file) {
        // Vérifier si le fichier est vide
        if (file.isEmpty()) {
            throw new RuntimeException("Impossible de stocker un fichier vide");
        }
        
        // Vérifier la taille du fichier
        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("La taille du fichier dépasse la limite autorisée de " + (maxFileSize / 1024 / 1024) + " MB");
        }
        
        // Normaliser le nom du fichier
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            // Vérifier si le nom du fichier contient des caractères invalides
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Le nom du fichier contient une séquence de chemin invalide: " + originalFileName);
            }
            
            // Vérifier le type de fichier (images uniquement)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Seules les images sont autorisées");
            }
            
            // Créer un nom de fichier unique
            String fileExtension = "";
            int dotIndex = originalFileName.lastIndexOf('.');
            if (dotIndex > 0) {
                fileExtension = originalFileName.substring(dotIndex);
            }
            
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            
            // Copier le fichier vers l'emplacement cible
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            return uniqueFileName;
            
        } catch (IOException ex) {
            throw new RuntimeException("Impossible de stocker le fichier " + originalFileName + ". Veuillez réessayer!", ex);
        }
    }
    
    /**
     * Supprimer un fichier
     */
    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Impossible de supprimer le fichier " + fileName, ex);
        }
    }
    
    /**
     * Obtenir le chemin du fichier
     */
    public Path getFilePath(String fileName) {
        return this.fileStorageLocation.resolve(fileName).normalize();
    }
    
    /**
     * Vérifier si un fichier existe
     */
    public boolean fileExists(String fileName) {
        Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
        return Files.exists(filePath);
    }
}