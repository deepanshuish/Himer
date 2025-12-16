# Start MongoDB Service Script
# Run this script as Administrator

Write-Host "Starting MongoDB..." -ForegroundColor Cyan

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script needs to run as Administrator!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Right-click PowerShell and select 'Run as Administrator', then run:" -ForegroundColor White
    Write-Host "  .\start-mongodb.ps1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or manually run:" -ForegroundColor White
    Write-Host "  net start MongoDB" -ForegroundColor Yellow
    exit 1
}

# Try to start MongoDB service
try {
    $service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    
    if ($service) {
        if ($service.Status -eq 'Running') {
            Write-Host "✅ MongoDB is already running!" -ForegroundColor Green
        } else {
            Start-Service -Name "MongoDB"
            Write-Host "✅ MongoDB service started successfully!" -ForegroundColor Green
        }
    } else {
        # Try alternative service names
        $mongoServices = Get-Service | Where-Object { $_.DisplayName -like "*Mongo*" }
        
        if ($mongoServices) {
            Write-Host "Found MongoDB service(s):" -ForegroundColor Yellow
            $mongoServices | ForEach-Object {
                Write-Host "  - $($_.Name): $($_.Status)" -ForegroundColor White
                if ($_.Status -ne 'Running') {
                    Start-Service -Name $_.Name
                    Write-Host "    ✅ Started!" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "❌ MongoDB service not found!" -ForegroundColor Red
            Write-Host ""
            Write-Host "MongoDB might not be installed or the service name is different." -ForegroundColor Yellow
            Write-Host "Please install MongoDB first or check the service name manually." -ForegroundColor Yellow
            exit 1
        }
    }
    
    # Wait a moment and verify
    Start-Sleep -Seconds 2
    $service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq 'Running') {
        Write-Host ""
        Write-Host "✅ MongoDB is now running!" -ForegroundColor Green
        Write-Host "You can now run: npm run check:mongodb" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error starting MongoDB: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running manually:" -ForegroundColor Yellow
    Write-Host "  net start MongoDB" -ForegroundColor White
}

