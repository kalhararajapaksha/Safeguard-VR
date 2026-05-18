"use client";

export type DeviceClass = "ios" | "android" | "other";

export function getDeviceClass(): DeviceClass {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || "",
  );
}

/**
 * Quick heuristic: ARCore (Scene Viewer) is available on Android in Chrome.
 * The definitive check is left to <model-viewer>, which hides its AR button
 * automatically when AR is not supported.
 */
export function probablySupportsSceneViewer(): boolean {
  return getDeviceClass() === "android";
}
