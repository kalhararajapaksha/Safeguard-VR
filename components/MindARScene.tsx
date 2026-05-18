"use client";

import { useEffect, useRef, useState } from "react";
import type { ModelConfig } from "@/lib/models";

type Props = {
  model: ModelConfig;
};

function applyCameraLayering(mindarThree: {
  video: HTMLVideoElement;
  renderer: { domElement: HTMLCanvasElement };
  cssRenderer: { domElement: HTMLElement };
  resize: () => void;
}) {
  const { video, renderer, cssRenderer } = mindarThree;

  video.style.zIndex = "0";
  video.style.position = "absolute";
  video.style.top = "0";
  video.style.left = "0";
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  renderer.domElement.style.zIndex = "1";
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.background = "transparent";
  renderer.domElement.style.pointerEvents = "none";

  cssRenderer.domElement.style.display = "none";

  mindarThree.resize();
}

async function ensureVideoPlaying(video: HTMLVideoElement) {
  if (video.paused) {
    try {
      await video.play();
    } catch {
      /* ignore */
    }
  }
}

/**
 * Marker-mode AR using MindAR image tracking.
 */
export default function MindARScene({ model }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "tracking" | "lost" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup: (() => Promise<void>) | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let videoInterval: ReturnType<typeof setInterval> | null = null;
    let onOrientation: (() => void) | null = null;
    let onVisibility: (() => void) | null = null;
    let onViewport: (() => void) | null = null;

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
          maxTrack: 1,
          // Snappier tracking (matches MindAR official three.js example)
          filterMinCF: 1,
          filterBeta: 10000,
          warmupTolerance: 5,
          missTolerance: 5,
        });

        const { renderer, scene, camera } = mindarThree;

        renderer.setClearColor(0x000000, 0);
        renderer.setClearAlpha(0);

        const anchor = mindarThree.addAnchor(0);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
        const dir = new THREE.DirectionalLight(0xffffff, 1.0);
        dir.position.set(1, 2, 1);
        scene.add(dir);

        anchor.onTargetFound = () => {
          if (!disposed) setStatus("tracking");
        };
        anchor.onTargetLost = () => {
          if (!disposed) setStatus("lost");
        };

        const gltf = await new GLTFLoader().loadAsync(model.glbUrl);
        const root = gltf.scene;
        const scale = model.markerScale;
        root.scale.set(scale, scale, scale);
        root.position.set(0, model.markerYOffset, 0);
        root.rotation.set(0, 0, 0);
        anchor.group.add(root);

        let mixer: InstanceType<typeof THREE.AnimationMixer> | null = null;
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(root);
          mixer.clipAction(gltf.animations[0]).play();
        }

        await mindarThree.start();

        if (disposed) {
          await mindarThree.stop();
          return;
        }

        applyCameraLayering(mindarThree);
        await ensureVideoPlaying(mindarThree.video);

        requestAnimationFrame(() => {
          applyCameraLayering(mindarThree);
          void ensureVideoPlaying(mindarThree.video);
        });

        const scheduleResize = () => {
          if (disposed) return;
          mindarThree.resize();
          void ensureVideoPlaying(mindarThree.video);
        };

        resizeObserver = new ResizeObserver(() => scheduleResize());
        resizeObserver.observe(containerRef.current!);

        onOrientation = () => {
          setTimeout(scheduleResize, 100);
          setTimeout(scheduleResize, 400);
        };
        window.addEventListener("orientationchange", onOrientation);

        if (window.visualViewport) {
          onViewport = () => scheduleResize();
          window.visualViewport.addEventListener("resize", onViewport);
          window.visualViewport.addEventListener("scroll", onViewport);
        }

        onVisibility = () => {
          if (document.visibilityState === "visible") {
            scheduleResize();
            void ensureVideoPlaying(mindarThree.video);
          }
        };
        document.addEventListener("visibilitychange", onVisibility);

        videoInterval = setInterval(() => {
          void ensureVideoPlaying(mindarThree.video);
        }, 2000);

        setStatus("ready");

        const clock = new THREE.Clock();
        renderer.setAnimationLoop(() => {
          const delta = clock.getDelta();
          if (mixer) mixer.update(delta);
          renderer.render(scene, camera);
        });

        cleanup = async () => {
          renderer.setAnimationLoop(null);
          if (videoInterval) clearInterval(videoInterval);
          if (resizeObserver) resizeObserver.disconnect();
          if (onOrientation) {
            window.removeEventListener("orientationchange", onOrientation);
          }
          if (onViewport && window.visualViewport) {
            window.visualViewport.removeEventListener("resize", onViewport);
            window.visualViewport.removeEventListener("scroll", onViewport);
          }
          if (onVisibility) {
            document.removeEventListener("visibilitychange", onVisibility);
          }
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
      if (cleanup) void cleanup();
    };
  }, [model]);

  return (
    <div className="fixed inset-0 touch-none overflow-hidden">
      <div ref={containerRef} className="mindar-host" />

      {status !== "tracking" && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 p-4 pt-14 text-white">
          <h1 className="text-lg font-semibold drop-shadow">{model.name}</h1>
          <p className="text-xs opacity-80 drop-shadow">{model.description}</p>
        </div>
      )}

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
        </div>
      </div>
    );
  }

  if (status === "loading" || status === "idle") {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 text-white">
        <p className="text-sm">Starting camera...</p>
      </div>
    );
  }

  if (status === "tracking") {
    return (
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 p-4">
        <p className="mx-auto max-w-sm rounded-lg bg-emerald-600/80 px-3 py-2 text-center text-sm font-medium text-white backdrop-blur">
          Target found — move slowly to keep tracking
        </p>
      </div>
    );
  }

  if (status === "ready" || status === "lost") {
    return (
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 p-4 pb-6">
        <div className="mx-auto max-w-sm rounded-lg bg-black/70 p-3 text-center text-white backdrop-blur">
          <p className="text-sm font-medium">
            Point at the <strong>printed</strong> target image
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Open <strong>/qr?mode=marker</strong> on a computer, print the
            page, then aim your camera at that card (not your monitor).
          </p>
          {model.targetImage && (
            <img
              src={model.targetImage}
              alt="Print this target"
              className="mx-auto mt-3 max-h-28 w-auto rounded border-2 border-white/40"
            />
          )}
        </div>
      </div>
    );
  }

  return null;
}
