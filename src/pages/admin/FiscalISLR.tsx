import React, { useState } from 'react';
import { RefreshCw, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface ComprobanteISLR {
  id: number; numero: string; proveedor: string; rif: string;
  mes: string; monto_pagado: number; alicuota: number; retencion: number; tipo: string;
}

const mockData: ComprobanteISLR[] = [
  { id:1, numero:'ARC-00055', proveedor:'Ing. Consultor SAP C.A.', rif:'J-40099887-2', mes:'Agosto 2026', monto_pagado:800, alicuota:3, retencion:24, tipo:'Honorarios Profesionales' },
  { id:2, numero:'ARC-00054', proveedor:'Consultores TIC Oriente', rif:'J-31234567-0', mes:'Agosto 2026', monto_pagado:500, alicuota:3, retencion:15, tipo:'Honorarios Profesionales' },
  { id:3, numero:'ARC-00053', proveedor:'Servicios Generales Bolívar', rif:'J-29000001-1', mes:'Julio 2026', monto_pagado:1200, alicuota:2, retencion:24, tipo:'Servicios Generales' },
  { id:4, numero:'ARC-00052', proveedor:'Mantenimiento Industrial C.A.', rif:'J-30111222-3', mes:'Julio 2026', monto_pagado:3500, alicuota:2, retencion:70, tipo:'Servicios Generales' },
];

const PER_PAGE = 10;

export default function FiscalISLR() {
  const [page, setPage] = useState(1);
  const pages = Math.ceil(mockData.length / PER_PAGE) || 1;
  const paged = mockData.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalRetencion = mockData.reduce((s, r) => s + r.retencion, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Contabilidad</span><span>/</span><span className="text-electrico-600">Reporte ISLR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Reporte ISLR</h1>
          <p className="text-sm text-gray-500 mt-0.5">Comprobantes AR-C y archivo XML/TXT oficial de ISLR.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast.success('XML exportado')} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileText className="w-4 h-4 text-blue-600" /><span>XML</span>
          </button>
          <button onClick={() => toast.success('Reporte ISLR exportado')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Download className="w-4 h-4 text-electrico-500" /><span>Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Comprobantes AR-C</div>
          <div className="text-2xl font-extrabold font-rajdhani text-brand-900 mt-1">{mockData.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Total Retenido</div>
          <div className="text-2xl font-extrabold font-rajdhani text-red-600 mt-1">${totalRetencion.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Base Imponible</div>
          <div className="text-2xl font-extrabold font-rajdhani text-gray-800 mt-1">${mockData.reduce((s, r) => s + r.monto_pagado, 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Nº AR-C</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Proveedor</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Período</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Monto Pagado</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">%</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Retención</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold font-mono text-brand-900">{r.numero}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">{r.proveedor}</div>
                    <div className="text-gray-400 font-mono text-[11px]">{r.rif}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.tipo}</td>
                  <td className="px-4 py-3 text-gray-600">{r.mes}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">${r.monto_pagado.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-700">{r.alicuota}%</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">${r.retencion.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toast.success('Comprobante AR-C generado')} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{mockData.length} comprobantes</span>
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
