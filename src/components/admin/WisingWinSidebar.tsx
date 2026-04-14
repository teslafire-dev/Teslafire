import { motion, AnimatePresence } from 'framer-motion';
import { useWisingWin } from '@/contexts/WisingWinContext';
import { 
  X, 
  Type, 
  AlignLeft, 
  ImageIcon, 
  Layout, 
  Quote as QuoteIcon, 
  ShieldCheck, 
  Palette, 
  Settings, 
  Plus,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function WisingWinSidebar() {
  const { isActive, toggleActive, dbConfig } = useWisingWin();
  const location = useLocation();

  // Detectar si estamos en una página dinámica para habilitar bloques
  const isDynamicPage = !location.pathname.startsWith('/admin') && location.pathname !== '/';

  if (!isActive) return null;

  const widgets = [
    { id: 'heading', name: 'Título Técnico', icon: Type, color: 'bg-primary-950', desc: 'H1/H2 Industrial' },
    { id: 'paragraph', name: 'Párrafo', icon: AlignLeft, color: 'bg-slate-500', desc: 'Texto cuerpo/técnico' },
    { id: 'image', name: 'Imagen', icon: ImageIcon, color: 'bg-emerald-500', desc: 'Visual Industrial' },
    { id: 'gallery', name: 'Galería', icon: Layout, color: 'bg-blue-500', desc: 'Catálogo Visual' },
    { id: 'quote', name: 'Cita', icon: QuoteIcon, color: 'bg-accent', desc: 'Testimonio/Frase' },
    { id: 'support_section', name: 'Soporte/FAQ', icon: ShieldCheck, color: 'bg-indigo-600', desc: 'FAQ + Sello Dobell' },
  ];

  return (
    <motion.aside
      initial={{ x: -400 }}
      animate={{ x: 0 }}
      exit={{ x: -400 }}
      className="fixed left-0 top-0 bottom-0 w-[350px] bg-white dark:bg-slate-950 z-[1100] border-r border-slate-200 dark:border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.1)] flex flex-col"
    >
      {/* Header del Sidebar */}
      <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-primary-950 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="flex items-center justify-between relative z-10 mb-4">
            <div className="flex items-center gap-3">
               <Sparkles className="w-5 h-5 text-accent" />
               <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">WisingWin Engine</span>
            </div>
            <button onClick={toggleActive} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
               <X className="w-5 h-5" />
            </button>
         </div>
         <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none relative z-10 italic">Editor Visual</h2>
      </div>

      {/* Navegación de Pestañas (Próximamente más opciones) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
         
         {/* SECCIÓN BLOQUES */}
         <section className="space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Bloques Disponibles
               </h3>
               {isDynamicPage && <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-black">ACTIVO</span>}
            </div>

            {!isDynamicPage ? (
               <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 text-center">
                  <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Los bloques solo están disponibles en páginas dinámicas.</p>
               </div>
            ) : (
               <div className="grid grid-cols-2 gap-3">
                  {widgets.map(w => (
                    <button 
                      key={w.id} 
                      onClick={() => toast.success('Arrastra o usa los botones (+) en la página')}
                      className="flex flex-col items-start gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-transparent hover:border-accent hover:bg-white dark:hover:bg-white/10 transition-all group text-left"
                    >
                       <div className={`w-10 h-10 ${w.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10`}>
                          <w.icon className="w-5 h-5" />
                       </div>
                       <div>
                          <span className="text-[10px] font-black text-primary-950 dark:text-white uppercase tracking-tight block">{w.name}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{w.desc}</span>
                       </div>
                    </button>
                  ))}
               </div>
            )}
         </section>

         {/* SECCIÓN CONFIGURACIÓN GLOBAL */}
         <section className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Palette className="w-4 h-4" /> Diseño Global
            </h3>
            <div className="space-y-3">
               <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                     <span className="w-4 h-4 rounded-full bg-accent"></span>
                     <span className="text-[9px] font-black text-primary-950 dark:text-white uppercase tracking-widest">Color Primario</span>
                  </div>
                  <Settings className="w-3 h-3 text-slate-300 group-hover:text-accent transition-colors" />
               </div>
               <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                     <span className="w-4 h-4 rounded-full bg-primary-950 border border-white/20"></span>
                     <span className="text-[9px] font-black text-primary-950 dark:text-white uppercase tracking-widest">Modo Oscuro</span>
                  </div>
                  <Settings className="w-3 h-3 text-slate-300 group-hover:text-accent transition-colors" />
               </div>
            </div>
         </section>

      </div>

      {/* Footer del Sidebar */}
      <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
         <div className="flex flex-col gap-4">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">WisingWin te permite editar el contenido visual de Dobell en tiempo real.</p>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[9px] font-black text-primary-950 dark:text-white uppercase tracking-widest tracking-tighter">Sincronizado con Supabase</span>
            </div>
         </div>
      </div>
    </motion.aside>
  );
}
