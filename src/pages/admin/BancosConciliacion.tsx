import React, { useState } from 'react';
import { RefreshCw, FileSpreadsheet, CheckCircle, AlertTriangle, Clock, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface MovConciliacion {
  id: number; fecha: string; descripcion: string; referencia: string;
  monto: number; moneda: string; en_sistema: boolean; en_banco: boolean; conciliado: boolean;
}

const mockData: MovConciliacion[] = [
  { id:1, fecha:'2026-09-09', descripcion:'Cobro FF-002810 – Norven', referencia:'MOV-992211', monto:1200, moneda:'USD', en_sistema:true, en_banco:true, conciliado:true },
  { id:2, fecha:'2026-09-08', descripcion:'Pago OC-00022 – 3M Venezuela', referencia:'TRF-PROV-881', monto:6200, moneda:'USD', en_sistema:true, en_banco:true, conciliado:true },
  { id:3, fecha:'2026-09-08', descripcion:'Comisión bancaria mensual', referencia:'COM-SEP-001', monto:25, moneda:'USD', en_sistema:false, en_banco:true, conciliado:false },
  { id:4, fecha:'2026-09-07', descripcion:'Cobro FF-002790 – Alfa & Omega', referencia:'TRF-110045', monto:3800, moneda:'USD', en_sistema:true, en_banco:false, conciliado:false },
  { id:5, fecha:'2026-09-05', descripcion:'Transferencia interna Bs→USD', referencia:'INT-2026-001', monto:500, moneda:'USD', en_sistema:true, en_banco:true, conciliado:true },
];

export default function BancosConciliacion() {
  const [page, setPage] = useState(1);
  const [showPendientes, setShowPendientes] = useState(false);
  const PER_PAGE = 10;

  const filtered = showPendientes ? mockData.filter(m => !m.conciliado) : mockData;
  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const pendientes = mockData.filter(m => !m.conciliado).length;
  const conciliados = mockData.filter(m => m.conciliado).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Bancos</span><span>/</span><span className="text-electrico-600">Conciliación Bancaria</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Revisión</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Conciliación Bancaria</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cotejo de extractos bancarios contra transacciones registradas en el sistema.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
          <button onClick={() => toast.success('Conciliación iniciada')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <CheckCircle className="w-4 h-4 text-electrico-500" /><span>Iniciar Conciliación</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-emerald-600" /><div className="text-xs text-gray-400 font-semibold">Conciliados</div></div>
          <div className="text-2xl font-extrabold font-rajdhani text-emerald-700">{conciliados}</div>
        </div>
        <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-amber-500" /><div className="text-xs text-gray-400 font-semibold">Pendientes</div></div>
          <div className="text-2xl font-extrabold font-rajdhani text-amber-600">{pendientes}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-gray-400" /><div className="text-xs text-gray-400 font-semibold">Total</div></div>
          <div className="text-2xl font-extrabold font-rajdhani text-gray-800">{mockData.length}</div>
        </div>
      </div>

      {/* Filtro rápido */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showPendientes} onChange={e => setShowPendientes(e.target.checked)} className="rounded text-brand-600" />
          <span className="text-xs font-semibold text-gray-600">Solo pendientes por conciliar ({pendientes})</span>
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Fecha</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Descripción</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Referencia</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Monto</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">En Sistema</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">En Banco</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Estado</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(m => (
                <tr key={m.id} className={`hover:bg-gray-50/50 transition-colors ${!m.conciliado ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-4 py-3 text-gray-600">{m.fecha}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 max-w-[200px] truncate">{m.descripcion}</td>
                  <td className="px-4 py-3 font-mono text-gray-500 text-[11px]">{m.referencia}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">${m.monto.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    {m.en_sistema ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {m.en_banco ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${m.conciliado ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {m.conciliado ? 'Conciliado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!m.conciliado && (
                      <button onClick={() => toast.success('Movimiento conciliado')} className="px-2.5 py-1 rounded-lg bg-brand-900 text-white text-[11px] font-bold hover:bg-brand-950">
                        Conciliar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{filtered.length} movimiento{filtered.length !== 1 ? 's' : ''}</span>
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
