$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$path = Join-Path $root 'assets\data.js'
$txt = [System.IO.File]::ReadAllText($path)

$map = [ordered]@{
  'mv1' = 'p-mv1.jpg'; 'mv2' = 'p-mv2.jpg'; 'mv3' = 'p-mv3.jpg'; 'mv4' = 'p-mv4.jpg'
  'mv5' = 'p-mv5.jpg'; 'mv6' = 'p-mv6.jpg'; 'mv7' = 'p-mv7.jpg'; 'mv8' = 'p-mv8.jpg'
  'mv9' = 'p-mv9.jpg'; 'mv10' = 'p-mv10.jpg'; 'mv11' = 'p-mv11.jpg'
  'sr1' = 'p-sr1.jpg'; 'sr2' = 'p-sr2.jpg'; 'sr3' = 'p-sr3.jpg'; 'sr4' = 'p-sr4.jpg'
  'sr5' = 'p-sr5.jpg'; 'sr6' = 'p-sr6.jpg'; 'sr7' = 'p-sr7.jpg'; 'sr8' = 'p-sr8.jpg'
}

foreach ($k in $map.Keys) {
  $old = "id:'$k',"
  $new = "id:'$k', art:'$($map[$k])',"
  if (-not $txt.Contains($old)) { throw "no encontrado: $old" }
  $txt = $txt.Replace($old, $new)
}

[System.IO.File]::WriteAllText($path, $txt, (New-Object System.Text.UTF8Encoding($false)))
Write-Output ("arte asignado a {0} titulos" -f $map.Count)
