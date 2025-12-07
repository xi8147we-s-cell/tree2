import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "../store";
import { memories } from "../data";

// --- Robust base detection for AI Studio Preview ---
// In AI Studio, the module is typically served from:
//   https://<random>.scf.usercontent.goog/<buildId>/assets/....js
// So assets in public/ are also under:
//   https://<random>.scf.usercontent.goog/<buildId>/mem/....
const detectAppBase = () => {
  // 1) Best: derive from current module url
  try {
    const metaUrl = (import.meta as any).url as string | undefined;
    if (metaUrl) {
      const u = new URL(metaUrl);
      const idx = u.pathname.lastIndexOf("/assets/");
      if (idx !== -1) {
        // keep "/<buildId>/" (include trailing slash)
        return u.origin + u.pathname.slice(0, idx + 1);
      }
      // fallback: module directory
      return u.origin + u.pathname.replace(/\/[^/]*$/, "/");
    }
  } catch {}

  // 2) Fallback: current document directory
  try {
    return new URL(".", document.baseURI).toString();
  } catch {}

  return "/";
};

const APP_BASE = detectAppBase();

const resolvePublic = (src: string) => {
  if (!src) return "";
  // Keep absolute/data/blob as-is
  if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:")) return src;

  // Clean: remove "./" or leading "/"
  const clean = src.replace(/^\.?\//, "").replace(/^\/+/, "");
  // encodeURI keeps "/" but encodes spaces etc
  return APP_BASE + encodeURI(clean);
};

const MemoryModal: React.FC = () => {
  const activeMemoryId = useStore((s) => s.activeMemoryId);
  const closeMemory = useStore((s) => s.closeMemory);
  const [imgError, setImgError] = useState(false);

  useEffect(() => setImgError(false), [activeMemoryId]);

  const { memory, resolvedSrc } = useMemo(() => {
    if (activeMemoryId == null) return { memory: null as any, resolvedSrc: "" };
    const m = memories.find((x) => x.id === activeMemoryId) || null;
    return { memory: m, resolvedSrc: m ? resolvePublic(m.imgUrl) : "" };
  }, [activeMemoryId]);

  if (!memory) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={closeMemory}
    >
      <div
        className="relative bg-[#fdfbf7] p-4 pb-12 max-w-sm w-full shadow-2xl transform rotate-1 transition-transform border border-gray-200"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 bg-white/40 backdrop-blur-md border border-white/30 rotate-[-1deg] shadow-sm z-20 pointer-events-none" />

        <div className="relative aspect-[4/5] bg-gray-200 mb-5 overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
          <div className="absolute inset-0 z-10 bg-[radial-gradient(circle,transparent_40%,rgba(66,44,20,0.2)_100%)] pointer-events-none mix-blend-multiply" />
          <div
            className="absolute inset-0 z-10 opacity-30 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            }}
          />

          {!imgError ? (
            <img
              src={resolvedSrc}
              alt={memory.title}
              onError={() => {
                console.warn("❌ Image failed:", { raw: memory.imgUrl, resolvedSrc, APP_BASE });
                setImgError(true);
              }}
              className="w-full h-full object-cover filter blur-[0.8px] sepia-[0.25] contrast-[0.85] brightness-[1.05] saturate-[0.8] transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-300 text-gray-700 text-xs p-4 text-center break-all">
              <div className="font-semibold mb-2">Image Not Found</div>
              <div className="opacity-80">raw: {memory.imgUrl}</div>
              <div className="opacity-80 mt-1">resolved: {resolvedSrc}</div>
              <div className="opacity-70 mt-1">base: {APP_BASE}</div>
            </div>
          )}

          <div className="absolute bottom-2 left-2 right-2 z-20 text-[10px] text-white/80 break-all bg-black/20 p-1 rounded">
            <a className="underline text-white font-bold block" href={resolvedSrc} target="_blank" rel="noreferrer">
              Open Original
            </a>
          </div>
        </div>

        <div className="font-serif text-gray-800 text-center space-y-2">
          <h3 className="text-2xl font-bold tracking-tight text-climb-green/90">{memory.title}</h3>
          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase border-b border-gray-200 inline-block pb-1">
            {memory.date}
          </p>
          <p className="mt-4 text-sm italic opacity-80 font-serif leading-relaxed text-gray-700">"{memory.caption}"</p>
        </div>

        <button
          onClick={closeMemory}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/90 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex flex-col items-center gap-1"
        >
          <span>✕ Close</span>
        </button>
      </div>
    </div>
  );
};

export default MemoryModal;