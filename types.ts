export interface Memory {
  id: number;
  title: string;
  date: string;
  caption: string;
  imgUrl: string;
  position: [number, number, number]; // x, y, z
}

export type HoldShape = 'box' | 'sphere' | 'dodecahedron';

export interface HoldData {
  id: number;
  position: [number, number, number];
  color: string;
  shape: HoldShape; 
  rotation?: [number, number, number]; 
}

export interface BurstData {
  id: number; // timestamp or counter to force updates
  position: [number, number, number];
}

export interface StoreState {
  currentHoldIndex: number;
  isFinished: boolean; // Game logic state
  isFinishModalOpen: boolean; // UI state for the popup
  activeMemoryId: number | null;
  lowPowerMode: boolean;
  
  // Particle Interaction
  burstData: BurstData | null;

  // Debug Info
  lastClickIndex: number | null;
  lastClickSuccess: boolean | null;

  // Actions
  clickHold: (index: number) => boolean; 
  triggerBurst: (position: [number, number, number]) => void;
  openMemory: (id: number) => void;
  closeMemory: () => void;
  closeFinishModal: () => void; // New action
  toggleLowPower: () => void;
  resetGame: () => void;
}