# Travaux Routiers - API Spring Boot

Petit projet Spring Boot fournissant une API CRUD pour les objets `Travaux`.

Exécution locale

```bash
mvn clean package
mvn spring-boot:run
```

Endpoints principaux

- `GET /api/travaux` — lister
- `GET /api/travaux/{id}` — récupérer
- `POST /api/travaux` — créer (JSON: `description`, `statut`)
- `PUT /api/travaux/{id}` — mettre à jour
- `DELETE /api/travaux/{id}` — supprimer

H2 console: http://localhost:8080/h2-console (JDBC URL: `jdbc:h2:mem:travauxdb`)
