import Link from "next/link";
import { MODEL } from "@/lib/models";
import MindARSceneClient from "@/components/MindARSceneClient";

export default function MarkerARPage() {
  return (
    <main className="relative h-[100dvh] w-full bg-black text-white">
      <MindARSceneClient model={MODEL} />

      <Link
        href="/"
        className="absolute left-3 top-3 z-30 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur"
      >
        &larr; Back
      </Link>
    </main>
  );
}
