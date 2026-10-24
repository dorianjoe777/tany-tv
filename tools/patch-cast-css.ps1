$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$cssPath = Join-Path $root 'assets\os.css'
$css = [System.IO.File]::ReadAllText($cssPath)

# El recorte directo evita que las reglas del plano afecten al reparto.
foreach ($layer in @('far', 'mid', 'near', 'fg')) {
  $css = $css.Replace(".depth-$layer img{", ".depth-$layer > img{")
}

$cast = @'

/* ============================================================
   10 · REPARTO: personajes 3D aislados y animados
   ============================================================ */
.cast{position:absolute;margin:0;pointer-events:none;transform-style:preserve-3d;
  filter:drop-shadow(0 .7rem 1.3rem rgba(0,0,0,.62))}
.cast img{width:100%;display:block}
.cast-snoopy{right:1.5%;bottom:35%;width:13rem;animation:castbob 7s ease-in-out infinite}
.cast-linus{right:31%;bottom:25%;width:8rem;opacity:.82;animation:castbob 9.5s ease-in-out infinite reverse}
.cast-football{right:18%;bottom:21%;width:3.4rem;animation:castbounce 4.6s ease-in-out infinite}
.cast-woodstock{right:21%;top:37%;width:3.4rem;animation:castflap 3.4s ease-in-out infinite}
.cast-balloon{right:10%;top:19%;width:8rem;animation:castrise 30s linear infinite}

@keyframes castbob{0%,100%{transform:translateY(0) rotate(-1.2deg)}50%{transform:translateY(-.55rem) rotate(1.2deg)}}
@keyframes castbounce{0%,100%{transform:translateY(0) rotate(-8deg)}45%{transform:translateY(-2.2rem) rotate(14deg) scaleY(.94)}}
@keyframes castflap{0%,100%{transform:translateY(0) rotate(-7deg) scaleY(1)}50%{transform:translateY(-1.1rem) rotate(9deg) scaleY(.9)}}
@keyframes castrise{0%{transform:translateY(0) translateX(0);opacity:0}8%{opacity:1}70%{transform:translateY(-10rem) translateX(1.4rem);opacity:1}88%{opacity:0}100%{transform:translateY(-11.5rem) translateX(1.7rem);opacity:0}}

body.reduced-motion .cast{animation:none!important}
'@

if ($css -notmatch 'REPARTO: personajes 3D') { $css += $cast }
[System.IO.File]::WriteAllText($cssPath, $css, (New-Object System.Text.UTF8Encoding($false)))
Write-Output 'css del reparto actualizado'
