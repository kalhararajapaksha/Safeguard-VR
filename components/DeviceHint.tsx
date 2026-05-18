"use client";

import { useEffect, useState } from "react";
import { getDeviceClass, type DeviceClass } from "@/lib/ua";

export default function DeviceHint() {
  const [device, setDevice] = useState<DeviceClass>("other");

  useEffect(() => {
    setDevice(getDeviceClass());
  }, []);

  if (device === "android") {
    return (
      <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-200">
        Android detected. Tap <strong>View in your space</strong> to launch
        Scene Viewer for full AR with animation.
      </p>
    );
  }

  if (device === "ios") {
    return (
      <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
        iOS detected. The model below is rendered with animation in a 3D
        viewer. For full in-camera AR on iOS, use <strong>Marker AR</strong> mode.
      </p>
    );
  }

  return (
    <p className="rounded-md border border-slate-500/40 bg-slate-500/10 p-3 text-xs text-slate-200">
      Open this page on a mobile device for AR features.
    </p>
  );
}
