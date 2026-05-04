netsh advfirewall firewall add rule name="FitTrack Backend Port 5000" dir=in action=allow protocol=TCP localport=5000
Write-Host "✅ Port 5000 opened in Windows Firewall!" -ForegroundColor Green
Pause
