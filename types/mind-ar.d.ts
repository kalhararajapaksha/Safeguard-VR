declare module "mind-ar/dist/mindar-image-three.prod.js" {
  /** Minimal shape used by our marker scene; full surface is bigger. */
  export class MindARThree {
    constructor(opts: {
      container: HTMLElement;
      imageTargetSrc: string;
      maxTrack?: number;
      uiLoading?: "yes" | "no";
      uiScanning?: "yes" | "no";
      uiError?: "yes" | "no";
      filterMinCF?: number;
      filterBeta?: number;
      missTolerance?: number;
      warmupTolerance?: number;
    });
    renderer: {
      domElement: HTMLCanvasElement;
      setAnimationLoop: (cb: (() => void) | null) => void;
      render: (scene: unknown, camera: unknown) => void;
      dispose: () => void;
      setClearColor: (color: number, alpha?: number) => void;
      setClearAlpha: (alpha: number) => void;
    };
    scene: { add: (obj: unknown) => void };
    camera: unknown;
    addAnchor(index: number): {
      group: { add: (obj: unknown) => void };
      onTargetFound?: () => void;
      onTargetLost?: () => void;
    };
    start(): Promise<void>;
    stop(): Promise<void>;
    resize(): void;
    video: HTMLVideoElement;
    cssRenderer: { domElement: HTMLElement };
  }
}
