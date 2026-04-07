import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Download, 
  Upload,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  DownloadCloud,
  Tags
} from "lucide-react";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { featuredProducts } from "@/data/mockData";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSyncProducts } from "@/hooks/useSyncProducts";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import ProductModal from "@/components/admin/ProductModal";
import CategoryManagerModal from "@/components/admin/CategoryManagerModal";

export default function AdminProductos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const { canManageProducts, loading: authLoading } = useAuth();
  const { syncFromExcel, isSyncing, progress } = useSyncProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (canManageProducts) fetchProducts();
  }, [canManageProducts]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*, categorias(nombre), marcas(nombre)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDbProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este SKU de la base de datos?")) return;
    try {
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (error) throw error;
      toast.success("SKU eliminado correctamente");
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al eliminar SKU");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await syncFromExcel(file);
    if (result) {
      fetchProducts(); // Refrescar la lista
    }
    
    // Limpiar el input para permitir subir el mismo archivo después
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        sku: "EJEMPLO-001",
        nombre: "Producto de Prueba",
        categoria: "Categoría A",
        precio: 99.99,
        stock: 10,
        descripcion: "Descripción técnica del producto...",
        fabricante: "Marca Profesional",
        imagen_url: "https://via.placeholder.com/400",
        is_new: true,
        is_offer: false
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, "plantilla_dobell_inventario.xlsx");
    toast.success("Plantilla descargada correctamente");
  };

  const handleExportProducts = () => {
    if (dbProducts.length === 0) {
      toast.error("No hay productos para exportar");
      return;
    }

    const exportData = dbProducts.map(p => ({
      sku: p.sku,
      nombre: p.nombre,
      categoria: p.categorias?.nombre || 'Sin Categoría',
      precio: p.precio,
      tipo_precio: p.tipo_precio,
      stock: p.stock,
      marca: p.marcas?.nombre || 'Sin Marca',
      estado: p.estado,
      destacado: p.destacado ? 'SÍ' : 'NO'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, `inventario_seguridad_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Catálogo exportado con éxito");
  };

  if (authLoading) return null;

  if (!canManageProducts) return (
    <div className="p-24 text-center flex flex-col items-center gap-8 animate-in fade-in duration-1000">
      <div className="w-24 h-24 bg-red-100 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-2xl">
        <Package className="w-12 h-12 text-red-600" />
      </div>
      <h2 className="text-4xl font-black text-primary-950 uppercase tracking-tighter">Acceso Restringido</h2>
      <p className="text-slate-500 font-medium max-w-md uppercase tracking-widest text-[10px]">No tiene permisos para gestionar el inventario industrial.</p>
    </div>
  );
  return (
    <div className="flex flex-col gap-10">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Inventario Técnico</h1>
          <p className="text-slate-500 font-medium tracking-wide">Gestión centralizada de 2,145 SKUs activos en el catálogo.</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <button 
            onClick={handleDownloadTemplate}
            className="bg-white border border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-2xl hover:border-accent transition-smooth active:scale-95 flex items-center gap-3"
          >
            <DownloadCloud className="w-4 h-4 text-accent" /> Descargar Plantilla
          </button>
          <button 
            onClick={handleImportClick}
            disabled={isSyncing}
            className="bg-accent text-white font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-2xl hover:bg-orange-600 transition-smooth active:scale-95 flex items-center gap-3 disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Upload className="w-4 h-4 text-white" />} 
            {isSyncing ? 'Sincronizando...' : 'Importar XLS'}
          </button>
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white border border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-2xl hover:border-accent transition-smooth active:scale-95 flex items-center gap-3"
          >
            <Tags className="w-4 h-4 text-accent" /> Categorías
          </button>
          <button 
            onClick={() => { setEditProduct(null); setIsModalOpen(true); }}
            className="bg-primary-950 text-white font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-2xl hover:bg-black transition-smooth shadow-2xl shadow-primary-950/20 active:scale-95 flex items-center gap-3"
          >
            <Plus className="w-4 h-4 text-accent" /> Nuevo SKU
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-50 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="relative w-full lg:max-w-[500px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-accent transition-smooth" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por SKU, nombre técnico o fabricante..." 
            className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 pl-16 pr-6 text-sm font-medium focus:ring-2 focus:ring-accent transition-smooth outline-none shadow-inner"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <button className="flex-1 md:flex-none bg-slate-50 border border-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest px-10 py-4 rounded-2xl hover:bg-white hover:border-accent transition-smooth flex items-center gap-3 justify-center">
              <Filter className="w-4 h-4" /> Filtros
           </button>
            <button 
              onClick={handleExportProducts}
              className="flex-1 md:flex-none bg-slate-50 border border-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest px-10 py-4 rounded-2xl hover:bg-white hover:border-accent transition-smooth flex items-center gap-3 justify-center"
            >
              <Download className="w-4 h-4" /> Exportar Inventario
            </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden mb-20 w-full">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto / Fabricante</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Localizador SKU</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Inversión</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Stock</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {loadingProducts ? (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando Inventario...</span>
                  </td>
                </tr>
              ) : dbProducts.filter(p => 
                  p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  p.sku.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No se encontraron productos</span>
                  </td>
                </tr>
              ) : dbProducts
                .filter(p => 
                  p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  p.sku.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((prod, i) => (
                <tr key={`${prod.id}-${i}`} className="hover:bg-slate-50/80 transition-smooth group active:bg-slate-100">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2 group-hover:rotate-3 group-hover:scale-110 transition-smooth shadow-inner shrink-0">
                          <img src={(prod.imagenes_urls && prod.imagenes_urls[0]) || '/placeholder-product.png'} alt={prod.nombre} className="w-full h-full object-contain" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-primary-950 group-hover:text-accent transition-smooth line-clamp-1 uppercase tracking-tight">{prod.nombre}</span>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{prod.marcas?.nombre || 'Fabricante No Definido'}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-xs font-black font-outfit text-primary-950 tracking-tighter bg-slate-100 px-3 py-1 rounded-lg uppercase">{prod.sku}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border border-slate-200/50">
                      {prod.categorias?.nombre || 'Sin Categoría'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="text-lg font-black text-primary-950 font-outfit tracking-tighter">
                      {prod.tipo_precio === 'cotizacion' ? "A Cotizar" : `$${prod.precio.toFixed(2)}`}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{prod.stock} Unid.</span>
                          <span className={`text-[9px] font-black uppercase ${prod.stock > 10 ? 'text-green-600' : 'text-red-600'}`}>
                            {prod.stock > 10 ? 'Saludable' : 'Stock Bajo'}
                          </span>
                       </div>
                       <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)] ${prod.stock > 10 ? 'bg-green-500 w-3/4' : 'bg-red-500 w-1/4'}`}
                          ></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                       <Link to={`/productos/${prod.id}`} target="_blank" className="p-3 text-slate-300 hover:text-accent transition-smooth bg-slate-50 rounded-xl active:scale-90 border border-transparent hover:border-slate-200">
                          <Eye className="w-5 h-5" />
                       </Link>
                       <button onClick={() => { setEditProduct(prod); setIsModalOpen(true); }} className="p-3 text-slate-300 hover:text-blue-600 transition-smooth bg-slate-50 rounded-xl active:scale-90 border border-transparent hover:border-slate-200">
                          <Edit3 className="w-5 h-5" />
                       </button>
                       <button onClick={() => handleDelete(prod.id)} className="p-3 text-slate-300 hover:text-red-500 transition-smooth bg-slate-50 rounded-xl active:scale-90 border border-transparent hover:border-slate-200">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Card */}
        <div className="p-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-50/20">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
             Catálogo: Mostrando {dbProducts.length} resultados activos
           </span>
           <div className="flex items-center gap-3">
              <button disabled className="w-12 h-12 rounded-2xl bg-white text-slate-200 flex items-center justify-center shadow-sm border border-slate-100 opacity-50">
                 <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                <button className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs bg-primary-950 text-white shadow-xl">1</button>
              </div>
              <button disabled className="w-12 h-12 rounded-2xl bg-white text-slate-200 flex items-center justify-center shadow-sm border border-slate-100 opacity-50">
                 <ChevronRight className="w-6 h-6" />
              </button>
           </div>
        </div>
      </div>

      {/* Modern Sync Progress Overlay */}
      {isSyncing && (
        <div className="fixed inset-0 bg-primary-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl flex flex-col items-center gap-8 text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center relative">
                 <div className="absolute inset-0 border-4 border-accent/20 rounded-full border-t-accent animate-spin"></div>
                 <FileSpreadsheet className="w-10 h-10 text-accent" />
              </div>
              <div className="flex flex-col gap-2">
                 <h3 className="text-3xl font-black text-primary-950 uppercase tracking-tighter">Sincronizando Catálogo</h3>
                 <p className="text-slate-500 font-medium tracking-wide">Procesando archivo técnico... no cierre esta ventana.</p>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50">
                 <div 
                   className="h-full bg-accent transition-all duration-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                   style={{ width: `${progress}%` }}
                 ></div>
              </div>
              <span className="text-4xl font-black text-primary-950 font-outfit">{progress}%</span>
           </div>
        </div>
      )}

      {/* Product Creation Modal */}
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditProduct(null); }} 
        onSuccess={fetchProducts} 
        editProduct={editProduct}
      />
      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
}
