import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { categories } from "@/data/mockData";
import { Filter, X } from "lucide-react";

export default function ProductFilters() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const currentCategory = searchParams.get("categoria");

  function handleFilterChange(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigate(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="w-full lg:w-72 flex flex-col gap-8 bg-white p-6 rounded-2xl border border-slate-200 h-fit sticky top-24">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-xl font-bold font-outfit text-primary-950 flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-600" /> Filtros
        </h3>
        {(searchParams.toString() !== "") && (
          <button 
            onClick={() => navigate(pathname, { replace: true })}
            className="text-xs font-black text-destructive hover:underline flex items-center gap-2 uppercase tracking-widest"
          >
            Limpiar <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Categorías</h4>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="category" 
                checked={currentCategory === cat.slug}
                onChange={() => handleFilterChange("categoria", cat.slug)}
                className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
              />
              <span className={`text-sm ${currentCategory === cat.slug ? 'text-primary-600 font-bold' : 'text-slate-600 font-medium'} group-hover:text-primary-600 transition-standard whitespace-nowrap`}>
                {cat.name}
              </span>
              <span className="ml-auto text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold">{cat.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter (Mock) */}
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Rango de Precio</h4>
        <div className="flex flex-col gap-3">
          <input type="range" className="w-full accent-primary-600" />
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>$0</span>
            <span>$1000+</span>
          </div>
        </div>
      </div>

      {/* Brand Filter (Mock) */}
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Marcas</h4>
        <div className="flex flex-col gap-2">
          {["Ansell", "Radians", "Bullard", "3M", "MSA"].map((brand) => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-slate-600 font-medium group-hover:text-primary-600 transition-standard grow">{brand}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
