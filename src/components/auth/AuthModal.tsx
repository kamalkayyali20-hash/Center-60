import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuthPage } from './AuthPage';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authInitialMode } = useApp();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 end-4 z-20 p-2 text-white/80 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          aria-label="Close auth dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <AuthPage
          initialMode={authInitialMode}
          isModal={true}
          onSuccess={() => setIsAuthModalOpen(false)}
        />
      </div>
    </div>
  );
};
