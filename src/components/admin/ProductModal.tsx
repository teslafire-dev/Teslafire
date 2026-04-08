import { useState, useEffect } from "react";
import { X, Package, Loader2, PlusCircle, Star } from "lucide-react";
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
    slug: "",
    categoria_id: "",
    categorias_ids: [] as string[],
    nueva_categoria: "",
    marca_id: "",
    nueva_marca: "",
    precio: "",
    moneda: "USD",
    stock: "",
    descripcion: "",
    descripcion_en: "",
    imagen_url: "",
    imagenes_urls: [] as string[]
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editProduct) {
        setFormData({
          sku: editProduct.sku || "",
          nombre: editProduct.nombre || "",
          nombre_en: editProduct.nombre_en || "",
          slug: editProduct.slug || "",
          categoria_id: editProduct.categoria_id || "",
          categorias_ids: editProduct.producto_categorias?.map((pc: any) => pc.categoria_id) || [],
          nueva_categoria: "",
          marca_id: editProduct.marca_id || "",
          nueva_marca: "",
          precio: editProduct.precio || "",
          moneda: editProduct.moneda || "USD",
          stock: editProduct.stock || "",
          descripcion: editProduct.descripcion || "",
          descripcion_en: editProduct.descripcion_en || "",
          imagen_url: editProduct.imagen_url || "",
          imagenes_urls: editProduct.imagenes_urls || (editProduct.imagen_url ? [editProduct.imagen_url] : [])
        });
      } else {
        setFormData({ 
          sku: "", 
          nombre: "", 
          nombre_en: "", 
          slug: "",
          categoria_id: "", 
          categorias_ids: [],
          nueva_categoria: "", 
          marca_id: "", 
          nueva_marca: "", 
          precio: "", 
          moneda: "USD", 
          stock: "", 
          descripcion: "", 
          descripcion_en: "", 
          imagen_url: "",
          imagenes_urls: []
        });
      }
      fetchRelations();
    }
  }, [isOpen, editProduct]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (formData.imagenes_urls.length >= 6) {
      toast.error("Máximo 6 fotos por producto");
      return;
    }

    setUploading(true);
    try {
      // 1. Convertir a WebP para optimizar peso y tamaño
      const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Forzar cuadrado de 800x800
            const size = 800;
            canvas.width = size;
            canvas.height = size;

            if (ctx) {
              // Limpiar fondo (transparente por defecto en WebP)
              ctx.clearRect(0, 0, size, size);
              
              // Calcular proporciones para no deformar (Contain logic)
              const scale = Math.min(size / img.width, size / img.height);
              const x = (size / 2) - (img.width / 2) * scale;
              const y = (size / 2) - (img.height / 2) * scale;
              
              ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
              
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Error al convertir imagen"));
              }, 'image/webp', 0.85); // Subimos un pelín la calidad
            }
          };
        };
        reader.onerror = reject;
      });

      // 2. Subir el archivo optimizado
      const fileName = `${Math.random().toString(36).substring(2)}.webp`;
      const folder = formData.sku.trim() || 'sin-sku';
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, optimizedBlob, {
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      const newImages = [...formData.imagenes_urls, publicUrl];
      setFormData(prev => ({ 
        ...prev, 
        imagenes_urls: newImages,
        imagen_url: prev.imagen_url || publicUrl 
      }));
      toast.success("Foto optimizada y subida (WebP)");
    } catch (err: any) {
      console.error(err);
      toast.error("Error al optimizar imagen");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    if (formData.imagenes_urls.length <= 1) {
      toast.error("El producto debe tener al menos una imagen");
      return;
    }
    const newImages = formData.imagenes_urls.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      imagenes_urls: newImages,
      // Si borramos la principal, la siguiente pasa a ser principal
      imagen_url: prev.imagen_url === formData.imagenes_urls[index] ? newImages[0] : prev.imagen_url
    }));
  };

  const setAsMain = (url: string) => {
    setFormData(prev => ({ ...prev, imagen_url: url }));
    toast.success("Imagen de portada actualizada");
  };

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

  const createSlug = (text: string) => 
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalCatId = formData.categoria_id;
      let finalMarcaId = formData.marca_id;

      // New Cat
      if (formData.categoria_id === "new" && formData.nueva_categoria) {
        const { data: newCat, error: errCat } = await supabase.from('categorias').insert([{
          nombre: formData.nueva_categoria,
          slug: createSlug(formData.nueva_categoria)
        }]).select('id').single();
        if (errCat) throw new Error(`Error al crear categoría: ${errCat.message}`);
        finalCatId = newCat.id;
      }

      // New Brand
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
        slug: formData.slug || createSlug(formData.nombre),
        categoria_id: finalCatId || null,
        marca_id: finalMarcaId || null,
        precio: parseFloat(formData.precio) || 0,
        moneda: formData.moneda,
        stock: parseInt(formData.stock) || 0,
        descripcion: formData.descripcion,
        descripcion_en: formData.descripcion_en,
        imagen_url: formData.imagen_url || formData.imagenes_urls[0] || "",
        imagenes_urls: formData.imagenes_urls,
        updated_at: new Date().toISOString()
      };

      let finalProductId = editProduct?.id;

      if (editProduct) {
        const { error } = await supabase.from("productos").update(productPayload).eq('id', editProduct.id);
        if (error) throw error;
        toast.success("SKU actualizado correctamente");
      } else {
        const { data: newProd, error } = await supabase.from("productos").insert([{
          ...productPayload,
          tipo_precio: "fijo",
          estado: "activo",
          destacado: false
        }]).select('id').single();
        if (error) throw error;
        finalProductId = newProd.id;
        toast.success("SKU registrado correctamente");
      }

      // Sync Categories
      await supabase.from('producto_categorias').delete().eq('producto_id', finalProductId);
      
      if (formData.categorias_ids.length > 0) {
        const relations = formData.categorias_ids.map(catId => ({
          producto_id: finalProductId,
          categoria_id: catId
        }));
        await supabase.from('producto_categorias').insert(relations);
      } else if (finalCatId) {
         await supabase.from('producto_categorias').insert([{
           producto_id: finalProductId,
           categoria_id: finalCatId
         }]);
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
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; border: 2px solid #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
      
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 h-[92vh]">
        {/* Header */}
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white shrink-0 z-20 w-full">
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

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 flex flex-col gap-8 bg-white">
          <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nombre (Español)</label>
                <input required type="text" value={formData.nombre} onChange={e => {
                  const newName = e.target.value;
                  setFormData({
                    ...formData, 
                    nombre: newName,
                    slug: createSlug(newName) // Auto-sync
                  });
                }} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none" placeholder="Descripción en español" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">URL Amigable (Slug - SEO)</label>
                <div className="relative">
                  <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: createSlug(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-12 text-sm font-bold text-accent focus:ring-2 focus:ring-accent outline-none" placeholder="ej: botas-seguridad-cuero" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 pointer-events-none">/slug</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-accent uppercase tracking-widest pl-2">Nombre (Inglés)</label>
                <input type="text" value={formData.nombre_en} onChange={e => setFormData({...formData, nombre_en: e.target.value})} className="bg-accent/5 border border-accent/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none" placeholder="Product name in English" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">SKU Localizador</label>
                <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none uppercase w-full" placeholder="Ej. CAS-005" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Categorías del Producto (Múltiple)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {categorias.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.categorias_ids.includes(cat.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked 
                            ? [...formData.categorias_ids, cat.id]
                            : formData.categorias_ids.filter(id => id !== cat.id);
                          setFormData({...formData, categorias_ids: newIds});
                        }}
                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-accent focus:ring-accent transition-smooth" 
                      />
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-primary-950 transition-colors uppercase">{cat.nombre}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2 pl-2">
                   <PlusCircle className="w-4 h-4 text-accent" />
                   <span className="text-[9px] font-bold text-slate-400 uppercase">Gestiona categorías desde el menú lateral</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Galería de Imágenes (Máx. 6 - La primera es la portada)</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {formData.imagenes_urls.map((url, index) => (
                  <div key={index} className={`relative group aspect-square rounded-[2rem] overflow-hidden border-2 transition-smooth shadow-sm ${formData.imagen_url === url ? 'border-accent ring-4 ring-accent/10' : 'border-slate-100 hover:border-slate-300'}`}>
                    <img src={url} className="w-full h-full object-contain p-2" />
                    
                    <div className="absolute inset-0 bg-primary-950/40 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center gap-2">
                       {formData.imagen_url !== url && (
                         <button 
                            type="button" 
                            onClick={() => setAsMain(url)}
                            className="p-2 bg-white text-primary-950 rounded-xl hover:bg-accent hover:text-white transition-smooth shadow-lg"
                            title="Poner como principal"
                         >
                            <Star className="w-4 h-4" />
                         </button>
                       )}
                       <button 
                          type="button" 
                          onClick={() => removeImage(index)}
                          className={`p-2 bg-white text-destructive rounded-xl hover:bg-destructive hover:text-white transition-smooth shadow-lg ${formData.imagenes_urls.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Eliminar foto"
                       >
                          <X className="w-4 h-4" />
                       </button>
                    </div>
                    {formData.imagen_url === url && (
                      <div className="absolute top-2 left-2 bg-accent text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">Portada</div>
                    )}
                  </div>
                ))}

                {formData.imagenes_urls.length < 6 && (
                  <div className="relative group aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-smooth cursor-pointer overflow-hidden">
                    <PlusCircle className="w-8 h-8 text-slate-300 group-hover:text-accent transition-smooth" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-accent">Añadir</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                        <Loader2 className="w-6 h-6 text-accent animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Información Técnica (Español)</label>
              <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none min-h-[120px] resize-none" placeholder="Características detalladas..." />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-accent uppercase tracking-widest pl-2">Technical Info (English)</label>
              <textarea value={formData.descripcion_en} onChange={e => setFormData({...formData, descripcion_en: e.target.value})} className="bg-accent/5 border border-accent/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none min-h-[120px] resize-none" placeholder="Detailed features in English..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Fabricante</label>
                <select value={formData.marca_id} onChange={e => setFormData({...formData, marca_id: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none">
                  <option value="">(Sin Marca)</option>
                  {marcas.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Moneda</label>
                <select value={formData.moneda} onChange={e => setFormData({...formData, moneda: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none">
                  <option value="USD">Dólares (US$)</option>
                  <option value="EUR">Euros (€)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Precio Base</label>
                <input required type="number" step="0.01" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none" placeholder="0.00" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Stock Disponible</label>
                <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none" placeholder="0" />
              </div>
            </div>
          </form>
        </div>

        {/* Footer (Fixed) */}
        <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-smooth active:scale-95"
          >
            Cancelar
          </button>
          <button 
            disabled={loading || uploading} 
            onClick={() => {
              const form = document.getElementById('product-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
            type="button" 
            className="bg-primary-950 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-accent transition-smooth shadow-xl flex items-center gap-3 disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Package className="w-4 h-4 text-accent" />}
            {loading ? "Procesando..." : (editProduct ? "Guardar Cambios" : "Registrar SKU")}
          </button>
        </div>
      </div>
    </div>
  );
}
