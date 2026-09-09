import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Plus, Filter, Calendar, ChevronLeft, ChevronRight, Eye, Wallet, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Gasto {
  id: number; numero: string; descripcion: string; categoria: string;
  proveedor: string; fecha: string; monto: number; moneda: string;
  centro_costo: string; metodo_pago: string; estado: 'pendiente' | 'aprobado' | 'pagado';
}

const ESTADO: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendiente: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700', icon: Clock },
  aprobado:  { label: 'Aprobado',  color: 'bg-blue-50 text-blue-700', icon: CheckCircle },
  pagado:    { label: 'Pagado',    color: 'bg-emerald-50 text-emerald-700', icon: Wallet },
};

const mockData: Gasto[] = [
  { id:1, numero:'GAS-00088', descripcion:'Servicio de internet fibra óptica', categoria:'Servicios Públicos', proveedor:'NetLine C.A.', fecha:'2026-09-09', monto:150000, moneda:'VES', centro_costo:'Administración', metodo_pago:'Transferencia', estado:'pagado' },
  { id:2, numero:'GAS-00087', descripcion:'Alquiler local Caracas – Sep 2026', categoria:'Alquileres', proveedor:'Inmobiliaria Caracas C.A.', fecha:'2026-09-05', monto:800, moneda:'USD', centro_costo:'Operaciones', metodo_pago:'Transferencia USD', estado:'pagado' },
  { id:3, numero:'GAS-00086', descripcion:'Combustible vehículos empresa', categoria:'Transporte', proveedor:'PDV Combustible', fecha:'2026-09-07', monto:85000, moneda:'VES', centro_costo:'Logística', metodo_pago:'Pago Móvil', estado:'pagado' },
  { id:4, numero:'GAS-00085', descripcion:'Papelería y útiles oficina', categoria:'Útiles de Oficina', proveedor:'Papelería La Luz', fecha:'2026-09-04', monto:32000, moneda:'VES', centro_costo:'Administración', metodo_pago:'Efectivo', estado:'aprobado' },
  { id:5, numero:'GAS-00084', descripcion:'Mantenimiento equipos refrigeración', categoria:'Mantenimiento', proveedor:'Clima Tech C.A.', fecha:'2026-09-02', monto:250, moneda:'USD', centro_costo:'Operaciones', metodo_pago:'', estado:'pendiente' },
];

const PER_PAGE = 10;

export default function AdmonGastos() {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(g => {
    const q = search.toLowerCase();
    const matchQ = !q || g.descripcion.toLowerCase().includes(q) || g.proveedor.toLowerCase().includes(q) || g.numero.toLowerCase().includes(q);
    const matchE = !estadoFilter || g.estado === estadoFilter;
    return matchQ && matchE;
  });
  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalUSD = mockData.filter(g => g.moneda === 'USD').reduce((s, g) => s + g.monto, 0);
  const totalVES = mockData.filter(g => g.moneda === 'VES').reduce((s, g) => s + g.monto, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Administración</span><span>/</span><span className="text-electrico-600">Gastos Operativos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Gastos Operativos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registro y clasificación de egresos y centros de costos.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
          <button onClick={() => toast('Registrar gasto en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Total Gastos USD</div>
          <div className="text-2xl font-extrabold font-rajdhani text-red-600 mt-1">${totalUSD.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Total Gastos Bs</div>
          <div className="text-2xl font-extrabold font-rajdhani text-brand-900 mt-1">Bs {(totalVES/1000).toFixed(0)}K</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Pendientes</div>
          <div className="text-2xl font-extrabold font-rajdhani text-amber-600 mt-1">{mockData.filter(g => g.estado === 'pendiente').length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Este mes</div>
          <div className="text-2xl font-extrabold font-rajdhani text-gray-800 mt-1">{mockData.length}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar descripción, proveedor o Nº..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none">
          <option value="">Todos</option>
          {Object.entries(ESTADO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200"><Calendar className="w-3.5 h-3.5 text-gray-400" /><span>Fecha</span></button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Nº</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Descripción</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Categoría</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Centro de Costo</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Fecha</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Monto</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(g => {
                const cfg = ESTADO[g.estado];
                const Icon = cfg.icon;
                return (
                  <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-brand-900">{g.numero}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800 max-w-[180px] truncate">{g.descripcion}</div>
                      <div className="text-gray-400 text-[11px]">{g.proveedor}</div>
                    </td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 font-semibold">{g.categoria}</span></td>
                    <td className="px-4 py-3 text-gray-600">{g.centro_costo}</td>
                    <td className="px-4 py-3 text-gray-600">{g.fecha}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">
                      {g.moneda === 'USD' ? '$' : 'Bs '}{g.monto.toLocaleString()}
                    </td>
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
          <span className="text-xs text-gray-500">{filtered.length} gasto{filtered.length !== 1 ? 's' : ''}</span>
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
