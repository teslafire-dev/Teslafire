import React, { useState } from 'react';
import { RefreshCw, Plus, Building2, Eye, Edit2, TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface CuentaBancaria {
  id: number; nombre: string; banco: string; tipo: 'corriente' | 'ahorro' | 'divisa' | 'caja';
  moneda: 'VES' | 'USD' | 'EUR'; numero: string; saldo: number;
  ultimo_movimiento: string; activa: boolean; descripcion: string;
}

const mockData: CuentaBancaria[] = [
  { id:1, nombre:'Cuenta Principal Bs', banco:'Banesco', tipo:'corriente', moneda:'VES', numero:'0134-0001-11-1234567890', saldo:8420000, ultimo_movimiento:'2026-09-09', activa:true, descripcion:'Cuenta operativa principal' },
  { id:2, nombre:'Cuenta USD Operaciones', banco:'Mercantil', tipo:'divisa', moneda:'USD', numero:'MRL-USD-4421-001', saldo:45200, ultimo_movimiento:'2026-09-08', activa:true, descripcion:'Cuenta en dólares para importaciones' },
  { id:3, nombre:'Cuenta Nómina', banco:'Banco de Venezuela', tipo:'corriente', moneda:'VES', numero:'0102-0001-11-9876543210', saldo:1200000, ultimo_movimiento:'2026-09-05', activa:true, descripcion:'Pago de nómina mensual' },
  { id:4, nombre:'Caja Fuerte USD', banco:'Caja Interna', tipo:'caja', moneda:'USD', numero:'CAJA-USD-001', saldo:8500, ultimo_movimiento:'2026-09-07', activa:true, descripcion:'Efectivo en dólares en caja fuerte' },
  { id:5, nombre:'Cuenta Ahorro Reserva', banco:'Banesco', tipo:'ahorro', moneda:'VES', numero:'0134-0001-81-0011223344', saldo:500000, ultimo_movimiento:'2026-08-31', activa:false, descripcion:'Reserva para contingencias' },
];

const TIPO_COLOR: Record<string, string> = {
  corriente: 'bg-blue-50 text-blue-700',
  ahorro: 'bg-emerald-50 text-emerald-700',
  divisa: 'bg-amber-50 text-amber-700',
  caja: 'bg-purple-50 text-purple-700',
};

const MONEDA_ICON: Record<string, string> = { VES: 'Bs', USD: '$', EUR: '€' };

export default function BancosCuentas() {
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const totalUSD = mockData.filter(c => c.moneda === 'USD' && c.activa).reduce((s, c) => s + c.saldo, 0);
  const totalVES = mockData.filter(c => c.moneda === 'VES' && c.activa).reduce((s, c) => s + c.saldo, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Bancos</span><span>/</span><span className="text-electrico-600">Cuentas Bancarias</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Cuentas Bancarias</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cuentas corrientes en Bs, cuentas custodia en divisas y cajas fuertes.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Nueva cuenta en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Nueva Cuenta</span>
          </button>
        </div>
      </div>

      {/* Resumen Tesorería */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold uppercase mb-2">Disponible USD</div>
          <div className="text-3xl font-extrabold font-rajdhani text-emerald-700">${totalUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-400 mt-1">{mockData.filter(c => c.moneda === 'USD' && c.activa).length} cuentas activas</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold uppercase mb-2">Disponible Bs</div>
          <div className="text-3xl font-extrabold font-rajdhani text-brand-900">Bs {(totalVES / 1000).toFixed(0)}K</div>
          <div className="text-xs text-gray-400 mt-1">{mockData.filter(c => c.moneda === 'VES' && c.activa).length} cuentas activas</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold uppercase mb-2">Total Cuentas</div>
          <div className="text-3xl font-extrabold font-rajdhani text-gray-900">{mockData.length}</div>
          <div className="text-xs text-gray-400 mt-1">{mockData.filter(c => c.activa).length} activas · {mockData.filter(c => !c.activa).length} inactivas</div>
        </div>
      </div>

      {/* Cards de cuentas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockData.map(c => (
          <div key={c.id} className={`bg-white rounded-2xl border ${c.activa ? 'border-gray-100' : 'border-gray-100 opacity-60'} p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-brand-700" />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">{c.nombre}</div>
                  <div className="text-xs text-gray-400">{c.banco}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-blue-600"><Eye className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-amber-600"><Edit2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg capitalize ${TIPO_COLOR[c.tipo]}`}>{c.tipo}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.activa ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {c.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <div className="font-mono text-xs text-gray-400 mb-3 truncate">{c.numero}</div>

            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-400 mb-0.5">Saldo disponible</div>
              <div className="text-xl font-extrabold font-rajdhani text-brand-900">
                {MONEDA_ICON[c.moneda]} {c.saldo.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-400 text-center">Último mov.: {c.ultimo_movimiento}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
