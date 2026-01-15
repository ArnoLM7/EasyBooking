Write-Host "Tests de performance EasyBooking" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "Test GET /api/rooms - 20 secondes" -ForegroundColor Cyan
autocannon -c 10 -d 20 http://localhost:3001/api/rooms

Write-Host ""
Write-Host "Tests termines" -ForegroundColor Green
