import { useState, useEffect } from "react";
import { X, Package, Loader2, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProduct?: any | null;
}

export default function ProductModal({ isOpen, onClose, onSuccess, editProduct }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    sku: "",
    nombre: "",
    nombre_en: "",
    categoria_id: "",
    nueva_categoria: "",
    marca_id: "",
    nueva_marca: "",
    precio: "",
    stock: "",
    descripcion: "",
    descripcion_en: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (editProduct) {
        setFormData({
          sku: editProduct.sku || "",
          nombre: editProduct.nombre || "",
          nombre_en: editProduct.nombre_en || "",
          categoria_id: editProduct.categoria_id || "",
          nueva_categoria: "",
          marca_id: editProduct.marca_id || "",
          nueva_marca: "",
          precio: editProduct.precio || "",
          stock: editProduct.stock || "",
          descripcion: editProduct.descripcion || "",
          descripcion_en: editProduct.descripcion_en || ""
        });
      } else {
        setFormData({ sku: "", nombre: "", nombre_en: "", categoria_id: "", nueva_categoria: "", marca_id: "", nueva_marca: "", precio: "", stock: "", descripcion: "", descripcion_en: "" });
      }
      fetchRelations();
    }
  }, [isOpen, editProduct]);

  const fetchRelations = async () => {
    try {
      const [cats, brnds] = await Promise.all([
        supabase.from('categorias').select('id, nombre').order('nombre'),
        supabase.from('marcas').select('id, nombre').order('nombre')
      ]);
      if (cats.data) setCategorias(cats.data);
      if (brnds.data) setMarcas(brnds.data);
    } catch (err) {
      console.error("Error fetching relations", err);
    }
  };

  if (!isOpen) return null;

  const createSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalCatId = formData.categoria_id;
      let finalMarcaId = formData.marca_id;

      // Handle New Category creation
      if (formData.categoria_id === "new" && formData.nueva_categoria) {
        const { data: newCat, error: errCat } = await supabase.from('categorias').insert([{
          nombre: formData.nueva_categoria,
          slug: createSlug(formData.nueva_categoria)
        }]).select('id').single();
        if (errCat) throw new Error(`Error al crear categoría: ${errCat.message}`);
        finalCatId = newCat.id;
      }

      // Handle New Brand creation
      if (formData.marca_id === "new" && formData.nueva_marca) {
        const { data: newMarca, error: errMarca } = await supabase.from('marcas').insert([{
          nombre: formData.nueva_marca
        }]).select('id').single();
        if (errMarca) throw new Error(`Error al crear marca: ${errMarca.message}`);
        finalMarcaId = newMarca.id;
      }

      const productPayload = {
        sku: formData.sku,
        nombre: formData.nombre,
        nombre_en: formData.nombre_en,
        categoria_id: finalCatId || null,
        marca_id: finalMarcaId || null,
        precio: parseFloat(formData.precio) || 0,
        stock: parseInt(formData.stock) || 0,
        descripcion: formData.descripcion,
        descripcion_en: formData.descripcion_en,
        updated_at: new Date().toISOString()
      };

      if (editProduct) {
        const { error } = await supabase.from("productos").update(productPayload).eq('id', editProduct.id);
        if (error) throw error;
        toast.success("SKU actualizado correctamente");
      } else {
        const { error } = await supabase.from("productos").insert([{
          ...productPayload,
          tipo_precio: "fijo",
          estado: "activo",
          destacado: false
        }]);
        if (error) throw error;
        toast.success("SKU registrado correctamente");
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al procesar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary-950/80 backdrop-blur-sm z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0 sticky top-0 z-10 w-full">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-accent" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter text-primary-950">{editProduct ? 'Editar SKU' : 'Nuevo SKU'}</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{editProduct ? 'Modificar Catálogo' : 'Añadir al Catálogo'}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-smooth">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nombre (Español)</label>
              <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none" placeholder="Descripción en español" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-accent uppercase tracking-widest pl-2">Nombre (Inglés)</label>
              <input type="text" value={formData.nombre_en} onChange={e => setFormData({...formData, nombre_en: e.target.value})} className="bg-accent/5 border border-accent/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none" placeholder="Product name in English" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">SKU Localizador</label>
              <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none uppercase" placeholder="Ej. CAS-005" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Categoría</label>
              <select required value={formData.categoria_id} onChange={e => setFormData({...formData, categoria_id: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none">
                <option value="" disabled>Seleccione una...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
                <option value="new" className="font-black text-accent">+ Crear Nueva Categoría</option>
              </select>
              {formData.categoria_id === "new" && (
                <input required type="text" value={formData.nueva_categoria} onChange={e => setFormData({...formData, nueva_categoria: e.target.value})} placeholder="Nombre de la categoría..." className="mt-2 bg-accent/5 border border-accent/20 text-accent rounded-2xl p-4 text-sm font-bold placeholder:text-accent/50 focus:ring-2 focus:ring-accent outline-none w-full" />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Información Técnica (Español)</label>
            <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none min-h-[100px] resize-none" placeholder="Características detalladas, certificaciones..." />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-accent uppercase tracking-widest pl-2">Technical Info (English)</label>
            <textarea value={formData.descripcion_en} onChange={e => setFormData({...formData, descripcion_en: e.target.value})} className="bg-accent/5 border border-accent/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none min-h-[100px] resize-none" placeholder="Detailed features, certifications in English..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Fabricante</label>
              <select value={formData.marca_id} onChange={e => setFormData({...formData, marca_id: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none">
                <option value="">(Sin Marca)</option>
                {marcas.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
                <option value="new" className="font-black text-accent">+ Nueva Marca</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Inversión (USD)</label>
              <input required type="number" step="0.01" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none" placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Stock</label>
              <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none" placeholder="0" />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-4 shrink-0">
            <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-smooth">
              Cancelar
            </button>
            <button disabled={loading} type="submit" className="bg-primary-950 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-accent transition-smooth shadow-xl flex items-center gap-3 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Package className="w-4 h-4 text-accent" />}
              {loading ? "Procesando..." : (editProduct ? "Actualizar" : "Registrar")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
