import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Download, 
  Upload,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { featuredProducts } from "@/data/mockData";
import { useState } from "react";

export default function AdminProductos() {
  const [searchTerm, setSearchTerm] = useState("");
  const products = [...featuredProducts, ...featuredProducts]; 

  return (
    <div className="flex flex-col gap-10">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Inventario Técnico</h1>
          <p className="text-slate-500 font-medium tracking-wide">Gestión centralizada de 2,145 SKUs activos en el catálogo.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white border border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-2xl hover:border-accent transition-smooth active:scale-95 flex items-center gap-3">
            <Upload className="w-4 h-4 text-accent" /> Importar XLS
          </button>
          <button className="bg-primary-950 text-white font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-2xl hover:bg-black transition-smooth shadow-2xl shadow-primary-950/20 active:scale-95 flex items-center gap-3">
            <Plus className="w-4 h-4 text-accent" /> Nuevo SKU
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-[500px]">
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
           <button className="flex-1 md:flex-none bg-slate-50 border border-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest px-10 py-4 rounded-2xl hover:bg-white hover:border-accent transition-smooth flex items-center gap-3 justify-center">
              <Download className="w-4 h-4" /> Reporte
           </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[4rem] border border-slate-50 shadow-sm overflow-hidden mb-20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
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
              {products.map((prod, i) => (
                <tr key={`${prod.id}-${i}`} className="hover:bg-slate-50/80 transition-smooth group active:bg-slate-100">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2 group-hover:rotate-3 group-hover:scale-110 transition-smooth shadow-inner shrink-0">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-primary-950 group-hover:text-accent transition-smooth line-clamp-1 uppercase tracking-tight">{prod.name}</span>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Ansell Global Professionals</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-xs font-black font-outfit text-primary-950 tracking-tighter bg-slate-100 px-3 py-1 rounded-lg uppercase">{prod.sku}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border border-slate-200/50">
                      {prod.category}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="text-lg font-black text-primary-950 font-outfit tracking-tighter">
                      {prod.price ? `$${prod.price.toFixed(2)}` : "A Cotizar"}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">45/100 Unid.</span>
                          <span className="text-[9px] font-black text-green-600 uppercase">Saludable</span>
                       </div>
                       <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div className="w-3/4 h-full bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                       <button className="p-3 text-slate-300 hover:text-accent transition-smooth bg-slate-50 rounded-xl active:scale-90 border border-transparent hover:border-slate-200">
                          <Eye className="w-5 h-5" />
                       </button>
                       <button className="p-3 text-slate-300 hover:text-blue-600 transition-smooth bg-slate-50 rounded-xl active:scale-90 border border-transparent hover:border-slate-200">
                          <Edit3 className="w-5 h-5" />
                       </button>
                       <button className="p-3 text-slate-300 hover:text-red-500 transition-smooth bg-slate-50 rounded-xl active:scale-90 border border-transparent hover:border-slate-200">
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
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Catálogo: Mostrando 1 a 16 de 2,145 resultados</span>
           <div className="flex items-center gap-3">
              <button className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-accent transition-smooth shadow-sm border border-slate-100">
                 <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                {[1, 2, 3, "...", 134].map((p, i) => (
                  <button key={i} className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs transition-smooth ${p === 1 ? 'bg-primary-950 text-white shadow-xl shadow-primary-950/20' : 'text-slate-500 hover:bg-slate-50 hover:text-accent'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-accent transition-smooth shadow-sm border border-slate-100">
                 <ChevronRight className="w-6 h-6" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
