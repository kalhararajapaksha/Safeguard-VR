export default function MarkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marker-ar fixed inset-0 overflow-hidden overscroll-none">
      {children}
    </div>
  );
}
