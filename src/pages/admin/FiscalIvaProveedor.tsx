import React, { useState } from 'react';
import { RefreshCw, Download, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface IvaProveedor {
  id: number; proveedor: string; rif: string; factura: string;
  fecha: string; base_imponible: number; alicuota: number; iva_credito: number; moneda: string;
}

const mockData: IvaProveedor[] = [
  { id:1, proveedor:'3M Venezuela', rif:'J-00304447-3', factura:'FF-012345', fecha:'2026-09-08', base_imponible:6200, alicuota:16, iva_credito:992, moneda:'USD' },
  { id:2, proveedor:'Distribuidora ProSeguridad C.A.', rif:'J-29876543-1', factura:'FF-009871', fecha:'2026-09-03', base_imponible:3420, alicuota:16, iva_credito:547.2, moneda:'USD' },
  { id:3, proveedor:'EPP Total C.A.', rif:'J-40012233-5', factura:'FF-004432', fecha:'2026-09-01', base_imponible:540, alicuota:16, iva_credito:86.4, moneda:'VES' },
  { id:4, proveedor:'Importaciones SafeGuard S.A.', rif:'J-31045678-9', factura:'CD-00038', fecha:'2026-09-05', base_imponible:1875.5, alicuota:16, iva_credito:300.08, moneda:'USD' },
];

const PER_PAGE = 10;

export default function FiscalIvaProveedor() {
  const [page, setPage] = useState(1);
  const pages = Math.ceil(mockData.length / PER_PAGE) || 1;
  const paged = mockData.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalCredito = mockData.reduce((s, r) => s + r.iva_credito, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Contabilidad</span><span>/</span><span className="text-electrico-600">Reporte IVA Proveedor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Reporte IVA Proveedor</h1>
          <p className="text-sm text-gray-500 mt-0.5">Relación de créditos fiscales de compras a proveedores.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Facturas de Compra</div>
          <div className="text-2xl font-extrabold font-rajdhani text-brand-900 mt-1">{mockData.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Base Imponible</div>
          <div className="text-2xl font-extrabold font-rajdhani text-gray-800 mt-1">${mockData.reduce((s, r) => s + r.base_imponible, 0).toFixed(0)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm">
          <div className="text-xs text-emerald-500 font-semibold">Total Crédito Fiscal</div>
          <div className="text-2xl font-extrabold font-rajdhani text-emerald-700 mt-1">${totalCredito.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Proveedor</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Factura</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Fecha</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Base Imp.</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Alícuota</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Crédito Fiscal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800 max-w-[200px] truncate">{r.proveedor}</div>
                    <div className="text-gray-400 font-mono text-[11px]">{r.rif}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-brand-900 font-bold">{r.factura}</td>
                  <td className="px-4 py-3 text-gray-600">{r.fecha}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">{r.moneda === 'USD' ? '$' : 'Bs '}{r.base_imponible.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-700">{r.alicuota}%</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">{r.moneda === 'USD' ? '$' : 'Bs '}{r.iva_credito.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50/60">
                <td colSpan={5} className="px-4 py-3 font-bold text-gray-600 text-right">TOTAL CRÉDITO FISCAL:</td>
                <td className="px-4 py-3 text-right font-extrabold text-emerald-700 text-sm">${totalCredito.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{mockData.length} facturas</span>
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
