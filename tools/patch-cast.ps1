$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$path = Join-Path $root 'index.html'
$txt = [System.IO.File]::ReadAllText($path)

function Sub([string]$pattern, [string]$replacement) {
  $script:txt = [regex]::Replace($script:txt, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $replacement }, [System.Text.RegularExpressions.RegexOptions]::Singleline)
}

# El reparto de personajes va dentro de los planos: hereda su paralaje.
Sub '(<div class="depth-layer depth-far" id="depth-far">\s*<img src="assets/plates/depth-far\.jpg" alt="">)' @'
$1
    <figure class="cast cast-linus"><img src="assets/chars/c-linus.cut.png" alt=""></figure>
    <figure class="cast cast-balloon"><img src="assets/chars/c-globo.cut.png" alt=""></figure>
'@

Sub '(<div class="depth-layer depth-mid" id="depth-mid">\s*<img src="assets/plates/depth-mid\.jpg" alt="">)' @'
$1
    <figure class="cast cast-woodstock"><img src="assets/chars/c-woodstock.cut.png" alt=""></figure>
'@

Sub '(<div class="depth-layer depth-near" id="depth-near">\s*<img src="assets/plates/depth-near\.jpg" alt="">)' @'
$1
    <figure class="cast cast-snoopy"><img src="assets/chars/c-snoopy.cut.png" alt=""></figure>
    <figure class="cast cast-football"><img src="assets/chars/c-futbol.cut.png" alt=""></figure>
'@

[System.IO.File]::WriteAllText($path, $txt, (New-Object System.Text.UTF8Encoding($false)))
Write-Output 'reparto anadido a la escena'
