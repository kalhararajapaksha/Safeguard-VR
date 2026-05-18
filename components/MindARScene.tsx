"use client";

import { useEffect, useRef, useState } from "react";
import type { ModelConfig } from "@/lib/models";

type Props = {
  model: ModelConfig;
};

/**
 * Marker-mode AR using MindAR image tracking. Runs entirely in-browser
 * via WebGL and works on iOS Safari and Android Chrome.
 *
 * The component is `"use client"` and must be loaded with
 * `dynamic(..., { ssr: false })` because MindAR touches `window`,
 * `navigator.mediaDevices`, and `WebGLRenderingContext` at import time.
 */
export default function MindARScene({ model }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "tracking" | "lost" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;
    let cleanup: (() => Promise<void>) | null = null;

    (async () => {
      try {
        setStatus("loading");

        const [{ MindARThree }, THREE, { GLTFLoader }] = await Promise.all([
          import("mind-ar/dist/mindar-image-three.prod.js"),
          import("three"),
          import("three/examples/jsm/loaders/GLTFLoader.js"),
        ]);

        if (disposed || !containerRef.current) return;

        const mindarThree = new MindARThree({
          container: containerRef.current,
          imageTargetSrc: model.mindTarget,
          uiLoading: "no",
          uiScanning: "no",
          uiError: "no",
        });

        const { renderer, scene, camera } = mindarThree;

        // WebGL canvas must be transparent so the camera <video> shows through.
        renderer.setClearColor(0x000000, 0);
        renderer.setClearAlpha(0);

        // CSS3D overlay is unused (no CSS anchors); keep it from blocking the feed.
        mindarThree.cssRenderer.domElement.style.pointerEvents = "none";
        mindarThree.cssRenderer.domElement.style.background = "transparent";

        const anchor = mindarThree.addAnchor(0);

        const ambient = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
        scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 1.0);
        dir.position.set(1, 2, 1);
        scene.add(dir);

        anchor.onTargetFound = () => {
          if (!disposed) setStatus("tracking");
        };
        anchor.onTargetLost = () => {
          if (!disposed) setStatus("lost");
        };

        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(model.glbUrl);

        const root = gltf.scene;
        const scale = model.markerScale;
        root.scale.set(scale, scale, scale);
        root.position.set(0, model.markerYOffset, 0);
        root.rotation.set(Math.PI / 2, 0, 0);
        anchor.group.add(root);

        let mixer: InstanceType<typeof THREE.AnimationMixer> | null = null;
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(root);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        await mindarThree.start();

        if (disposed) {
          await mindarThree.stop();
          return;
        }

        // MindAR sets video z-index to -2, which hides it behind our black page
        // background. Lift video above the container paint but below the canvas.
        const video = mindarThree.video;
        if (video) {
          video.style.zIndex = "0";
          video.style.objectFit = "cover";
          video.muted = true;
          video.playsInline = true;
          try {
            await video.play();
          } catch {
            /* iOS may require a user gesture; start() usually suffices */
          }
        }
        renderer.domElement.style.zIndex = "1";
        renderer.domElement.style.background = "transparent";

        mindarThree.resize();
        requestAnimationFrame(() => mindarThree.resize());

        setStatus("ready");

        const clock = new THREE.Clock();
        renderer.setAnimationLoop(() => {
          const delta = clock.getDelta();
          if (mixer) mixer.update(delta);
          renderer.render(scene, camera);
        });

        cleanup = async () => {
          renderer.setAnimationLoop(null);
          try {
            await mindarThree.stop();
          } catch {
            /* noop */
          }
          renderer.dispose();
        };
      } catch (err) {
        console.error("MindAR init failed", err);
        if (!disposed) {
          setStatus("error");
          setErrorMsg(
            err instanceof Error
              ? err.message
              : "Failed to start AR. Camera permission required.",
          );
        }
      }
    })();

    return () => {
      disposed = true;
      if (cleanup) cleanup();
    };
  }, [model]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <div
        ref={containerRef}
        className="mindar-host absolute inset-0"
        style={{ width: "100%", height: "100%", position: "relative" }}
      />

      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 p-4 text-white">
        <h1 className="text-lg font-semibold drop-shadow">{model.name}</h1>
        <p className="text-xs opacity-80 drop-shadow">{model.description}</p>
      </div>

      <StatusOverlay status={status} message={errorMsg} model={model} />
    </div>
  );
}

function StatusOverlay({
  status,
  message,
  model,
}: {
  status: "idle" | "loading" | "ready" | "tracking" | "lost" | "error";
  message: string | null;
  model: ModelConfig;
}) {
  if (status === "error") {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6 text-center text-white">
        <div className="max-w-sm space-y-2">
          <p className="text-base font-semibold">AR failed to start</p>
          <p className="text-sm opacity-80">{message ?? "Unknown error"}</p>
          <p className="text-xs opacity-60">
            Make sure you opened this page over HTTPS and granted camera
            permission.
          </p>
        </div>
      </div>
    );
  }

  if (status === "loading" || status === "idle") {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 text-white">
        <div className="text-sm">Loading AR engine...</div>
      </div>
    );
  }

  if (status === "ready" || status === "lost") {
    return (
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 p-4">
        <div className="mx-auto max-w-sm rounded-lg bg-black/60 p-3 text-center text-white backdrop-blur">
          <p className="text-sm font-medium">Point your camera at the target</p>
          {model.targetImage && (
            <img
              src={model.targetImage}
              alt="Target"
              className="mx-auto mt-2 h-24 w-auto rounded border border-white/30"
            />
          )}
        </div>
      </div>
    );
  }

  return null;
}
