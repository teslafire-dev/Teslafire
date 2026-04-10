import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Filter, X, Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext";

interface ProductFiltersProps {
  onFilterChange?: () => void;
  isMobile?: boolean;
}

export default function ProductFilters({ onFilterChange, isMobile }: ProductFiltersProps = {}) {
  const { t, lang } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get("categoria");
  const currentBrand = searchParams.get("marca");
  const minPrice = searchParams.get("min_precio");
  const maxPrice = searchParams.get("max_precio");

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isBrandsOpen, setIsBrandsOpen] = useState(true);

  useEffect(() => {
    async function loadFilters() {
      setLoading(true);
      try {
        const [catsRes, brandsRes] = await Promise.all([
          supabase.from('categorias').select('id, nombre, slug, parent_id').order('orden'),
          supabase.from('marcas').select('id, nombre').order('nombre')
        ]);
        
        if (catsRes.data) setCategories(catsRes.data);
        if (brandsRes.data) setBrands(brandsRes.data);
      } catch (err) {
        console.error("Error loading filters:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFilters();
  }, []);

  function handleFilterChange(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Si cambiamos de categoría, limpiamos cualquier subcategoría previa para no confundir la URL
    // (En este caso usaremos el slug para el filtrado principal)
    navigate(`${pathname}?${params.toString()}`, { replace: true });
    if (onFilterChange) onFilterChange();
  }

  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || "1000");

  // Debounce effect for price
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localMaxPrice !== maxPrice) {
        handleFilterChange("max_precio", localMaxPrice === "1000" ? null : localMaxPrice);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localMaxPrice]);

  // Group categories by parent
  const mainCategories = categories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  return (
    <aside className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-10 flex flex-col gap-10 sticky top-28 transition-colors duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-primary-950 dark:text-white uppercase tracking-tighter flex items-center gap-3">
          <Filter className="w-5 h-5 text-accent" /> {t('catalog.filters')}
        </h2>
        {(currentCategory || currentBrand || minPrice || maxPrice) && (
          <button 
            onClick={() => {
              setLocalMaxPrice("1000");
              navigate(pathname, { replace: true });
            }}
            className="text-[10px] font-black text-accent uppercase tracking-widest hover:text-primary-950 dark:hover:text-white transition-smooth"
          >
            {t('catalog.clear')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">Sincronizando...</span>
        </div>
      ) : (
        <>
          {/* Categories Filter - HIERARCHICAL VIEW */}
          <div className="flex flex-col gap-6">
            <button 
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h3 className="text-xs font-black uppercase tracking-widest text-primary-950 dark:text-white flex items-center gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                 {t('catalog.categories')}
              </h3>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-smooth ${isCategoriesOpen ? 'rotate-180 text-accent' : ''}`} />
            </button>
            
            {isCategoriesOpen && (
              <div className="flex flex-col gap-5 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent animate-in slide-in-from-top-2 duration-300">
                <label 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => handleFilterChange("categoria", null)}
                >
                  <input 
                    type="radio" 
                    name="category"
                    checked={!currentCategory}
                    readOnly
                    className="w-4 h-4 text-accent border-slate-300 dark:border-slate-700 focus:ring-accent bg-transparent" 
                  />
                  <span className={`text-sm ${!currentCategory ? 'text-accent font-black' : 'text-slate-600 dark:text-slate-400 font-medium'} group-hover:text-accent transition-standard grow uppercase tracking-tight`}>
                    {t('catalog.all_categories')}
                  </span>
                </label>

                {mainCategories.map((mainCat) => {
                  const subCategories = getSubcategories(mainCat.id);
                  const isMainSelected = currentCategory === mainCat.slug;
                  
                  return (
                    <div key={mainCat.id} className="flex flex-col gap-3">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="category"
                          checked={isMainSelected}
                          onChange={() => handleFilterChange("categoria", isMainSelected ? null : mainCat.slug)}
                          className="w-4 h-4 text-accent border-slate-300 dark:border-slate-700 focus:ring-accent bg-transparent" 
                        />
                        <span className={`text-sm ${isMainSelected ? 'text-accent font-black' : 'text-primary-950 dark:text-white font-black'} group-hover:text-accent transition-standard grow uppercase tracking-tight border-b border-slate-50 dark:border-slate-800 pb-1`}>
                          {(lang === 'EN' && mainCat.nombre_en) ? mainCat.nombre_en : mainCat.nombre}
                        </span>
                      </label>

                      {/* Subcategories with indentation */}
                      {subCategories.length > 0 && (
                        <div className="flex flex-col gap-2 ml-6 border-l border-slate-100 dark:border-slate-800 pl-4">
                          {subCategories.map((sub) => (
                            <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                              <input 
                                type="radio" 
                                name="category"
                                checked={currentCategory === sub.slug}
                                onChange={() => handleFilterChange("categoria", currentCategory === sub.slug ? null : sub.slug)}
                                className="w-3 h-3 text-accent border-slate-300 dark:border-slate-700 focus:ring-accent bg-transparent" 
                              />
                              <span className={`text-[11px] ${currentCategory === sub.slug ? 'text-accent font-black' : 'text-slate-500 dark:text-slate-400 font-medium'} group-hover:text-accent transition-standard grow uppercase tracking-widest`}>
                                {(lang === 'EN' && sub.nombre_en) ? sub.nombre_en : sub.nombre}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-6">
            <button 
              onClick={() => setIsPriceOpen(!isPriceOpen)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h3 className="text-xs font-black uppercase tracking-widest text-primary-950 dark:text-white flex items-center gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                 {t('catalog.price_range')}
              </h3>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-smooth ${isPriceOpen ? 'rotate-180 text-accent' : ''}`} />
            </button>
            
            {isPriceOpen && (
              <div className="px-2 flex flex-col gap-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
                   <div className="flex-1 flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('catalog.max_price')}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-slate-400">$</span>
                         <input 
                          type="number" 
                          value={localMaxPrice} 
                          onChange={(e) => setLocalMaxPrice(e.target.value)}
                          placeholder="1000"
                          className="w-full bg-transparent text-sm font-black text-primary-950 dark:text-white outline-none"
                         />
                      </div>
                   </div>
                </div>

                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="10"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent transition-smooth"
                />
                
                <div className="flex justify-between">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('catalog.min_price')}</span>
                      <span className="text-sm font-black text-primary-950 dark:text-white font-outfit">$0</span>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('catalog.max_price')}</span>
                      <span className="text-sm font-black text-accent font-outfit">${localMaxPrice}</span>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Brand Filter */}
          <div className="flex flex-col gap-6 pb-4">
            <button 
              onClick={() => setIsBrandsOpen(!isBrandsOpen)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h3 className="text-xs font-black uppercase tracking-widest text-primary-950 dark:text-white flex items-center gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                 {t('catalog.brands')}
              </h3>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-smooth ${isBrandsOpen ? 'rotate-180 text-accent' : ''}`} />
            </button>
            
            {isBrandsOpen && (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent animate-in slide-in-from-top-2 duration-300">
                {brands.map((brand) => (
                  <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="brand"
                      checked={currentBrand === brand.nombre}
                      onChange={() => handleFilterChange("marca", currentBrand === brand.nombre ? null : brand.nombre)}
                      className="w-4 h-4 text-accent border-slate-300 dark:border-slate-700 focus:ring-accent bg-transparent" 
                    />
                    <span className={`text-sm ${currentBrand === brand.nombre ? 'text-accent font-bold' : 'text-slate-600 dark:text-slate-400 font-medium'} group-hover:text-accent transition-standard grow uppercase tracking-tight`}>
                      {brand.nombre}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </>
      ) }
    </aside>
  );
}
