import { useState, useEffect } from "react";
import { 
  Tags, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Save, 
  X, 
  Image as ImageIcon,
  Upload,
  AlertCircle,
  Search,
  Filter,
  PlusCircle,
  Eye,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Forms
  const [newCat, setNewCat] = useState({ nombre: "", nombre_en: "", imagen_url: "" });
  const [editForm, setEditForm] = useState({ nombre: "", nombre_en: "", imagen_url: "" });
  const [uploading, setUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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

  const handleFileUpload = async (file: File, context: 'new' | 'edit') => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.error("Solo se permiten imágenes JPG, PNG o WEBP");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `cat_${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('categories')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('categories')
        .getPublicUrl(filePath);

      if (context === 'new') {
        setNewCat(prev => ({ ...prev, imagen_url: publicUrl }));
      } else {
        setEditForm(prev => ({ ...prev, imagen_url: publicUrl }));
      }
      toast.success("Imagen cargada con éxito");
    } catch (err: any) {
      toast.error("Error al subir imagen");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.nombre.trim()) return;
    
    setProcessing("new");
    try {
      const slug = newCat.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const { error } = await supabase.from("categorias").insert([{
        nombre: newCat.nombre,
        nombre_en: newCat.nombre_en,
        imagen_url: newCat.imagen_url,
        slug
      }]);

      if (error) throw error;
      toast.success("Categoría creada");
      setNewCat({ nombre: "", nombre_en: "", imagen_url: "" });
      setIsAdding(false);
      fetchCategorias();
    } catch (err: any) {
      toast.error("Error al crear la categoría");
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.nombre.trim()) return;
    setProcessing(id);
    try {
      const slug = editForm.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const { error } = await supabase.from("categorias").update({ 
        nombre: editForm.nombre, 
        nombre_en: editForm.nombre_en,
        imagen_url: editForm.imagen_url,
        slug 
      }).eq("id", id);
      
      if (error) throw error;
      toast.success("Configuración de categoría actualizada");
      setEditingId(null);
      fetchCategorias();
    } catch (err: any) {
      toast.error("Error al actualizar");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar categoría? Los productos asociados podrían quedar sin categoría vinculada.")) return;
    setProcessing(id);
    try {
      const { error } = await supabase.from("categorias").delete().eq("id", id);
      if (error) throw error;
      toast.success("Categoría eliminada del sistema");
      fetchCategorias();
    } catch (err: any) {
      toast.error("Error al eliminar");
    } finally {
      setProcessing(null);
    }
  };

  const filteredCategorias = categorias.filter(cat => 
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (cat.nombre_en && cat.nombre_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
    cat.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      {/* Search & Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-5xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Categorías Técnicas</h1>
          <p className="text-lg font-bold text-slate-400 tracking-tight">Clasificación inteligente para la navegación del catálogo industrial.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary-950 text-white font-extrabold uppercase text-[12px] tracking-wider px-8 py-4 rounded-2xl hover:bg-black transition-smooth shadow-2xl shadow-primary-950/20 active:scale-95 flex items-center gap-2 whitespace-nowrap"
        >
          {isAdding ? <X className="w-5 h-5 text-accent" /> : <PlusCircle className="w-5 h-5 text-accent" />} 
          {isAdding ? "Cancelar Registro" : "Registrar Categoría"}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-2xl"
          >
            <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Nombre Industrial (ES)</label>
                  <input 
                    type="text" 
                    value={newCat.nombre} 
                    onChange={e => setNewCat({...newCat, nombre: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-8 py-5 text-lg font-black placeholder:text-slate-300 focus:ring-4 focus:ring-accent/10 focus:bg-white transition-all outline-none"
                    placeholder="Ej: CALZADO DE SEGURIDAD"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Technical Name (EN)</label>
                  <input 
                    type="text" 
                    value={newCat.nombre_en} 
                    onChange={e => setNewCat({...newCat, nombre_en: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-8 py-5 text-lg font-black placeholder:text-slate-300 focus:ring-4 focus:ring-accent/10 focus:bg-white transition-all outline-none"
                    placeholder="Ej: SAFETY FOOTWEAR"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={processing === "new" || uploading}
                    className="bg-primary-950 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-accent transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {processing === "new" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Confirmar Registro Técnico
                  </button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1 mb-3 block">Vista Previa / Imagen</label>
                <div className="relative aspect-[4/3] bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 overflow-hidden group hover:border-accent transition-all">
                  {newCat.imagen_url ? (
                    <img src={newCat.imagen_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                       <ImageIcon className="w-12 h-12 text-slate-200 group-hover:text-accent transition-all" />
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-10">Recomendado 800x600px<br/>Fondo industrial</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary-950/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button type="button" className="relative p-5 bg-white rounded-full text-primary-950 shadow-2xl">
                      <Upload className="w-6 h-6" />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'new')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </button>
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-accent animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Search Filters Row */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="relative w-full lg:max-w-[700px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-accent transition-all" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, slug o etiqueta técnica..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-6 pl-16 pr-6 text-xl font-black placeholder:text-slate-300 focus:ring-4 focus:ring-accent/10 focus:bg-white transition-all outline-none shadow-inner"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <button className="flex-1 md:flex-none bg-slate-50 border border-slate-100 text-slate-500 font-extrabold uppercase text-[11px] tracking-widest px-8 py-6 rounded-2xl hover:bg-white hover:border-accent transition-all flex items-center gap-3 justify-center">
              <Filter className="w-5 h-5" /> Filtrar Por Tráfico
           </button>
        </div>
      </div>

      {/* Responsive Grid Content */}
      {loading ? (
        <div className="py-40 flex flex-col items-center gap-6">
           <Loader2 className="w-16 h-16 text-accent animate-spin" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Escaneando Base de Datos</span>
        </div>
      ) : filteredCategorias.length === 0 ? (
        <div className="py-40 flex flex-col items-center gap-8 bg-white rounded-[4rem] border border-slate-50 text-center">
           <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center opacity-50">
              <X className="w-12 h-12 text-slate-400" />
           </div>
           <div className="flex flex-col gap-2">
              <h3 className="text-3xl font-black text-primary-950 uppercase tracking-tighter">No se encontraron resultados</h3>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Intenta con otra palabra clave o agrega una nueva categoría.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {filteredCategorias.map(cat => (
             <motion.div 
               key={cat.id} 
               layout
               className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:border-accent/20 transition-all duration-500"
             >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                   {cat.imagen_url ? (
                     <img src={cat.imagen_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center opacity-20">
                        <ImageIcon className="w-16 h-16 text-primary-950" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                      <span className="text-accent font-black text-[9px] uppercase tracking-[0.3em] mb-1">/{cat.slug}</span>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none">{cat.nombre}</h3>
                   </div>
                   
                   <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button 
                         onClick={() => {
                           setEditingId(cat.id);
                           setEditForm({ nombre: cat.nombre, nombre_en: cat.nombre_en || "", imagen_url: cat.imagen_url || "" });
                         }}
                         className="p-4 bg-white/95 backdrop-blur-md text-primary-950 rounded-2xl shadow-xl hover:bg-accent hover:text-white transition-all active:scale-95"
                      >
                         <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                         onClick={() => handleDelete(cat.id)}
                         className="p-4 bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all active:scale-95"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>
                
                <div className="p-8 pt-4">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cat.nombre_en || "TECHNICAL VERSION PENDING"}</p>
                </div>

                {/* Inline Editing Overlay */}
                <AnimatePresence>
                  {editingId === cat.id && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }} 
                      className="absolute inset-0 z-10 bg-white p-8 flex flex-col gap-6"
                    >
                       <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                             <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nombre Actualizado</label>
                             <input 
                               type="text" 
                               value={editForm.nombre} 
                               onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                               className="bg-slate-50 p-4 rounded-xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-accent"
                             />
                          </div>
                          <div className="relative aspect-video rounded-2xl bg-slate-100 overflow-hidden group/edit">
                             <img src={editForm.imagen_url} className="w-full h-full object-cover" />
                             <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/edit:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                                <Upload className="w-6 h-6 text-white" />
                                <input 
                                   type="file" 
                                   accept="image/*"
                                   onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'edit')}
                                   className="hidden"
                                />
                             </label>
                             {uploading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>}
                          </div>
                       </div>
                       <div className="flex gap-2 mt-auto">
                          <button onClick={() => handleUpdate(cat.id)} className="flex-1 bg-primary-950 text-white py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-950/20">Aplicar</button>
                          <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em]">Cerrar</button>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </motion.div>
           ))}
        </div>
      )}
    </div>
  );
}
