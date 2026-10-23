$ErrorActionPreference = 'Continue'
$base = '192.168.100'
$ports = @(8001, 8002, 55000, 9197, 8080, 8000)

$conns = New-Object System.Collections.Generic.List[object]
for ($i = 1; $i -le 254; $i++) {
  $h = "$base.$i"
  foreach ($p in $ports) {
    $c = New-Object System.Net.Sockets.TcpClient
    try {
      $ar = $c.BeginConnect($h, $p, $null, $null)
      $conns.Add([pscustomobject]@{ C = $c; H = $h; P = $p; AR = $ar })
    } catch { $c.Close() }
  }
}

# WaitAll admite max 64 handles -> se procesa en lotes
$chunk = 50
$hits = @()
for ($s = 0; $s -lt $conns.Count; $s += $chunk) {
  $end = [Math]::Min($s + $chunk, $conns.Count)
  $slice = $conns[$s..($end - 1)]
  $handles = [System.Threading.WaitHandle[]]@($slice | ForEach-Object { $_.AR.AsyncWaitHandle })
  try { [System.Threading.WaitHandle]::WaitAll($handles, 3000) | Out-Null } catch {}
  foreach ($t in $slice) {
    if ($t.C.Connected) { $hits += "$($t.H):$($t.P)" }
    try { $t.C.Close() } catch {}
  }
}

Write-Output "--- puertos abiertos en $base.0/24 (8001/8002/55000/9197/8080/8000) ---"
if ($hits.Count -eq 0) { Write-Output "(ninguno)" } else { $hits | Sort-Object | ForEach-Object { Write-Output $_ } }
Write-Output "--- fin scan ---"
