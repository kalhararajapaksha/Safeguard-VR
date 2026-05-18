import Link from "next/link";
import { MODEL } from "@/lib/models";
import ModelViewerAR from "@/components/ModelViewerAR";
import DeviceHint from "@/components/DeviceHint";

export default function LauncherARPage() {
  return (
    <main className="flex h-[100dvh] flex-col bg-black text-white">
      <div className="flex-1">
        <ModelViewerAR model={MODEL} />
      </div>

      <div className="space-y-2 border-t border-white/10 bg-black/80 p-3 backdrop-blur">
        <DeviceHint />
        <div className="flex items-center justify-between text-xs">
          <Link href="/" className="text-blue-400 hover:underline">
            &larr; Back
          </Link>
          <Link href="/marker" className="text-blue-400 hover:underline">
            Switch to Marker AR &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
