import React from 'react';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const cuentas = [
  { nombre: 'Banesco Bs (Principal)', saldo: 8420000, moneda: 'VES', disponible: 7500000, reservado: 920000, tendencia: 'up' },
  { nombre: 'Mercantil USD', saldo: 45200, moneda: 'USD', disponible: 38000, reservado: 7200, tendencia: 'up' },
  { nombre: 'BDV Nómina', saldo: 1200000, moneda: 'VES', disponible: 1200000, reservado: 0, tendencia: 'down' },
  { nombre: 'Caja Fuerte USD', saldo: 8500, moneda: 'USD', disponible: 8500, reservado: 0, tendencia: 'stable' },
];

const compromisos = [
  { descripcion: 'Pago nómina quincena Sep-II', fecha: '2026-09-20', monto: 2800000, moneda: 'VES', tipo: 'egreso' },
  { descripcion: 'Pago OC-00024 – ProSeguridad', fecha: '2026-09-15', monto: 3420, moneda: 'USD', tipo: 'egreso' },
  { descripcion: 'Cobro Factura FF-002800 – Alfa & Omega', fecha: '2026-09-24', monto: 4800, moneda: 'USD', tipo: 'ingreso' },
  { descripcion: 'Pago alquiler local Caracas', fecha: '2026-09-25', monto: 800, moneda: 'USD', tipo: 'egreso' },
];

export default function BancosDisponibilidad() {
  const totalUSD = cuentas.filter(c => c.moneda === 'USD').reduce((s, c) => s + c.saldo, 0);
  const dispUSD = cuentas.filter(c => c.moneda === 'USD').reduce((s, c) => s + c.disponible, 0);
  const totalVES = cuentas.filter(c => c.moneda === 'VES').reduce((s, c) => s + c.saldo, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Bancos</span><span>/</span><span className="text-electrico-600">Disponibilidad de Saldos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Disponibilidad de Saldos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Flujo de caja y disponibilidad de saldo proyectada por cuenta.</p>
        </div>
        <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm self-start sm:self-auto"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* Resumen global */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-brand-900 to-brand-950 rounded-2xl p-5 text-white shadow-lg">
          <div className="text-xs text-electrico-300 font-bold uppercase mb-2">Disponible USD Total</div>
          <div className="text-3xl font-extrabold font-rajdhani text-electrico-400">${dispUSD.toLocaleString()}</div>
          <div className="text-xs text-white/60 mt-1">de ${totalUSD.toLocaleString()} total</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="text-xs text-gray-400 font-bold uppercase mb-2">Total Bs</div>
          <div className="text-3xl font-extrabold font-rajdhani text-brand-900">Bs {(totalVES / 1000000).toFixed(2)}M</div>
          <div className="text-xs text-gray-400 mt-1">{cuentas.filter(c => c.moneda === 'VES').length} cuentas en Bs</div>
        </div>
        <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4 text-amber-500" /><div className="text-xs text-amber-600 font-bold uppercase">Compromisos próximos</div></div>
          <div className="text-3xl font-extrabold font-rajdhani text-amber-600">{compromisos.filter(c => c.tipo === 'egreso').length}</div>
          <div className="text-xs text-gray-400 mt-1">pagos programados</div>
        </div>
      </div>

      {/* Detalle por cuenta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cuentas.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-gray-800 text-sm">{c.nombre}</div>
              {c.tendencia === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : c.tendencia === 'down' ? <TrendingDown className="w-4 h-4 text-red-500" /> : <DollarSign className="w-4 h-4 text-gray-400" />}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-[11px] text-gray-400 font-semibold">Saldo Total</div>
                <div className="font-extrabold text-gray-900 font-rajdhani text-lg">{c.moneda === 'USD' ? '$' : 'Bs '}{c.saldo.toLocaleString()}</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <div className="text-[11px] text-emerald-600 font-semibold">Disponible</div>
                <div className="font-extrabold text-emerald-700 font-rajdhani text-lg">{c.moneda === 'USD' ? '$' : 'Bs '}{c.disponible.toLocaleString()}</div>
              </div>
            </div>
            {c.reservado > 0 && (
              <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                {c.moneda === 'USD' ? '$' : 'Bs '}{c.reservado.toLocaleString()} reservado en compromisos
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Compromisos próximos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40">
          <h3 className="font-bold text-gray-800 text-sm">Compromisos Próximos (15 días)</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {compromisos.map((c, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50">
              <div>
                <div className="font-semibold text-gray-800 text-sm">{c.descripcion}</div>
                <div className="text-xs text-gray-400 mt-0.5">Vence: {c.fecha}</div>
              </div>
              <span className={`font-bold text-sm ${c.tipo === 'ingreso' ? 'text-emerald-700' : 'text-red-600'}`}>
                {c.tipo === 'ingreso' ? '+' : '-'}{c.moneda === 'USD' ? '$' : 'Bs '}{c.monto.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
