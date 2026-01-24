param(
    [switch]$Full
)

try {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    Set-Location $ScriptDir

    $composeFile = "docker/docker-compose.yml"

    mvn clean package -DskipTests

    if ($Full) {
        Write-Host "Stopping all containers and removing volumes..."
        docker compose -f $composeFile --env-file .env down -v

        Write-Host "Rebuilding images WITHOUT cache..."
        docker compose -f $composeFile --env-file .env build --no-cache

        Write-Host "Starting all services..."
        docker compose -f $composeFile --env-file .env up -d
    }
    else {
        Write-Host "Rebuilding app-java image WITHOUT cache..."
        docker compose -f $composeFile --env-file .env build --no-cache app-java

        Write-Host "Starting app-java service..."
        docker compose -f $composeFile --env-file .env up -d app-java
    }

    Write-Host "Done. Use 'docker compose ps' to check status."
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
