import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Plus, Eye, ChevronLeft, ChevronRight, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Cobro {
  id: number; numero: string; cliente: string; rif: string;
  factura_ref: string; fecha_factura: string; fecha_vencimiento: string;
  monto_usd: number; abonado: number; saldo: number;
  metodo_pago: string; banco: string; referencia: string;
  estado: 'pendiente' | 'cobrado' | 'parcial' | 'vencido';
}

const ESTADO: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendiente: { label: 'Pendiente', color: 'bg-gray-100 text-gray-600', icon: Clock },
  cobrado:   { label: 'Cobrado',   color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  parcial:   { label: 'Parcial',   color: 'bg-blue-50 text-blue-700', icon: DollarSign },
  vencido:   { label: 'Vencido',   color: 'bg-red-50 text-red-700', icon: AlertTriangle },
};

const mockData: Cobro[] = [
  { id:1, numero:'COB-00088', cliente:'Inversiones Alfa & Omega C.A.', rif:'J-40123456-7', factura_ref:'FF-002800', fecha_factura:'2026-08-25', fecha_vencimiento:'2026-09-24', monto_usd:4800, abonado:0, saldo:4800, metodo_pago:'', banco:'', referencia:'', estado:'pendiente' },
  { id:2, numero:'COB-00087', cliente:'Constructora Oriente 2000', rif:'J-31987654-2', factura_ref:'FF-002775', fecha_factura:'2026-08-05', fecha_vencimiento:'2026-09-04', monto_usd:8000, abonado:3000, saldo:5000, metodo_pago:'Transferencia', banco:'Banesco', referencia:'TRF-001234', estado:'parcial' },
  { id:3, numero:'COB-00085', cliente:'Ferretería El Martillo', rif:'J-20456789-3', factura_ref:'FF-002755', fecha_factura:'2026-07-10', fecha_vencimiento:'2026-07-25', monto_usd:1200, abonado:0, saldo:1200, metodo_pago:'', banco:'', referencia:'', estado:'vencido' },
  { id:4, numero:'COB-00082', cliente:'Servicios Industriales Norven', rif:'J-29111222-5', factura_ref:'FF-002810', fecha_factura:'2026-09-01', fecha_vencimiento:'2026-09-16', monto_usd:1200, abonado:1200, saldo:0, metodo_pago:'Pago Móvil', banco:'Venezuela', referencia:'MOV-992211', estado:'cobrado' },
];

const PER_PAGE = 10;

export default function CXCCobros() {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.cliente.toLowerCase().includes(q) || c.factura_ref.toLowerCase().includes(q);
    const matchE = !estadoFilter || c.estado === estadoFilter;
    return matchQ && matchE;
  });
  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>CXC</span><span>/</span><span className="text-electrico-600">Cobros</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Cobros</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registro de cobranzas de facturas a crédito.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
          <button onClick={() => toast('Registrar cobro en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Registrar Cobro</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(ESTADO).map(([k, v]) => {
          const count = mockData.filter(c => c.estado === k).length;
          const Icon = v.icon;
          return (
            <div key={k} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className={`p-1 rounded-lg ${v.color}`}><Icon className="w-3.5 h-3.5" /></span>
                <div className="text-xs text-gray-400 font-semibold">{v.label}</div>
              </div>
              <div className="text-xl font-extrabold font-rajdhani text-gray-900">{count}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar cliente o factura..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
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
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Cliente / Factura</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Vencimiento</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Monto</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Abonado</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Saldo</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Pago</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Estado</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(c => {
                const cfg = ESTADO[c.estado];
                const Icon = cfg.icon;
                return (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800 max-w-[180px] truncate">{c.cliente}</div>
                      <div className="text-gray-400 font-mono text-[11px]">{c.factura_ref} · {c.rif}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.fecha_vencimiento}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">${c.monto_usd.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-bold">${c.abonado.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${c.saldo > 0 ? 'text-red-600' : 'text-emerald-600'}`}>${c.saldo.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.metodo_pago ? <div>{c.metodo_pago} - {c.banco}</div> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Eye className="w-3.5 h-3.5" /></button>
                        {c.estado !== 'cobrado' && (
                          <button onClick={() => toast.success(`Cobro registrado`)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600"><DollarSign className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
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
