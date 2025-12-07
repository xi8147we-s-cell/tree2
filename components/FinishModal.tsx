import React from 'react';
import { useStore } from '../store';

const FinishModal: React.FC = () => {
  const isFinishModalOpen = useStore((state) => state.isFinishModalOpen);
  const closeFinishModal = useStore((state) => state.closeFinishModal);

  if (!isFinishModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={closeFinishModal}
    >
      <div 
        className="relative bg-gradient-to-br from-climb-green/95 to-black/95 p-8 rounded-xl border border-gold/30 text-center shadow-2xl pointer-events-auto max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
        
        {/* Close X Button */}
        <button 
          onClick={closeFinishModal}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-serif text-gold mb-4 drop-shadow-md">Merry Climb-mas! 🎄</h2>
        <p className="text-gray-200 mb-8 leading-relaxed font-light">
           Route completed! <br/>
           May your crimps be positive and your landings soft this coming year.
        </p>

        <button 
            onClick={closeFinishModal}
            className="w-full bg-gold hover:bg-yellow-300 text-climb-dark font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg uppercase tracking-wide text-sm"
        >
            Back to Tree
        </button>
      </div>
    </div>
  );
};

export default FinishModal;