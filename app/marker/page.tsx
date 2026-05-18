import Link from "next/link";
import { MODEL } from "@/lib/models";
import MindARSceneClient from "@/components/MindARSceneClient";

export default function MarkerARPage() {
  return (
    <main className="fixed inset-0 text-white">
      <MindARSceneClient model={MODEL} />

      <Link
        href="/"
        className="absolute left-3 top-3 z-50 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur"
      >
        &larr; Back
      </Link>
    </main>
  );
}
