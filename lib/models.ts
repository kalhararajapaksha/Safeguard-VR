/**
 * Single-model configuration.
 *
 * Replace the fields below to swap in your own GLB and MindAR target.
 *
 *  - `glbUrl`        animated GLB used by both launcher and marker modes.
 *  - `mindTarget`    .mind file produced by MindAR's image compiler (required for marker mode).
 *  - `targetImage`   PNG/JPG used to compile the .mind file; also shown as a hint and used to generate the printable QR overlay.
 *  - `markerScale`   scale applied inside the marker scene (the target image plane is 1 unit wide).
 *  - `markerYOffset` lift the model off the marker so it doesn't z-fight with the printed page.
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
  name: "Cesium Man",
  description: "Animated humanoid walk cycle (Khronos sample).",
  glbUrl: "/models/robot.glb",
  mindTarget: "/targets/card.mind",
  targetImage: "/targets/card.png",
  markerScale: 0.5,
  markerYOffset: 0,
  hasAnimation: true,
};
