import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductoPrecio {
  id: number; codigo: string; descripcion: string; marca: string; unidad: string;
  precio_costo: number; precio_detal: number; precio_mayor: number;
  precio_corporativo: number; precio_instalador: number;
  con_igtf: number; con_iva: number;
}

const mockData: ProductoPrecio[] = [
  { id:1, codigo:'EX-CO2-010', descripcion:'Extintor CO₂ 10 lb', marca:'Amerex', unidad:'Und', precio_costo:48.50, precio_detal:78.00, precio_mayor:65.00, precio_corporativo:60.00, precio_instalador:62.00, con_igtf:80.34, con_iva:90.48 },
  { id:2, codigo:'EPP-CAS-001', descripcion:'Casco MSA V-Gard Blanco', marca:'MSA Safety', unidad:'Und', precio_costo:32.00, precio_detal:52.00, precio_mayor:44.00, precio_corporativo:40.00, precio_instalador:42.00, con_igtf:53.56, con_iva:60.32 },
  { id:3, codigo:'EPP-GUA-003', descripcion:'Guantes Nitrilo L (100 und.)', marca:'3M', unidad:'Caja', precio_costo:42.00, precio_detal:68.00, precio_mayor:57.00, precio_corporativo:53.00, precio_instalador:55.00, con_igtf:70.04, con_iva:78.88 },
  { id:4, codigo:'EPP-LEN-002', descripcion:'Lentes de Seguridad 3M Clear', marca:'3M', unidad:'Und', precio_costo:8.75, precio_detal:14.00, precio_mayor:12.00, precio_corporativo:11.00, precio_instalador:11.50, con_igtf:14.42, con_iva:16.24 },
  { id:5, codigo:'SEG-SEN-010', descripcion:'Señal "Área Restringida"', marca:'Pematech', unidad:'Und', precio_costo:2.10, precio_detal:4.50, precio_mayor:3.80, precio_corporativo:3.50, precio_instalador:3.60, con_igtf:4.64, con_iva:5.22 },
];

const PER_PAGE = 15;

export default function ListaPrecios() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(p => {
    const q = search.toLowerCase();
    return !q || p.descripcion.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q);
  });
  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Analíticas</span><span>/</span><span className="text-electrico-600">Lista de Precios</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Lista de Precios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Precios en divisas por canal de venta, con IGTF e IVA calculados.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando lista...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar producto, código o marca..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200"><Filter className="w-3.5 h-3.5 text-gray-400" /><span>Filtros</span></button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase sticky left-0 bg-gray-50">Producto</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Costo</th>
                <th className="text-right px-4 py-3 font-bold text-gray-400 uppercase bg-sky-50/50">Detal</th>
                <th className="text-right px-4 py-3 font-bold text-gray-400 uppercase bg-brand-50/50">Mayor</th>
                <th className="text-right px-4 py-3 font-bold text-gray-400 uppercase bg-amber-50/50">Corporativo</th>
                <th className="text-right px-4 py-3 font-bold text-gray-400 uppercase bg-emerald-50/50">Instalador</th>
                <th className="text-right px-4 py-3 font-bold text-amber-600 uppercase">+IGTF</th>
                <th className="text-right px-4 py-3 font-bold text-blue-600 uppercase">+IVA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 sticky left-0 bg-white">
                    <div className="font-bold text-gray-800 max-w-[200px] truncate">{p.descripcion}</div>
                    <div className="text-gray-400 font-mono text-[11px]">{p.codigo} · {p.marca}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-500">${p.precio_costo.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-sky-700 bg-sky-50/30">${p.precio_detal.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-brand-900 bg-brand-50/30">${p.precio_mayor.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-amber-700 bg-amber-50/30">${p.precio_corporativo.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700 bg-emerald-50/30">${p.precio_instalador.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-amber-600">${p.con_igtf.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-700">${p.con_iva.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{filtered.length} producto{filtered.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-bold text-gray-700 px-2">{page} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
