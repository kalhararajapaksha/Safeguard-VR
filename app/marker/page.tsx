import Link from "next/link";
import { MODEL } from "@/lib/models";
import MindARSceneClient from "@/components/MindARSceneClient";

export default function MarkerARPage() {
  return (
    <>
      <MindARSceneClient model={MODEL} />
      <Link
        href="/"
        className="absolute left-3 top-3 z-50 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur"
        style={{
          top: "max(0.75rem, env(safe-area-inset-top))",
          left: "max(0.75rem, env(safe-area-inset-left))",
        }}
      >
        &larr; Back
      </Link>
    </>
  );
}
