import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Download, 
  Upload,
  Loader2,
  Package,
  Box,
  Pencil,
  X,
  Check,
  Building2,
  DownloadCloud
} from "lucide-react";
import * as XLSX from "xlsx";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSyncProducts } from "@/hooks/useSyncProducts";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import ProductEditor from "@/components/admin/ProductEditor";

export default function AdminProductos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("todos");
  const [selectedCategoria, setSelectedCategoria] = useState("todas");
  const [selectedTiendaId, setSelectedTiendaId] = useState("all");
  const [photoFilter, setPhotoFilter] = useState<'todos' | 'con' | 'sin'>('todos');

  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [categoriasList, setCategoriasList] = useState<any[]>([]);
  const [tiendasList, setTiendasList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [stockModalProduct, setStockModalProduct] = useState<any | null>(null);
  const [adjustingStock, setAdjustingStock] = useState<number>(0);
  const [savingStock, setSavingStock] = useState(false);

  const { canManageProducts, loading: authLoading } = useAuth();
  const { syncFromExcel, isSyncing, progress } = useSyncProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (canManageProducts) {
      fetchProducts();
      fetchAuxData();
    }
  }, [canManageProducts]);

  const fetchAuxData = async () => {
    try {
      const [{ data: cats }, { data: tiendas }] = await Promise.all([
        supabase.from('categorias').select('id, nombre').order('nombre'),
        supabase.from('tiendas').select('id, nombre, es_principal').order('nombre')
      ]);
      if (cats) setCategoriasList(cats);
      if (tiendas) setTiendasList(tiendas);
    } catch (err) {
      console.error("Error fetching aux data:", err);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          marcas(nombre),
          producto_categorias(
            categoria_id,
            categorias(nombre)
          ),
          producto_stock(
            stock_actual,
            tienda_id,
            ubicacion
          )
        `)
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

  const handleUpdateStock = async () => {
    if (!stockModalProduct) return;
    setSavingStock(true);
    try {
      const storeId = tiendasList[0]?.id;
      if (!storeId) throw new Error("No hay tiendas registradas");

      const { error } = await supabase
        .from('producto_stock')
        .upsert({
          producto_id: stockModalProduct.id,
          tienda_id: storeId,
          stock_actual: Number(adjustingStock),
          stock_comprometido: 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'producto_id,tienda_id' });

      if (error) throw error;
      toast.success("Stock actualizado exitosamente");
      setStockModalProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al actualizar stock");
    } finally {
      setSavingStock(false);
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
      fetchProducts();
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportProducts = () => {
    if (dbProducts.length === 0) {
      toast.error("No hay productos para exportar");
      return;
    }

    const exportData = dbProducts.map(p => ({
      sku: p.sku,
      nombre: p.nombre,
      categoria: p.producto_categorias?.[0]?.categorias?.nombre || 'Sin Categoría',
      precio: p.precio,
      stock: p.producto_stock?.[0]?.stock_actual ?? p.stock ?? 0,
      marca: p.marcas?.nombre || 'Sin Marca',
      estado: p.activo ? 'ACTIVO' : 'INACTIVO'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, `inventario_teslafire_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Catálogo exportado con éxito");
  };

  // Filtrado reactivo de productos
  const filteredProducts = dbProducts.filter(p => {
    // 1. Buscador por texto (nombre, sku, codigo_barra)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = (p.nombre || '').toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      const matchCb = (p.codigo_barra || '').toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCb) return false;
    }

    // 2. Estado
    if (selectedEstado === 'activos' && !p.activo) return false;
    if (selectedEstado === 'inactivos' && p.activo) return false;

    // 3. Categoría
    if (selectedCategoria !== 'todas') {
      const hasCat = p.producto_categorias?.some((pc: any) => pc.categoria_id === selectedCategoria);
      const directCat = p.categoria_id === selectedCategoria;
      if (!hasCat && !directCat) return false;
    }

    // 4. Filtro con/sin foto
    const hasPhoto = Boolean((p.imagenes_urls && p.imagenes_urls.length > 0 && p.imagenes_urls[0]) || p.imagen_url);
    if (photoFilter === 'con' && !hasPhoto) return false;
    if (photoFilter === 'sin' && hasPhoto) return false;

    return true;
  });

  // Contadores con foto / sin foto
  const conFotoCount = dbProducts.filter(p => Boolean((p.imagenes_urls && p.imagenes_urls.length > 0 && p.imagenes_urls[0]) || p.imagen_url)).length;
  const sinFotoCount = dbProducts.length - conFotoCount;

  if (authLoading) return null;

  if (!canManageProducts) return (
    <div className="p-24 text-center flex flex-col items-center gap-8 animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center border border-red-200">
        <Package className="w-10 h-10 text-red-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Acceso Restringido</h2>
      <p className="text-gray-500 text-xs font-semibold">No tiene permisos para gestionar el inventario.</p>
    </div>
  );

  // VISTA 1: Editor Completo (Tanto para Nuevo Registro como para Editar)
  if (viewMode === 'editor') {
    return (
      <ProductEditor 
        product={editProduct} 
        onBack={() => {
          setViewMode('list');
          setEditProduct(null);
        }}
        onSaved={() => {
          setViewMode('list');
          setEditProduct(null);
          fetchProducts();
        }}
      />
    );
  }

  const selectedTiendaNombre = tiendasList.find(t => t.id === selectedTiendaId)?.nombre || 'Almacén Tesla Fire';

  // VISTA 2: Listado Oficial de Productos Tesla Fire
  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* Barra de Título Superior */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Productos
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Mostrando stock de: <span className="font-semibold text-gray-800">{selectedTiendaNombre}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <button 
            type="button"
            onClick={handleExportProducts}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold shadow-2xs transition-all"
            title="Exportar Catálogo"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            Exportar
          </button>
          
          {/* Botón + Nuevo Registro que reutiliza el menú de Editar Producto */}
          <button 
            type="button"
            onClick={() => { setEditProduct(null); setViewMode('editor'); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#343a40] hover:bg-[#23272b] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-white" />
            + Nuevo Registro
          </button>
        </div>
      </div>

      {/* Tarjeta de Filtros */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
          
          {/* Buscar */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ej: disco 500 (trae todo lo que ter"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Tienda */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Tienda
            </label>
            <select
              value={selectedTiendaId}
              onChange={(e) => setSelectedTiendaId(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white cursor-pointer"
            >
              <option value="all">★ Almacén Tesla Fire (actual)</option>
              {tiendasList.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Estado
            </label>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>

          {/* Categoría */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Categoría
            </label>
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white cursor-pointer"
            >
              <option value="todas">Todas</option>
              {categoriasList.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Botón Filtrar */}
          <div className="lg:col-span-1">
            <button
              type="button"
              className="w-full py-2.5 px-4 bg-[#495057] hover:bg-[#343a40] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center"
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Badges de Contadores (con foto / sin foto) */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setPhotoFilter(prev => prev === 'con' ? 'todos' : 'con')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            photoFilter === 'con' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>{conFotoCount} con foto</span>
        </button>

        <button
          type="button"
          onClick={() => setPhotoFilter(prev => prev === 'sin' ? 'todos' : 'sin')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            photoFilter === 'sin' 
              ? 'bg-gray-100 text-gray-800 border-gray-300 shadow-2xs' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>
          <span>{sinFotoCount} sin foto</span>
        </button>
      </div>

      {/* Tabla Oficial de Productos */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-4 px-6 text-xs font-bold text-gray-600 tracking-wider">
                  Producto / Código
                </th>
                <th className="py-4 px-6 text-xs font-bold text-emerald-600 tracking-wider text-center w-36">
                  Stock
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-600 tracking-wider text-right w-56">
                  Detal
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 text-right w-24">
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingProducts ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
                    <span className="text-xs font-bold text-gray-400">Cargando catálogo...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <span className="text-xs font-bold text-gray-400">No se encontraron artículos con los filtros aplicados.</span>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const stock = prod.producto_stock?.[0]?.stock_actual ?? prod.stock ?? 0;
                  const precioDivisas = Number(prod.precio || 0);
                  const precioDetalBcv = Number(prod.precio_detal_bcv || (precioDivisas * 1.2301));
                  const imgUrl = (prod.imagenes_urls && prod.imagenes_urls[0]) || prod.imagen_url || '';

                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/70 transition-colors group">
                      
                      {/* Producto / Código */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 p-0.5">
                            {imgUrl ? (
                              <img 
                                src={imgUrl} 
                                alt={prod.nombre} 
                                className="w-full h-full object-contain" 
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                              {prod.nombre}
                            </h3>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 font-medium">
                              <span>
                                Cód: <span className="font-semibold text-gray-600">{prod.sku}</span>
                              </span>
                              {prod.codigo_barra && (
                                <span>
                                  C.B: <span className="font-semibold text-gray-600">{prod.codigo_barra}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-6 text-center">
                        <span className="text-base font-bold text-emerald-600 font-rajdhani">
                          {stock}
                        </span>
                      </td>

                      {/* Detal */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-gray-500 font-medium">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold mr-1.5 tracking-tight">
                              DETAL BCV
                            </span>
                            <span className="text-xs font-black text-gray-900 font-rajdhani">
                              ${precioDetalBcv.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium mt-0.5">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold mr-1.5 tracking-tight">
                              DETAL $
                            </span>
                            <span className="text-xs font-black text-gray-900 font-rajdhani">
                              ${precioDivisas.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Acciones (Cubo verde Stock + Lápiz gris Editar) */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Botón Cubo Verde: Ajuste rápido de Stock */}
                          <button
                            type="button"
                            onClick={() => {
                              setStockModalProduct(prod);
                              setAdjustingStock(stock);
                            }}
                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center transition-all shadow-2xs"
                            title="Ajustar Stock de almacén"
                          >
                            <Box className="w-4 h-4" />
                          </button>

                          {/* Botón Lápiz Gris: Editar Producto (Reutiliza el menú completo) */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditProduct(prod);
                              setViewMode('editor');
                            }}
                            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 flex items-center justify-center transition-all shadow-2xs"
                            title="Editar Producto"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Rápido de Stock (al pulsar el Cubo Verde) */}
      {stockModalProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <Box className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Ajustar Stock Físico</h3>
              </div>
              <button 
                onClick={() => setStockModalProduct(null)} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-gray-800 line-clamp-1">{stockModalProduct.nombre}</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">SKU: {stockModalProduct.sku}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-center border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Cantidad en almacén principal</span>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustingStock(prev => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-200 font-bold text-gray-700 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={adjustingStock}
                  onChange={(e) => setAdjustingStock(parseInt(e.target.value) || 0)}
                  className="w-20 text-center text-xl font-bold font-rajdhani py-1 px-2 rounded-lg border border-gray-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setAdjustingStock(prev => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-200 font-bold text-gray-700 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStockModalProduct(null)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={savingStock}
                onClick={handleUpdateStock}
                className="px-4 py-2 text-xs font-bold bg-[#343a40] hover:bg-[#23272b] text-white rounded-xl shadow flex items-center gap-1.5"
              >
                {savingStock ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Guardar Stock
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
