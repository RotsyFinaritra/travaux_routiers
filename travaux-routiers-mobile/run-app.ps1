$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$devPort = 5173
$devServerUp = $false
try {
	$devServerUp = (Test-NetConnection -ComputerName '127.0.0.1' -Port $devPort -InformationLevel Quiet)
} catch {
	$devServerUp = $false
}

if (-not $devServerUp) {
	Write-Host "Starting Vite dev server on 0.0.0.0:$devPort ..."
	Start-Process -FilePath "powershell" -ArgumentList @(
		"-NoExit",
		"-Command",
		"Set-Location '$projectRoot'; npx vite --host 0.0.0.0 --port $devPort"
	) | Out-Null
	Start-Sleep -Seconds 2
} else {
	Write-Host "Vite dev server already running on port $devPort."
}

ionic cap run android -l --external

# Alternative (no live reload):
# ionic cap run android