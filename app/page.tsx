import Link from "next/link";
import { MODEL } from "@/lib/models";
import DeviceHint from "@/components/DeviceHint";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-2xl px-4 py-8 text-white">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Safeguard AR</h1>
        <p className="mt-1 text-sm text-slate-300">
          Scan the printed QR with your phone&apos;s native camera &mdash; the
          URL opens this site and the animated 3D model appears in AR.
        </p>
      </header>

      <div className="mb-6">
        <DeviceHint />
      </div>

      <article className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <h2 className="text-lg font-semibold">{MODEL.name}</h2>
        <p className="mb-4 text-sm text-slate-300">{MODEL.description}</p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href="/ar"
            className="rounded-lg bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Open Launcher AR
          </Link>
          <Link
            href="/marker"
            className="rounded-lg bg-sky-500 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-sky-400"
          >
            Open Marker AR
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <Link
            href="/qr?mode=ar"
            className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-center text-emerald-200 hover:bg-emerald-500/20"
          >
            Printable QR &rarr; launcher
          </Link>
          <Link
            href="/qr?mode=marker"
            className="rounded-md border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-center text-sky-200 hover:bg-sky-500/20"
          >
            Printable QR &rarr; marker
          </Link>
        </div>
      </article>

      <section className="mt-6 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <h3 className="text-base font-semibold text-white">How it works</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Open one of the &ldquo;Printable QR&rdquo; pages and print it.</li>
          <li>
            On any phone, open the native camera and aim at the QR. Tap the
            link banner to open this site.
          </li>
          <li>
            <strong>Launcher</strong> &mdash; Android opens Scene Viewer
            (full AR with animation). iOS shows an animated 3D viewer.
          </li>
          <li>
            <strong>Marker</strong> &mdash; the same printed QR is the
            anchor: the camera page tracks it and places the animated model
            on top of it. Works on iOS Safari + Android Chrome.
          </li>
        </ol>
      </section>

      <footer className="mt-10 border-t border-white/10 pt-4 text-xs text-slate-400">
        <p>
          AR features require HTTPS. On Android use Chrome; on iOS use Safari.
          GLB models with animations are supported on both platforms.
        </p>
      </footer>
    </main>
  );
}
