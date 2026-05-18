"use client";

import { useRef } from "react";
import type { ModelConfig } from "@/lib/models";

/**
 * Declare <model-viewer> for JSX. The actual custom element class is
 * registered by the `<model-viewer>` script tag loaded from a CDN in
 * `app/layout.tsx`. We avoid the npm `@google/model-viewer` package
 * because its three.js peer dep conflicts with mind-ar's (4.x needs
 * three >=0.157, mind-ar 1.2.5 needs three <=0.151).
 */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & Record<string, unknown>,
        HTMLElement
      >;
    }
  }
}

type Props = {
  model: ModelConfig;
};

export default function ModelViewerAR({ model }: Props) {
  const viewerRef = useRef<HTMLElement | null>(null);

  return (
    <div className="relative h-[100dvh] w-full bg-black">
      <model-viewer
        ref={viewerRef as unknown as React.RefObject<HTMLElement>}
        src={model.glbUrl}
        alt={model.name}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        camera-controls
        touch-action="pan-y"
        auto-rotate
        autoplay
        shadow-intensity="1"
        exposure="1"
        environment-image="neutral"
        style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
      >
        <button
          slot="ar-button"
          className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg"
        >
          View in your space
        </button>

        <div
          slot="poster"
          className="flex h-full w-full items-center justify-center text-white"
        >
          Loading {model.name}...
        </div>
      </model-viewer>

      <div className="pointer-events-none absolute left-0 right-0 top-0 p-4 text-white">
        <h1 className="text-lg font-semibold drop-shadow">{model.name}</h1>
        <p className="text-xs opacity-80 drop-shadow">{model.description}</p>
      </div>
    </div>
  );
}
