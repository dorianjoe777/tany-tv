$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$fontDir = Join-Path $project 'assets\fonts'
New-Item -ItemType Directory -Force -Path $fontDir | Out-Null

$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
$src = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&family=Bangers&family=Patrick+Hand&display=swap'

$css = (Invoke-WebRequest -Uri $src -UseBasicParsing -Headers @{ 'User-Agent' = $ua }).Content

# Google Fonts emits a subset comment before each @font-face block.
$parts = [regex]::Split($css, '/\*\s*([a-z0-9\-\[\]]+)\s*\*/')
$blocks = @()
for ($i = 1; $i -lt $parts.Count; $i += 2) {
  if ($parts[$i] -eq 'latin') { $blocks += $parts[$i + 1] }
}

$out = New-Object System.Collections.Generic.List[string]
foreach ($b in $blocks) {
  if ($b -notmatch '@font-face') { continue }
  $family = ([regex]::Match($b, "font-family:\s*'([^']+)'")).Groups[1].Value
  $weight = ([regex]::Match($b, 'font-weight:\s*(\d+)')).Groups[1].Value
  if (-not $weight) { $weight = '400' }
  $url = ([regex]::Match($b, 'url\((https://[^)]+\.woff2)\)')).Groups[1].Value
  if (-not $url) { continue }
  $slug = ($family -replace '\s', '') + '-' + $weight + '.woff2'
  $dest = Join-Path $fontDir $slug
  Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -Headers @{ 'User-Agent' = $ua }
  $out.Add("@font-face{font-family:'$family';font-style:normal;font-weight:$weight;font-display:swap;src:url('$slug') format('woff2');}")
  Write-Output ("  {0} ({1} KB)" -f $slug, [math]::Round((Get-Item $dest).Length / 1024, 1))
}

$cssOut = "/* Self-hosted fonts: the TV loads everything over the local network. */`n" + ($out -join "`n") + "`n"
[System.IO.File]::WriteAllText((Join-Path $fontDir 'fonts.css'), $cssOut, (New-Object System.Text.UTF8Encoding($false)))
Write-Output ("fonts ready: {0} files" -f $out.Count)
