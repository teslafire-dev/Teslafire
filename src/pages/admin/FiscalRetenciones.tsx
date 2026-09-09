import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Plus, Eye, ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface Retencion {
  id: number; numero: string; tipo: 'IVA' | 'ISLR'; proveedor_cliente: string; rif: string;
  fecha: string; factura_ref: string; base_imponible: number; porcentaje: number;
  monto_retenido: number; moneda: string;
}

const mockData: Retencion[] = [
  { id:1, numero:'RETEN-IVA-00088', tipo:'IVA', proveedor_cliente:'3M Venezuela', rif:'J-00304447-3', fecha:'2026-09-08', factura_ref:'FF-012345', base_imponible:6200, porcentaje:75, monto_retenido:969.75, moneda:'USD' },
  { id:2, numero:'RETEN-IVA-00087', tipo:'IVA', proveedor_cliente:'Distribuidora ProSeguridad', rif:'J-29876543-1', fecha:'2026-09-03', factura_ref:'FF-009871', base_imponible:3420, porcentaje:75, monto_retenido:534.82, moneda:'USD' },
  { id:3, numero:'RETEN-ISLR-00031', tipo:'ISLR', proveedor_cliente:'Ing. Consultor SAP C.A.', rif:'J-40099887-2', fecha:'2026-08-28', factura_ref:'FAC-001122', base_imponible:800, porcentaje:3, monto_retenido:24.00, moneda:'USD' },
  { id:4, numero:'RETEN-ISLR-00030', tipo:'ISLR', proveedor_cliente:'Consultores TIC Oriente', rif:'J-31234567-0', fecha:'2026-08-15', factura_ref:'FAC-000999', base_imponible:500, porcentaje:3, monto_retenido:15.00, moneda:'USD' },
];

const PER_PAGE = 10;

export default function FiscalRetenciones() {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || r.proveedor_cliente.toLowerCase().includes(q) || r.numero.toLowerCase().includes(q);
    const matchT = !tipoFilter || r.tipo === tipoFilter;
    return matchQ && matchT;
  });
  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Contabilidad</span><span>/</span><span className="text-electrico-600">Retenciones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Retenciones IVA / ISLR</h1>
          <p className="text-sm text-gray-500 mt-0.5">Emisión y comprobantes de retención fiscal (IVA 75% e ISLR).</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
          <button onClick={() => toast('Nueva retención en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Nueva Retención</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Total Retenciones</div>
          <div className="text-2xl font-extrabold font-rajdhani text-brand-900 mt-1">{mockData.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">IVA</div>
          <div className="text-2xl font-extrabold font-rajdhani text-blue-700 mt-1">{mockData.filter(r => r.tipo === 'IVA').length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">ISLR</div>
          <div className="text-2xl font-extrabold font-rajdhani text-purple-700 mt-1">{mockData.filter(r => r.tipo === 'ISLR').length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Monto Total</div>
          <div className="text-2xl font-extrabold font-rajdhani text-emerald-700 mt-1">${mockData.reduce((s, r) => s + r.monto_retenido, 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por Nº retención o proveedor..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
        <select value={tipoFilter} onChange={e => { setTipoFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none">
          <option value="">Todos</option>
          <option value="IVA">IVA</option>
          <option value="ISLR">ISLR</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Nº Retención</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Proveedor / Cliente</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Factura</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Base Imp.</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">%</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Retenido</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold font-mono text-brand-900">{r.numero}</div>
                    <div className="text-gray-400">{r.fecha}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${r.tipo === 'IVA' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{r.tipo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800 max-w-[180px] truncate">{r.proveedor_cliente}</div>
                    <div className="text-gray-400 font-mono text-[11px]">{r.rif}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-700">{r.factura_ref}</td>
                  <td className="px-4 py-3 text-right text-gray-700 font-bold">${r.base_imponible.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-700">{r.porcentaje}%</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">${r.monto_retenido.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toast.success('Comprobante generado')} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{filtered.length} retención{filtered.length !== 1 ? 'es' : ''}</span>
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
