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
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Forms
  const [newCat, setNewCat] = useState({ nombre: "", nombre_en: "", imagen_url: "" });
  const [editForm, setEditForm] = useState({ nombre: "", nombre_en: "", imagen_url: "" });
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

  const handleFileUpload = async (file: File, context: 'new' | 'edit') => {
    if (!file) return;
    
    // Validar tipo
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error("Solo se permiten imágenes JPG o PNG");
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
      toast.success("Imagen cargada correctamente");
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
      fetchCategorias();
    } catch (err: any) {
      toast.error("Error al crear");
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
      toast.success("Actualizado");
      setEditingId(null);
      fetchCategorias();
    } catch (err: any) {
      toast.error("Error al actualizar");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar categoría? Los productos asociados podrían quedar huérfanos.")) return;
    setProcessing(id);
    try {
      const { error } = await supabase.from("categorias").delete().eq("id", id);
      if (error) throw error;
      toast.success("Eliminada");
      fetchCategorias();
    } catch (err: any) {
      toast.error("Error al eliminar");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-20">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-primary-950 uppercase tracking-tighter leading-none">Gestión de Categorías</h1>
          <p className="text-slate-500 font-medium tracking-wide">Clasificación técnica para la navegación inteligente del catálogo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Panel Izquierdo: Creación */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreate} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm sticky top-32 flex flex-col gap-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-accent text-white rounded-xl shadow-xl shadow-accent/20">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-primary-950 uppercase tracking-tighter">Nueva Categoría</h2>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre (Español)</label>
                <input 
                  type="text" 
                  value={newCat.nombre} 
                  onChange={e => setNewCat({...newCat, nombre: e.target.value})}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none transition-smooth"
                  placeholder="Ej: Calzado de Seguridad"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Name (English)</label>
                <input 
                  type="text" 
                  value={newCat.nombre_en} 
                  onChange={e => setNewCat({...newCat, nombre_en: e.target.value})}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none transition-smooth"
                  placeholder="Ej: Safety Footwear"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Icono / Imagen (600x400px)</label>
                <div className="relative group">
                  <div className="w-full aspect-video bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center gap-3 group-hover:border-accent transition-smooth relative">
                    {newCat.imagen_url ? (
                      <>
                        <img src={newCat.imagen_url} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setNewCat({...newCat, imagen_url: ""})}
                          className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl shadow-xl hover:scale-110 transition-smooth"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-accent transition-smooth" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Click para subir JPG/PNG</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'new')}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-accent animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button 
              disabled={processing === "new" || uploading}
              className="w-full bg-primary-950 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-accent transition-smooth shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
            >
              {processing === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Categoría
            </button>
          </form>
        </div>

        {/* Panel Derecho: Lista */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categorias.map(cat => (
                <motion.div 
                  key={cat.id} 
                  layout
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-smooth"
                >
                  {editingId === cat.id ? (
                    <div className="p-8 flex flex-col gap-6">
                      <div className="flex flex-col gap-4">
                        <input 
                          type="text" 
                          value={editForm.nombre} 
                          onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                          placeholder="Nombre"
                        />
                        <input 
                          type="text" 
                          value={editForm.nombre_en} 
                          onChange={e => setEditForm({...editForm, nombre_en: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                          placeholder="Name (En)"
                        />
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-2">
                          {editForm.imagen_url ? (
                            <img src={editForm.imagen_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                               <ImageIcon className="w-6 h-6 text-slate-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-primary-950/40 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                             <Upload className="w-6 h-6 text-white" />
                             <input 
                                type="file" 
                                accept="image/*"
                                onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'edit')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                             />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(cat.id)} className="flex-1 bg-primary-950 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-accent transition-smooth">Guardar</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-smooth">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="aspect-video bg-slate-200 relative overflow-hidden">
                        {cat.imagen_url ? (
                          <img src={cat.imagen_url} alt={cat.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100">
                            <ImageIcon className="w-10 h-10 text-slate-300" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditForm({ nombre: cat.nombre, nombre_en: cat.nombre_en || "", imagen_url: cat.imagen_url || "" });
                            }}
                            className="p-3 bg-white/90 backdrop-blur-sm text-primary-950 rounded-xl shadow-xl hover:bg-accent hover:text-white transition-smooth active:scale-90"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id)}
                            className="p-3 bg-white/90 backdrop-blur-sm text-red-500 rounded-xl shadow-xl hover:bg-red-500 hover:text-white transition-smooth active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-accent uppercase tracking-widest leading-none mb-1">/{cat.slug}</span>
                          <h3 className="text-xl font-black text-primary-950 uppercase tracking-tighter">{cat.nombre}</h3>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-tight italic">{cat.nombre_en || "No Translation"}</p>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
