param(
    [switch]$Full
)

try {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    Set-Location $ScriptDir

    $composeFile = "docker/docker-compose.yml"

    mvn clean package -DskipTests

    docker compose -f $composeFile --env-file .env up -d

    Write-Host "Done. Use 'docker compose ps' to check status."
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
