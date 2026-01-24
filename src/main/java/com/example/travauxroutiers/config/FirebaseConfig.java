package com.example.travauxroutiers.config;

import com.example.travauxroutiers.datastore.DataStore;
import com.example.travauxroutiers.datastore.FirebaseDataStore;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
@Profile("cloud")
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        String path = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (path == null || path.isEmpty()) {
            path = "/app/secrets/firebase-service-account.json";
        }
        try (InputStream serviceAccount = new FileInputStream(path)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            return FirebaseApp.initializeApp(options);
        }
    }

    @Bean
    public DataStore dataStore(FirebaseApp app) {
        return new FirebaseDataStore(app);
    }
}
