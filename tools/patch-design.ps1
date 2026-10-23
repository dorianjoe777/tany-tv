$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$nl = "`n"

function Patch([string]$file, [array]$pairs) {
  $path = Join-Path $root $file
  $txt = [System.IO.File]::ReadAllText($path)
  $i = 0
  foreach ($p in $pairs) {
    $i++
    $old = $p[0]; $new = $p[1]; $isRegex = ($p.Count -gt 2 -and $p[2] -eq 're')
    if ($isRegex) {
      $rx = [regex]::new($old, [System.Text.RegularExpressions.RegexOptions]::Multiline)
      if (-not $rx.IsMatch($txt)) { throw "PATTERN NOT FOUND [$file #$i]" }
      $txt = $rx.Replace($txt, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $new })
    } else {
      if (-not $txt.Contains($old)) { throw "TEXT NOT FOUND [$file #$i]: $old" }
      $txt = $txt.Replace($old, $new)
    }
  }
  [System.IO.File]::WriteAllText($path, $txt, (New-Object System.Text.UTF8Encoding($false)))
  Write-Output "OK $file ($($pairs.Count) changes)"
}

# ---------------- data.js : poster editorial ----------------
$posterNew = @'
function fitLines(title, maxW, baseSize) {
  const words = String(title).split(' ');
  const approx = (s, size) => s.length * size * 0.415;
  let lines = [''];
  for (const w of words) {
    const test = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + w : w;
    if (approx(test, baseSize) > maxW && lines[lines.length - 1]) lines.push(w);
    else lines[lines.length - 1] = test;
  }
  if (lines.length > 3) lines = [lines.slice(0, 2).join(' '), lines.slice(2).join(' ')];
  let size = baseSize;
  while (lines.length > 1 && Math.max.apply(null, lines.map(l => approx(l, size))) > maxW) {
    size -= 1.5;
    if (size < 13) break;
  }
  return { lines, size };
}

function posterSVG(item, opts) {
  opts = opts || {};
  const uid = 'p' + item.id;
  const pal = item.pal || ['#2A3348', '#4A5570', '#EFC24A'];
  const c1 = pal[0], c2 = pal[1], acc = pal[2];
  const motif = MOTIFS[item.motif] || MOTIFS.snoopy;
  const fit = fitLines(item.title, 248, opts.size || 27);
  const size = fit.size;
  const startY = 356 - (fit.lines.length - 1) * (size * 1.02);

  const lineEls = fit.lines.map((l, i) =>
    `<text x="150" y="${startY + i * size * 1.02}" text-anchor="middle" font-family="DM Serif Display,Georgia,serif"
       font-size="${size}" fill="#F6F1E4">${esc(l)}</text>`).join('');

  const year = item.year ? String(item.year) : '';
  const dur = item.dur ? ' / ' + item.dur + "'" : '';

  return `<svg viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(item.title)}">
    <defs>
      <linearGradient id="${uid}g" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
      </linearGradient>
      <pattern id="${uid}d" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r="1.1" fill="#ffffff" opacity=".5"/>
      </pattern>
      <radialGradient id="${uid}v" cx="50%" cy="42%" r="72%">
        <stop offset="55%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity=".34"/>
      </radialGradient>
    </defs>
    <rect width="300" height="450" fill="url(#${uid}g)"/>
    <circle cx="240" cy="62" r="46" fill="${acc}" opacity=".13"/>
    <g transform="translate(0,-8)">${motif}</g>
    <rect width="300" height="450" fill="url(#${uid}v)"/>
    <rect y="296" width="300" height="154" fill="#0B0A07" opacity=".86"/>
    <rect y="296" width="300" height="1.4" fill="${acc}"/>
    ${lineEls}
    <text x="150" y="424" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="10.5"
      letter-spacing="2.2" fill="${acc}" opacity=".92">${esc(year + dur)}</text>
    <rect x=".7" y=".7" width="298.6" height="448.6" fill="none" stroke="#ffffff" stroke-opacity=".1"/>
  </svg>`;
}

function esc(s) {
'@

Patch 'assets\data.js' @(
  ,@('function fitLines\(title, maxW, baseSize\) \{[\s\S]*?\n\}\n\nfunction esc\(s\) \{', $posterNew, 're')
)

# ---------------- os.js ----------------
$continueNew = @'
function continueCard(c) {
  const item = MOVIES.concat(SERIES).find(x => x.id === c.ref) || MOVIES[0];
  return `<article class="c-card" tabindex="-1" data-item="${item.id}">
    <div class="c-art">${posterSVG(item)}</div>
    <div class="c-scrim"></div>
    <span class="c-left">${c.left} min</span>
    <div class="c-info">
      <div class="c-title">${esc(item.title)}</div>
      <div class="c-sub">${item.year} / ${esc(item.genres[0])} / quedan ${c.left} min</div>
      <div class="c-note">${esc(c.note)}</div>
    </div>
    <div class="c-bar"><i style="width:${Math.round(c.prog * 100)}%"></i></div>
  </article>`;
}
'@

$weatherNew = @'
function applyWeather() {
  const w = WEATHER[State.settings.theme] || WEATHER.tarde;
  const icon = $('.weather-widget .wx-icon');
  if (icon) icon.innerHTML = w[0];
  const pv = $('#pv-text');
  if (pv) pv.textContent = w[1];
}
'@

Patch 'assets\os.js' @(
  ,@("`$('#thought p')", "`$('#thought span')")
  ,@("{ title: 'Continuar viendo", "{ idx: '01', title: 'Continuar viendo")
  ,@("{ title: 'Pel", "{ idx: '02', title: 'Pel")
  ,@("{ title: 'Series", "{ idx: '03', title: 'Series")
  ,@("{ title: 'Recomendado por Lucy", "{ idx: '04', title: 'Recomendado por Lucy")
  ,@("{ title: 'Mundo de Snoopy", "{ idx: '05', title: 'Mundo de Snoopy")
  ,@('      <div class="rail-head">' + $nl + '        <span class="rail-title">', '      <div class="rail-head">' + $nl + '        <span class="rail-idx">${esc(r.idx)}</span>' + $nl + '        <span class="rail-title">')
  ,@('function continueCard\(c\) \{[\s\S]*?\n  </article>`;\n\}', $continueNew, 're')
  ,@('function applyWeather\(\) \{[\s\S]*?\n\}', $weatherNew, 're')
  ,@('Cometa: probabilidad de despegue 70%', 'Cometa: probabilidad de despegue 70%')
  ,@('>Cometa: ', '>Cometa: ')
)

# fix del texto arabes: se hace aparte por codificacion
$osPath = Join-Path $root 'assets\os.js'
$osTxt = [System.IO.File]::ReadAllText($osPath)
$osTxt = [regex]::Replace($osTxt, 'Cometa:\s*\S+\s*de despegue', 'Cometa: probabilidad de despegue')
[System.IO.File]::WriteAllText($osPath, $osTxt, (New-Object System.Text.UTF8Encoding($false)))
Write-Output 'OK assets\os.js (fix texto arabe)'

# ---------------- os.css ----------------
Patch 'assets\os.css' @(
  ,@('.set-row.is-focused .s-value{color:var(--cream)}', '.set-row.is-focused .set-value{color:var(--cream)}')
)

Write-Output '--- patch diseno listo ---'
