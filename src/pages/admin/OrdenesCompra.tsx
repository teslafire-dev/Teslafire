import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Plus, Filter, Calendar, ChevronLeft, ChevronRight, Eye, Edit2, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrdenCompra {
  id: number; numero: string; fecha: string; proveedor: string; rif: string;
  items: number; total_usd: number; moneda: string; estado: 'borrador' | 'aprobada' | 'enviada' | 'recibida' | 'cancelada';
  fecha_entrega: string; almacen: string; usuario: string;
}

const ESTADO: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  borrador:  { label: 'Borrador',  color: 'bg-gray-100 text-gray-600',    icon: Edit2 },
  aprobada:  { label: 'Aprobada',  color: 'bg-blue-50 text-blue-700',     icon: CheckCircle },
  enviada:   { label: 'Enviada',   color: 'bg-amber-50 text-amber-700',   icon: Truck },
  recibida:  { label: 'Recibida',  color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  cancelada: { label: 'Cancelada', color: 'bg-red-50 text-red-600',       icon: XCircle },
};

const mockData: OrdenCompra[] = [
  { id:1, numero:'OC-00024', fecha:'2026-09-09', proveedor:'Distribuidora ProSeguridad C.A.', rif:'J-29876543-1', items:8, total_usd:3420.00, moneda:'USD', estado:'aprobada', fecha_entrega:'2026-09-15', almacen:'Almacén Principal', usuario:'J. Rodríguez' },
  { id:2, numero:'OC-00023', fecha:'2026-09-07', proveedor:'Importaciones SafeGuard S.A.', rif:'J-31045678-9', items:5, total_usd:1875.50, moneda:'USD', estado:'enviada', fecha_entrega:'2026-09-12', almacen:'Almacén Principal', usuario:'M. Pérez' },
  { id:3, numero:'OC-00022', fecha:'2026-09-05', proveedor:'3M Venezuela', rif:'J-00304447-3', items:12, total_usd:6200.00, moneda:'USD', estado:'recibida', fecha_entrega:'2026-09-08', almacen:'Almacén Principal', usuario:'J. Rodríguez' },
  { id:4, numero:'OC-00021', fecha:'2026-09-03', proveedor:'EPP Total C.A.', rif:'J-40012233-5', items:3, total_usd:540.00, moneda:'USD', estado:'borrador', fecha_entrega:'2026-09-20', almacen:'Tienda Oriente', usuario:'C. Morales' },
  { id:5, numero:'OC-00020', fecha:'2026-08-28', proveedor:'Distribuidora ProSeguridad C.A.', rif:'J-29876543-1', items:6, total_usd:2100.00, moneda:'USD', estado:'cancelada', fecha_entrega:'2026-09-05', almacen:'Almacén Principal', usuario:'M. Pérez' },
];

const PER_PAGE = 10;

export default function OrdenesCompra() {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(o => {
    const q = search.toLowerCase();
    const matchQ = !q || o.numero.toLowerCase().includes(q) || o.proveedor.toLowerCase().includes(q) || o.rif.includes(q);
    const matchE = !estadoFilter || o.estado === estadoFilter;
    return matchQ && matchE;
  });
  const total = filtered.length;
  const pages = Math.ceil(total / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Compras</span><span>/</span><span className="text-electrico-600">Órdenes de Compra</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Órdenes de Compra</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generación y control del ciclo de órdenes de compra a proveedores.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
          <button onClick={() => toast('Nueva OC en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Nueva Orden</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total OC', value: mockData.length, color: 'text-brand-900' },
          { label: 'Aprobadas', value: mockData.filter(o => o.estado === 'aprobada').length, color: 'text-blue-700' },
          { label: 'En Tránsito', value: mockData.filter(o => o.estado === 'enviada').length, color: 'text-amber-700' },
          { label: 'Recibidas', value: mockData.filter(o => o.estado === 'recibida').length, color: 'text-emerald-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{s.label}</div>
            <div className={`text-2xl font-extrabold font-rajdhani mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por Nº OC, proveedor o RIF..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-brand-500">
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200"><Calendar className="w-3.5 h-3.5 text-gray-400" /><span>Fecha</span></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Nº OC</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Proveedor</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Ítems</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Entrega Est.</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Almacén</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(o => {
                const cfg = ESTADO[o.estado];
                const Icon = cfg.icon;
                return (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-brand-900 font-mono">{o.numero}</div>
                      <div className="text-gray-400">{o.fecha}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800 max-w-[200px] truncate">{o.proveedor}</div>
                      <div className="text-gray-400 font-mono">{o.rif}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-700">{o.items}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">${o.total_usd.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{o.fecha_entrega}</td>
                    <td className="px-4 py-3 text-gray-600">{o.almacen}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{total} orden{total !== 1 ? 'es' : ''}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-bold text-gray-700 px-2">{page} / {pages || 1}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
