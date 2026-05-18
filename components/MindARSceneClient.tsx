"use client";

import dynamic from "next/dynamic";
import type { ModelConfig } from "@/lib/models";

const MindARScene = dynamic(() => import("./MindARScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[100dvh] items-center justify-center bg-black text-white">
      Loading marker AR...
    </div>
  ),
});

export default function MindARSceneClient({ model }: { model: ModelConfig }) {
  return <MindARScene model={model} />;
}
