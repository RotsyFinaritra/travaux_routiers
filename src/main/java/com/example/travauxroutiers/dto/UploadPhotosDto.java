package com.example.travauxroutiers.dto;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public class UploadPhotosDto {
    private Long signalementId;
    private List<MultipartFile> photos;

    // Getters et Setters
    public Long getSignalementId() { return signalementId; }
    public void setSignalementId(Long signalementId) { this.signalementId = signalementId; }
    public List<MultipartFile> getPhotos() { return photos; }
    public void setPhotos(List<MultipartFile> photos) { this.photos = photos; }
}