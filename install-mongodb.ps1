# MongoDB Installation Helper Script for Windows
# This script helps you install MongoDB on Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MongoDB Installation Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is already installed
$mongoPath = "C:\Program Files\MongoDB\Server"
if (Test-Path $mongoPath) {
    Write-Host "✅ MongoDB appears to be installed at: $mongoPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start MongoDB, run (as Administrator):" -ForegroundColor Yellow
    Write-Host "  net start MongoDB" -ForegroundColor White
    exit 0
}

Write-Host "MongoDB is not installed." -ForegroundColor Yellow
Write-Host ""
Write-Host "To install MongoDB:" -ForegroundColor Cyan
Write-Host "1. Download MongoDB Community Server:" -ForegroundColor White
Write-Host "   https://www.mongodb.com/try/download/community" -ForegroundColor Blue
Write-Host ""
Write-Host "2. Select:" -ForegroundColor White
Write-Host "   - Version: Latest (7.0+)" -ForegroundColor Gray
Write-Host "   - Platform: Windows" -ForegroundColor Gray
Write-Host "   - Package: MSI" -ForegroundColor Gray
Write-Host ""
Write-Host "3. During installation:" -ForegroundColor White
Write-Host "   ✅ Check 'Install MongoDB as a Service'" -ForegroundColor Green
Write-Host "   ✅ Choose 'Run service as Network Service user'" -ForegroundColor Green
Write-Host "   ✅ Check 'Install MongoDB Compass' (optional)" -ForegroundColor Green
Write-Host ""
Write-Host "4. After installation, start MongoDB:" -ForegroundColor White
Write-Host "   Run PowerShell as Administrator and execute:" -ForegroundColor Gray
Write-Host "   net start MongoDB" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Test the connection:" -ForegroundColor White
Write-Host "   npm run check:mongodb" -ForegroundColor Yellow
Write-Host ""

# Try to open the download page
$response = Read-Host "Would you like to open the MongoDB download page? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    Start-Process "https://www.mongodb.com/try/download/community"
}

