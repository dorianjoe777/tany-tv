$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$dep = Join-Path $root 'deploy'

foreach ($d in @($dep, "$dep\assets", "$dep\assets\fonts", "$dep\assets\plates", "$dep\assets\posters")) {
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null }
}

Copy-Item (Join-Path $root 'index.html') (Join-Path $dep 'index.html') -Force
Copy-Item (Join-Path $root 'assets\*.css') (Join-Path $dep 'assets') -Force
Copy-Item (Join-Path $root 'assets\*.js') (Join-Path $dep 'assets') -Force
Copy-Item (Join-Path $root 'assets\fonts\*') (Join-Path $dep 'assets\fonts') -Force
Copy-Item (Join-Path $root 'assets\plates\*.jpg') (Join-Path $dep 'assets\plates') -Force
Copy-Item (Join-Path $root 'assets\posters\*.jpg') (Join-Path $dep 'assets\posters') -Force

$all = @()
$all += Get-ChildItem $dep -File
$all += Get-ChildItem (Join-Path $dep 'assets') -File
$all += Get-ChildItem (Join-Path $dep 'assets\fonts') -File
$all += Get-ChildItem (Join-Path $dep 'assets\plates') -File
$all += Get-ChildItem (Join-Path $dep 'assets\posters') -File
$sum = ($all | Measure-Object -Property Length -Sum).Sum
$bad = @($all | Where-Object { $_.Name -match 'keystore|\.apk$|\.jks$|id_rsa' })
Write-Output ("deploy: {0} ficheros · {1} MB" -f $all.Count, [math]::Round($sum / 1MB, 2))
Write-Output ("index.html: {0}" -f (Test-Path (Join-Path $dep 'index.html')))
Write-Output ("secretos fuera: {0}" -f ($bad.Count -eq 0))
