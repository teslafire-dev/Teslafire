import React from 'react';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Users, Package, ShoppingCart, BarChart3, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];
const ventasData = [42, 48, 51, 38, 55, 60, 58, 65, 48];
const maxVenta = Math.max(...ventasData);

const kpis = [
  { label: 'Ventas del Mes', value: '$48,200', sub: '+8.3% vs mes anterior', trend: 'up', icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { label: 'Clientes Activos', value: '142', sub: '+5 nuevos este mes', trend: 'up', icon: Users, color: 'text-blue-700', bg: 'bg-blue-50' },
  { label: 'Órdenes Pendientes', value: '8', sub: '3 en tránsito', trend: 'neutral', icon: ShoppingCart, color: 'text-amber-700', bg: 'bg-amber-50' },
  { label: 'Productos en Stock', value: '1,248', sub: '12 con stock crítico', trend: 'down', icon: Package, color: 'text-brand-900', bg: 'bg-brand-50' },
];

const topClientes = [
  { nombre: 'Consorcio Petrosa C.A.', monto: 34000, pct: 70 },
  { nombre: 'Constructora Oriente 2000', monto: 22400, pct: 45 },
  { nombre: 'Inversiones Alfa & Omega', monto: 18800, pct: 38 },
  { nombre: 'Servicios Industriales Norven', monto: 9600, pct: 20 },
];

const topProductos = [
  { nombre: 'Extintor CO₂ 10 lb', codigo: 'EX-CO2-010', vendidos: 85, monto: 4122 },
  { nombre: 'Casco MSA V-Gard', codigo: 'EPP-CAS-001', vendidos: 42, monto: 1344 },
  { nombre: 'Arnés de Seguridad 3M', codigo: 'EPP-ARN-001', vendidos: 29, monto: 2668 },
  { nombre: 'Guantes Nitrilo L', codigo: 'EPP-GUA-003', vendidos: 120, monto: 504 },
];

export default function InformeGerencial() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Analíticas</span><span>/</span><span className="text-electrico-600">Informe Gerencial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Informe Gerencial</h1>
          <p className="text-sm text-gray-500 mt-0.5">Dashboard ejecutivo con KPIs de ventas, inventario y cartera.</p>
        </div>
        <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm self-start sm:self-auto"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className={`p-2 rounded-xl ${k.bg}`}><Icon className={`w-4 h-4 ${k.color}`} /></span>
                {k.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : k.trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-500" /> : null}
              </div>
              <div className={`text-2xl font-extrabold font-rajdhani ${k.color}`}>{k.value}</div>
              <div className="text-xs text-gray-400 font-semibold mt-0.5">{k.label}</div>
              <div className="text-[11px] text-gray-400 mt-1">{k.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico ventas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800">Ventas 2026 (MUSD)</h3>
            <span className="text-xs text-gray-400">Ene – Sep</span>
          </div>
          <div className="flex items-end gap-2 h-36">
            {meses.map((mes, i) => (
              <div key={mes} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg transition-all" style={{ height: `${(ventasData[i] / maxVenta) * 100}%`, background: i === 8 ? 'var(--color-electrico-500, #e2fb5c)' : '#1a1a2e', minHeight: '4px' }} />
                <div className="text-[10px] text-gray-400 font-semibold">{mes}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top clientes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Top Clientes (Sep)</h3>
          <div className="space-y-3">
            {topClientes.map((c, i) => (
              <div key={c.nombre}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">{c.nombre}</div>
                  <div className="text-xs font-bold text-gray-800">${c.monto.toLocaleString()}</div>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 rounded-full bg-brand-900" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top productos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Top Productos Vendidos (Sep 2026)</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">#</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Producto</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Uds. Vendidas</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Monto USD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topProductos.map((p, i) => (
                <tr key={p.codigo} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-extrabold text-gray-400 font-rajdhani text-lg">#{i+1}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-800">{p.nombre}</div>
                    <div className="text-gray-400 font-mono text-[11px]">{p.codigo}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-brand-900">{p.vendidos}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">${p.monto.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
