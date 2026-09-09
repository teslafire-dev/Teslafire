import React, { useState } from 'react';
import { RefreshCw, FileSpreadsheet, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];
const ingresos = [42000, 48000, 51000, 38000, 55000, 60000, 58000, 65000, 48000];
const gastos   = [18000, 22000, 20000, 19000, 24000, 23000, 21000, 26000, 19000];

const categorias = [
  { nombre: 'Alquileres', monto: 800, moneda: 'USD', pct: 35 },
  { nombre: 'Nómina / RRHH', monto: 2800000, moneda: 'VES', pct: 55 },
  { nombre: 'Transporte / Combustible', monto: 85000, moneda: 'VES', pct: 15 },
  { nombre: 'Servicios Públicos', monto: 150000, moneda: 'VES', pct: 10 },
  { nombre: 'Mantenimiento', monto: 250, moneda: 'USD', pct: 8 },
];

const maxIngreso = Math.max(...ingresos);

export default function AdmonReportes() {
  const utilidad = ingresos.reduce((s, v) => s + v, 0) - gastos.reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Administración</span><span>/</span><span className="text-electrico-600">Reportes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Reportes Administrativos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Métricas de pérdidas, ganancias y gastos operativos.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Ingresos YTD', value: `$${(ingresos.reduce((s,v)=>s+v,0)/1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Gastos YTD', value: `$${(gastos.reduce((s,v)=>s+v,0)/1000).toFixed(0)}K`, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Utilidad Neta', value: `$${(utilidad/1000).toFixed(0)}K`, icon: DollarSign, color: 'text-brand-900', bg: 'bg-brand-50' },
          { label: 'Margen', value: `${((utilidad/ingresos.reduce((s,v)=>s+v,0))*100).toFixed(1)}%`, icon: BarChart3, color: 'text-blue-700', bg: 'bg-blue-50' },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className={`p-1.5 rounded-lg ${k.bg}`}><Icon className={`w-3.5 h-3.5 ${k.color}`} /></span>
                <div className="text-xs text-gray-400 font-semibold">{k.label}</div>
              </div>
              <div className={`text-2xl font-extrabold font-rajdhani ${k.color}`}>{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* Gráfico de barras P&G */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800">Ingresos vs Gastos 2026 (USD)</h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-electrico-500 inline-block" />Ingresos</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />Gastos</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {meses.map((mes, i) => (
            <div key={mes} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full flex items-end gap-0.5" style={{ height: '120px' }}>
                <div className="flex-1 bg-electrico-500 rounded-t-sm" style={{ height: `${(ingresos[i] / maxIngreso) * 100}%` }} />
                <div className="flex-1 bg-red-400 rounded-t-sm" style={{ height: `${(gastos[i] / maxIngreso) * 100}%` }} />
              </div>
              <div className="text-[10px] text-gray-400 font-semibold">{mes}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gastos por categoría */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Gastos por Categoría (Sep 2026)</h3>
        <div className="space-y-3">
          {categorias.map(c => (
            <div key={c.nombre}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-gray-700">{c.nombre}</div>
                <div className="text-xs font-bold text-gray-800">{c.moneda === 'USD' ? '$' : 'Bs '}{c.monto.toLocaleString()}</div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-brand-900 rounded-full transition-all" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
