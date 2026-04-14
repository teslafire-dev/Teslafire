import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Link as LinkIcon, 
  Layers, 
  Save, 
  PlusCircle, 
  Edit3,
  ExternalLink,
  Package,
  Tags,
  FileText,
  FileCode,
  Eye,
  X,
  Type,
  AlignLeft,
  Image as ImageIcon,
  Quote as QuoteIcon,
  Layout
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  orden: number;
  tipo: 'internal' | 'external' | 'category' | 'product' | 'page';
  item_id?: string;
  parent_id?: string;
}

export default function AdminMenus() {
  const [activeTab, setActiveTab] = useState<'menus' | 'paginas'>('menus');
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [paginas, setPaginas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  
  // Form state for Menu
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<MenuItem['tipo']>('internal');

  // Form state for Page
  const [newPath, setNewPath] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState<'publico' | 'borrador' | 'protegido'>('publico');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [menusRes, paginasRes] = await Promise.all([
      supabase.from('menus').select('*').order('orden', { ascending: true }),
      supabase.from('paginas').select('*').order('created_at', { ascending: false })
    ]);

    if (menusRes.error || paginasRes.error) {
      toast.error('Error al sincronizar datos');
    } else {
      setMenus(menusRes.data || []);
      setPaginas(paginasRes.data || []);
    }
    setLoading(false);
  };

  const handleCreatePage = async () => {
    if (!newTitle || !newPath) {
      toast.error('Título y ruta son obligatorios');
      return;
    }
    const slug = newPath.replace(/^\//, '');
    const { error } = await supabase.from('paginas').insert([{
      titulo: newTitle,
      slug: slug,
      estado: newStatus,
      password: newStatus === 'protegido' ? newPassword : null,
      published: newStatus !== 'borrador',
      widgets: []
    }]);

    if (error) toast.error('Error: ' + error.message);
    else {
      toast.success('Página creada');
      setIsAdding(false);
      setNewTitle(''); setNewPath(''); setNewPassword('');
      fetchData();
    }
  };

  const addWidget = async (type: string) => {
    if (!editingPage) return;
    const newWidget = { type, content: '', url: '', urls: [] };
    const updatedWidgets = [...(editingPage.widgets || []), newWidget];
    
    const { error } = await supabase.from('paginas').update({ widgets: updatedWidgets }).eq('id', editingPage.id);
    if (!error) {
      setEditingPage({ ...editingPage, widgets: updatedWidgets });
      toast.success(`Bloque ${type} añadido`);
      fetchData();
    }
  };

  const removeWidget = async (index: number) => {
    const updatedWidgets = editingPage.widgets.filter((_: any, i: number) => i !== index);
    const { error } = await supabase.from('paginas').update({ widgets: updatedWidgets }).eq('id', editingPage.id);
    if (!error) {
      setEditingPage({ ...editingPage, widgets: updatedWidgets });
      fetchData();
    }
  };

  const moveWidget = async (index: number, direction: 'up' | 'down') => {
    const updatedWidgets = [...editingPage.widgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updatedWidgets.length) return;
    
    [updatedWidgets[index], updatedWidgets[targetIndex]] = [updatedWidgets[targetIndex], updatedWidgets[index]];
    const { error } = await supabase.from('paginas').update({ widgets: updatedWidgets }).eq('id', editingPage.id);
    if (!error) {
      setEditingPage({ ...editingPage, widgets: updatedWidgets });
      fetchData();
    }
  };

  const handleDelete = async (id: string, table: 'menus' | 'paginas') => {
    if (!confirm('¿Estás seguro?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) toast.error('Error al eliminar');
    else { toast.success('Eliminado'); fetchData(); }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-3 text-accent mb-2">
              <Layers className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestión de Interfaz</span>
           </div>
           <h1 className="text-4xl font-black text-primary-950 uppercase tracking-tighter leading-none">Navegación y Páginas</h1>
           
           <div className="flex items-center gap-1 mt-6 bg-slate-100 p-1.5 rounded-2xl w-fit">
              {['menus', 'paginas'].map((tab) => (
                <button key={tab} onClick={() => { setActiveTab(tab as any); setIsAdding(false); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-primary-950 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{tab === 'menus' ? 'Menús' : 'Páginas'}</button>
              ))}
           </div>
        </div>
        
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-4 bg-accent text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-accent/40 hover:scale-105 active:scale-95 transition-all">
          {isAdding ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          {isAdding ? 'Cancelar' : activeTab === 'menus' ? 'Nuevo Enlace' : 'Nueva Página'}
        </button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl flex flex-col gap-8">
             {activeTab === 'menus' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</label>
                      <input type="text" className="bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm" placeholder="Ej: Catálogo" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
                   </div>
                   <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
                      <select className="bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm" value={newType} onChange={(e) => setNewType(e.target.value as any)}>
                         <option value="internal">Interno</option><option value="external">Externo</option><option value="category">Categoría</option><option value="product">Producto</option><option value="page">Página</option>
                      </select>
                   </div>
                   <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ruta</label>
                      <input type="text" className="bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm" placeholder="/ruta" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                   </div>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <input type="text" className="bg-slate-50 p-5 rounded-2xl font-bold text-sm" placeholder="Título" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                   <input type="text" className="bg-slate-50 p-5 rounded-2xl font-bold text-sm" placeholder="Ruta (slug)" value={newPath} onChange={(e) => setNewPath(e.target.value)} />
                   <select className="bg-slate-50 p-5 rounded-2xl font-bold text-sm" value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)}>
                      <option value="publico">Público</option><option value="borrador">Borrador</option><option value="protegido">Protegido</option>
                   </select>
                   {newStatus === 'protegido' && <input type="text" className="bg-accent/5 p-5 rounded-2xl font-bold text-sm text-accent transition-all" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />}
                </div>
             )}
             <button onClick={activeTab === 'menus' ? () => {} : handleCreatePage} className="w-fit bg-primary-950 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest self-end">Guardar Cambios</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4">
        {activeTab === 'menus' ? (
          menus.map((item, index) => (
            <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center gap-6 group hover:border-accent transition-all">
               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-accent transition-colors">
                  {item.tipo === 'category' ? <Tags /> : item.tipo === 'product' ? <Package /> : item.tipo === 'page' ? <FileCode /> : <LinkIcon />}
               </div>
               <div className="flex-1">
                  <span className="text-lg font-black text-primary-950 uppercase tracking-tighter truncate block">{item.label}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.url}</span>
               </div>
               <button onClick={() => handleDelete(item.id, 'menus')} className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))
        ) : (
          paginas.map((pag) => (
            <div key={pag.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center gap-6 group hover:border-primary-950 transition-all">
               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary-950">
                  <FileText className="w-7 h-7" />
               </div>
               <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-primary-950 uppercase tracking-tighter truncate">{pag.titulo}</span>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${pag.estado === 'publico' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>{pag.estado}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/{pag.slug} • {pag.widgets?.length || 0} Widgets</span>
               </div>
               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => setEditingPage(pag)} className="p-4 bg-slate-100 text-primary-950 rounded-2xl hover:bg-primary-950 hover:text-white transition-all"><Layout className="w-5 h-5" /></button>
                  <a href={`/${pag.slug}`} target="_blank" className="p-4 bg-slate-50 text-slate-400 rounded-2xl"><Eye className="w-5 h-5" /></a>
                  <button onClick={() => handleDelete(pag.id, 'paginas')} className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
               </div>
            </div>
          ))
        )}
      </div>

      {/* BLOCK EDITOR MODAL */}
      <AnimatePresence>
        {editingPage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-end bg-primary-950/40 backdrop-blur-md">
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="w-full max-w-2xl h-full bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] p-12 overflow-y-auto custom-scrollbar flex flex-col gap-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                   <div>
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest">Constructor de Bloques</span>
                      <h2 className="text-3xl font-black text-primary-950 uppercase tracking-tighter italic">Editando: {editingPage.titulo}</h2>
                   </div>
                   <button onClick={() => setEditingPage(null)} className="p-4 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                     { id: 'heading', name: 'Título', icon: Type },
                     { id: 'paragraph', name: 'Párrafo', icon: AlignLeft },
                     { id: 'image', name: 'Imagen', icon: ImageIcon },
                     { id: 'gallery', name: 'Galería', icon: Layout },
                     { id: 'quote', name: 'Cita', icon: QuoteIcon }
                   ].map(w => (
                     <button key={w.id} onClick={() => addWidget(w.id)} className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 hover:border-accent hover:bg-white transition-all group">
                        <w.icon className="w-6 h-6 text-slate-400 group-hover:text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{w.name}</span>
                     </button>
                   ))}
                </div>

                <div className="flex flex-col gap-6">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Estructura de la Página</span>
                   {editingPage.widgets?.length === 0 ? (
                      <div className="p-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                         <Layout className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                         <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sin bloques. Añade uno arriba.</p>
                      </div>
                   ) : (
                      editingPage.widgets.map((w: any, idx: number) => (
                        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-500">
                           <div className="flex flex-col gap-1">
                              <button onClick={() => moveWidget(idx, 'up')} className="p-2 text-slate-200 hover:text-accent"><MoveUp className="w-4 h-4" /></button>
                              <button onClick={() => moveWidget(idx, 'down')} className="p-2 text-slate-200 hover:text-accent"><MoveDown className="w-4 h-4" /></button>
                           </div>
                           <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                              {w.type === 'heading' ? <Type className="w-5 h-5" /> : w.type === 'paragraph' ? <AlignLeft className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                           </div>
                           <div className="flex-1">
                              <span className="text-[10px] font-black text-primary-950 uppercase tracking-widest block">{w.type}</span>
                              <span className="text-xs text-slate-400 font-bold italic">Bloque #{idx + 1}</span>
                           </div>
                           <button onClick={() => removeWidget(idx)} className="p-4 text-red-100 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      ))
                   )}
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100">
                   <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] leading-relaxed">Tras añadir el bloque, ve a la página para editar el contenido visualmente con WisingWin.</p>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
