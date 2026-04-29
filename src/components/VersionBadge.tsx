import { APP_VERSION, APP_VERSION_LABEL } from "@/lib/version";

export function VersionBadge() {
  return (
    <div className="fixed bottom-3 right-3 z-50 max-w-[calc(100vw-1.5rem)] border border-white/10 bg-black/55 px-3 py-2 text-right text-[11px] leading-4 text-zinc-400 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:border-cyan-200/30 hover:bg-black/70 hover:text-zinc-200 sm:bottom-4 sm:right-4">
      <p className="font-medium text-zinc-300">Direction Distiller</p>
      <p>
        {APP_VERSION} · {APP_VERSION_LABEL}
      </p>
    </div>
  );
}
