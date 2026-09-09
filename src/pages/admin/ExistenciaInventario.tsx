import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Filter, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductoExistencia {
  id: number; codigo: string; descripcion: string; marca: string; unidad: string;
  stock_principal: number; stock_oriente: number; stock_total: number;
  minimo: number; reorden: number; estado: 'ok' | 'critico' | 'agotado';
}

const ESTADO: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ok:      { label: 'Normal',   color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  critico: { label: 'Crítico',  color: 'bg-amber-50 text-amber-700', icon: AlertTriangle },
  agotado: { label: 'Agotado',  color: 'bg-red-50 text-red-700', icon: XCircle },
};

const mockData: ProductoExistencia[] = [
  { id:1, codigo:'EX-CO2-010', descripcion:'Extintor CO₂ 10 lb', marca:'Amerex', unidad:'Und', stock_principal:65, stock_oriente:12, stock_total:77, minimo:10, reorden:30, estado:'ok' },
  { id:2, codigo:'EPP-CAS-001', descripcion:'Casco MSA V-Gard', marca:'MSA', unidad:'Und', stock_principal:45, stock_oriente:8, stock_total:53, minimo:15, reorden:50, estado:'ok' },
  { id:3, codigo:'EPP-GUA-003', descripcion:'Guantes Nitrilo L (100 und.)', marca:'3M', unidad:'Caja', stock_principal:212, stock_oriente:0, stock_total:212, minimo:20, reorden:100, estado:'ok' },
  { id:4, codigo:'EPP-ARN-001', descripcion:'Arnés de Seguridad 3M', marca:'3M', unidad:'Und', stock_principal:7, stock_oriente:0, stock_total:7, minimo:5, reorden:15, estado:'critico' },
  { id:5, codigo:'SEG-CON-090', descripcion:'Cono de Seguridad 90cm', marca:'Pematech', unidad:'Und', stock_principal:38, stock_oriente:5, stock_total:43, minimo:20, reorden:50, estado:'ok' },
  { id:6, codigo:'SEG-SEN-010', descripcion:'Señal "Área Restringida"', marca:'Pematech', unidad:'Und', stock_principal:143, stock_oriente:22, stock_total:165, minimo:30, reorden:80, estado:'ok' },
  { id:7, codigo:'EPP-LEN-002', descripcion:'Lentes de Seguridad 3M', marca:'3M', unidad:'Und', stock_principal:0, stock_oriente:0, stock_total:0, minimo:10, reorden:50, estado:'agotado' },
];

const PER_PAGE = 15;

export default function ExistenciaInventario() {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.descripcion.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q);
    const matchE = !estadoFilter || p.estado === estadoFilter;
    return matchQ && matchE;
  });
  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Analíticas</span><span>/</span><span className="text-electrico-600">Existencia de Inventario</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Existencia de Inventario</h1>
          <p className="text-sm text-gray-500 mt-0.5">Disponibilidad consolidada por almacén, alertas críticas y punto de reorden.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
        </div>
      </div>

      {/* Stats de estado */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(ESTADO).map(([k, v]) => {
          const count = mockData.filter(p => p.estado === k).length;
          const Icon = v.icon;
          return (
            <div key={k} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className={`p-1.5 rounded-lg ${v.color}`}><Icon className="w-3.5 h-3.5" /></span>
                <div className="text-xs text-gray-400 font-semibold">{v.label}</div>
              </div>
              <div className="text-2xl font-extrabold font-rajdhani text-gray-900">{count} prod.</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar producto, código o marca..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Producto</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Und.</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Almacén Ppal.</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Tienda Oriente</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Total</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Mínimo</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Reorden</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(p => {
                const cfg = ESTADO[p.estado];
                const Icon = cfg.icon;
                return (
                  <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors ${p.estado === 'agotado' ? 'bg-red-50/20' : p.estado === 'critico' ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800 max-w-[200px] truncate">{p.descripcion}</div>
                      <div className="text-gray-400 font-mono text-[11px]">{p.codigo} · {p.marca}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{p.unidad}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{p.stock_principal}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-700">{p.stock_oriente}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-extrabold ${p.stock_total === 0 ? 'text-red-600' : p.stock_total <= p.minimo ? 'text-amber-600' : 'text-brand-900'}`}>{p.stock_total}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.minimo}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.reorden}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
