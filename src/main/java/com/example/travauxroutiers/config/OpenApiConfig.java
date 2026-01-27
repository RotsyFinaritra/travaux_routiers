package com.example.travauxroutiers.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI travauxRoutiersOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Travaux Routiers API")
                        .version("v1")
                        .description("Documentation Swagger/OpenAPI pour l'application Travaux Routiers"));
    }
}
