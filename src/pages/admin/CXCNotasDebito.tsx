import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Plus, Eye, ChevronLeft, ChevronRight, CheckCircle, Clock, AlertTriangle, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotaDebito {
  id: number; numero: string; cliente: string; rif: string;
  fecha: string; motivo: string; monto_usd: number;
  factura_origen: string; estado: 'pendiente' | 'aprobada' | 'anulada';
}

const ESTADO: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendiente: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700', icon: Clock },
  aprobada:  { label: 'Aprobada',  color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  anulada:   { label: 'Anulada',   color: 'bg-red-50 text-red-700', icon: AlertTriangle },
};

const mockData: NotaDebito[] = [
  { id:1, numero:'ND-00025', cliente:'Constructora Oriente 2000 C.A.', rif:'J-31987654-2', fecha:'2026-09-05', motivo:'Intereses de mora (25 días)', monto_usd:120.00, factura_origen:'FF-002775', estado:'aprobada' },
  { id:2, numero:'ND-00024', cliente:'Ferretería El Martillo C.A.', rif:'J-20456789-3', fecha:'2026-08-28', motivo:'Gastos de cobranza extrajudicial', monto_usd:50.00, factura_origen:'FF-002755', estado:'pendiente' },
  { id:3, numero:'ND-00023', cliente:'Consorcio Petrosa C.A.', rif:'J-40234567-8', fecha:'2026-08-15', motivo:'Flete no facturado', monto_usd:200.00, factura_origen:'NE-00380', estado:'anulada' },
];

export default function CXCNotasDebito() {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = mockData.filter(n => {
    const q = search.toLowerCase();
    const matchQ = !q || n.cliente.toLowerCase().includes(q) || n.numero.toLowerCase().includes(q);
    const matchE = !estadoFilter || n.estado === estadoFilter;
    return matchQ && matchE;
  });
  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>CXC</span><span>/</span><span className="text-electrico-600">Notas de Débito</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Notas de Débito</h1>
          <p className="text-sm text-gray-500 mt-0.5">Emisión de notas de débito a clientes por intereses, fletes u otros cargos.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
          <button onClick={() => toast('Nueva nota en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Nueva Nota</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(ESTADO).map(([k, v]) => {
          const count = mockData.filter(n => n.estado === k).length;
          const monto = mockData.filter(n => n.estado === k).reduce((s, n) => s + n.monto_usd, 0);
          const Icon = v.icon;
          return (
            <div key={k} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className={`p-1.5 rounded-lg ${v.color}`}><Icon className="w-3.5 h-3.5" /></span>
                <div className="text-xs text-gray-400 font-semibold">{v.label}</div>
              </div>
              <div className="text-xl font-extrabold font-rajdhani text-gray-900">{count} ND</div>
              <div className="text-xs text-gray-500">${monto.toFixed(2)}</div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar cliente o Nº nota..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none">
          <option value="">Todos</option>
          {Object.entries(ESTADO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Nº Nota</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Motivo</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Origen</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Monto</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Estado</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(n => {
                const cfg = ESTADO[n.estado];
                const Icon = cfg.icon;
                return (
                  <tr key={n.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold font-mono text-brand-900">{n.numero}</div>
                      <div className="text-gray-400">{n.fecha}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800 max-w-[180px] truncate">{n.cliente}</div>
                      <div className="text-gray-400 font-mono text-[11px]">{n.rif}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px]">{n.motivo}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{n.factura_origen}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">${n.monto_usd.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Eye className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{filtered.length} nota{filtered.length !== 1 ? 's' : ''}</span>
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
