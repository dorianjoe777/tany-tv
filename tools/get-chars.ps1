$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$dir = Join-Path $root 'assets\chars'
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$items = @(
  @{ id = '455664424751371'; name = 'c-snoopy.png' },
  @{ id = '455663586484332'; name = 'c-charlie.png' },
  @{ id = '455664393740424'; name = 'c-woodstock.jpg' },
  @{ id = '455664572444931'; name = 'c-globo.png' },
  @{ id = '455664424751373'; name = 'c-linus.jpg' },
  @{ id = '455664135151770'; name = 'c-lucy.jpg' },
  @{ id = '455664572444950'; name = 'c-casaperro.jpg' },
  @{ id = '455664572444940'; name = 'c-cometa.png' },
  @{ id = '455664135151774'; name = 'c-futbol.png' },
  @{ id = '455664135151776'; name = 'c-piano.png' }
)

foreach ($it in $items) {
  $dest = Join-Path $dir $it.name
  if (Test-Path $dest) { Write-Output ("  ya esta {0}" -f $it.name); continue }
  $json = mcode-tools get_asset_url $it.id 2>&1 | Out-String
  $url = ($json | ConvertFrom-Json).download_url
  if (-not $url) { Write-Output ("  sin url {0}" -f $it.name); continue }
  Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -TimeoutSec 300
  Write-Output ("  {0} ({1} KB)" -f $it.name, [math]::Round((Get-Item $dest).Length / 1KB, 1))
}

Write-Output '--- recortando fondos ---'
& powershell -ExecutionPolicy Bypass -File (Join-Path $root 'tools\cutout.ps1')
