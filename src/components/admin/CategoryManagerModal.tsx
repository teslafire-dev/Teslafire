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
  const [editNameEn, setEditNameEn] = useState("");
  const [newName, setNewName] = useState("");
  const [newNameEn, setNewNameEn] = useState("");

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
      const { error } = await supabase.from("categorias").update({ 
        nombre: editName, 
        nombre_en: editNameEn,
        slug 
      }).eq("id", id);
      
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setProcessing("new");
    try {
      const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const { error } = await supabase.from("categorias").insert([{
        nombre: newName,
        nombre_en: newNameEn,
        slug
      }]);
      if (error) throw error;
      toast.success("Categoría creada");
      setNewName("");
      setNewNameEn("");
      fetchCategorias();
    } catch (err: any) {
      toast.error(err.message || "Error al crear");
    } finally {
      setProcessing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-primary-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 max-h-[85vh]">
        
        {/* Header */}
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
              <Tags className="w-6 h-6 text-accent" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter text-primary-950">Categorías</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bilingüe / familias</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-smooth">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-10 flex-1 overflow-y-auto">
          {/* Create New Section */}
          <form onSubmit={handleCreate} className="mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Añadir Nueva Categoría</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                placeholder="Nombre (Español)"
                className="bg-white border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
              />
              <input 
                type="text" 
                value={newNameEn} 
                onChange={e => setNewNameEn(e.target.value)}
                placeholder="Name (English)"
                className="bg-white border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
            <button 
              disabled={processing === "new"}
              className="bg-primary-950 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-accent transition-smooth flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Registrar Categoría
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm font-bold uppercase tracking-widest">No hay categorías</div>
          ) : (
            <div className="flex flex-col gap-4">
              {categorias.map(cat => (
                <div key={cat.id} className="bg-white p-6 rounded-3xl flex flex-col border border-slate-100 hover:border-slate-200 transition-smooth group gap-4">
                  {editingId === cat.id ? (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                          autoFocus
                          placeholder="Español"
                        />
                        <input 
                          type="text" 
                          value={editNameEn} 
                          onChange={(e) => setEditNameEn(e.target.value)}
                          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                          placeholder="English"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleUpdate(cat.id)}
                          disabled={processing === cat.id}
                          className="px-6 py-2 bg-primary-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent transition-smooth disabled:opacity-50 flex items-center gap-2"
                        >
                          {processing === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3 h-3" />} Guardar
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-6 py-2 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-smooth">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-primary-950 tracking-tight uppercase">{cat.nombre}</span>
                          {cat.nombre_en && (
                            <span className="text-[10px] font-bold text-accent px-2 py-0.5 bg-accent/5 rounded-md self-center">{cat.nombre_en}</span>
                          )}
                        </div>
                        <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase mt-1">/{cat.slug}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setEditingId(cat.id); setEditName(cat.nombre); setEditNameEn(cat.nombre_en || ""); }}
                          className="p-2.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 bg-slate-50 rounded-xl transition-smooth"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          disabled={processing === cat.id}
                          className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 bg-slate-50 rounded-xl transition-smooth disabled:opacity-50"
                          title="Eliminar"
                        >
                          {processing === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
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
