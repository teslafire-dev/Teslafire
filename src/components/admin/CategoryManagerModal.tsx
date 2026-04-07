import { useState, useEffect } from "react";
import { X, Save, Trash2, Loader2, Tags, Plus, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryManagerModal({ isOpen, onClose }: CategoryManagerModalProps) {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (isOpen) fetchCategorias();
  }, [isOpen]);

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

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Está seguro de eliminar esta categoría? Si tiene productos asociados, no se podrá eliminar.")) return;
    
    setProcessing(id);
    try {
      const { error } = await supabase.from("categorias").delete().eq("id", id);
      if (error) {
        if (error.code === '23503') throw new Error("No puede eliminar esta categoría porque hay productos enlazados a ella.");
        throw error;
      }
      toast.success("Categoría eliminada");
      fetchCategorias();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar");
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setProcessing(id);
    try {
      const slug = editName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const { error } = await supabase.from("categorias").update({ nombre: editName, slug }).eq("id", id);
      if (error) throw error;
      
      toast.success("Categoría actualizada");
      setEditingId(null);
      fetchCategorias();
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar");
    } finally {
      setProcessing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-primary-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 max-h-[85vh]">
        
        {/* Header */}
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
              <Tags className="w-6 h-6 text-accent" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter text-primary-950">Categorías</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestión de familias</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-smooth">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-10 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm font-bold uppercase tracking-widest">No hay categorías</div>
          ) : (
            <div className="flex flex-col gap-4">
              {categorias.map(cat => (
                <div key={cat.id} className="bg-slate-50 p-4 rounded-3xl flex items-center justify-between border border-slate-100 hover:border-slate-200 transition-smooth group">
                  {editingId === cat.id ? (
                    <div className="flex-1 flex items-center gap-3 mr-4">
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleUpdate(cat.id)}
                        disabled={processing === cat.id}
                        className="p-2 bg-primary-950 text-white rounded-xl hover:bg-accent transition-smooth disabled:opacity-50"
                      >
                        {processing === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        disabled={processing === cat.id}
                        className="p-2 bg-white text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl transition-smooth"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col px-2">
                        <span className="text-sm font-black text-primary-950 tracking-tight uppercase">{cat.nombre}</span>
                        <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{cat.slug}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
                        <button 
                          onClick={() => { setEditingId(cat.id); setEditName(cat.nombre); }}
                          className="p-2.5 text-blue-500 hover:bg-blue-50 bg-white border border-transparent hover:border-blue-100 rounded-xl transition-smooth"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          disabled={processing === cat.id}
                          className="p-2.5 text-red-500 hover:bg-red-50 bg-white border border-transparent hover:border-red-100 rounded-xl transition-smooth disabled:opacity-50"
                          title="Eliminar"
                        >
                          {processing === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
