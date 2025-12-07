import { create } from 'zustand';
import { StoreState } from './types';
import { holds } from './data';

export const useStore = create<StoreState>((set, get) => ({
  currentHoldIndex: 0,
  isFinished: false,
  isFinishModalOpen: false, // Default closed
  activeMemoryId: null,
  lowPowerMode: false,
  
  burstData: null,

  // Debug defaults
  lastClickIndex: null,
  lastClickSuccess: null,

  clickHold: (index: number) => {
    const { currentHoldIndex, isFinished, triggerBurst } = get();
    
    // Debug logging
    console.log(`[Store] Clicked Hold: ${index}, Current Target: ${currentHoldIndex}`);

    if (isFinished) return false;

    // Logic: Only allow the exact next hold
    if (index === currentHoldIndex) {
      const nextIndex = currentHoldIndex + 1;
      const finished = nextIndex >= holds.length;
      
      // TRIGGER PARTICLE BURST
      const hold = holds[index];
      triggerBurst(hold.position);

      set({ 
        currentHoldIndex: nextIndex,
        isFinished: finished,
        isFinishModalOpen: finished, // Open modal ONLY when just finished
        lastClickIndex: index,
        lastClickSuccess: true
      });
      return true;
    }
    
    // Ignore clicks on previous holds (already lit)
    if (index < currentHoldIndex) {
      set({ lastClickIndex: index, lastClickSuccess: true });
      return true;
    }

    // Wrong hold clicked
    set({ lastClickIndex: index, lastClickSuccess: false });
    return false;
  },

  triggerBurst: (position) => {
    set({ burstData: { id: Date.now(), position } });
  },

  openMemory: (id) => set({ activeMemoryId: id }),
  closeMemory: () => set({ activeMemoryId: null }),
  
  closeFinishModal: () => set({ isFinishModalOpen: false }), // Allow closing to view tree
  
  toggleLowPower: () => set((state) => ({ lowPowerMode: !state.lowPowerMode })),
  
  resetGame: () => set({
    currentHoldIndex: 0,
    isFinished: false,
    isFinishModalOpen: false,
    activeMemoryId: null,
    lastClickIndex: null,
    lastClickSuccess: null,
    burstData: null
  })
}));