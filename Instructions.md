## Déployer / Lancer le projet (Docker)

Depuis la racine du projet `travaux_routiers`, exécutez :

Windows:
```
.\restart-app.ps1 --Full
```

Linux:
```
./restart-app.sh full
```

Si vous préférez lancer manuellement via Docker Compose :
```
docker compose -f docker/docker-compose.yml --env-file .env down -v
docker compose -f docker/docker-compose.yml --env-file .env build --no-cache
docker compose -f docker/docker-compose.yml --env-file .env up -d
```

## Application Web (React - Manager)

Depuis la racine du projet :
```
cd web-manager-react
npm run dev
```

## Identifiants par défaut (Manager)

- **Email :** admin@gmail.com
- **Mot de passe :** admin123