param([string]$Target = '100.95.238.97', [int]$From = 1, [int]$To = 10000, [int]$TimeoutMs = 900)

# Escaneo TCP sin SYN: conecta de verdad y reporta lo que escucha.
$ErrorActionPreference = 'Continue'
Write-Output ("=== escaneo {0} puertos {1}-{2} ===" -f $Target, $From, $To)

$ports = $From..$To
$open = New-Object System.Collections.Generic.List[string]
$chunk = 120

for ($s = 0; $s -lt $ports.Count; $s += $chunk) {
  $end = [Math]::Min($s + $chunk, $ports.Count)
  $slice = $ports[$s..($end - 1)]
  $conns = @()
  foreach ($p in $slice) {
    $c = New-Object System.Net.Sockets.TcpClient
    try {
      $ar = $c.BeginConnect($Target, $p, $null, $null)
      $conns += [pscustomobject]@{ C = $c; P = $p; AR = $ar }
    } catch { $c.Close() }
  }
  $handles = [System.Threading.WaitHandle[]]@($conns | ForEach-Object { $_.AR.AsyncWaitHandle })
  try { [System.Threading.WaitHandle]::WaitAll($handles, $TimeoutMs) | Out-Null } catch {}
  foreach ($t in $conns) {
    if ($t.C.Connected) { $open.Add([string]$t.P) }
    try { $t.C.Close() } catch {}
  }
  if (($s / $chunk) % 20 -eq 0) { Write-Output ("  ...{0}/{1}" -f $end, $ports.Count) }
}

Write-Output '--- puertos abiertos ---'
if ($open.Count -eq 0) { Write-Output '  (ninguno)' } else { $open | Sort-Object { [int]$_ } | ForEach-Object { Write-Output "  $_" } }
Write-Output '--- fin ---'
