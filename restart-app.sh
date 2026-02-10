#!/usr/bin/env bash
# Restart helper (bash) — equivalent of restart-app.ps1
# Usage:
#   ./restart-app.sh        # rebuild and start app-java service
#   ./restart-app.sh full   # down -v then rebuild and start all services

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE_FILE="docker/docker-compose.yml"

echo "Building Maven project (skipping tests)..."
mvn clean package -DskipTests

if [[ ${1:-} == "full" ]]; then
  echo "Stopping all containers and removing volumes..."
  docker compose -f "$COMPOSE_FILE" --env-file .env down -v

  echo "Rebuilding images WITHOUT cache..."
  docker compose -f "$COMPOSE_FILE" --env-file .env build --no-cache

  echo "Starting all services..."
  docker compose -f "$COMPOSE_FILE" --env-file .env up -d
else
  echo "Rebuilding app-java image WITHOUT cache..."
  docker compose -f "$COMPOSE_FILE" --env-file .env build --no-cache app-java

  echo "Starting app-java service..."
  docker compose -f "$COMPOSE_FILE" --env-file .env up -d app-java
fi

echo "Done. Use 'docker compose ps' to check status."
