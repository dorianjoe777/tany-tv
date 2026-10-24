$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$path = Join-Path $root 'index.html'
$txt = [System.IO.File]::ReadAllText($path)
$nl = "`n"

function Sub([string]$pattern, [string]$replacement, [string]$label) {
  $script:txt = [regex]::Replace($script:txt, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $replacement }, [System.Text.RegularExpressions.RegexOptions]::Singleline)
}

# 1. cabecera: reloj grande + chip de clima
$header = @'
<div class="status">
    <div class="clock-block">
      <time id="clock">--:--</time>
      <span id="date">&#8212;</span>
    </div>
    <button class="wx-chip" id="weather" title="Cambiar el cielo del barrio">
      <span class="wx-chip-icon" id="wx-glyph-chip"></span>
      <span class="wx-chip-temp" id="wx-temp-chip">--&#176;</span>
    </button>
  </div>
</header>
'@
Sub '<div class="status">[\s\S]*?</header>' ($header + "`n</header>") 'cabecera'

# 2. hero: panel de clima a la derecha
$panel = @'
    <aside class="wx-panel" id="wx-panel">
      <div class="wxp-top">
        <span class="wxp-glyph" id="wx-glyph"></span>
        <span class="wxp-temp" id="wx-temp">--&#176;</span>
      </div>
      <div class="wxp-city" id="wx-city">&#8212;</div>
      <div class="wxp-label" id="wx-label">&#8212;</div>
      <div class="wxp-range" id="wx-range">&#8212;</div>
      <div class="wxp-hours" id="wx-hours"></div>
      <div class="wxp-sun">
        <span class="wxp-sun-item"><em>amanecer</em><span id="wx-sunrise">--:--</span></span>
        <span class="wxp-sun-bar"><i id="wx-sun-bar"></i></span>
        <span class="wxp-sun-item"><em>atardecer</em><span id="wx-sunset">--:--</span></span>
      </div>
    </aside>

'@
Sub '(<div class="rails" id="home-rails">)' ($panel + '$1') 'panel de clima'

# 3. reposo: reloj grande + clima
$idle = @'
    <div class="idle-wordmark">
      <span class="iw-name">TANY<em>TV</em></span>
      <div class="idle-info">
        <span class="idle-time" id="idle-clock">--:--</span>
        <span class="idle-wx" id="idle-wx"></span>
      </div>
'@
Sub '<div class="idle-wordmark">[\s\S]*?<span class="iw-name">TANY<em>TV</em></span>' $idle 'reposo'

[System.IO.File]::WriteAllText($path, $txt, (New-Object System.Text.UTF8Encoding($false)))
Write-Output 'index.html actualizado'
