# TANY TV

Sistema operativo de TV para **AI PONT SA** (Changhong, Android 14 / Google TV, 1920×1080).
Interfaz completa de的中心电视 construida como app nativa Android TV (WebView a pantalla
completa con toda la web empaquetada dentro del APK: funciona sin internet y sin servidor).

El mundo de Peanuts como sistema: portada editorial,Continuar viendo, Películas, Series,
**Mundo de Snoopy** (seis canales animados), Tienda y Ajustes.

---

## 1 · Qué es y cómo está montado

```
snoopy-tv/
├── index.html              Shell de la interfaz
├── assets/
│   ├── os.css              Sistema de diseño (todo el layout y el estilo)
│   ├── os.js               Motor: navegación D-pad, reproductor, canales, ajustes
│   ├── data.js             Catálogo + generador de arte SVG
│   ├── depth.js            Motor de profundidad 3D (paralaje + volumen)
│   ├── depth.css           Perspectiva de la escena y capas
│   ├── channels.css        Animaciones de los seis canales
│   ├── fonts/              Tipografías self-hosted (woff2 + fonts.css)
│   ├── plates/             Fondo del paisaje (3 planos de profundidad)
│   └── posters/            Pósters ilustrados (uno por título)
├── android/
│   ├── app/                App nativa: MainActivity.java, manifest, recursos
│   └── SnoopyTV.apk        Binario firmado (lo genera tools/build-apk.ps1)
└── tools/                  Scripts de build, servidor local y utilidades
```

**La app nativa** (`android/app/src/com/snoopy/tv/MainActivity.java`) sirve la web desde
los propios assets del APK usando un origen falso seguro
(`https://appassets.androidplatform.net/…`) interceptado en `shouldInterceptRequest`.
No hay red, ni servidor, ni dependencias externas en tiempo de ejecución.

---

## 2 · Poner en marcha

### Servir en el navegador (desarrollo)
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\serve.ps1 -Port 8080
```
Luego `http://<tu-ip>:8080/`.

### Compilar e instalar el APK
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\build-apk.ps1 -Install -Device 100.73.44.16:33377
```
El script usa el SDK de `tools/android-sdk` o, si no existe, el de
`..\mvs_d7351cdfe44f4d4c959469cb726ed39e\workspace\toolchain\android-sdk`
(build-tools 34.0.0 + JDK 17). Firma con `tools/snoopy.keystore` (password `android`).

Salida: `android/SnoopyTV.apk` (~1,3 MB).

---

## 3 · Conectar con la TV

| Dato | Valor |
|---|---|
| Nombre | `AI PONT SA` |
| Sistema | Android 14 (SDK 34), Google TV, MediaTek mt5867, 1,4 GB RAM |
| Tailscale | `100.73.44.16` (tailnet `tail94d782.ts.net`) |
| LAN | `192.168.100.56` |
| Depuración | ADB por Wi‑Fi, puerto `33377`, emparejada |

```powershell
$adb = ".\tools\platform-tools\adb.exe"
& $adb pair 100.73.44.16:38433 <codigo-de-vinculacion>   # el codigo lo da la TV
& $adb connect 100.73.44.16:33377
& $adb -s 100.73.44.16:33377 shell am start -n com.snoopy.tv/.MainActivity
& $adb -s 100.73.44.16:33377 shell screencap -p /sdcard/s.png
& $adb -s 100.73.44.16:33377 pull /sdcard/s.png .\shots\tv.png
```

Ayudas: `tools/snap.ps1` (captura), `tools/portscan.ps1` (escaneo de puertos),
`tools/setup-android.ps1` (descarga JDK + SDK), `tools/fetch-fonts.ps1` (tipografías).

---

## 4 · Sistema de diseño

| | |
|---|---|
| Tinta | `#0F0D09` · `#151209` · `#1D1911` |
| Papel | `#F6F1E4` (crema) · `#E9E0C9` |
| Acento | `#EFC24A` (amarillo Woodstock) — **uno solo** |
| Alerta | `#C9503C` — solo para «En vivo» |
| Tipos | DM Serif Display (títulos) · Outfit (interfaz) · JetBrains Mono (datos) · Patrick Hand (la voz de los personajes) |
| Escala | `html { font-size: calc(100vh / 56) }` → todo escala con la altura de la pantalla |

Reglas:
- Un único acento. El amarillo marca foco, índices y datos; nunca rellenos grandes.
- Todo el arte es vectorial o generado: **no hay imágenes de terceros**.
- El foco es un marco de 2 px en amarillo; el cursor es Woodstock.
- Modo «reposo» tras 45 s sin actividad: Snoopy dormido.

### Profundidad
`assets/depth.js` publica en `:root` las variables `--dpx --dpy --dfx --dfy --tiltx --tilty
--sheen-x --sheen-y`. Las cuatro capas del paisaje (`.depth-far|mid|near|fg`) se mueven a
distintas velocidades y el elemento enfocado se inclina en 3D. El paralaje responde al puntero
y, en la TV, al **foco** (evento `depth:focus`, emitido por `os.js`).

---

## 5 · Reglas para seguir trabajando

- `assets/os.js` es la fuente de verdad de la navegación; `data.js` del catálogo.
- El catálogo usa títulos reales de Peanuts; el arte es original (nada de personajes de Schulz).
- Al tocar el arte: `assets/posters/*.jpg` es la versión comprimida (640×853, q76).
  Los PNG de alta resolución no se versionan; se regeneran con `tools/gen-posters.ps1`.
- No subir `tools/jdk`, `tools/platform-tools` ni `tools/android-sdk` (ver `.gitignore`).
- Probar siempre en la TV real antes de dar algo por bueno: `tools/snap.ps1`.
