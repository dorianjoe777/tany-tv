$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$cssPath = Join-Path $root 'assets\os.css'
$css = [System.IO.File]::ReadAllText($cssPath)

function Rep([string]$old, [string]$new, [string]$label) {
  if (-not $script:css.Contains($old)) { throw "NO ENCONTRADO: $label" }
  $script:css = $script:css.Replace($old, $new)
}

# El lienzo manda: el escenario se reparte en filas.
Rep @'
#stage{
  position:absolute;left:0;top:0;width:1280px;height:720px;overflow:hidden;
  transform-origin:top left;
  transform:translate(var(--sx,0px),var(--sy,0px)) scale(var(--ss,1));
}
'@ @'
#stage{
  position:absolute;left:0;top:0;width:1280px;height:720px;overflow:hidden;
  transform-origin:top left;
  transform:translate(var(--sx,0px),var(--sy,0px)) scale(var(--ss,1));
  display:flex;flex-direction:column;
}
'@ 'stage flex'

Rep '#topbar{position:relative;z-index:20;display:flex;align-items:center;gap:2.4rem;' '#topbar{position:relative;z-index:20;flex:0 0 auto;display:flex;align-items:center;gap:2.4rem;' 'topbar flex'
Rep '#screens{position:relative;z-index:10;height:calc(100vh - 13.6rem);overflow:hidden}' '#screens{position:relative;z-index:10;flex:1 1 auto;min-height:0;overflow:hidden}' 'screens flex'
Rep '#bottombar{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;' '#bottombar{position:relative;z-index:20;flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;' 'bottombar flex'

# Los overlays viven dentro del lienzo.
Rep '.overlay{position:fixed;inset:0;z-index:100;background:#0A0907;' '.overlay{position:absolute;inset:0;z-index:100;background:#0A0907;' 'overlay absolute'
Rep '#cursor{position:fixed;left:0;top:0;' '#cursor{position:absolute;left:0;top:0;' 'cursor absolute'

# El toast tambien, para que escale con el lienzo.
Rep '#toast{position:fixed;left:50%;bottom:5.4rem;' '#toast{position:absolute;left:50%;bottom:5.4rem;' 'toast absolute'

# Las media queries median el panel, no la tele: fuera.
Rep @'
@media (max-aspect-ratio:4/3){
  .hero-art{width:12rem;height:18rem}
  .hero-title{font-size:2.4rem}
  .card{flex-basis:10.5rem}
}
@media (max-width:1100px){
  .wx-panel{display:none}
  .brand-sub{display:none}
  .hero{gap:1.4rem}
  .hero-art{width:12.5rem;height:18.75rem}
  .hero-title{font-size:2.2rem}
  .hero-syn{font-size:.95rem}
  .screen-sub{display:none}
}
'@ '' 'media queries fuera'

# La noche azul: la escena entera se tiñe.
Rep 'body[data-theme="noche"] .tint{background:rgba(60,80,160,.34);mix-blend-mode:multiply}' 'body[data-theme="noche"] .tint{background:rgba(54,78,168,.52);mix-blend-mode:multiply}' 'tint noche'
Rep @'
body[data-theme="noche"] .sky{background:linear-gradient(180deg,#08090E 0%,#0D0F16 52%,#131722 100%)}
'@ @'
body[data-theme="noche"] .sky{background:linear-gradient(180deg,#07080F 0%,#0C1020 48%,#141C3A 76%,#1E2A52 100%)}
'@ 'sky noche'
Rep 'body[data-theme="noche"] .glow{opacity:.45}' 'body[data-theme="noche"] .glow{opacity:.7;background:radial-gradient(50% 50% at 50% 50%, rgba(120,160,255,.16), rgba(90,120,220,.06) 42%, transparent 72%)}' 'glow noche'

[System.IO.File]::WriteAllText($cssPath, $css, (New-Object System.Text.UTF8Encoding($false)))
Write-Output 'css actualizado para el lienzo fijo'
