# AGENTS.md — TANY TV

Sistema operativo de TV para **AI PONT SA** (Changhong, Android 14 / Google TV).
App nativa Android TV + interfaz web empaquetada en el APK.

## Reglas de oro

1. **Primero lee `README.md`**: tiene la arquitectura, la conexión con la TV y los scripts.
2. **No toques `tools/jdk`, `tools/android-sdk`, `tools/platform-tools`** (toolchain, no se versiona).
3. **Prueba en la TV real** antes de declarar algo terminado:
   `powershell -ExecutionPolicy Bypass -File .\tools\build-apk.ps1 -Install -Device 100.73.44.16:33377`
   y captura con `tools\snap.ps1`.
4. **Un solo acento** (amarillo `#EFC24A`). Nada de degradados de color, nada de neón.
5. **Nada de material de terceros**: el arte es SVG propio o generado. Peanuts es de Schulz;
   usamos títulos y referencias, nunca imágenes oficiales ni personajes dibujados por otros.

## Dónde tocar

| Cambio | Archivo |
|---|---|
| Layout, color, tipografía | `assets/os.css` |
| Navegación, reproductor, canales, ajustes | `assets/os.js` |
| Catálogo y textos | `assets/data.js` |
| Parallaje e inclinación 3D | `assets/depth.js` + `assets/depth.css` |
| Animaciones de los canales | `assets/channels.css` |
| Animación nativa / WebView a pantalla completa | `android/app/src/com/snoopy/tv/MainActivity.java` |

## Reglas del código

- JavaScript ES5-ish y sin dependencias: el WebView de la TV puede ser antiguo.
  Nada de arrow functions en el Java de la app (el `bootclasspath` es `android.jar`).
- El foco se mueve con el D-pad: al añadir un elemento enfocable, mételo en un
  `data-nav-row` para que el motor de navegación lo encuentre.
- Si tocas `assets/depth.css` o `assets/os.css`, remember que **ambos** definen
  `.depth-layer`: el que se carga último manda (ahora `os.css` va después).
- Nada de `scrollIntoView` en el foco: el riel 3D se posiciona con `layoutRails()`.

## Arte generado

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\gen-posters.ps1   # lotes de 10
powershell -ExecutionPolicy Bypass -File .\tools\normalize-posters.ps1
```
Cada póster es 640×853 JPEG q76 (`assets/posters/`). Los PNG originales no se versionan.

## Conexión con la TV

- Tailscale `100.73.44.16`, ADB `100.73.44.16:33377`, LAN `192.168.100.56`.
- `adb shell am start -n com.snoopy.tv/.MainActivity`
- Ojo: la TV está a 1280×720 por un *override* de `wm size`. Para 1080p real:
  `adb shell wm size reset` (cambia la configuración del usuario: pídele permiso antes).
