/**
 * Single-model configuration.
 *
 *  - `glbUrl`        animated GLB used by both launcher and marker modes.
 *  - `mindTarget`    .mind file from MindAR's image compiler (marker mode).
 *  - `targetImage`   JPG/PNG used to compile the .mind file; print this for tracking.
 *  - `markerScale`   scale in MindAR space (target plane width = 1 unit).
 *  - `markerYOffset` lift off the printed image to avoid z-fighting.
 */
export type ModelConfig = {
  name: string;
  description: string;
  glbUrl: string;
  mindTarget: string;
  targetImage: string;
  markerScale: number;
  markerYOffset: number;
  hasAnimation: boolean;
};

export const MODEL: ModelConfig = {
  name: "Vesak Lantern",
  description: "Festive Vesak Day lantern — point your camera at the printed target.",
  glbUrl: "/models/vesak_lantern.glb",
  mindTarget: "/targets/targets.mind",
  targetImage: "/targets/target.jpg",
  markerScale: 0.35,
  markerYOffset: 0.05,
  hasAnimation: true,
};
