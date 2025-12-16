# Start MongoDB as Administrator
# This script will prompt for admin rights and start MongoDB

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting MongoDB Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script needs Administrator privileges!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please:" -ForegroundColor White
    Write-Host "1. Right-click on PowerShell" -ForegroundColor Gray
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor Gray
    Write-Host "3. Navigate to this folder: cd '$PWD'" -ForegroundColor Gray
    Write-Host "4. Run: net start MongoDB" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or run this script again from an Administrator PowerShell." -ForegroundColor White
    
    # Try to restart as admin
    $response = Read-Host "Would you like to restart PowerShell as Administrator? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Start-Process powershell -Verb RunAs -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Running as Administrator...' -ForegroundColor Green; net start MongoDB"
    }
    exit 1
}

# Try to start MongoDB
Write-Host "Attempting to start MongoDB service..." -ForegroundColor Cyan

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
        # Try to find MongoDB service with different names
        $mongoServices = Get-Service | Where-Object { $_.DisplayName -like "*Mongo*" }
        
        if ($mongoServices) {
            Write-Host "Found MongoDB service(s):" -ForegroundColor Yellow
            foreach ($svc in $mongoServices) {
                Write-Host "  - $($svc.Name) ($($svc.DisplayName)): $($svc.Status)" -ForegroundColor White
                if ($svc.Status -ne 'Running') {
                    Start-Service -Name $svc.Name
                    Write-Host "    ✅ Started!" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "❌ MongoDB service not found!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Possible reasons:" -ForegroundColor Yellow
            Write-Host "  1. MongoDB is not installed" -ForegroundColor White
            Write-Host "  2. MongoDB was not installed as a service" -ForegroundColor White
            Write-Host "  3. Service name is different" -ForegroundColor White
            Write-Host ""
            Write-Host "To check all services, run:" -ForegroundColor Yellow
            Write-Host "  Get-Service | Where-Object {`$_.DisplayName -like '*Mongo*'}" -ForegroundColor Gray
            exit 1
        }
    }
    
    # Verify it's running
    Start-Sleep -Seconds 2
    $service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq 'Running') {
        Write-Host ""
        Write-Host "✅ MongoDB is now running!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Test connection: npm run check:mongodb" -ForegroundColor Yellow
        Write-Host "  2. Seed database: npm run seed" -ForegroundColor Yellow
        Write-Host "  3. Start server: npm run dev:server" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error starting MongoDB: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running manually:" -ForegroundColor Yellow
    Write-Host "  net start MongoDB" -ForegroundColor White
}

