import React from 'react';
import { RefreshCw, ShoppingCart, DollarSign, Users, Package, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const metricas = [
  { label: 'Ventas Hoy', value: '$4,820', icono: DollarSign, color: 'text-emerald-700', bg: 'from-emerald-500 to-emerald-600' },
  { label: 'Facturas Emitidas', value: '12', icono: ShoppingCart, color: 'text-blue-700', bg: 'from-blue-500 to-blue-600' },
  { label: 'Clientes Atendidos', value: '8', icono: Users, color: 'text-amber-700', bg: 'from-amber-500 to-amber-600' },
  { label: 'Despachos Hoy', value: '5', icono: Package, color: 'text-brand-700', bg: 'from-brand-800 to-brand-900' },
];

const ventasHora = [
  { hora: '08:00', ventas: 2, monto: 420 },
  { hora: '09:00', ventas: 3, monto: 980 },
  { hora: '10:00', ventas: 5, monto: 2100 },
  { hora: '11:00', ventas: 1, monto: 320 },
  { hora: '12:00', ventas: 0, monto: 0 },
  { hora: '13:00', ventas: 1, monto: 1000 },
];

const ultimaFacturas = [
  { numero: 'FF-002815', cliente: 'Inversiones Alfa & Omega', monto: 1800, hora: '10:45', estado: 'cobrada' },
  { numero: 'FF-002814', cliente: 'Ferretería El Martillo', monto: 420, hora: '10:12', estado: 'pendiente' },
  { numero: 'NE-00393', cliente: 'Constructora Oriente 2000', monto: 3200, hora: '09:30', estado: 'nota_entrega' },
  { numero: 'FF-002813', cliente: 'Consorcio Petrosa C.A.', monto: 5100, hora: '08:55', estado: 'cobrada' },
];

const maxMonto = Math.max(...ventasHora.map(v => v.monto));

export default function TableroDiario() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Analíticas</span><span>/</span><span className="text-electrico-600">Tablero Diario</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Tablero Diario</h1>
          <p className="text-sm text-gray-500 mt-0.5">Métricas en vivo del día — 9 de septiembre 2026.</p>
        </div>
        <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm self-start sm:self-auto"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metricas.map(m => {
          const Icon = m.icono;
          return (
            <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${m.bg} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-extrabold font-rajdhani text-gray-900">{m.value}</div>
              <div className="text-xs text-gray-400 font-semibold mt-0.5">{m.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Ventas por hora */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Ventas por Hora (Hoy)</h3>
          <div className="flex items-end gap-3 h-32">
            {ventasHora.map((v, i) => (
              <div key={v.hora} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] font-bold text-gray-500">{v.monto > 0 ? `$${(v.monto/1000).toFixed(1)}k` : ''}</div>
                <div className="w-full rounded-t-lg" style={{ height: `${maxMonto > 0 ? (v.monto / maxMonto) * 80 : 0}px`, background: v.monto > 0 ? 'var(--color-brand-900, #1a1a2e)' : '#f3f4f6', minHeight: '4px' }} />
                <div className="text-[10px] text-gray-400">{v.hora.replace(':00', 'h')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimas facturas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100"><h3 className="font-bold text-gray-800 text-sm">Últimas Facturas</h3></div>
          <div className="divide-y divide-gray-50">
            {ultimaFacturas.map(f => (
              <div key={f.numero} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-brand-900 text-xs">{f.numero}</div>
                    <div className="text-xs text-gray-600 max-w-[160px] truncate">{f.cliente}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800 text-xs">${f.monto.toLocaleString()}</div>
                    <div className="flex items-center gap-1 justify-end text-[11px] text-gray-400 mt-0.5"><Clock className="w-3 h-3" />{f.hora}</div>
                  </div>
                </div>
                <div className="mt-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    f.estado === 'cobrada' ? 'bg-emerald-50 text-emerald-700' :
                    f.estado === 'pendiente' ? 'bg-amber-50 text-amber-700' :
                    'bg-blue-50 text-blue-700'}`}>
                    {f.estado === 'cobrada' ? '✓ Cobrada' : f.estado === 'pendiente' ? '⏳ Pendiente' : '📄 Nota Entrega'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
