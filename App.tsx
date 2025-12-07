import React, { useEffect, useRef, useState } from 'react';
import Scene from './components/Scene';
import MemoryModal from "./components/MemoryModal";
import FinishModal from './components/FinishModal';
import { useStore } from './store';
import { holds } from './data';

// Provided raw GitHub URL
const BGM_URL = "https://raw.githubusercontent.com/xi8147we-s-cell/bgm1207/refs/heads/main/ytmp3free.cc_lady-a-a-holly-jolly-christmas-audio-youtubemp3free.org.mp3";

// --- BGM BUTTON COMPONENT ---
export function BGMButton() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set reasonable volume
    audio.volume = 0.5;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    
    // Handle loading errors
    const onError = (e: any) => {
      console.warn("BGM Error:", audio.error, e);
      setError("Audio failed to load");
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);

    if (playing) {
      audio.pause();
    } else {
      // Use a promise catch to handle "User didn't interact" policies or network errors
      audio.play().catch((err) => {
        console.warn("Play blocked or failed:", err);
        setError("Playback failed");
      });
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={BGM_URL}
        loop
        playsInline
        preload="auto"
      />
      <div className="fixed top-4 right-4 z-[9999] flex items-center gap-2">
        {error && (
          <div className="text-[11px] px-2 py-1 rounded bg-red-900/80 text-white/90 shadow-md">
            {error}
          </div>
        )}
        <button
          onClick={toggle}
          className="rounded-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg font-mono text-sm flex items-center gap-2"
          title={playing ? "Pause Music" : "Play Music"}
        >
          <span>{playing ? "⏸" : "▶️"}</span>
          <span className="hidden md:inline">BGM</span>
        </button>
      </div>
    </>
  );
}

const App: React.FC = () => {
  const currentHoldIndex = useStore((state) => state.currentHoldIndex);
  const isFinished = useStore((state) => state.isFinished);
  const lowPowerMode = useStore((state) => state.lowPowerMode);
  const toggleLowPower = useStore((state) => state.toggleLowPower);
  const resetGame = useStore((state) => state.resetGame);
  
  // Debug State
  const lastClickIndex = useStore(state => state.lastClickIndex);
  const lastClickSuccess = useStore(state => state.lastClickSuccess);

  return (
    <div className="w-full h-screen relative font-sans text-white select-none overflow-hidden">
      
      {/* 1. New BGM Button (Fixed Top-Right) */}
      <BGMButton />

      {/* 3D Scene */}
      <Scene />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start pointer-events-none z-10">
        
        {/* Left: Title & Progress */}
        <div className="pointer-events-auto">
          <h1 className="text-2xl md:text-4xl font-serif text-gold drop-shadow-lg tracking-wider">
            Memory Tree
          </h1>
          
          <div className="mt-2 bg-black/30 backdrop-blur-md p-2 rounded-lg border border-white/10 inline-block">
            <p className="text-sm md:text-base text-white font-mono">
              Route: <span className="text-gold font-bold text-lg">{currentHoldIndex}</span> / {holds.length}
            </p>
          </div>

          {/* DEBUG UI (Small text) */}
          <div className="mt-1 text-[10px] text-gray-500 font-mono opacity-60">
            Click Debug: {lastClickIndex !== null ? `Idx:${lastClickIndex} (${lastClickSuccess ? 'OK' : 'X'})` : 'Waiting...'}
          </div>
        </div>
        
        {/* Right: Controls (Moved down to avoid overlap with fixed BGM button) */}
        <div className="pointer-events-auto flex flex-col gap-2 items-end mt-14 md:mt-12">
            
            <button 
                onClick={toggleLowPower}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] md:text-xs border border-white/20 transition-all"
            >
                {lowPowerMode ? "⚡️ Eco" : "✨ High"}
            </button>
            <button 
                onClick={resetGame}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] md:text-xs border border-white/20 transition-all"
            >
                ↺ Reset
            </button>
        </div>
      </div>

      {/* Modals */}
      <FinishModal />
      <MemoryModal />
      
      {/* Footer Hint */}
      {!isFinished && (
          <div className="absolute bottom-8 w-full text-center pointer-events-none opacity-50 text-xs tracking-widest uppercase animate-pulse">
              Tap the blinking hold to start
          </div>
      )}
    </div>
  );
};

export default App;