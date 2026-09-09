import React, { useState } from 'react';
import { RefreshCw, Download, Calendar, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const periodos = [
  { mes: 'Agosto 2026 (2ª quincena)', desde: '2026-08-16', hasta: '2026-08-31', facturas_venta: 42, facturas_compra: 18, iva_debito: 8940, iva_credito: 3210, estado: 'generado' },
  { mes: 'Agosto 2026 (1ª quincena)', desde: '2026-08-01', hasta: '2026-08-15', facturas_venta: 38, facturas_compra: 22, iva_debito: 7600, iva_credito: 4180, estado: 'generado' },
  { mes: 'Julio 2026 (2ª quincena)', desde: '2026-07-16', hasta: '2026-07-31', facturas_venta: 51, facturas_compra: 14, iva_debito: 10200, iva_credito: 2800, estado: 'declarado' },
  { mes: 'Julio 2026 (1ª quincena)', desde: '2026-07-01', hasta: '2026-07-15', facturas_venta: 45, facturas_compra: 19, iva_debito: 9100, iva_credito: 3500, estado: 'declarado' },
];

export default function FiscalTxtIva() {
  const [periodoSel, setPeriodoSel] = useState(0);
  const p = periodos[periodoSel];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Contabilidad</span><span>/</span><span className="text-electrico-600">Reporte TXT IVA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Reporte TXT IVA (SENIAT)</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generador de archivos TXT para la declaración quincenal del SENIAT.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast.success('TXT generado correctamente')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Download className="w-4 h-4 text-electrico-500" /><span>Generar TXT</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Lista de períodos */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-bold uppercase text-gray-400 px-1 mb-3">Períodos</div>
          {periodos.map((per, i) => (
            <button key={i} onClick={() => setPeriodoSel(i)} className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${periodoSel === i ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <div className="font-bold text-gray-800 text-xs leading-snug">{per.mes}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${per.estado === 'declarado' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {per.estado === 'declarado' ? '✓ Declarado' : '⏳ Pendiente'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Detalle del período seleccionado */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-gray-800">{p.mes}</div>
                <div className="text-xs text-gray-400 mt-0.5">{p.desde} al {p.hasta}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.estado === 'declarado' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {p.estado === 'declarado' ? <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Declarado</span> : <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Pendiente</span>}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400 font-semibold">Fact. Venta</div>
                <div className="text-xl font-extrabold font-rajdhani text-brand-900">{p.facturas_venta}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400 font-semibold">Fact. Compra</div>
                <div className="text-xl font-extrabold font-rajdhani text-brand-900">{p.facturas_compra}</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <div className="text-xs text-emerald-600 font-semibold">IVA Débito</div>
                <div className="text-xl font-extrabold font-rajdhani text-emerald-700">${p.iva_debito.toLocaleString()}</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <div className="text-xs text-red-500 font-semibold">IVA Crédito</div>
                <div className="text-xl font-extrabold font-rajdhani text-red-600">${p.iva_credito.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4 bg-brand-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-brand-600 font-bold uppercase">IVA a Pagar</div>
                <div className="text-2xl font-extrabold font-rajdhani text-brand-900">${(p.iva_debito - p.iva_credito).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toast.success('TXT de Ventas generado')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-900 text-white text-xs font-bold hover:bg-brand-950">
                  <Download className="w-3.5 h-3.5 text-electrico-500" /><span>TXT Ventas</span>
                </button>
                <button onClick={() => toast.success('TXT de Compras generado')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-200 text-brand-900 text-xs font-bold hover:bg-brand-50">
                  <Download className="w-3.5 h-3.5" /><span>TXT Compras</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
