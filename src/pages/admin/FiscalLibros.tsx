import React, { useState } from 'react';
import { RefreshCw, Download, FileSpreadsheet, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface AsientoLibro {
  id: number; fecha: string; tipo: 'compra' | 'venta'; numero_doc: string;
  proveedor_cliente: string; rif: string; base: number; iva: number; total: number; moneda: string;
}

const mockVentas: AsientoLibro[] = [
  { id:1, fecha:'2026-09-09', tipo:'venta', numero_doc:'FF-002815', proveedor_cliente:'Inversiones Alfa & Omega C.A.', rif:'J-40123456-7', base:5000, iva:800, total:5800, moneda:'USD' },
  { id:2, fecha:'2026-09-08', tipo:'venta', numero_doc:'NE-00393', proveedor_cliente:'Constructora Oriente 2000', rif:'J-31987654-2', base:3200, iva:512, total:3712, moneda:'USD' },
  { id:3, fecha:'2026-09-07', tipo:'venta', numero_doc:'FF-002810', proveedor_cliente:'Servicios Industriales Norven', rif:'J-29111222-5', base:1200, iva:192, total:1392, moneda:'USD' },
];

const mockCompras: AsientoLibro[] = [
  { id:4, fecha:'2026-09-08', tipo:'compra', numero_doc:'FF-012345', proveedor_cliente:'3M Venezuela', rif:'J-00304447-3', base:6200, iva:992, total:7192, moneda:'USD' },
  { id:5, fecha:'2026-09-03', tipo:'compra', numero_doc:'FF-009871', proveedor_cliente:'Distribuidora ProSeguridad', rif:'J-29876543-1', base:3420, iva:547.2, total:3967.2, moneda:'USD' },
];

export default function FiscalLibros() {
  const [tab, setTab] = useState<'ventas' | 'compras'>('ventas');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const data = tab === 'ventas' ? mockVentas : mockCompras;
  const pages = Math.ceil(data.length / PER_PAGE) || 1;
  const paged = data.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalBase = data.reduce((s, r) => s + r.base, 0);
  const totalIva = data.reduce((s, r) => s + r.iva, 0);
  const totalTotal = data.reduce((s, r) => s + r.total, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Contabilidad</span><span>/</span><span className="text-electrico-600">Libros Compras/Ventas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Libros de Compras / Ventas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Libro oficial de ventas y compras según providencias del SENIAT.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando Excel...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
          <button onClick={() => toast.success('Libros exportados')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Download className="w-4 h-4 text-electrico-500" /><span>Exportar Libros</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => { setTab('ventas'); setPage(1); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'ventas' ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Libro de Ventas
        </button>
        <button onClick={() => { setTab('compras'); setPage(1); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'compras' ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Libro de Compras
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Fecha</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">N° Documento</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">{tab === 'ventas' ? 'Cliente' : 'Proveedor'}</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Base Imp.</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">IVA 16%</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-600">{r.fecha}</td>
                  <td className="px-4 py-3 font-mono font-bold text-brand-900">{r.numero_doc}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800 max-w-[200px] truncate">{r.proveedor_cliente}</div>
                    <div className="text-gray-400 font-mono text-[11px]">{r.rif}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-700">${r.base.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-amber-600">${r.iva.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-brand-900">${r.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td colSpan={3} className="px-4 py-3 font-bold text-gray-600">TOTALES</td>
                <td className="px-4 py-3 text-right font-bold text-gray-800">${totalBase.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold text-amber-600">${totalIva.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-extrabold text-brand-900">${totalTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{data.length} registro{data.length !== 1 ? 's' : ''}</span>
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
