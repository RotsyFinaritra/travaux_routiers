package com.example.travauxroutiers.config;

import com.example.travauxroutiers.datastore.DataStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("cloud")
public class CloudStartupRunner implements ApplicationRunner {
    private static final Logger logger = LoggerFactory.getLogger(CloudStartupRunner.class);
    private final DataStore dataStore;

    public CloudStartupRunner(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    @Override
    public void run(ApplicationArguments args) {
        logger.info("[startup] Attempting to initialize Firebase DataStore...");
        try {
            dataStore.ping();
            logger.info("[startup] Firebase DataStore initialized successfully.");
        } catch (Exception e) {
            logger.error("[startup] Firebase DataStore initialization failed: {}", e.getMessage(), e);
        }
    }
}
