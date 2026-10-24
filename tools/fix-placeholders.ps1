$ErrorActionPreference = 'Stop'
$p = Join-Path (Split-Path -Parent $PSScriptRoot) 'index.html'
$t = [System.IO.File]::ReadAllText($p)
$nl = "`n"

$blocks = @(
  '  <div class="depth-layer depth-far" id="depth-far">' + $nl + '    <img src="assets/plates/depth-far.jpg" alt="">',
  '  <div class="depth-layer depth-mid" id="depth-mid">' + $nl + '    <img src="assets/plates/depth-mid.jpg" alt="">',
  '  <div class="depth-layer depth-near" id="depth-near">' + $nl + '    <img src="assets/plates/depth-near.jpg" alt="">'
)

$lines = $t -split "`r?`n"
$out = New-Object System.Collections.Generic.List[string]
$i = 0
foreach ($l in $lines) {
  if ($l.Trim() -eq '$1' -and $i -lt $blocks.Count) {
    $out.Add($blocks[$i])
    $i++
  } else {
    $out.Add($l)
  }
}
Write-Output ("sustituidos: {0}" -f $i)
$t = $out -join $nl
[System.IO.File]::WriteAllText($p, $t, (New-Object System.Text.UTF8Encoding($false)))
$o = ([regex]::Matches($t, '<div[\s>]')).Count
$c = ([regex]::Matches($t, '</div>')).Count
Write-Output ("div: {0} abre / {1} cierra" -f $o, $c)
