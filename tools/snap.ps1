param([string]$Out = 'tv.png', [string]$Device = '100.73.44.16:33377', [int]$Wait = 3)

# Captura la pantalla actual de la TV por ADB y la trae al proyecto.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$adb = Join-Path $root 'tools\platform-tools\adb.exe'
$dir = Join-Path $root 'shots'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$path = if ([System.IO.Path]::IsPathRooted($Out)) { $Out } else { Join-Path $dir $Out }

Start-Sleep -Seconds $Wait
& $adb -s $Device shell screencap -p /sdcard/_snap.png | Out-Null
& $adb -s $Device pull /sdcard/_snap.png $path | Out-Null
& $adb -s $Device shell rm -f /sdcard/_snap.png | Out-Null
Write-Output "SNAP $path ($([math]::Round((Get-Item $path).Length/1024,1)) KB)"
