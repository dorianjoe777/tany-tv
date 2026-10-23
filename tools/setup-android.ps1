$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$tools = Join-Path $root 'tools'
$jdkDir = Join-Path $tools 'jdk'
$sdkDir = Join-Path $tools 'android-sdk'

function Get-File($url, $dest) {
  if (Test-Path $dest) { Write-Output ("  cached: {0}" -f (Split-Path -Leaf $dest)); return }
  Write-Output ("  downloading: {0}" -f (Split-Path -Leaf $dest))
  Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -TimeoutSec 1800
}

# ---------- 1. JDK 17 ----------
if (-not (Test-Path (Join-Path $jdkDir 'bin\javac.exe'))) {
  Get-File 'https://aka.ms/download-jdk/microsoft-jdk-17-windows-x64.zip' (Join-Path $tools 'jdk.zip')
  Write-Output '  extracting jdk...'
  if (Test-Path $jdkDir) { [System.IO.Directory]::Delete($jdkDir, $true) }
  Expand-Archive -Path (Join-Path $tools 'jdk.zip') -DestinationPath $tools -Force
  $inner = Get-ChildItem -Path $tools -Directory | Where-Object { $_.Name -like 'jdk*' } | Select-Object -First 1
  if ($inner) { Move-Item -Path $inner.FullName -Destination $jdkDir -Force }
}
$env:JAVA_HOME = $jdkDir
$env:PATH = "$jdkDir\bin;$env:PATH"
$ver = (& (Join-Path $jdkDir 'bin\java.exe') -version 2>&1 | Out-String).Trim()
Write-Output ("JAVA: {0}" -f ($ver -split "`n")[0])

# ---------- 2. Android command line tools ----------
$cmdline = Join-Path $sdkDir 'cmdline-tools\latest\bin\sdkmanager.bat'
if (-not (Test-Path $cmdline)) {
  Get-File 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip' (Join-Path $tools 'cmdline.zip')
  Write-Output '  extracting cmdline-tools...'
  $tmp = Join-Path $tools 'cmdline-tmp'
  if (Test-Path $tmp) { [System.IO.Directory]::Delete($tmp, $true) }
  Expand-Archive -Path (Join-Path $tools 'cmdline.zip') -DestinationPath $tmp -Force
  New-Item -ItemType Directory -Force -Path (Join-Path $sdkDir 'cmdline-tools') | Out-Null
  Move-Item -Path (Join-Path $tmp 'cmdline-tools') -Destination (Join-Path $sdkDir 'cmdline-tools\latest') -Force
  [System.IO.Directory]::Delete($tmp, $true)
}

# ---------- 3. licenses + packages ----------
$yes = (1..60 | ForEach-Object { 'y' }) -join "`n"
Write-Output '  accepting licenses...'
$yes | & $cmdline --sdk_root=$sdkDir --licenses 2>&1 | Out-Null
Write-Output '  installing platforms + build-tools...'
& $cmdline --sdk_root=$sdkDir 'platforms;android-34' 'build-tools;34.0.0' 2>&1 | Select-Object -Last 6

$androidJar = Join-Path $sdkDir 'platforms\android-34\android.jar'
$aapt2 = Join-Path $sdkDir 'build-tools\34.0.0\aapt2.exe'
$d8 = Join-Path $sdkDir 'build-tools\34.0.0\d8.bat'
if ((Test-Path $androidJar) -and (Test-Path $aapt2) -and (Test-Path $d8)) {
  Write-Output 'ANDROID SDK READY'
  Write-Output ("  android.jar : {0}" -f $androidJar)
  Write-Output ("  aapt2       : {0}" -f $aapt2)
  Write-Output ("  d8          : {0}" -f $d8)
} else {
  Write-Output 'SDK INCOMPLETE'
  exit 1
}
