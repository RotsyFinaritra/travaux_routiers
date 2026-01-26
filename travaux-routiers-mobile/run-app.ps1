param(
	[switch]$LiveReload,
	[string]$PublicHost,
	[int]$Port = 8100
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

if ($LiveReload) {
	Write-Host "Running Android with Live Reload (port $Port)..."
	Write-Host "Note: your phone MUST be able to reach your PC IP (same network)."

	if ($PublicHost -and $PublicHost.Trim().Length -gt 0) {
		ionic cap run android -l --external --public-host $PublicHost --port $Port
	} else {
		ionic cap run android -l --external --port $Port
	}
} else {
	Write-Host "Running Android WITHOUT Live Reload (uses built assets, no network needed)..."
	npm run build
	npx cap sync android
	ionic cap run android
}