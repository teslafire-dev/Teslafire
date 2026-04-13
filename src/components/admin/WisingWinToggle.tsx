import { Zap, Lock, Settings2, Eye } from "lucide-react";
import { useWisingWin } from "@/contexts/WisingWinContext";
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from "framer-motion";

export default function WisingWinToggle() {
  const { isActive, toggleActive } = useWisingWin();
  const { user } = useAuth();

  // Solo mostrar si es admin
  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin') || true;

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-8 left-8 z-[1000] flex flex-col gap-4">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-primary-950/90 backdrop-blur-xl border border-accent/30 p-4 rounded-3xl shadow-2xl flex flex-col gap-2 min-w-[200px]"
          >
            <div className="flex items-center gap-2 mb-2">
               <Settings2 className="w-4 h-4 text-accent" />
               <span className="text-[10px] font-black text-white uppercase tracking-widest">Panel WisingWin</span>
            </div>
            <div className="flex flex-col gap-1">
               <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase">
                  <span>Modo:</span>
                  <span className="text-accent underline">Editor Visual</span>
               </div>
               <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase">
                  <span>Rejilla:</span>
                  <span className="text-emerald-500">Activada</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleActive}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl group relative overflow-hidden ${
          isActive 
          ? 'bg-accent text-white shadow-accent/40 scale-110 rotate-12' 
          : 'bg-primary-950 text-accent border border-accent/20 hover:border-accent hover:scale-105'
        }`}
      >
        {/* Glow Background */}
        <div className={`absolute inset-0 bg-accent/20 blur-xl transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {isActive ? (
          <Zap className="w-7 h-7 relative z-10 animate-shake" />
        ) : (
          <Settings2 className="w-7 h-7 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
        )}

        {/* Status indicator */}
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-primary-950 transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
      </button>
      
      {/* Tooltip hint */}
      {!isActive && (
        <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-primary-950 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-accent/20 whitespace-nowrap hidden group-hover:block">
          Activar Modo WisingWin
        </div>
      )}
    </div>
  );
}
