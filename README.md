# Safeguard AR

A mobile-first AR web app. Scan a printed QR with your phone's native camera, the URL opens this site, and an animated GLB 3D model appears in AR. No app install.

## Two AR modes

| Mode         | Route       | Android (Chrome)                                       | iOS (Safari)                                         |
| ------------ | ----------- | ------------------------------------------------------ | ---------------------------------------------------- |
| **Launcher** | `/ar`       | `<model-viewer>` -> Scene Viewer (full AR + animation) | 3D viewer with animation (Quick Look needs USDZ)     |
| **Marker**   | `/marker`   | MindAR image tracking (full in-camera AR + animation)  | MindAR image tracking (full in-camera AR + animation)|

The native phone camera scans the printed QR and opens the URL. There is no in-app QR scanner because the OS already does it better.

## Quick start

```bash
npm install --ignore-scripts
npm run dev
```

Visit `http://localhost:3000`. AR features need HTTPS, so to test on a real phone:

```bash
npm run dev:https
```

The first run generates a self-signed cert. Note the LAN URL printed in the terminal (e.g. `https://192.168.1.5:3000`) and accept the cert warning on your phone.

> **Why `--ignore-scripts`?** `mind-ar` transitively depends on the native `canvas` module, which requires Visual Studio C++ build tools on Windows. We only use MindAR's *browser* bundle at runtime, so the native build is not needed.

## Production build

```bash
npm run build
npm start
```

Deploy to **Vercel** (recommended) for automatic HTTPS, CDN-served GLBs, and zero config.

## Project layout

```
app/
  page.tsx                  Landing page (model card + printable QR links)
  ar/page.tsx               Launcher AR (<model-viewer>)
  marker/page.tsx           Marker AR (MindAR + Three.js)
  qr/page.tsx               Printable QR for either mode
components/
  ModelViewerAR.tsx         <model-viewer> wrapper
  MindARScene.tsx           Three.js + MindAR scene (animation mixer)
  MindARSceneClient.tsx     Client-only dynamic wrapper (ssr: false)
  DeviceHint.tsx            iOS / Android hint banner
  PrintButton.tsx           window.print() trigger
lib/
  models.ts                 Single MODEL config (GLB, MindAR target, scales)
  ua.ts                     iOS / Android UA detection
public/
  models/robot.glb          Sample animated GLB (CesiumMan)
  targets/card.png          Reference image tracked by MindAR
  targets/card.mind         Pre-compiled MindAR image target
scripts/
  compile-target.mjs        Compile a PNG/JPG -> .mind (needs canvas)
```

## Swapping in your own model

1. Drop your animated GLB into `public/models/your-model.glb`.
2. Update `lib/models.ts` (`MODEL.glbUrl`, scales, etc.).
3. For marker mode: choose a high-contrast reference image (busy photographs track best, plain QRs are workable but less robust), put it in `public/targets/`, and compile it:
   ```bash
   npm run compile-targets
   ```
   On Windows, the offline compiler needs `canvas`. The easier path is MindAR's online compiler -- upload your image, download the `.mind` file, drop it into `public/targets/`:
   <https://hiukim.github.io/mind-ar-js-doc/tools/compile>

## Format notes

- **GLB / glTF 2.0** is the standard for animated 3D on the web. Both modes use the same file.
- **PLY** is a static mesh / point-cloud format with no animation. Convert PLY to GLB in Blender (`File > Export > glTF 2.0`) before adding it here.
- **USDZ** is only required for iOS *AR Quick Look*. We are GLB-only, so iOS gets the in-page animated 3D viewer instead. Marker mode still gives iOS full in-camera AR.

## Required runtime conditions

- HTTPS (or `localhost`). Camera and AR APIs refuse to start over plain HTTP.
- Camera permission granted by the user.
- Android: ARCore + Google Play Services for AR (auto-installed when needed).
- iOS: Safari (full screen / standalone mode also works).
