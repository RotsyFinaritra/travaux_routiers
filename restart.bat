@echo off
setlocal enabledelayedexpansion

REM Se placer dans le dossier du script
cd /d %~dp0

set COMPOSE_FILE=docker\docker-compose.yml

echo === Building Java project ===
mvn clean package -DskipTests
IF ERRORLEVEL 1 (
    echo Maven build failed
    exit /b 1
)

IF "%1"=="FULL" (
    echo === Stopping containers and removing volumes ===
    docker compose -f %COMPOSE_FILE% --env-file .env down -v

    echo === Rebuilding images WITHOUT cache ===
    docker compose -f %COMPOSE_FILE% --env-file .env build --no-cache

    echo === Starting all services ===
    docker compose -f %COMPOSE_FILE% --env-file .env up -d
) ELSE (
    echo === Rebuilding app-java image WITHOUT cache ===
    docker compose -f %COMPOSE_FILE% --env-file .env build --no-cache app-java

    echo === Starting app-java service ===
    docker compose -f %COMPOSE_FILE% --env-file .env up -d app-java
)

echo === Done ===
docker compose -f %COMPOSE_FILE% ps
pause


curl.exe -i -X OPTIONS "http://localhost:8081/api/auth/login" -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type, Authorization"