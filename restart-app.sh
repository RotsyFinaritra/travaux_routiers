#!/usr/bin/env bash
# Lightweight restart helper (bash)
# Usage:
#   ./restart-app.sh        # rebuild and start app-java service
#   ./restart-app.sh full   # down -v then rebuild and start all services

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE_FILE="docker/docker-compose.yml"

if [[ ${1:-} == "full" ]]; then
  echo "Stopping all containers and removing volumes..."
  docker compose -f "$COMPOSE_FILE" down -v
  echo "Building and starting all services..."
  docker compose -f "$COMPOSE_FILE" up --build -d
else
  echo "Rebuilding and starting 'app-java' service..."
  docker compose -f "$COMPOSE_FILE" up --build -d app-java
fi

echo "Done. Check status with: docker compose -f $COMPOSE_FILE ps"
