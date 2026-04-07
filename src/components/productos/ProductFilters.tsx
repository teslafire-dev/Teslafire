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
          supabase.from('categorias').select('id, nombre, slug').order('nombre'),
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
    navigate(`${pathname}?${params.toString()}`);
    if (onFilterChange) onFilterChange();
  }

  return (
    <aside className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-10 flex flex-col gap-10 sticky top-28">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-primary-950 uppercase tracking-tighter flex items-center gap-3">
          <Filter className="w-5 h-5 text-accent" /> {t('catalog.filters')}
        </h2>
        {(currentCategory || currentBrand || minPrice || maxPrice) && (
          <button 
            onClick={() => navigate(pathname)}
            className="text-[10px] font-black text-accent uppercase tracking-widest hover:text-primary-950 transition-smooth"
          >
            {t('catalog.clear')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Sincronizando...</span>
        </div>
      ) : (
        <>
          {/* Categories Filter */}
          <div className="flex flex-col gap-6">
            <button 
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h3 className="text-xs font-black uppercase tracking-widest text-primary-950 flex items-center gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                 {t('catalog.categories')}
              </h3>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-smooth ${isCategoriesOpen ? 'rotate-180 text-accent' : ''}`} />
            </button>
            
            {isCategoriesOpen && (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent animate-in slide-in-from-top-2 duration-300">
                <label 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => handleFilterChange("categoria", null)}
                >
                  <input 
                    type="radio" 
                    name="category"
                    checked={!currentCategory}
                    readOnly
                    className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" 
                  />
                  <span className={`text-sm ${!currentCategory ? 'text-primary-600 font-bold' : 'text-slate-600 font-medium'} group-hover:text-primary-600 transition-standard grow`}>
                    {t('catalog.all_categories')}
                  </span>
                </label>

                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category"
                      checked={currentCategory === cat.slug}
                      onChange={() => handleFilterChange("categoria", currentCategory === cat.slug ? null : cat.slug)}
                      className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" 
                    />
                    <span className={`text-sm ${currentCategory === cat.slug ? 'text-primary-600 font-bold' : 'text-slate-600 font-medium'} group-hover:text-primary-600 transition-standard grow`}>
                      {(lang === 'EN' && cat.nombre_en) ? cat.nombre_en : cat.nombre}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-6">
            <button 
              onClick={() => setIsPriceOpen(!isPriceOpen)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h3 className="text-xs font-black uppercase tracking-widest text-primary-950 flex items-center gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                 {t('catalog.price_range')}
              </h3>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-smooth ${isPriceOpen ? 'rotate-180 text-accent' : ''}`} />
            </button>
            
            {isPriceOpen && (
              <div className="px-2 flex flex-col gap-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                   <div className="flex-1 flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('catalog.max_price')}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-slate-400">$</span>
                         <input 
                          type="number" 
                          value={maxPrice || ""} 
                          onChange={(e) => handleFilterChange("max_precio", e.target.value || null)}
                          placeholder="9990"
                          className="w-full bg-transparent text-sm font-black text-primary-950 outline-none"
                         />
                      </div>
                   </div>
                </div>

                <input 
                  type="range" 
                  min="0" 
                  max="9990" 
                  step="10"
                  value={maxPrice || "9990"}
                  onChange={(e) => handleFilterChange("max_precio", e.target.value)}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-accent transition-smooth"
                />
                
                <div className="flex justify-between">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('catalog.min_price')}</span>
                      <span className="text-sm font-black text-primary-950 font-outfit">$0</span>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('catalog.max_price')}</span>
                      <span className="text-sm font-black text-accent font-outfit">${maxPrice || "9990"}</span>
                   </div>
                </div>
                <p className="text-[9px] font-medium text-slate-400 italic">
                  * {t('catalog.filter_disclaimer')}
                </p>
              </div>
            )}
          </div>

          {/* Brand Filter */}
          <div className="flex flex-col gap-6 pb-4">
            <button 
              onClick={() => setIsBrandsOpen(!isBrandsOpen)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h3 className="text-xs font-black uppercase tracking-widest text-primary-950 flex items-center gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                 {t('catalog.brands')}
              </h3>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-smooth ${isBrandsOpen ? 'rotate-180 text-accent' : ''}`} />
            </button>
            
            {isBrandsOpen && (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent animate-in slide-in-from-top-2 duration-300">
                {brands.map((brand) => (
                  <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="brand"
                      checked={currentBrand === brand.nombre}
                      onChange={() => handleFilterChange("marca", currentBrand === brand.nombre ? null : brand.nombre)}
                      className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" 
                    />
                    <span className={`text-sm ${currentBrand === brand.nombre ? 'text-primary-600 font-bold' : 'text-slate-600 font-medium'} group-hover:text-primary-600 transition-standard grow`}>
                      {brand.nombre}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
