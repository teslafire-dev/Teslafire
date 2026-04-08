import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "@/components/productos/ProductCard";
import ProductFilters from "@/components/productos/ProductFilters";
import { Grid, List, ChevronDown, SlidersHorizontal, Loader2, Package, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Productos() {
  const { t, lang } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [searchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const currentCategory = searchParams.get("categoria");
  const currentBrand = searchParams.get("marca");
  const minPrice = searchParams.get("min_precio");
  const maxPrice = searchParams.get("max_precio");

  useEffect(() => {
    fetchProducts();
  }, [currentCategory, currentBrand, minPrice, maxPrice, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('productos')
        .select('*, categorias(nombre), marcas(nombre)');

      if (currentCategory) {
        const { data: catData } = await supabase
          .from('categorias')
          .select('id')
          .eq('slug', currentCategory)
          .single();
        if (catData) query = query.eq('categoria_id', catData.id);
      }

      if (currentBrand) {
        const { data: brandData } = await supabase
          .from('marcas')
          .select('id')
          .eq('nombre', currentBrand)
          .single();
        if (brandData) query = query.eq('marca_id', brandData.id);
      }

      if (minPrice) query = query.gte('precio', parseFloat(minPrice));
      if (maxPrice) query = query.lte('precio', parseFloat(maxPrice));

      if (sortBy === "price_asc") query = query.order('precio', { ascending: true });
      else if (sortBy === "price_desc") query = query.order('precio', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-32 md:pt-40 pb-40 relative">
      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white z-[101] lg:hidden shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase tracking-tighter">Filtrar Catálogo</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-slate-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ProductFilters onFilterChange={() => setIsMobileFilterOpen(false)} isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <div className="hidden lg:block lg:w-72 shrink-0">
            <ProductFilters />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-10">
            {/* Catalog Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col gap-3">
                <h1 className="text-4xl md:text-6xl font-black font-outfit text-primary-950 uppercase tracking-tighter leading-none">
                   {t('catalog.title').split(' ').map((word, i) => (
                      word === 'Productos' || word === 'Products' 
                      ? <span key={i} className="text-accent underline decoration-4 decoration-accent/20 underline-offset-8 transition-smooth" style={{ textDecorationThickness: '6px' }}>{word}</span> 
                      : word + ' '
                   ))}
                </h1>
                <p className="text-slate-500 font-medium tracking-wide">
                   {t('catalog.showing_results').replace('{count}', products.length.toString())}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-2xl px-6 py-3.5 pr-12 text-xs font-black uppercase tracking-widest text-primary-950 outline-none focus:ring-2 focus:ring-accent transition-smooth shadow-sm cursor-pointer"
                  >
                    <option value="newest">{t('catalog.sort.newest')}</option>
                    <option value="price_asc">{t('catalog.sort.price_asc')}</option>
                    <option value="price_desc">{t('catalog.sort.price_desc')}</option>
                    <option value="popularity">{t('catalog.sort.popularity')}</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-accent transition-smooth" />
                </div>
                
                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-3 px-6 py-3.5 bg-primary-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-950/20 active:scale-95 transition-smooth"
                >
                  <SlidersHorizontal className="w-4 h-4" /> {t('catalog.filters')}
                </button>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6 text-slate-400">
                <Loader2 className="w-16 h-16 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[.4em] animate-pulse">Sincronizando Inventario</span>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: (i % 8) * 0.05 }}
                    key={product.id}
                  >
                    <ProductCard 
                      id={product.id}
                      name={(lang === 'EN' && product.nombre_en) ? product.nombre_en : product.nombre}
                      sku={product.sku}
                      category={(lang === 'EN' && product.categorias?.nombre_en) ? product.categorias?.nombre_en : (product.categorias?.nombre || 'General')}
                      price={product.precio}
                      moneda={product.moneda}
                      image={(product.imagenes_urls && product.imagenes_urls[0]) || '/placeholder-product.png'}
                      isNew={product.is_new}
                      isOffer={product.is_offer}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 gap-8 bg-white rounded-[4rem] border border-slate-100 border-dashed">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-slate-200" />
                </div>
                <div className="text-center">
                   <h3 className="text-2xl font-black text-primary-950 uppercase tracking-tighter mb-2">{t('catalog.no_products')}</h3>
                   <p className="text-slate-500 font-medium tracking-wide">{t('catalog.no_products_desc')}</p>
                </div>
              </div>
            )}

            {/* End of results */}
            {!loading && products.length > 0 && (
              <div className="flex flex-col items-center gap-6 pt-20">
                <div className="w-px h-20 bg-gradient-to-b from-slate-200 to-transparent"></div>
                <span className="text-[10px] font-black uppercase tracking-[.6em] text-slate-300">
                   {t('catalog.end')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
