$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'tools\poster-args.json'
$j = Get-Content $src -Raw | ConvertFrom-Json
$all = $j.requests
Write-Output ("total posteres: {0}" -f $all.Count)

$outDir = Join-Path $root 'assets\posters'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$batches = @()
for ($i = 0; $i -lt $all.Count; $i += 10) {
  $slice = @($all[$i..([Math]::Min($i + 9, $all.Count - 1))])
  $file = Join-Path $root ("tools\poster-batch-{0}.json" -f ($batches.Count + 1))
  $json = @{ requests = $slice } | ConvertTo-Json -Depth 6
  [System.IO.File]::WriteAllText($file, $json, (New-Object System.Text.UTF8Encoding($false)))
  $batches += $file
}

$nodeIds = @()
foreach ($b in $batches) {
  Write-Output ("--- generando {0} ---" -f (Split-Path -Leaf $b))
  $res = mcode-tools connector call connector__matrix__generate_image --args-file $b 2>&1 | Out-String
  Write-Output $res.Trim()
  try {
    $parsed = $res | ConvertFrom-Json
    foreach ($s in $parsed.success_items) { $nodeIds += [pscustomobject]@{ id = $s.node_id; name = $s.file_name } }
  } catch { Write-Output '  (respuesta no parseable)' }
}

Write-Output '--- descargando ---'
foreach ($n in $nodeIds) {
  $json = mcode-tools get_asset_url $n.id 2>&1 | Out-String
  $url = ($json | ConvertFrom-Json).download_url
  if (-not $url) { Write-Output ("  sin url {0}" -f $n.name); continue }
  $dest = Join-Path $outDir $n.name
  Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -TimeoutSec 300
  Write-Output ("  {0} -> {1} KB" -f $n.name, [math]::Round((Get-Item $dest).Length / 1KB, 1))
}
Write-Output '--- listo ---'
