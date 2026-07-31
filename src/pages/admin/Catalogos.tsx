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
  ArrowRight,
  Package,
  Layers,
  Settings,
  Tags,
  CheckCircle2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCatalogos() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Customization Form
  const [catalogTitle, setCatalogTitle] = useState('Catálogo Oficial de Productos');
  const [catalogSubtitle, setCatalogSubtitle] = useState('Venemax Store - Valencia, Venezuela');
  const [catalogContact, setCatalogContact] = useState('+58 (241) 822.38.44 | venemax1@hotmail.com');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeDescriptions, setIncludeDescriptions] = useState(true);

  // Selected Products State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('productos').select('*, marcas(nombre), categorias(nombre)').order('nombre'),
        supabase.from('categorias').select('*').order('nombre')
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar los productos");
    } finally {
      setLoading(false);
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
      // Unselect all filtered
      setSelectedProductIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const getFilteredProducts = () => {
    return products.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.categoria_id === selectedCategory;
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

          const tableRows = selectedProducts.map(p => [
            p.sku,
            p.nombre,
            p.marcas?.nombre || 'Genérica',
            p.categorias?.nombre || 'General',
            p.precio ? `$${Number(p.precio).toFixed(2)}` : 'A Cotizar',
            includeDescriptions ? (p.descripcion || 'Sin descripción técnica.') : ''
          ]);

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
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <RefreshCcw className="w-8 h-8 animate-spin text-accent" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cargando Productos</span>
      </div>
    );
  }

  const filtered = getFilteredProducts();
  const allFilteredSelected = filtered.length > 0 && filtered.every(p => selectedProductIds.includes(p.id));

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-24">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Creador de Catálogos</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Selecciona los productos y expórtalos en PDF a tu gusto.</p>
        </div>
        <button 
          onClick={handleGeneratePDF}
          disabled={generating || selectedProductIds.length === 0}
          className="flex items-center gap-3 bg-accent text-white hover:bg-accent/90 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
        >
          {generating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Exportar PDF ({selectedProductIds.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL IZQUIERDO: PERSONALIZACIÓN */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
            <h2 className="text-sm font-black text-primary-950 uppercase tracking-widest flex items-center gap-2">
              <Settings className="w-4 h-4 text-accent" /> Configuración PDF
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

        {/* PANEL DERECHO: BUSCADOR Y LISTA */}
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
                Seleccionados: {selectedProductIds.length} / {products.length}
              </span>
            </div>

            {/* Listado de Productos */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {filtered.map(p => {
                const isSelected = selectedProductIds.includes(p.id);
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
                          src={p.imagen_url || '/placeholder-product.png'} 
                          alt={p.nombre} 
                          className="max-h-full max-w-full object-contain" 
                        />
                      </div>
                      <div className="text-left">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{p.sku}</span>
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
