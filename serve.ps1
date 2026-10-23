param(
  [int]$Port = 8080,
  [string]$Root = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

# SnoopyOS - servidor HTTP estatico minimalista sobre TcpListener puro.
# No requiere Python, Node, ni permisos de URL ACL (a diferencia de HttpListener).
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path $Root).Path

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.webp' = 'image/webp'
  '.ico'  = 'image/x-icon'
  '.woff2'= 'font/woff2'
  '.mp4'  = 'video/mp4'
  '.webm' = 'video/webm'
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $Port)
$listener.Start()

$ips = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254*' -and $_.PrefixLength -eq 24 } |
  Select-Object -ExpandProperty IPAddress

Write-Output "SnoopyOS :: sirviendo '$Root'"
foreach ($ip in $ips) { Write-Output "  -> http://${ip}:$Port/" }
Write-Output "listo."

while ($true) {
  try {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)

    $requestLine = $reader.ReadLine()
    if (-not $requestLine) { $client.Close(); continue }

    $parts = $requestLine -split ' '
    $target = if ($parts.Count -ge 2) { $parts[1] } else { '/' }
    while ($true) {
      $line = $reader.ReadLine()
      if ($null -eq $line -or $line -eq '') { break }
    }

    $path = ($target -split '\?')[0]
    $path = [System.Uri]::UnescapeDataString($path)
    if ($path.EndsWith('/')) { $path += 'index.html' }

    $full = Join-Path $Root $path.TrimStart('/')
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
      $body = [System.Text.Encoding]::UTF8.GetBytes("<!doctype html><meta charset=utf-8><body style='font:16px sans-serif;background:#16130f;color:#f7f5f0;padding:40px'><h1>404</h1><p>$path</p>")
      $head = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      $stream.Write([System.Text.Encoding]::ASCII.GetBytes($head), 0, $head.Length)
      $stream.Write($body, 0, $body.Length)
      $client.Close()
      continue
    }

    $bytes = [System.IO.File]::ReadAllBytes($full)
    $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
    $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
    $head = "HTTP/1.1 200 OK`r`nContent-Type: $type`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
    $stream.Write([System.Text.Encoding]::ASCII.GetBytes($head), 0, $head.Length)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush()
    $client.Close()
  } catch {
    # nunca matar el loop por una conexion mala
    try { $client.Close() } catch {}
  }
}
