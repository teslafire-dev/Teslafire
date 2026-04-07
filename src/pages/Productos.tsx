import { Link } from "react-router-dom";
import ProductCard from "@/components/productos/ProductCard";
import ProductFilters from "@/components/productos/ProductFilters";
import { Grid, List, ChevronDown, SlidersHorizontal, Loader2, Package } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export default function Productos() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[.2em] mb-12">
          <Link to="/" className="hover:text-accent transition-smooth">Home</Link>
          <span className="text-slate-300">/</span>
          <span className="text-primary-950 font-black">Catálogo</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <ProductFilters />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-10">
            {/* Header & Controls */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-primary-950 uppercase tracking-tighter leading-none">Catálogo de Productos</h1>
                <p className="text-slate-500 font-medium tracking-wide">
                  {loading ? 'Cargando Catálogo...' : `Mostrando ${products.length} resultados profesionales.`}
                </p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative group w-full md:w-56 text-slate-600">
                  <select className="appearance-none w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 pr-10 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-accent outline-none transition-smooth cursor-pointer">
                    <option>Ordenar por: Popularidad</option>
                    <option>Precio: Menor a Mayor</option>
                    <option>Precio: Mayor a Menor</option>
                    <option>Novedades</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-accent pointer-events-none" />
                </div>
                <div className="flex border border-slate-100 rounded-xl overflow-hidden shrink-0 bg-slate-50 p-1">
                  <button className="p-2.5 bg-primary-950 text-white rounded-lg shadow-lg"><Grid className="w-5 h-5" /></button>
                  <button className="p-2.5 text-slate-400 hover:text-accent transition-smooth"><List className="w-5 h-5" /></button>
                </div>
                <button className="lg:hidden p-3 rounded-xl bg-white border border-slate-100 text-slate-600 flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest hover:border-accent transition-smooth w-full md:w-auto">
                  <SlidersHorizontal className="w-4 h-4" /> Filtros
                </button>
              </div>
            </div>

             {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {loading ? (
                <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-400">
                   <Loader2 className="w-12 h-12 animate-spin text-accent" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-center">Sincronizando Inventario con Base de Datos</span>
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center gap-6 text-slate-400">
                   <Package className="w-16 h-16 text-slate-200" />
                   <div className="text-center">
                    <h3 className="text-xl font-black text-primary-950 uppercase tracking-tighter">Sin Stock Disponible</h3>
                    <p className="text-xs font-medium uppercase tracking-widest mt-2">Estamos actualizando nuestro catálogo técnico.</p>
                   </div>
                </div>
              ) : (
                products.map((prod) => (
                  <ProductCard 
                    key={prod.id} 
                    id={prod.id} 
                    name={prod.nombre} 
                    sku={prod.sku} 
                    category={prod.categoria} 
                    price={prod.precio} 
                    image={prod.imagen_url || '/placeholder-product.png'} 
                    isNew={prod.is_new} 
                    isOffer={prod.is_offer} 
                  />
                ))
              )}
            </div>

            {/* Pagination (Mock) */}
            <div className="flex justify-center mt-12 mb-32">
              <nav className="flex gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                {[1, 2, 3, "...", 12].map((p, i) => (
                  <button 
                    key={i} 
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs transition-smooth ${p === 1 ? 'bg-primary-950 text-white shadow-xl shadow-primary-950/20' : 'text-slate-500 hover:bg-slate-50 hover:text-accent'}`}
                  >
                    {p}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
