/** Decorative fake site canvas — reads as a builder, not a tenant business. */
export function BuilderWireframe({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden border border-[#d7dde5] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)] ${className}`}
      aria-hidden
    >
      <div className="flex items-center gap-2 border-b border-[#e8edf3] bg-[#f7f9fc] px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d7dde5]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d7dde5]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d7dde5]" />
        <span className="ml-3 h-2 flex-1 max-w-[12rem] rounded-sm bg-[#e8edf3]" />
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f766e] sm:h-36">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <div className="h-2.5 w-24 rounded-sm bg-white/70" />
            <div className="h-2 w-40 rounded-sm bg-white/35" />
            <div className="mt-3 h-6 w-20 rounded-sm bg-[#14b8a6]" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 border border-[#e8edf3] bg-[#f7f9fc] p-2">
            <div className="h-1.5 w-10 bg-[#cbd5e1]" />
            <div className="mt-2 h-1 w-full bg-[#e2e8f0]" />
            <div className="mt-1 h-1 w-[75%] bg-[#e2e8f0]" />
          </div>
          <div className="h-16 border border-[#e8edf3] bg-[#f7f9fc] p-2">
            <div className="h-1.5 w-10 bg-[#cbd5e1]" />
            <div className="mt-2 h-1 w-full bg-[#e2e8f0]" />
            <div className="mt-1 h-1 w-[75%] bg-[#e2e8f0]" />
          </div>
          <div className="h-16 border border-[#e8edf3] bg-[#f7f9fc] p-2">
            <div className="h-1.5 w-10 bg-[#cbd5e1]" />
            <div className="mt-2 h-1 w-full bg-[#e2e8f0]" />
            <div className="mt-1 h-1 w-[75%] bg-[#e2e8f0]" />
          </div>
        </div>
        <div className="flex gap-3 border border-[#e8edf3] p-3">
          <div className="h-12 w-16 shrink-0 bg-[#e2e8f0]" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-1.5 w-28 bg-[#cbd5e1]" />
            <div className="h-1 w-full bg-[#e2e8f0]" />
            <div className="h-1 w-[80%] bg-[#e2e8f0]" />
          </div>
        </div>
        <div className="h-8 bg-[#0f172a]" />
      </div>
    </div>
  );
}
