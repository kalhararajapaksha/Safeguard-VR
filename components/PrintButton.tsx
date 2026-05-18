"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-slate-100"
    >
      Print this QR
    </button>
  );
}
