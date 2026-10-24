$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'source-lite'

foreach ($d in @($src, "$src\assets", "$src\assets\fonts", "$src\assets\plates", "$src\assets\posters",
    "$src\assets\chars", "$src\android", "$src\android\app", "$src\android\app\res", "$src\android\app\res\values",
    "$src\android\app\res\drawable", "$src\android\app\src", "$src\android\app\src\com",
    "$src\android\app\src\com\snoopy", "$src\android\app\src\com\snoopy\tv", "$src\tools")) {
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null }
}

Copy-Item (Join-Path $root 'index.html') $src -Force
Copy-Item (Join-Path $root 'README.md') $src -Force
Copy-Item (Join-Path $root 'AGENTS.md') $src -Force
Copy-Item (Join-Path $root '.gitignore') $src -Force
Copy-Item (Join-Path $root 'assets\*.css') (Join-Path $src 'assets') -Force
Copy-Item (Join-Path $root 'assets\*.js') (Join-Path $src 'assets') -Force
Copy-Item (Join-Path $root 'assets\fonts\*') (Join-Path $src 'assets\fonts') -Force
Copy-Item (Join-Path $root 'assets\plates\*.jpg') (Join-Path $src 'assets\plates') -Force
$charSrc = Join-Path $src 'assets\chars'
Get-ChildItem (Join-Path $root 'assets\chars') -File -Filter '*.cut.png' | ForEach-Object {
  Copy-Item $_.FullName (Join-Path $charSrc $_.Name) -Force
}
Copy-Item (Join-Path $root 'assets\posters\*.jpg') (Join-Path $src 'assets\posters') -Force
Copy-Item (Join-Path $root 'android\app\AndroidManifest.xml') (Join-Path $src 'android\app') -Force
Copy-Item (Join-Path $root 'android\app\src\com\snoopy\tv\MainActivity.java') (Join-Path $src 'android\app\src\com\snoopy\tv') -Force
Copy-Item (Join-Path $root 'android\app\res\values\*.xml') (Join-Path $src 'android\app\res\values') -Force
Copy-Item (Join-Path $root 'android\app\res\drawable\*.png') (Join-Path $src 'android\app\res\drawable') -Force
Copy-Item (Join-Path $root 'tools\*.ps1') (Join-Path $src 'tools') -Force
Copy-Item (Join-Path $root 'tools\*.json') (Join-Path $src 'tools') -Force

$all = @()
foreach ($d in @($src, "$src\assets", "$src\assets\fonts", "$src\assets\plates", "$src\assets\posters",
    "$src\android\app", "$src\android\app\res\values", "$src\android\app\res\drawable",
    "$src\android\app\src\com\snoopy\tv", "$src\tools", "$src\assets\chars")) {
  $all += Get-ChildItem $d -File -ErrorAction SilentlyContinue
}
$sum = ($all | Measure-Object -Property Length -Sum).Sum
$bad = @($all | Where-Object { $_.Name -match 'keystore|\.apk$|\.jks$' })
Write-Output ("fuente ligera: {0} ficheros · {1} KB" -f $all.Count, [math]::Round($sum / 1KB, 1))
Write-Output ("sin claves: {0}" -f ($bad.Count -eq 0))
