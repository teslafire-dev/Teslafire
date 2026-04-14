import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Editable } from '@/components/admin/Editable';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Lock, ShieldCheck, ChevronDown, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const { data, error } = await supabase
        .from('paginas')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        setPage(data);
        if (data.estado === 'protegido') {
          setIsLocked(true);
        }
      }
      setLoading(false);
    }
    fetchPage();
  }, [slug]);

  const handleUnlock = () => {
    if (passwordInput === page.password) {
      setIsLocked(false);
      toast.success('Acceso concedido', { icon: '🔓' });
    } else {
      toast.error('Contraseña incorrecta');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando Contenido...</span>
      </div>
    );
  }

  if (!page || (page.estado === 'borrador' && !localStorage.getItem('supabase.auth.token'))) {
    return <Navigate to="/" replace />;
  }

  // --- PASSWORD VIEW ---
  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-[3.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-accent"></div>
           <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-8">
              <Lock className="w-10 h-10" />
           </div>
           <h2 className="text-3xl font-black text-primary-950 uppercase tracking-tighter mb-4 leading-none">Página Protegida</h2>
           <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-loose mb-10">Este contenido requiere una clave de acceso autorizada para ser visualizado.</p>
           
           <div className="flex flex-col gap-4">
              <input 
                 type="password" 
                 className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl font-black text-center text-lg focus:ring-2 focus:ring-accent outline-none tracking-[0.5em]"
                 placeholder="••••"
                 value={passwordInput}
                 onChange={(e) => setPasswordInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              />
              <button 
                onClick={handleUnlock}
                className="w-full bg-primary-950 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-accent transition-colors"
              >
                Desbloquear Contenido
              </button>
           </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-white dark:bg-slate-950">
      {/* Header Dinámico */}
      <section className="container mx-auto px-4 mb-16 px-6 lg:px-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 text-accent mb-6">
             <ShieldCheck className="w-5 h-5" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">{page.estado === 'publico' ? 'Acceso Público' : 'Contenido Protegido'}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-primary-950 dark:text-white leading-[0.9] tracking-tighter font-outfit uppercase mb-8">
            <Editable keyName={`page_title_${page.id}`}>{page.titulo}</Editable>
          </h1>
        </motion.div>
      </section>

      {/* Contenido Principal con Renderizador de Widgets */}
      <section className="container mx-auto px-6 lg:px-20 space-y-12">
        {(!page.widgets || page.widgets.length === 0) ? (
          <div className="prose prose-slate dark:prose-invert max-w-none">
             <div className="bg-slate-50 dark:bg-white/5 p-10 md:p-20 rounded-[4rem] border border-slate-100 dark:border-white/10 shadow-inner">
                <div className="text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-300 leading-relaxed uppercase tracking-tight">
                  <Editable keyName={`page_content_${page.id}`}>
                     Esta página está vacía. Usa el editor de bloques en el panel para añadir contenido.
                  </Editable>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col gap-12 max-w-5xl mx-auto">
            {page.widgets.map((w: any, idx: number) => {
              const key = `page_${page.id}_widget_${idx}`;
              
              switch (w.type) {
                case 'heading':
                  return (
                    <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} key={key} className="text-4xl md:text-5xl font-black text-primary-950 dark:text-white uppercase tracking-tighter">
                      <Editable keyName={`${key}_c`}>{w.content || 'Título del Bloque'}</Editable>
                    </motion.h2>
                  );
                
                case 'paragraph':
                  return (
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} key={key} className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      <Editable keyName={`${key}_c`}>{w.content || 'Escribe tu párrafo aquí...'}</Editable>
                    </motion.div>
                  );

                case 'image':
                  return (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} key={key} className="relative aspect-video rounded-[3rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-2xl group">
                       <img src={w.url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Industrial" />
                       <div className="absolute inset-0 bg-gradient-to-t from-primary-950/20 to-transparent"></div>
                    </motion.div>
                  );

                case 'gallery':
                  return (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {(w.urls || [1,2,3]).map((url: string, i: number) => (
                         <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={`${key}_img_${i}`} className="aspect-square rounded-[2rem] overflow-hidden border border-slate-100 dark:border-white/5">
                            <img src={typeof url === 'string' ? url : 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1470&auto=format&fit=crop'} className="w-full h-full object-cover" />
                         </motion.div>
                       ))}
                    </div>
                  );
                
                case 'quote':
                  return (
                    <motion.blockquote initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} key={key} className="border-l-8 border-accent pl-10 py-6 bg-slate-50 dark:bg-white/5 rounded-r-[3rem]">
                       <p className="text-2xl font-black text-primary-950 dark:text-white uppercase tracking-tight italic mb-4">
                          <Editable keyName={`${key}_c`}>"La excelencia industrial no es un acto, es un hábito."</Editable>
                       </p>
                       <cite className="text-xs font-black text-accent uppercase tracking-widest not-italic">— Dobell Team</cite>
                    </motion.blockquote>
                  );

                default:
                  return null;
              }
            })}
          </div>
        )}
      </section>

      {/* WIDGETS / BLOQUES OPCIONALES */}
      <section className="container mx-auto px-4 mt-20 space-y-20 px-6 lg:px-20">
         
         {/* Widget FAQ (Ejemplo de Widget de sistema) */}
         <div className="bg-white dark:bg-slate-900 p-12 lg:p-20 rounded-[4rem] border border-slate-100 dark:border-white/5 shadow-2xl">
            <div className="flex flex-col gap-2 mb-12">
               <span className="text-accent text-[10px] font-black uppercase tracking-widest">Información de Soporte</span>
               <h3 className="text-4xl font-black text-primary-950 dark:text-white uppercase tracking-tighter">Preguntas Frecuentes</h3>
            </div>
            
            <div className="flex flex-col gap-4">
               {[1,2,3].map((i) => (
                 <div key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0 pb-6">
                    <button 
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full flex items-center justify-between text-left py-4 group"
                    >
                       <span className="text-lg font-black text-primary-950 dark:text-slate-100 uppercase tracking-tighter group-hover:text-accent transition-colors">
                          <Editable keyName={`page_${page.id}_faq_q_${i}`}>Título de la pregunta frecuente #{i}</Editable>
                       </span>
                       <ChevronDown className={`w-6 h-6 text-slate-300 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                       {activeFaq === i && (
                         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wide leading-relaxed mt-2 pt-4 border-t border-slate-50 dark:border-white/5">
                               <Editable keyName={`page_${page.id}_faq_a_${i}`}>Aquí va la respuesta detallada para resolver las dudas de tus clientes sobre este servicio o política industrial.</Editable>
                            </p>
                         </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
               ))}
            </div>
         </div>

         {/* Widget Beneficios */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="bg-slate-50 dark:bg-white/5 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 group hover:bg-primary-950 transition-all duration-500">
                 <CheckCircle2 className="w-10 h-10 text-accent mb-6 group-hover:scale-110 transition-transform" />
                 <h5 className="text-xl font-black text-primary-950 dark:text-white uppercase tracking-tighter mb-3 group-hover:text-white">
                    <Editable keyName={`page_${page.id}_ben_t_${i}`}>Punto Clave {i}</Editable>
                 </h5>
                 <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-loose group-hover:text-slate-300">
                    <Editable keyName={`page_${page.id}_ben_d_${i}`}>Descripción técnica detallada del beneficio o característica que el cliente obtendrá con este servicio.</Editable>
                 </p>
              </div>
            ))}
         </div>
      </section>

      {/* Footer Industrial Decorativo */}
      <section className="container mx-auto px-4 mt-32 px-6 lg:px-20">
         <div className="p-20 bg-primary-950 rounded-[4rem] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
            <h2 className="text-white font-black text-5xl uppercase tracking-tighter mb-6 relative z-10 italic">Sección Oficial Dobell</h2>
            <div className="flex justify-center gap-3 mb-8 relative z-10">
               {[1,2,3,4,5].map(i => <div key={i} className="w-12 h-1 bg-accent/30 rounded-full"></div>)}
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] relative z-10">Confidencialidad • Integridad • Seguridad</p>
         </div>
      </section>
    </div>
  );
}
