import React, { useState } from 'react';
import { RefreshCw, FileSpreadsheet, Filter, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface TopProducto {
  rank: number; codigo: string; descripcion: string; marca: string;
  unidades_vendidas: number; monto_usd: number; margen_pct: number;
  variacion_pct: number; categoria: string;
}

const mockData: TopProducto[] = [
  { rank:1, codigo:'EX-CO2-010', descripcion:'Extintor CO₂ 10 lb', marca:'Amerex', unidades_vendidas:142, monto_usd:11076, margen_pct:38, variacion_pct:12.4, categoria:'Extinción' },
  { rank:2, codigo:'EPP-CAS-001', descripcion:'Casco MSA V-Gard Blanco', marca:'MSA', unidades_vendidas:98, monto_usd:5096, margen_pct:41, variacion_pct:8.2, categoria:'EPP' },
  { rank:3, codigo:'EPP-ARN-001', descripcion:'Arnés de Seguridad 3M', marca:'3M', unidades_vendidas:54, monto_usd:4968, margen_pct:45, variacion_pct:-3.1, categoria:'EPP' },
  { rank:4, codigo:'EPP-GUA-003', descripcion:'Guantes Nitrilo L (100u)', marca:'3M', unidades_vendidas:380, monto_usd:4560, margen_pct:30, variacion_pct:22.5, categoria:'EPP' },
  { rank:5, codigo:'SEG-SEN-010', descripcion:'Señal "Área Restringida"', marca:'Pematech', unidades_vendidas:520, monto_usd:2340, margen_pct:52, variacion_pct:5.8, categoria:'Señalización' },
  { rank:6, codigo:'SEG-CON-090', descripcion:'Cono de Seguridad 90cm', marca:'Pematech', unidades_vendidas:185, monto_usd:1202, margen_pct:48, variacion_pct:-1.2, categoria:'Señalización' },
  { rank:7, codigo:'EPP-LEN-002', descripcion:'Lentes de Seguridad 3M Clear', marca:'3M', unidades_vendidas:290, monto_usd:1015, margen_pct:35, variacion_pct:19.8, categoria:'EPP' },
];

export default function TopProductos() {
  const [periodo, setPeriodo] = useState('mes');

  const maxMonto = Math.max(...mockData.map(p => p.monto_usd));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Analíticas</span><span>/</span><span className="text-electrico-600">Top Productos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Top Productos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ranking de productos más vendidos por monto, unidades y margen.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
        </div>
      </div>

      {/* Período */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {[{ key: 'dia', label: 'Hoy' }, { key: 'semana', label: 'Semana' }, { key: 'mes', label: 'Mes' }, { key: 'trimestre', label: 'Trimestre' }].map(p => (
            <button key={p.key} onClick={() => setPeriodo(p.key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${periodo === p.key ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-400">Sep 2026</div>
      </div>

      {/* Gráfico de barras horizontales */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-5">Ranking por Monto Vendido (USD)</h3>
        <div className="space-y-3">
          {mockData.map((p, i) => (
            <div key={p.codigo}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-brand-900 text-white text-[11px] font-extrabold flex items-center justify-center font-rajdhani flex-shrink-0">
                    {p.rank}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-800 text-xs truncate max-w-[200px]">{p.descripcion}</div>
                    <div className="text-[11px] text-gray-400">{p.marca} · {p.codigo}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <div className="font-bold text-gray-800 text-sm">${p.monto_usd.toLocaleString()}</div>
                  <div className={`text-[11px] font-bold flex items-center justify-end gap-0.5 ${p.variacion_pct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {p.variacion_pct >= 0 ? '+' : ''}{p.variacion_pct}%
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div className={`h-2 rounded-full transition-all ${i === 0 ? 'bg-electrico-500' : 'bg-brand-900'}`} style={{ width: `${(p.monto_usd / maxMonto) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla complementaria */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800 text-sm">Detalles del Ranking</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">#</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Producto</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Categoría</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Uds.</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Monto USD</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Margen</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Variación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockData.map(p => (
                <tr key={p.codigo} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-extrabold text-gray-400 font-rajdhani text-lg">#{p.rank}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-800 max-w-[180px] truncate">{p.descripcion}</div>
                    <div className="text-gray-400 font-mono text-[11px]">{p.codigo}</div>
                  </td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 font-semibold">{p.categoria}</span></td>
                  <td className="px-4 py-3 text-right font-bold text-gray-700">{p.unidades_vendidas}</td>
                  <td className="px-4 py-3 text-right font-bold text-brand-900">${p.monto_usd.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold">{p.margen_pct}%</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className={`flex items-center justify-end gap-1 font-bold ${p.variacion_pct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      <TrendingUp className={`w-3 h-3 ${p.variacion_pct < 0 ? 'rotate-180' : ''}`} />
                      {p.variacion_pct >= 0 ? '+' : ''}{p.variacion_pct}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
