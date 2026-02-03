package com.example.travauxroutiers.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.travauxroutiers.dto.StatisticsDto;
import com.example.travauxroutiers.service.StatisticsService;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/global")
    public ResponseEntity<StatisticsDto> getGlobalStatistics() {
        try {
            System.out.println("🌐 Endpoint /api/statistics/global appelé");
            StatisticsDto statistics = statisticsService.getGlobalStatistics();
            System.out.println("📈 Réponse envoyée avec " + statistics.getTotalPoints() + " points");
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            System.err.println("❌ Erreur dans le contrôleur: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("API Statistics fonctionne correctement");
    }
}