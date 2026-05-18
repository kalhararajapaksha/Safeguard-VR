import { headers } from "next/headers";
import Link from "next/link";
import QRCode from "qrcode";
import PrintButton from "@/components/PrintButton";
import { MODEL } from "@/lib/models";

type SearchParams = Promise<{ mode?: string }>;

export default async function QRPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { mode } = await searchParams;
  const isMarker = mode === "marker";
  const path = isMarker ? "/marker" : "/ar";
  const label = isMarker ? "Marker AR" : "Launcher AR";

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const targetUrl = `${proto}://${host}${path}`;

  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 600,
    color: { dark: "#000000", light: "#FFFFFF" },
  });

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-xl px-4 py-8 text-white print:py-0">
      <header className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/" className="text-blue-400 hover:underline">
          &larr; Back
        </Link>
        <span className="text-xs text-slate-400">Printable QR</span>
      </header>

      <h1 className="mb-1 text-xl font-bold print:text-black">{label}</h1>
      <p className="mb-4 text-sm text-slate-300 print:text-black">
        Scan with any phone&apos;s native camera to open{" "}
        <code className="rounded bg-white/10 px-1 print:bg-transparent">
          {path}
        </code>
        .
        {isMarker && (
          <>
            {" "}
            Then point the in-app camera back at this printed QR &mdash; the
            QR is also the AR anchor.
          </>
        )}
      </p>

      <div className="mx-auto w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`QR code for ${targetUrl}`}
          className="block h-auto w-full"
        />
        <p className="mt-2 break-all text-center text-[10px] text-slate-600">
          {targetUrl}
        </p>
      </div>

      {isMarker && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 print:break-before-page print:border-0 print:bg-white">
          <h2 className="mb-2 text-sm font-semibold text-white print:text-black">
            AR marker target
          </h2>
          <p className="mb-3 text-xs text-slate-300 print:text-black">
            After scanning the QR above, the camera page will track this
            reference image. Print it alongside the QR (or on a separate
            page) and point your camera at it to anchor the 3D model.
          </p>
          <div className="mx-auto w-full max-w-sm rounded-xl bg-white p-2 shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MODEL.targetImage}
              alt="AR tracking target"
              className="block h-auto w-full"
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2 text-xs text-slate-400 print:hidden">
        <p>
          Tip: print this page on plain paper at full size for best tracking.
          Avoid glossy paper, glare, and curling.
        </p>
        <p>
          For marker tracking, the printed QR must match the compiled{" "}
          <code className="rounded bg-white/10 px-1">.mind</code> target.
          See <code className="rounded bg-white/10 px-1">scripts/compile-target.mjs</code>
          .
        </p>
      </div>

      <div className="mt-6 print:hidden">
        <PrintButton />
      </div>
    </main>
  );
}
