param(
    [switch]$Full
)

try {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    Set-Location $ScriptDir

    $composeFile = "docker/docker-compose.yml"

    mvn -DskipTests package
    docker compose -f docker/docker-compose.yml --env-file .env up -d --no-deps --build app-java

    Write-Host "Done. Use 'docker compose ps' to check status."
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
