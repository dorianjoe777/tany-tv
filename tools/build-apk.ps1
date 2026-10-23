param([switch]$Install, [string]$Device = '100.73.44.16:33377')

# Compila SNOOPY TV como APK nativo de Android TV y lo instala en la TV.
# Sin Gradle: aapt2 (recursos) + javac + d8 (dex) + zipalign + apksigner.
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot

# Toolchain Android: se usa el local si existe; si no, el del proyecto hermano.
$sdkCandidates = @(
  (Join-Path $root 'tools\android-sdk'),
  'C:\Users\DELL\.minimax\sessions\mvs_d7351cdfe44f4d4c959469cb726ed39e\workspace\toolchain\android-sdk'
)
$sdk = $sdkCandidates | Where-Object { Test-Path (Join-Path $_ 'build-tools\34.0.0\aapt2.exe') } | Select-Object -First 1
$jdkCandidates = @(
  (Join-Path $root 'tools\jdk'),
  'C:\Users\DELL\.minimax\sessions\mvs_d7351cdfe44f4d4c959469cb726ed39e\workspace\toolchain\jdk'
)
$jdk = $jdkCandidates | Where-Object { Test-Path (Join-Path $_ 'bin\javac.exe') } | Select-Object -First 1

$bt = Join-Path $sdk 'build-tools\34.0.0'
$app = Join-Path $root 'android\app'
$adb = Join-Path $root 'tools\platform-tools\adb.exe'
$platform = Join-Path $sdk 'platforms\android-34\android.jar'

if (-not $platform) { Write-Output 'FALTA android.jar'; exit 1 }
if (-not (Test-Path (Join-Path $jdk 'bin\javac.exe'))) { Write-Output 'FALTA el JDK'; exit 1 }
Write-Output "SDK: $sdk"
Write-Output "JDK: $jdk"

$env:JAVA_HOME = $jdk
$env:PATH = "$jdk\bin;$env:PATH"

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$build = Join-Path $root "android\build\$stamp"
New-Item -ItemType Directory -Force -Path $build | Out-Null
$resDir = Join-Path $app 'res'
$drawDir = Join-Path $resDir 'drawable'
New-Item -ItemType Directory -Force -Path $drawDir | Out-Null
$assets = Join-Path $build 'assets'
New-Item -ItemType Directory -Force -Path $assets | Out-Null

# ---------- 1. icono y banner (PNG generados, sin dependencias externas) ----------
Add-Type -AssemblyName System.Drawing
function New-Icon([string]$path) {
  $s = 192
  $bmp = New-Object System.Drawing.Bitmap $s, $s
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::FromArgb(255, 22, 19, 15))
  $yellow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 243, 195, 77))
  $ink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 26, 22, 16))
  $beak = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 224, 138, 60))
  $g.FillEllipse($yellow, 34, 56, 112, 112)
  $pts = @(
    (New-Object System.Drawing.Point 142, 88),
    (New-Object System.Drawing.Point 186, 110),
    (New-Object System.Drawing.Point 142, 132)
  )
  $g.FillPolygon($beak, $pts)
  $g.FillEllipse($ink, 110, 84, 19, 19)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 26, 22, 16)), 11
  $pen.StartCap = 'Round'; $pen.EndCap = 'Round'
  $g.DrawArc($pen, 52, 26, 62, 62, 195, 145)
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
function New-Banner([string]$path) {
  $w = 320; $h = 180
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $g.Clear([System.Drawing.Color]::FromArgb(255, 22, 19, 15))
  $yellow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 243, 195, 77))
  $cream = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 248, 242, 225))
  $ink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 26, 22, 16))
  $beak = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 224, 138, 60))
  $g.FillEllipse($yellow, 30, 62, 92, 92)
  $g.FillEllipse($ink, 88, 86, 15, 15)
  $pts = @(
    (New-Object System.Drawing.Point 114, 90),
    (New-Object System.Drawing.Point 150, 107),
    (New-Object System.Drawing.Point 114, 124)
  )
  $g.FillPolygon($beak, $pts)
  $f1 = New-Object System.Drawing.Font 'Arial Black', 38
  $f2 = New-Object System.Drawing.Font 'Arial Black', 20
  $g.FillRectangle($yellow, 14, 14, 6, 152)
  $g.DrawString('SNOOPY', $f1, $cream, 36, 40)
  $g.DrawString('TV', $f2, $yellow, 196, 96)
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
New-Icon (Join-Path $drawDir 'ic_launcher.png')
New-Banner (Join-Path $drawDir 'ic_banner.png')
Write-Output '1/7 icono y banner generados'

# ---------- 2. empaquetar la web dentro del APK ----------
$site = Join-Path $assets 'site'
New-Item -ItemType Directory -Force -Path (Join-Path $site 'assets\plates') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $site 'assets\fonts') | Out-Null
Copy-Item (Join-Path $root 'index.html') $site -Force
Copy-Item (Join-Path $root 'assets\*.css') (Join-Path $site 'assets') -Force
Copy-Item (Join-Path $root 'assets\*.js') (Join-Path $site 'assets') -Force
Copy-Item (Join-Path $root 'assets\fonts\*.woff2') (Join-Path $site 'assets\fonts') -Force
Copy-Item (Join-Path $root 'assets\fonts\fonts.css') (Join-Path $site 'assets\fonts') -Force
Copy-Item (Join-Path $root 'assets\plates\*.jpg') (Join-Path $site 'assets\plates') -Force
Write-Output '2/7 sitio web empaquetado en assets/site'

# ---------- 3. recursos ----------
$flat = Join-Path $build 'res.zip'
& (Join-Path $bt 'aapt2.exe') compile --dir $resDir -o $flat
if ($LASTEXITCODE -ne 0) { Write-Output 'FALLO aapt2 compile'; exit 1 }

$unsigned = Join-Path $build 'app-unsigned.apk'
& (Join-Path $bt 'aapt2.exe') link -o $unsigned -I $platform --manifest (Join-Path $app 'AndroidManifest.xml') -A $assets --min-sdk-version 24 --target-sdk-version 34 --version-code 1 --version-name 1.0 $flat
if ($LASTEXITCODE -ne 0) { Write-Output 'FALLO aapt2 link'; exit 1 }
Write-Output '3/7 recursos enlazados'

# ---------- 4. java -> classes ----------
$classes = Join-Path $build 'classes'
New-Item -ItemType Directory -Force -Path $classes | Out-Null
& (Join-Path $jdk 'bin\javac.exe') -source 8 -target 8 -nowarn -bootclasspath $platform -classpath $platform -d $classes (Join-Path $app 'src\com\snoopy\tv\MainActivity.java')
if ($LASTEXITCODE -ne 0) { Write-Output 'FALLO javac'; exit 1 }
Write-Output '4/7 java compilado'

# ---------- 5. classes -> dex ----------
$dexDir = Join-Path $build 'dex'
New-Item -ItemType Directory -Force -Path $dexDir | Out-Null
$classFiles = (Get-ChildItem -Path $classes -Filter *.class -Recurse | ForEach-Object { $_.FullName })
& (Join-Path $bt 'd8.bat') --lib $platform --min-api 24 --output $dexDir $classFiles
if ($LASTEXITCODE -ne 0) { Write-Output 'FALLO d8'; exit 1 }
Write-Output '5/7 dex generado'

# ---------- 6. meter el dex en el apk + alinear ----------
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($unsigned, 'Update')
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, (Join-Path $dexDir 'classes.dex'), 'classes.dex') | Out-Null
$zip.Dispose()
$aligned = Join-Path $build 'app-aligned.apk'
& (Join-Path $bt 'zipalign.exe') -f -p 4 $unsigned $aligned
if ($LASTEXITCODE -ne 0) { Write-Output 'FALLO zipalign'; exit 1 }
Write-Output '6/7 apk alineado'

# ---------- 7. firmar ----------
$ks = Join-Path $root 'tools\snoopy.keystore'
if (-not (Test-Path $ks)) {
  & (Join-Path $jdk 'bin\keytool.exe') -genkeypair -keystore $ks -alias snoopy -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname 'CN=Snoopy TV, OU=Home, O=Snoopy, L=Quito, C=EC' | Out-Null
}
$final = Join-Path $root 'android\SnoopyTV.apk'
& (Join-Path $bt 'apksigner.bat') sign --ks $ks --ks-pass pass:android --key-pass pass:android --out $final $aligned
if ($LASTEXITCODE -ne 0) { Write-Output 'FALLO apksigner'; exit 1 }
& (Join-Path $bt 'apksigner.bat') verify $final
Write-Output "7/7 APK firmado: $final ($([math]::Round((Get-Item $final).Length/1024,1)) KB)"

if ($Install) {
  Write-Output '--- instalando en la TV ---'
  & $adb -s $Device install -r -t $final
  & $adb -s $Device shell am start -n com.snoopy.tv/.MainActivity
}
