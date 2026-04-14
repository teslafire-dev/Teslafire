import { useState, useEffect } from "react";
import { 
  Tags, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  Save, 
  X, 
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  PlusCircle,
  Eye,
  ArrowUp,
  ArrowDown,
  Layout
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'nombre', direction: 'asc' });

  // Modal Form State
  const [formData, setFormData] = useState({ nombre: "", nombre_en: "", imagen_url: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("categorias").select("*").order("nombre");
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat: any = null) => {
    if (cat) {
      setEditCat(cat);
      setFormData({ nombre: cat.nombre, nombre_en: cat.nombre_en || "", imagen_url: cat.imagen_url || "" });
    } else {
      setEditCat(null);
      setFormData({ nombre: "", nombre_en: "", imagen_url: "" });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `cat_${fileName}`;

      const { error: uploadError } = await supabase.storage.from('categories').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('categories').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, imagen_url: publicUrl }));
      toast.success("Imagen técnica vinculada");
    } catch (err: any) {
      toast.error("Error al subir archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;
    
    setProcessing(true);
    try {
      const slug = formData.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const data = { ...formData, slug };

      const { error } = editCat 
        ? await supabase.from("categorias").update(data).eq("id", editCat.id)
        : await supabase.from("categorias").insert([data]);

      if (error) throw error;
      toast.success(editCat ? "Categoría actualizada" : "Categoría registrada");
      setIsModalOpen(false);
      fetchCategorias();
    } catch (err: any) {
      toast.error("Error en la operación");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Confirmar eliminación técnica?")) return;
    try {
      const { error } = await supabase.from("categorias").delete().eq("id", id);
      if (error) throw error;
      toast.success("Registro eliminado");
      fetchCategorias();
    } catch (err: any) {
      toast.error("Error al eliminar");
    }
  };

  const getSortedCategorias = () => {
    let filtered = categorias.filter(cat => 
      cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (cat.nombre_en && cat.nombre_en.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key]?.toLowerCase() || '';
        const valB = b[sortConfig.key]?.toLowerCase() || '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-5xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Gestión de Categorías</h1>
          <p className="text-lg font-bold text-slate-400 tracking-tight">Administración del árbol de navegación industrial.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary-950 text-white font-extrabold uppercase text-[12px] tracking-wider px-8 py-4 rounded-2xl hover:bg-black transition-smooth shadow-2xl shadow-primary-950/20 active:scale-95 flex items-center gap-2 whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5 text-accent" /> Nueva Categoría
        </button>
      </div>

      {/* Search & Filters Row */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="relative w-full lg:max-w-[700px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre técnico o slug..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-6 pl-16 pr-6 text-xl font-black placeholder:text-slate-300 focus:ring-4 focus:ring-accent/10 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* Table Design consistent with Products */}
      <div className="bg-white rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden mb-20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest w-[100px]">Imagen</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Nombre (ES / EN)</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Ruta (Slug)</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando niveles...</span>
                  </td>
                </tr>
              ) : getSortedCategorias().length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <Tags className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No se encontraron categorías</p>
                  </td>
                </tr>
              ) : getSortedCategorias().map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/80 transition-smooth group active:bg-slate-100">
                  <td className="px-8 py-5">
                    <div className="w-16 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 p-1">
                      {cat.imagen_url ? (
                        <img src={cat.imagen_url} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon className="w-5 h-5" /></div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-primary-950 uppercase tracking-tighter leading-none">{cat.nombre}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{cat.nombre_en || "Pte. Traducción"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[10px] font-black font-outfit text-accent bg-accent/5 px-3 py-1 rounded-lg uppercase border border-accent/10">/{cat.slug}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-3">
                       <button onClick={() => handleOpenModal(cat)} className="p-3 text-slate-400 hover:text-primary-950 transition-smooth bg-slate-50 rounded-xl hover:shadow-lg">
                          <Edit3 className="w-5 h-5" />
                       </button>
                       <button onClick={() => handleDelete(cat.id)} className="p-3 text-slate-400 hover:text-red-500 transition-smooth bg-slate-50 rounded-xl hover:shadow-lg">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CATEGORY MODAL - WordPress / Product Style */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary-950/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.3)] overflow-hidden"
            >
               <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                        <Tags className="w-5 h-5" />
                     </div>
                     <div>
                        <span className="text-[8px] font-black text-accent uppercase tracking-[0.3em]">Editor Técnico</span>
                        <h2 className="text-2xl font-black text-primary-950 uppercase tracking-tighter leading-none">{editCat ? 'Ajustar' : 'Nueva'}</h2>
                     </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-slate-400 rounded-full hover:bg-slate-100 transition-all"><X className="w-5 h-5" /></button>
               </div>

               <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                  <div className="flex flex-col gap-6">
                     <div className="flex flex-col gap-2.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Industrial (ES)</label>
                        <input 
                          type="text" 
                          required
                          value={formData.nombre}
                          onChange={e => setFormData({...formData, nombre: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-black focus:bg-white focus:ring-4 focus:ring-accent/10 outline-none transition-all uppercase"
                        />
                     </div>
                     <div className="flex flex-col gap-2.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Technical Name (EN)</label>
                        <input 
                          type="text" 
                          value={formData.nombre_en}
                          onChange={e => setFormData({...formData, nombre_en: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-black focus:bg-white focus:ring-4 focus:ring-accent/10 outline-none transition-all uppercase"
                        />
                     </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Imagen Técnica</label>
                     <div className="relative aspect-video bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center group hover:border-accent transition-all">
                        {formData.imagen_url ? (
                          <>
                            <img src={formData.imagen_url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-primary-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all bg-blur-sm">
                               <button type="button" className="relative p-5 bg-white rounded-full text-primary-950 shadow-2xl">
                                  <Upload className="w-6 h-6" />
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                               </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                             <ImageIcon className="w-12 h-12 text-slate-200 group-hover:text-accent transition-all" />
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Formato Industrial Recomendado<br/>JPG / PNG / WEBP</span>
                             <input 
                               type="file" 
                               accept="image/*"
                               onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                               className="absolute inset-0 opacity-0 cursor-pointer"
                             />
                          </div>
                        )}
                        {uploading && <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-accent" /></div>}
                     </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button 
                        type="submit"
                        disabled={processing || uploading}
                        className="flex-1 bg-primary-950 text-white p-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-accent transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                     >
                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {editCat ? 'Sincronizar Cambios' : 'Registrar Clasificación'}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
