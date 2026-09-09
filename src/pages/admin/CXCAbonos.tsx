import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Eye, ChevronLeft, ChevronRight, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface HistorialCobro {
  id: number; numero_recibo: string; cliente: string; rif: string;
  factura_ref: string; fecha: string; monto_usd: number;
  metodo: string; banco: string; referencia: string; usuario: string;
}

const mockData: HistorialCobro[] = [
  { id:1, numero_recibo:'REC-00142', cliente:'Servicios Industriales Norven', rif:'J-29111222-5', factura_ref:'FF-002810', fecha:'2026-09-07', monto_usd:1200, metodo:'Pago Móvil', banco:'Banco de Venezuela', referencia:'MOV-992211', usuario:'A. González' },
  { id:2, numero_recibo:'REC-00141', cliente:'Inversiones Alfa & Omega C.A.', rif:'J-40123456-7', factura_ref:'FF-002790', fecha:'2026-09-05', monto_usd:3800, metodo:'Transferencia', banco:'Banesco USD', referencia:'TRF-110045', usuario:'M. Pérez' },
  { id:3, numero_recibo:'REC-00140', cliente:'Constructora Oriente 2000 C.A.', rif:'J-31987654-2', factura_ref:'FF-002775', fecha:'2026-09-03', monto_usd:3000, metodo:'Transferencia', banco:'Mercantil', referencia:'TRF-009881', usuario:'A. González' },
  { id:4, numero_recibo:'REC-00139', cliente:'Consorcio Petrosa C.A.', rif:'J-40234567-8', factura_ref:'FF-002760', fecha:'2026-08-28', monto_usd:12000, metodo:'Cheque', banco:'Banesco', referencia:'CHK-00445', usuario:'J. Rodríguez' },
  { id:5, numero_recibo:'REC-00138', cliente:'Ferretería El Martillo C.A.', rif:'J-20456789-3', factura_ref:'FF-002740', fecha:'2026-08-20', monto_usd:900, metodo:'Efectivo USD', banco:'Caja', referencia:'EFT-0088', usuario:'M. Pérez' },
];

const PER_PAGE = 10;

export default function CXCAbonos() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(h => {
    const q = search.toLowerCase();
    return !q || h.cliente.toLowerCase().includes(q) || h.numero_recibo.toLowerCase().includes(q) || h.referencia.toLowerCase().includes(q);
  });
  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalCobrado = mockData.reduce((s, h) => s + h.monto_usd, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>CXC</span><span>/</span><span className="text-electrico-600">Historial de Cobros</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Historial de Cobros</h1>
          <p className="text-sm text-gray-500 mt-0.5">Historial de recibos y abonos recibidos de clientes.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm sm:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-electrico-600" />
            <div className="text-xs text-gray-400 font-semibold uppercase">Total Cobrado (período)</div>
          </div>
          <div className="text-2xl font-extrabold font-rajdhani text-emerald-700">${totalCobrado.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold uppercase">Recibos emitidos</div>
          <div className="text-2xl font-extrabold font-rajdhani text-brand-900 mt-1">{mockData.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold uppercase">Promedio por cobro</div>
          <div className="text-2xl font-extrabold font-rajdhani text-gray-700 mt-1">${(totalCobrado / mockData.length).toFixed(0)}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar cliente, recibo o referencia..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200"><Calendar className="w-3.5 h-3.5 text-gray-400" /><span>Rango</span></button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Nº Recibo</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Factura</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Fecha</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Monto</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Método / Ref.</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Usuario</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(h => (
                <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold font-mono text-brand-900">{h.numero_recibo}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800 max-w-[180px] truncate">{h.cliente}</div>
                    <div className="text-gray-400 font-mono text-[11px]">{h.rif}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-700">{h.factura_ref}</td>
                  <td className="px-4 py-3 text-gray-600">{h.fecha}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">${h.monto_usd.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700 font-semibold">{h.metodo}</div>
                    <div className="text-gray-400 font-mono text-[11px]">{h.referencia} · {h.banco}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{h.usuario}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Eye className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{filtered.length} recibo{filtered.length !== 1 ? 's' : ''}</span>
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
