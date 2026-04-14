import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Plus, 
  Trash2, 
  Link as LinkIcon, 
  Layers, 
  PlusCircle, 
  Edit3,
  Package,
  Tags,
  FileText,
  FileCode,
  Eye,
  X,
  Lock,
  ChevronDown,
  ChevronRight,
  Menu as MenuIcon,
  Search,
  CheckSquare,
  Square,
  ArrowRight,
  Save,
  Globe,
  Plus as PlusTiny
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface MenuItem {
  id: string;
  label: string;
  label_en?: string;
  url: string;
  orden: number;
  is_core: boolean;
  tipo: 'internal' | 'external' | 'category' | 'product' | 'page';
  item_id?: string;
  parent_id?: string | null;
}

export default function AdminMenus() {
  const [activeTab, setActiveTab] = useState<'menus' | 'paginas' | 'config'>('menus');
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [paginas, setPaginas] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection state
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  
  // Custom link state
  const [customLabel, setCustomLabel] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editLabelEn, setEditLabelEn] = useState('');
  const [editUrl, setEditUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [menusRes, pagesRes, catsRes] = await Promise.all([
      supabase.from('menus').select('*').order('orden', { ascending: true }),
      supabase.from('paginas').select('*').order('titulo', { ascending: true }),
      supabase.from('categorias').select('*').order('nombre', { ascending: true })
    ]);
    if (menusRes.data) setMenus(menusRes.data);
    if (pagesRes.data) setPaginas(pagesRes.data);
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  };

  const handleAddToMenu = async (type: 'page' | 'category' | 'custom') => {
    let itemsToAdd = [];
    if (type === 'page') {
      itemsToAdd = paginas.filter(p => selectedPages.includes(p.id)).map(p => ({
        label: p.titulo, label_en: p.titulo_en || '', url: `/${p.slug}`, tipo: 'page', orden: menus.length + 1, location: 'header'
      }));
      setSelectedPages([]);
    } else if (type === 'category') {
      itemsToAdd = categories.filter(c => selectedCats.includes(c.id)).map(c => ({
        label: c.nombre, label_en: c.nombre_en || '', url: `/productos?categoria=${c.id}`, tipo: 'category', orden: menus.length + 1, location: 'header'
      }));
      setSelectedCats([]);
    } else if (type === 'custom') {
      if (!customLabel || !customUrl) return toast.error('Datos incompletos');
      itemsToAdd = [{ label: customLabel, url: customUrl, tipo: 'internal', orden: menus.length + 1, location: 'header' }];
      setCustomLabel(''); setCustomUrl('');
    }

    if (itemsToAdd.length === 0) return;
    const { error } = await supabase.from('menus').insert(itemsToAdd);
    if (!error) { toast.success('Items añadidos'); fetchData(); }
  };

  const updateParent = async (id: string, parentId: string | null) => {
    const { error } = await supabase.from('menus').update({ parent_id: parentId }).eq('id', id);
    if (!error) { toast.success('Jerarquía actualizada'); fetchData(); }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from('menus').update({ label: editLabel, label_en: editLabelEn, url: editUrl }).eq('id', editingId);
    if (!error) { toast.success('Cambios guardados'); setEditingId(null); fetchData(); }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('¿Seguro?')) return;
    const { error } = await supabase.from('menus').delete().eq('id', id);
    if (!error) { toast.success('Eliminado'); fetchData(); }
  };

  const renderMenuStructure = (parentId: string | null = null, level = 0) => {
    return menus
      .filter(m => m.parent_id === parentId)
      .map(item => (
        <div key={item.id} className="flex flex-col gap-2">
          <div style={{ marginLeft: `${level * 40}px` }} className={`bg-white p-5 rounded-3xl border border-slate-100 shadow-lg group hover:border-accent transition-all animate-in slide-in-from-left-4 duration-500`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-accent transition-colors">
                     {level > 0 ? <ChevronRight className="w-4 h-4" /> : <MenuIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="font-black text-primary-950 uppercase tracking-tighter text-sm">{item.label}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{item.tipo} | {item.url}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                   <a href={item.url} target="_blank" className="p-2 text-slate-300 hover:text-accent transition-colors" title="Ver Página">
                      <Eye className="w-4 h-4" />
                   </a>
                   <select value={item.parent_id || 'none'} onChange={(e) => updateParent(item.id, e.target.value === 'none' ? null : e.target.value)} className="text-[9px] font-black uppercase tracking-widest bg-slate-50 border-none rounded-lg px-2 py-1 outline-none text-slate-400 focus:text-accent ml-2">
                      <option value="none">Principal</option>
                      {menus.filter(m => !m.parent_id && m.id !== item.id).map(m => (
                        <option key={m.id} value={m.id}>Bajo: {m.label}</option>
                      ))}
                   </select>

                   <button onClick={() => {
                        setEditingId(editingId === item.id ? null : item.id);
                        setEditLabel(item.label); setEditLabelEn(item.label_en || ''); setEditUrl(item.url);
                     }} className={`p-2 rounded-xl transition-all ${editingId === item.id ? 'bg-accent text-white' : 'text-slate-300 hover:text-accent'}`}>
                      <Edit3 className="w-4 h-4" />
                   </button>

                   {!item.is_core && (
                     <button onClick={() => handleDeleteMenu(item.id)} className="p-2 text-red-100 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </button>
                   )}
                </div>
            </div>

            <AnimatePresence>
                {editingId === item.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-6 pt-6 border-t border-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="space-y-1"><label className="text-[8px] font-black uppercase text-slate-400 ml-1">Nombre (ES)</label><input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold border-none" /></div>
                            <div className="space-y-1"><label className="text-[8px] font-black uppercase text-accent ml-1">Name (EN)</label><input value={editLabelEn} onChange={(e) => setEditLabelEn(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold border-none" /></div>
                            <div className="space-y-1"><label className="text-[8px] font-black uppercase text-slate-400 ml-1">URL</label><input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold border-none" /></div>
                        </div>
                        <button onClick={saveEdit} className="flex items-center gap-2 bg-primary-950 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase hover:bg-accent transition-all shadow-xl shadow-primary-950/20">
                            <Save className="w-3 h-3" /> Guardar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
          {renderMenuStructure(item.id, level + 1)}
        </div>
      ));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>
  );

  return (
    <div className="p-8 lg:p-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
           <div>
             <h1 className="text-5xl font-black text-primary-950 uppercase tracking-tighter font-outfit leading-none mb-3">Constructor de Navegación</h1>
             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Dobell Engine / Estilo Pro</p>
           </div>
           
           <div className="flex bg-white p-1.5 rounded-2xl shadow-xl border border-slate-100">
              {['menus', 'paginas'].map(t => (
                <button key={t} onClick={() => setActiveTab(t as any)} className={`px-8 py-2.5 rounded-[0.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-primary-950 text-white shadow-lg' : 'text-slate-400 hover:text-primary-950'}`}>
                   {t === 'menus' ? 'Menus' : 'Gestionar Páginas'}
                </button>
              ))}
           </div>
        </header>

        {activeTab === 'menus' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* PANEL IZQUIERDO: PIEZAS */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-xs font-black text-primary-950 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><PlusCircle className="w-4 h-4 text-accent" /> Piezas Disponibles</h2>
              
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                 <div className="p-6 bg-slate-50/50 border-b border-slate-50 flex justify-between items-center"><span className="text-[10px] font-black uppercase text-primary-950">Páginas Dinámicas</span><ChevronDown className="w-4 h-4 text-slate-400" /></div>
                 <div className="p-6 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {paginas.map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group">
                         <button onClick={() => setSelectedPages(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} className="flex items-center gap-3 flex-1">
                            {selectedPages.includes(p.id) ? <CheckSquare className="w-4 h-4 text-accent" /> : <Square className="w-4 h-4 text-slate-200 group-hover:text-slate-300" />}
                            <span className="text-[11px] font-bold text-slate-500 uppercase">{p.titulo}</span>
                         </button>
                         <a href={`/${p.slug}`} target="_blank" className="text-slate-400 hover:text-accent transition-colors bg-slate-50 p-2 rounded-lg" title="Vista Previa"><Eye className="w-4 h-4" /></a>
                      </div>
                    ))}
                 </div>
                 <div className="p-6 border-t border-slate-50 bg-slate-50/20">
                    <button onClick={() => handleAddToMenu('page')} disabled={selectedPages.length === 0} className="w-full bg-primary-950 text-white py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-accent disabled:opacity-30 transition-all flex items-center justify-center gap-2">Añadir al Menú <ArrowRight className="w-3 h-3" /></button>
                 </div>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                 <div className="p-6 bg-slate-50/50 border-b border-slate-50 flex justify-between items-center"><span className="text-[10px] font-black uppercase text-primary-950">Categorías y Enlaces</span><ChevronDown className="w-4 h-4 text-slate-400" /></div>
                 <div className="p-6 space-y-4">
                    <input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="URL manual (ej: /contacto)" className="w-full bg-slate-50 border-none p-4 rounded-xl text-xs font-bold" />
                    <input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Etiqueta del enlace" className="w-full bg-slate-50 border-none p-4 rounded-xl text-xs font-bold" />
                    <button onClick={() => handleAddToMenu('custom')} className="w-full bg-primary-950 text-white py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-accent transition-all">Anclaje Manual</button>
                 </div>
              </div>
            </div>

            {/* PANEL DERECHO: ESTRUCTURA */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-10 min-h-[600px] flex flex-col gap-8 relative overflow-hidden">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                    <div><h2 className="text-3xl font-black text-primary-950 uppercase tracking-tighter leading-none">Estructura del Menú</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 underline decoration-accent/30 underline-offset-4">Organiza tus links y crea submenús arrastrando el orden</p></div>
                    <div className="w-16 h-1 bg-accent/20 rounded-full"></div>
                 </div>
                 <div className="flex flex-col gap-4">{menus.length === 0 ? <div className="py-40 text-center text-slate-200 font-black uppercase tracking-widest text-xs flex flex-col items-center gap-6"><MenuIcon className="w-16 h-16 opacity-10" /> Menú Vacío</div> : renderMenuStructure(null)}</div>
              </div>
            </div>
          </div>
        ) : (
          /* PANEL DE PAGINAS: GESTION COMPLETA */
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button 
                  onClick={() => {/* Lógica para nueva página si fuera necesaria aquí */}} 
                  className="bg-white border-4 border-dashed border-slate-100 p-10 rounded-[3rem] text-slate-300 hover:border-accent hover:text-accent transition-all flex flex-col items-center justify-center gap-4 group"
                >
                   <PlusCircle className="w-12 h-12" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Inaugurar Nueva Página Dinámica</span>
                </button>

                {paginas.map(p => (
                  <div key={p.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col gap-6 group hover:border-accent transition-all relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rotate-45 translate-x-12 -translate-y-12"></div>
                     <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-accent transition-colors">
                           <FileCode className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-end">
                           <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${p.estado === 'publico' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-500'}`}>
                              {p.estado}
                           </span>
                        </div>
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-primary-950 uppercase tracking-tighter mb-1 truncate">{p.titulo}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link: /{p.slug}</p>
                     </div>
                     <div className="flex items-center gap-2 mt-2">
                        <Link to={`/${p.slug}?edit=true`} className="flex-1 bg-accent text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all">
                           <Edit3 className="w-4 h-4 mx-auto" />
                        </Link>
                        <a href={`/${p.slug}`} target="_blank" className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-primary-950 hover:text-white transition-all">
                           <Eye className="w-5 h-5" />
                        </a>
                        <button className="p-4 bg-red-50 text-red-300 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                           <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
