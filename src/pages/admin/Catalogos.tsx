import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Download, 
  CheckSquare, 
  Square,
  RefreshCcw,
  Package,
  Settings,
  FolderOpen,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCatalogos() {
  // DB States
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [savedCatalogs, setSavedCatalogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Selection/Edit State
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [catalogTitle, setCatalogTitle] = useState('Nuevo Catálogo de Productos');
  const [catalogSubtitle, setCatalogSubtitle] = useState('Venemax Store - Valencia, Venezuela');
  const [catalogContact, setCatalogContact] = useState('+58 (241) 822.38.44 | venemax1@hotmail.com');
  const [includeDescriptions, setIncludeDescriptions] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Products using junction table categories
      const { data: productsData, error: pError } = await supabase
        .from('productos')
        .select(`
          *,
          marcas(nombre),
          producto_categorias(
            categoria_id,
            categorias(nombre)
          )
        `)
        .order('nombre');

      if (pError) throw pError;
      setProducts(productsData || []);

      // 2. Fetch Categories
      const { data: catsData, error: cError } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre');

      if (cError) throw cError;
      setCategories(catsData || []);

      // 3. Fetch Saved Catalogs
      await fetchSavedCatalogs();

    } catch (error: any) {
      console.error("Error loading initial catalog data:", error);
      toast.error("Error al cargar la información: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedCatalogs = async () => {
    try {
      const { data, error } = await supabase
        .from('catalogos')
        .select('*, catalogo_productos(producto_id)')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setSavedCatalogs(data || []);
    } catch (error: any) {
      console.error("Error loading catalogs:", error);
    }
  };

  const handleSelectCatalog = (catalog: any) => {
    setSelectedCatalogId(catalog.id);
    setCatalogTitle(catalog.titulo);
    setCatalogSubtitle(catalog.subtitulo || '');
    setCatalogContact(catalog.contacto || '');
    setIncludeDescriptions(catalog.incluir_descripciones !== false);
    
    // Set selected products
    const productIds = catalog.catalogo_productos?.map((cp: any) => cp.producto_id) || [];
    setSelectedProductIds(productIds);
    toast.success(`Catálogo "${catalog.titulo}" cargado`);
  };

  const handleCreateNewCatalog = () => {
    setSelectedCatalogId(null);
    setCatalogTitle('Nuevo Catálogo Venemax');
    setCatalogSubtitle('Venemax Store - Valencia, Venezuela');
    setCatalogContact('+58 (241) 822.38.44 | venemax1@hotmail.com');
    setIncludeDescriptions(true);
    setSelectedProductIds([]);
    toast.success("Formulario preparado para nuevo catálogo");
  };

  const handleSaveCatalog = async () => {
    if (!catalogTitle.trim()) {
      toast.error("El catálogo necesita un título");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Guardando catálogo...");
    try {
      let catalogId = selectedCatalogId;

      // 1. Insert or Update Catalog metadata
      if (catalogId) {
        const { error } = await supabase
          .from('catalogos')
          .update({
            titulo: catalogTitle,
            subtitulo: catalogSubtitle,
            contacto: catalogContact,
            incluir_descripciones: includeDescriptions,
            updated_at: new Date().toISOString()
          })
          .eq('id', catalogId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('catalogos')
          .insert({
            titulo: catalogTitle,
            subtitulo: catalogSubtitle,
            contacto: catalogContact,
            incluir_descripciones: includeDescriptions
          })
          .select()
          .single();

        if (error) throw error;
        catalogId = data.id;
        setSelectedCatalogId(catalogId);
      }

      // 2. Sync products selection (Delete old mappings, write new ones)
      const { error: deleteError } = await supabase
        .from('catalogo_productos')
        .delete()
        .eq('catalogo_id', catalogId);

      if (deleteError) throw deleteError;

      if (selectedProductIds.length > 0) {
        const insertRows = selectedProductIds.map(pId => ({
          catalogo_id: catalogId!,
          producto_id: pId
        }));
        
        const { error: insertError } = await supabase
          .from('catalogo_productos')
          .insert(insertRows);

        if (insertError) throw insertError;
      }

      toast.success("¡Catálogo guardado con éxito!", { id: toastId });
      await fetchSavedCatalogs();
    } catch (error: any) {
      console.error("Error saving catalog:", error);
      toast.error("Error al guardar catálogo: " + error.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCatalog = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the deleted item
    if (!confirm("¿Seguro que deseas eliminar este catálogo permanentemente?")) return;

    try {
      const { error } = await supabase.from('catalogos').delete().eq('id', id);
      if (error) throw error;

      toast.success("Catálogo eliminado");
      if (selectedCatalogId === id) {
        handleCreateNewCatalog();
      }
      await fetchSavedCatalogs();
    } catch (error: any) {
      toast.error("Error al eliminar: " + error.message);
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filtered = getFilteredProducts();
    const filteredIds = filtered.map(p => p.id);
    const allSelected = filteredIds.every(id => selectedProductIds.includes(id));

    if (allSelected) {
      setSelectedProductIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const getFilteredProducts = () => {
    return products.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
                              p.producto_categorias?.some((pc: any) => pc.categoria_id === selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  };

  const handleGeneratePDF = () => {
    if (selectedProductIds.length === 0) {
      toast.error("Por favor selecciona al menos un producto");
      return;
    }

    setGenerating(true);
    const toastId = toast.loading("Generando catálogo en PDF...");

    const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));

    // Dynamic loading of jsPDF and AutoTable from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      const scriptAutotable = document.createElement('script');
      scriptAutotable.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
      scriptAutotable.onload = () => {
        try {
          const { jsPDF } = (window as any).jspdf;
          const doc = new jsPDF();

          // Aesthetics Colors
          const primaryColor = [2, 6, 23]; // Deep slate
          const accentColor = [255, 184, 0]; // Venemax Gold/Yellow

          // Header page 1
          doc.setFillColor(...primaryColor);
          doc.rect(0, 0, 210, 50, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(26);
          doc.setFont("helvetica", "bold");
          doc.text("VENEMAX", 15, 25);
          doc.setTextColor(...accentColor);
          doc.text("STORE", 68, 25);

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text("LA GRAN TIENDA DEL COMPUTADOR, C.A.", 15, 33);
          doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, 39);

          // Customize details right-aligned
          doc.setFontSize(9);
          doc.text(catalogContact.toUpperCase(), 195, 33, { align: 'right' });

          // Title & Subtitle body
          doc.setTextColor(...primaryColor);
          doc.setFontSize(18);
          doc.setFont("helvetica", "bold");
          doc.text(catalogTitle.toUpperCase(), 15, 65);
          
          doc.setFontSize(11);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          doc.text(catalogSubtitle, 15, 72);

          // Table Columns definition
          const tableHeaders = [
            ['SKU', 'PRODUCTO', 'MARCA', 'CATEGORÍA', 'PRECIO', 'DESCRIPCIÓN']
          ];

          const tableRows = selectedProducts.map(p => {
            const catName = p.producto_categorias?.[0]?.categorias?.nombre || 'General';
            return [
              p.sku,
              p.nombre,
              p.marcas?.nombre || 'Genérica',
              catName,
              p.precio ? `$${Number(p.precio).toFixed(2)}` : 'A Cotizar',
              includeDescriptions ? (p.descripcion || 'Sin descripción técnica.') : ''
            ];
          });

          // Render AutoTable
          (doc as any).autoTable({
            startY: 80,
            head: tableHeaders,
            body: tableRows,
            theme: 'grid',
            headStyles: {
              fillColor: primaryColor,
              textColor: [255, 255, 255],
              fontSize: 8,
              fontStyle: 'bold',
              halign: 'center'
            },
            bodyStyles: {
              fontSize: 8,
              valign: 'middle'
            },
            columnStyles: {
              0: { cellWidth: 25 },
              1: { cellWidth: 40, fontStyle: 'bold' },
              2: { cellWidth: 20 },
              3: { cellWidth: 25 },
              4: { cellWidth: 20, halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] },
              5: { cellWidth: 60 }
            },
            alternateRowStyles: {
              fillColor: [248, 250, 252]
            },
            margin: { left: 15, right: 15 },
            didDrawPage: (data: any) => {
              // Footer page number
              doc.setFontSize(8);
              doc.setTextColor(150, 150, 150);
              doc.text(
                `Página ${data.pageNumber} | Generado desde el Panel Venemax Store`,
                105,
                287,
                { align: 'center' }
              );
            }
          });

          // Save file
          const cleanFileName = catalogTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
          doc.save(`${cleanFileName}_catalogo.pdf`);
          toast.success("Catálogo descargado con éxito", { id: toastId });
        } catch (error: any) {
          console.error("PDF generation failed:", error);
          toast.error("Error al generar PDF: " + error.message, { id: toastId });
        } finally {
          setGenerating(false);
        }
      };
      document.body.appendChild(scriptAutotable);
    };
    document.body.appendChild(script);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
        <RefreshCcw className="w-8 h-8 animate-spin text-accent" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cargando Creador de Catálogos...</span>
      </div>
    );
  }

  const filtered = getFilteredProducts();
  const allFilteredSelected = filtered.length > 0 && filtered.every(p => selectedProductIds.includes(p.id));

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-24 text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Creador de Catálogos</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Crea y edita catálogos personalizados para exportar en PDF.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleCreateNewCatalog}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
          
          <button 
            onClick={handleSaveCatalog}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-950 text-white hover:bg-primary-950/90 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary-950/20 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Catálogo
          </button>

          <button 
            onClick={handleGeneratePDF}
            disabled={generating || selectedProductIds.length === 0}
            className="flex items-center gap-3 bg-accent text-white hover:bg-accent/90 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
          >
            {generating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Exportar PDF ({selectedProductIds.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL IZQUIERDO: LISTA DE CATÁLOGOS Y OPCIONES */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Listado de Catálogos Guardados */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
            <h2 className="text-sm font-black text-primary-950 uppercase tracking-widest flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-accent" /> Catálogos Guardados
            </h2>
            
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {savedCatalogs.map(cat => {
                const isActive = selectedCatalogId === cat.id;
                return (
                  <div 
                    key={cat.id}
                    onClick={() => handleSelectCatalog(cat)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                      isActive 
                        ? 'bg-primary-950 text-white border-primary-950' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-50'
                    }`}
                  >
                    <div className="text-left">
                      <h4 className="text-xs font-bold uppercase truncate max-w-[180px]">{cat.titulo}</h4>
                      <p className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {cat.catalogo_productos?.length || 0} Productos
                      </p>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteCatalog(cat.id, e)}
                      className={`p-2 rounded-xl transition-all ${
                        isActive 
                          ? 'text-slate-400 hover:text-red-400' 
                          : 'text-slate-300 hover:text-red-500'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {savedCatalogs.length === 0 && (
                <div className="text-slate-300 py-10 font-bold uppercase text-[9px] tracking-widest">
                  No hay catálogos creados
                </div>
              )}
            </div>
          </div>

          {/* Configuración del Catálogo Activo */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
            <h2 className="text-sm font-black text-primary-950 uppercase tracking-widest flex items-center gap-2">
              <Settings className="w-4 h-4 text-accent" /> Datos de Plantilla
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Título del Catálogo</label>
                <input 
                  type="text" 
                  value={catalogTitle} 
                  onChange={(e) => setCatalogTitle(e.target.value)} 
                  className="bg-slate-50 border border-slate-50 p-4 rounded-xl text-xs font-bold focus:bg-white outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Subtítulo o Ubicación</label>
                <input 
                  type="text" 
                  value={catalogSubtitle} 
                  onChange={(e) => setCatalogSubtitle(e.target.value)} 
                  className="bg-slate-50 border border-slate-50 p-4 rounded-xl text-xs font-bold focus:bg-white outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Contacto Cabecera</label>
                <input 
                  type="text" 
                  value={catalogContact} 
                  onChange={(e) => setCatalogContact(e.target.value)} 
                  className="bg-slate-50 border border-slate-50 p-4 rounded-xl text-xs font-bold focus:bg-white outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeDescriptions} 
                  onChange={(e) => setIncludeDescriptions(e.target.checked)}
                  className="w-5 h-5 text-accent border-slate-200 rounded focus:ring-accent accent-accent"
                />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Incluir Descripciones</span>
              </label>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: BUSCADOR Y SELECCIÓN DE PRODUCTOS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
            
            {/* Buscador y Filtros */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o SKU..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border-none py-3.5 pl-12 pr-6 rounded-2xl text-xs font-bold focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
              
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border-none py-3.5 px-6 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-500 outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="all">Todas las Categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {/* Acciones de Selección */}
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
              <button 
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-accent transition-colors"
              >
                {allFilteredSelected ? <CheckSquare className="w-4 h-4 text-accent" /> : <Square className="w-4 h-4" />}
                {allFilteredSelected ? 'Deseleccionar Todos' : 'Seleccionar Filtrados'}
              </button>
              
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Seleccionados en Catálogo: {selectedProductIds.length} / {products.length}
              </span>
            </div>

            {/* Listado de Productos */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {filtered.map(p => {
                const isSelected = selectedProductIds.includes(p.id);
                const catName = p.producto_categorias?.[0]?.categorias?.nombre || 'General';
                return (
                  <div 
                    key={p.id} 
                    onClick={() => toggleSelectProduct(p.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                      isSelected 
                        ? 'bg-accent/5 border-accent/30 shadow-md shadow-accent/5' 
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center p-1.5 shrink-0 border border-slate-100">
                        <img 
                          src={p.imagenes_urls?.[0] || p.imagen_url || '/placeholder-product.png'} 
                          alt={p.nombre} 
                          className="max-h-full max-w-full object-contain" 
                        />
                      </div>
                      <div className="text-left">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{p.sku} | {catName}</span>
                        <h4 className="text-xs font-bold text-primary-950 uppercase tracking-tight group-hover:text-accent transition-colors">{p.nombre}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="text-xs font-black text-slate-900">${Number(p.precio || 0).toFixed(2)}</span>
                      <div className={`p-2 rounded-xl transition-all ${isSelected ? 'text-accent' : 'text-slate-200 group-hover:text-slate-400'}`}>
                        {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">
                  <Package className="w-12 h-12 mx-auto opacity-10 mb-4" />
                  No se encontraron productos
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
