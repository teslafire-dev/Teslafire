import { useState, useEffect } from 'react';
import { useParams, Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Editable } from '@/components/admin/Editable';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Loader2, 
  Lock, 
  ShieldCheck, 
  ChevronDown, 
  Trash2, 
  Plus,
  Type,
  AlignLeft,
  ImageIcon,
  Quote as QuoteIcon,
  Layout,
  Layers,
  Upload,
  Settings,
  AlignCenter,
  AlignRight,
  Maximize,
  Columns,
  Box,
  Split,
  Grid3X3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWisingWin } from '@/contexts/WisingWinContext';

export default function DynamicPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { isActive: isWisingActive } = useWisingWin();
  const isEditMode = searchParams.get('edit') === 'true' || isWisingActive;
  const { user, canManageSettings } = useAuth();
  
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<string | null>(null);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('paginas')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      const widgetsWithIds = (data.widgets || []).map((w: any) => ({
        ...w,
        id: w.id || Math.random().toString(36).substr(2, 9),
        width: w.width || '100',
        align: w.align || 'left'
      }));
      setPage({ ...data, widgets: widgetsWithIds });
      
      if (data.estado === 'protegido' && !isEditMode) {
        setIsLocked(true);
      }
    }
    setLoading(false);
  };

  const saveWidgets = async (updatedWidgets: any[]) => {
    // Clean up empty placeholders before saving to DB
    const cleanWidgets = updatedWidgets.filter(w => w.type !== 'placeholder' || isEditMode);
    setPage((prev: any) => ({ ...prev, widgets: updatedWidgets }));
    const { error } = await supabase.from('paginas').update({ widgets: cleanWidgets }).eq('id', page.id);
    if (error) toast.error('Error al sincronizar');
  };

  const updateWidgetProp = (id: string, prop: string, value: any) => {
    const updated = page.widgets.map((w: any) => 
      w.id === id ? { ...w, [prop]: value } : w
    );
    saveWidgets(updated);
  };

  const handleRemoveWidget = (id: string) => {
    if (!confirm('¿Eliminar este bloque?')) return;
    const updated = page.widgets.filter((w: any) => w.id !== id);
    saveWidgets(updated);
  };

  const handleAddWidget = (type: string, afterId: string | null) => {
    const createWidget = (t: string, w = '100') => ({ 
      id: Math.random().toString(36).substr(2, 9),
      type: t, content: '', url: '', width: w, align: 'left', urls: [] 
    });

    let newWidgets: any[] = [];
    if (type === 'row-2') {
      newWidgets = [createWidget('placeholder', '50'), createWidget('placeholder', '50')];
    } else if (type === 'row-3') {
      newWidgets = [createWidget('placeholder', '33'), createWidget('placeholder', '33'), createWidget('placeholder', '33')];
    } else {
      newWidgets = [createWidget(type)];
    }
    
    let updated = [...page.widgets];
    if (afterId === null) {
      updated = [...newWidgets, ...updated];
    } else {
      const index = updated.findIndex((w: any) => w.id === afterId);
      updated.splice(index + 1, 0, ...newWidgets);
    }
    
    saveWidgets(updated);
    setShowAddMenu(null);
  };

  const replacePlaceholder = (id: string, type: string) => {
    const updated = page.widgets.map((w: any) => 
      w.id === id ? { ...w, type, content: '' } : w
    );
    saveWidgets(updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const toastId = toast.loading('Subiendo imagen...');
    try {
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      const filePath = `paginas/${fileName}`;
      const { error } = await supabase.storage.from('products').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
      updateWidgetProp(id, 'url', publicUrl);
      toast.success('Imagen actualizada', { id: toastId });
    } catch (error: any) {
      toast.error('Error: ' + error.message, { id: toastId });
    }
  };

  const handleUnlock = () => {
    if (passwordInput === page.password) {
      setIsLocked(false);
      toast.success('Acceso concedido');
    } else {
      toast.error('Contraseña incorrecta');
    }
  };

  const renderWidget = (w: any) => {
    const key = `widget_${w.id}`;
    const alignClass = w.align === 'center' ? 'text-center items-center mx-auto' : w.align === 'right' ? 'text-right items-end ml-auto' : 'text-left items-start mr-auto';
    
    switch (w.type) {
      case 'placeholder':
        return (
          <div className="w-full aspect-[4/1] md:aspect-video bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group/hvr hover:border-accent hover:bg-accent/5 transition-all text-slate-300 hover:text-accent shadow-inner relative overflow-hidden">
             {/* Fondo sutil para mejor visibilidad */}
             <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-transparent dark:from-white/5 opacity-50"></div>
             
             <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl transform group-hover/hvr:scale-110 transition-transform relative z-10 border border-slate-100 dark:border-white/10">
                <Plus className="w-6 h-6 text-accent" />
             </div>
             <span className="text-[9px] font-black uppercase tracking-[0.3em] relative z-10 mb-2">Insertar Módulo</span>
             
             <div className="absolute inset-0 z-20 opacity-0 group-hover/hvr:opacity-100 transition-all duration-500 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 rounded-[2.5rem] p-6 gap-4 backdrop-blur-md">
                {[
                  { id: 'heading', icon: Type, name: 'Título' },
                  { id: 'paragraph', icon: AlignLeft, name: 'Texto' },
                  { id: 'image', icon: ImageIcon, name: 'Foto' }
                ].map(b => (
                  <button key={b.id} onClick={() => replacePlaceholder(w.id, b.id)} className="flex flex-col items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-[1.5rem] transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/10 group/btn">
                     <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl group-hover/btn:bg-accent group-hover/btn:text-white transition-colors">
                        <b.icon className="w-5 h-5" />
                     </div>
                     <span className="text-[8px] font-black uppercase tracking-widest">{b.name}</span>
                  </button>
                ))}
             </div>
          </div>
        );
      case 'heading':
        return (
          <div className={`flex flex-col ${alignClass}`}>
            <h2 className="text-4xl md:text-5xl font-black text-primary-950 dark:text-white uppercase tracking-tighter w-full">
              <Editable keyName={`${key}_c`}>{w.content || 'Título del Bloque'}</Editable>
            </h2>
          </div>
        );
      case 'paragraph':
        return (
          <div className={`flex flex-col ${alignClass}`}>
            <div className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic w-full">
              <Editable keyName={`${key}_c`}>{w.content || 'Escribe tu párrafo aquí...'}</Editable>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="relative rounded-[3rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-2xl group w-full aspect-video">
             <img src={w.url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070'} className="w-full h-full object-cover" alt="Industrial" />
             {isEditMode && (
                <div className="absolute inset-0 bg-primary-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-4 backdrop-blur-sm">
                   <label className="bg-white text-primary-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-accent transition-all flex items-center gap-3">
                      <Upload className="w-5 h-5" /> REEMPLAZAR FOTO
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, w.id)} />
                   </label>
                </div>
             )}
          </div>
        );
      case 'gallery':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
             {(w.urls || [1,2,3]).map((url: string, i: number) => (
               <div key={`${key}_img_${i}`} className="aspect-square rounded-[2rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-lg relative group">
                  <img src={typeof url === 'string' ? url : 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1470'} className="w-full h-full object-cover" />
               </div>
             ))}
          </div>
        );
      case 'quote':
        return (
          <blockquote className={`border-l-8 border-accent pl-10 py-6 bg-slate-50 dark:bg-white/5 rounded-r-[3rem] w-full ${alignClass}`}>
             <p className="text-2xl font-black text-primary-950 dark:text-white uppercase tracking-tight italic mb-4"><Editable keyName={`${key}_c`}>"La excelencia industrial no es un acto, es un hábito."</Editable></p>
             <cite className="text-xs font-black text-accent uppercase tracking-widest not-italic">— Dobell Team</cite>
          </blockquote>
        );
      case 'support_section':
        return (
          <div className="space-y-10 py-6 w-full">
             <div className="bg-white dark:bg-slate-900 p-10 lg:p-14 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 -translate-y-16 translate-x-16 rounded-full"></div>
                <div className="flex flex-col gap-2 mb-10"><h3 className="text-3xl font-black text-primary-950 dark:text-white uppercase tracking-tighter">Preguntas Frecuentes</h3></div>
                <div className="flex flex-col gap-4">
                   {[1,2].map((i) => (
                     <div key={i} className="border-b border-slate-50 dark:border-white/5 last:border-0 pb-4">
                        <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between text-left py-4 group">
                           <span className="text-sm font-black text-primary-950 dark:text-slate-100 uppercase tracking-tight group-hover:text-accent transition-colors"><Editable keyName={`${key}_faq_q_${i}`}>Pregunta frecuente #{i}</Editable></span>
                           <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>{activeFaq === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="text-slate-500 font-bold text-xs uppercase tracking-wide leading-relaxed mt-2"><Editable keyName={`${key}_faq_a_${i}`}>Respuesta técnica para el cliente.</Editable></p></motion.div>)}</AnimatePresence>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dobell Engine Sync...</span>
    </div>
  );

  if (!page || (page.estado === 'borrador' && !user && !isEditMode)) return <Navigate to="/" replace />;

  if (isLocked) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-[3.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
         <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-8"><Lock className="w-10 h-10" /></div>
         <h2 className="text-3xl font-black text-primary-950 uppercase tracking-tighter mb-4 leading-none">Página Protegida</h2>
         <div className="flex flex-col gap-4">
            <input type="password" className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl font-black text-center text-lg focus:ring-2 focus:ring-accent outline-none tracking-[0.5em]" placeholder="••••" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlock()} />
            <button onClick={handleUnlock} className="w-full bg-primary-950 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-accent transition-colors">Desbloquear</button>
         </div>
      </motion.div>
    </div>
  );

  return (
    <div className={`min-h-screen pt-32 pb-20 bg-white dark:bg-slate-950 transition-all duration-500`}>
      <section className="container mx-auto px-6 lg:px-20 mb-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 text-accent mb-6">
             <ShieldCheck className="w-5 h-5" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">{page.estado === 'publico' ? 'Acceso Público' : 'Contenido Protegido'}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-primary-950 dark:text-white leading-[0.9] tracking-tighter uppercase mb-8">
            <Editable keyName={`page_title_${page.id}`}>{page.titulo}</Editable>
          </h1>
        </motion.div>
      </section>

      <section className="container mx-auto px-6 lg:px-20">
        <Reorder.Group axis="y" values={page.widgets} onReorder={saveWidgets} className="flex flex-wrap gap-y-12 max-w-5xl mx-auto items-start">
          {page.widgets.map((w: any) => {
            const widthClass = w.width === '50' ? 'w-full md:w-[calc(50%-1.5rem)]' : w.width === '33' ? 'w-full md:w-[calc(33.3%-1rem)]' : 'w-full';
            
            return (
              <Reorder.Item key={w.id} value={w} className={`${widthClass} group/widget relative pr-6 mb-12`} dragListener={isEditMode}>
                 {/* Separador Visual de Edicion */}
                 {isEditMode && <div className="absolute -inset-4 border border-dashed border-slate-100 dark:border-white/5 rounded-[4rem] pointer-events-none -z-10 group-hover/widget:border-accent/40 group-hover/widget:bg-slate-50/50 dark:group-hover/widget:bg-white/5 transition-all"></div>}

                 {isEditMode && canManageSettings && (
                    <div className="absolute -left-16 top-0 flex flex-col gap-2 opacity-0 group-hover/widget:opacity-100 transition-all z-20">
                       <div className="p-3 bg-white shadow-xl rounded-xl text-slate-300 cursor-grab hover:text-accent transition-all"><Layers className="w-4 h-4" /></div>
                       <button onClick={() => setShowSettings(showSettings === w.id ? null : w.id)} className={`p-3 bg-white shadow-xl rounded-xl transition-all ${showSettings === w.id ? 'text-accent ring-2 ring-accent' : 'text-slate-400 hover:text-accent'}`}><Settings className="w-4 h-4" /></button>
                       <button onClick={() => handleRemoveWidget(w.id)} className="p-3 bg-red-100 text-red-500 shadow-xl rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                 )}

                 <AnimatePresence>
                    {showSettings === w.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.9, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9, x: 20 }} className="absolute left-16 top-0 w-64 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl border border-slate-100 dark:border-white/10 p-6 z-[100]">
                         <div className="flex flex-col gap-6">
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Columns className="w-3 h-3" /> Ancho del Bloque</p>
                               <div className="grid grid-cols-3 gap-2">
                                  {[{v: '100', i: Maximize}, {v: '50', i: Columns}, {v: '33', i: Box}].map(o => (
                                    <button key={o.v} onClick={() => updateWidgetProp(w.id, 'width', o.v)} className={`p-3 rounded-xl flex items-center justify-center transition-all ${w.width === o.v ? 'bg-accent text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary-950 dark:hover:text-white'}`}><o.i className="w-4 h-4" /></button>
                                  ))}
                               </div>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><AlignLeft className="w-3 h-3" /> Alineación</p>
                               <div className="grid grid-cols-3 gap-2">
                                  {[{v: 'left', i: AlignLeft}, {v: 'center', i: AlignCenter}, {v: 'right', i: AlignRight}].map(o => (
                                    <button key={o.v} onClick={() => updateWidgetProp(w.id, 'align', o.v)} className={`p-3 rounded-xl flex items-center justify-center transition-all ${w.align === o.v ? 'bg-accent text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary-950 dark:hover:text-white'}`}><o.i className="w-4 h-4" /></button>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
                 {renderWidget(w)}
                 {isEditMode && canManageSettings && (
                    <div className="flex justify-center -mb-6 relative z-10 pt-4">
                       <button onClick={() => setShowAddMenu(showAddMenu === w.id ? null : w.id)} className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/widget:opacity-100 border-4 border-white dark:border-slate-950"><Plus className="w-6 h-6" /></button>
                       {showAddMenu === w.id && (
                         <div className="absolute top-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 p-4 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] grid grid-cols-3 gap-2 z-[60] animate-in zoom-in-95 backdrop-blur-md">
                            {[
                               { id: 'heading', name: 'Título', icon: Type },
                               { id: 'paragraph', name: 'Texto', icon: AlignLeft },
                               { id: 'image', name: 'Foto', icon: ImageIcon },
                               { id: 'row-2', name: '2 Caps', icon: Split },
                               { id: 'row-3', name: '3 Caps', icon: Grid3X3 },
                               { id: 'gallery', name: 'Galería', icon: Layout }
                            ].map(block => (
                              <button key={block.id} onClick={() => handleAddToMenu ? handleAddWidget(block.id, w.id) : null} className="flex flex-col items-center gap-2 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all group">
                                 <block.icon className="w-5 h-5 text-slate-400 group-hover:text-accent" />
                                 <span className="text-[8px] font-black uppercase text-slate-300">{block.name}</span>
                              </button>
                            ))}
                         </div>
                       )}
                    </div>
                 )}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </section>
    </div>
  );
}
