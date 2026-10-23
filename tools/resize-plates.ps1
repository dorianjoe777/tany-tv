$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$plates = Join-Path $root 'assets\plates'
$orig = Join-Path $plates 'orig'
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path $orig | Out-Null

# mover los originales al subcarpeta 'orig' (no se borra nada)
Get-ChildItem -Path (Join-Path $plates '*') -File | Where-Object { $_.Extension -in '.png', '.jpg' } | ForEach-Object {
  $dest = Join-Path $orig $_.Name
  if (-not (Test-Path $dest)) { Move-Item -Path $_.FullName -Destination $dest -Force; Write-Output ("  movido {0}" -f $_.Name) }
}

function Resize-Jpeg([string]$src, [string]$dst, [int]$w, [int]$h, [long]$quality) {
  $img = [System.Drawing.Image]::FromFile($src)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.SmoothingMode = 'HighQuality'
  $g.PixelOffsetMode = 'HighQuality'
  $g.DrawImage($img, 0, 0, $w, $h)
  $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $quality
  $bmp.Save($dst, $enc, $ep)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  Write-Output ("  {0} -> {1} KB" -f (Split-Path -Leaf $dst), [math]::Round((Get-Item $dst).Length / 1KB, 1))
}

$map = @(
  @{ s = 'depth-far.png';  d = 'depth-far.jpg' },
  @{ s = 'depth-mid.jpg';  d = 'depth-mid.jpg' },
  @{ s = 'depth-near.png'; d = 'depth-near.jpg' }
)
foreach ($m in $map) {
  $src = Join-Path $orig $m.s
  if (-not (Test-Path $src)) { Write-Output ("falta {0}" -f $m.s); continue }
  Resize-Jpeg $src (Join-Path $plates $m.d) 1920 1080 72
}
Write-Output 'placas listas'
