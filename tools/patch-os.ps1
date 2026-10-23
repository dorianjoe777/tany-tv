$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

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

$nl = "`n"

Patch 'assets\os.js' @(
  ,@('^[ \t]*syncNowPlaying\(el\);\r?\n', '', 're')
  ,@('    if (row === rowOf(cur)) continue;', "    if (row === curRow || (curRow && (row.contains(curRow) || curRow.contains(row)))) continue;")
  ,@(' data-nav-row="card-${item.id}"', '')
  ,@(' data-nav-row="cont-${c.id}"', '')
  ,@(' data-nav-row="chan-${c.id}"', '')
  ,@(' data-nav-row="chrow-${c.id}"', '')
  ,@(' data-nav-row="shop-${s.id}"', '')
  ,@(' data-nav-row="set-${r.k}"', '')
  ,@('^\s*<rect width="1600" height="900" fill="#e0a martial"/>\r?\n', '', 're')
  ,@('>Nada de [^<]*</text>', '>Snoopy con gafas. Nada mas hace falta.</text>', 're')
  ,@('<div class="shop-icon">${MOTIFS[s.icon] || MOTIFS.snoopy}</div>', '<div class="shop-icon"><svg viewBox="40 110 220 210">${MOTIFS[s.icon] || MOTIFS.snoopy}</svg></div>')
  ,@('function boot() {', "let booted = false;${nl}function boot() {${nl}  if (booted) return;${nl}  booted = true;")
  ,@("  if (el.matches('.card[data-item]')) { openPlayer(el.dataset.item); return; }", "  if (el.matches('.card[data-item], .c-card[data-item]')) {${nl}    lastItemId = el.dataset.item;${nl}    openPlayer(el.dataset.item);${nl}    return;${nl}  }")
  ,@("  if (el.matches('.c-card[data-item]')) { openPlayer(el.dataset.item); return; }", '')
  ,@("  if (el.matches('.ch-card[data-channel]')) { openChannel(el.dataset.channel); return; }", "  if (el.matches('.ch-card[data-channel]')) {${nl}    lastChannelId = el.dataset.channel;${nl}    openChannel(el.dataset.channel);${nl}    return;${nl}  }")
  ,@("  const cur = State.current;${nl}  if (!cur) return;", "  const cur = State.current;${nl}  if (!cur) return;${nl}  const curRow = rowOf(cur);")
)

Patch 'index.html' @(
  ,@('<div class="hero-actions">', '<div class="hero-actions" data-nav-row="hero">')
  ,@(' data-nav-row="hero"', '')
  ,@('<div class="grid" id="movie-grid"></div>', '<div class="grid" id="movie-grid" data-nav-row="grid-movie"></div>')
  ,@('<div class="grid" id="series-grid"></div>', '<div class="grid" id="series-grid" data-nav-row="grid-series"></div>')
  ,@('<div class="continue-grid" id="continue-grid"></div>', '<div class="continue-grid" id="continue-grid" data-nav-row="grid-continue"></div>')
  ,@('<div class="channel-grid" id="channel-grid"></div>', '<div class="channel-grid" id="channel-grid" data-nav-row="grid-channel"></div>')
  ,@('<div class="shop-grid" id="shop-grid"></div>', '<div class="shop-grid" id="shop-grid" data-nav-row="grid-shop"></div>')
)

Write-Output '--- patch done ---'
