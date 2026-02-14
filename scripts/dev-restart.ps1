Write-Host "Stopping any running Next.js dev servers and freeing ports..." -ForegroundColor Yellow

$ports = 3000..3010

foreach ($port in $ports) {
  try {
    $conns = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
      $pids = $conns | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
      foreach ($pid in $pids) {
        try {
          $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
          if ($proc) {
            Write-Host "Stopping process $($proc.ProcessName) (PID: $pid) on port $port..." -ForegroundColor Cyan
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
          }
        } catch {
          Write-Host "Warning: Failed to stop PID $pid for port $port. Continuing..." -ForegroundColor DarkYellow
        }
      }
    }
  } catch {
    Write-Host "Info: Could not query port $port. Continuing..." -ForegroundColor DarkYellow
  }
}

Start-Sleep -Seconds 1

if (Test-Path ".next") {
  Write-Host "Removing .next build cache..." -ForegroundColor Yellow
  try {
    Remove-Item -Recurse -Force ".next"
  } catch {
    Write-Host "Warning: Failed to remove .next; continuing." -ForegroundColor DarkYellow
  }
}

Write-Host "Starting Next.js dev server..." -ForegroundColor Green
& npm.cmd run dev
