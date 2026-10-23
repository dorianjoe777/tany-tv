$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$dir = Join-Path $root 'assets\posters'
Add-Type -AssemblyName System.Drawing

function Normalize([string]$src, [string]$dst, [int]$w, [int]$h, [long]$q) {
  $img = [System.Drawing.Image]::FromFile($src)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.SmoothingMode = 'HighQuality'
  $g.PixelOffsetMode = 'HighQuality'
  $g.DrawImage($img, 0, 0, $w, $h)
  $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $q
  $bmp.Save($dst, $enc, $ep)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
}

$total = 0
Get-ChildItem -Path $dir -File | Where-Object { $_.Extension -in '.png', '.jpg', '.jpeg' } | ForEach-Object {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
  $final = Join-Path $dir ($base + '.jpg')
  $tmp = Join-Path $dir ($base + '.__tmp.jpg')
  if (Test-Path $tmp) { [System.IO.File]::Delete($tmp) }
  Normalize $_.FullName $tmp 640 853 76
  Move-Item -Path $tmp -Destination $final -Force
  $kb = [math]::Round((Get-Item $final).Length / 1KB, 1)
  Write-Output ("  {0}.jpg  {1} KB" -f $base, $kb)
  $total += $kb
}
Write-Output ("total: {0} KB" -f [math]::Round($total / 1024, 2))
