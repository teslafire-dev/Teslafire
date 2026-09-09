import React, { useState } from 'react';
import { RefreshCw, Plus, Edit2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface Moneda {
  id: number; codigo: string; nombre: string; simbolo: string;
  tasa_oficial: number; tasa_paralelo: number; fecha_actualizacion: string;
  activa: boolean; es_base: boolean;
}

const mockData: Moneda[] = [
  { id:1, codigo:'VES', nombre:'Bolívar Venezolano', simbolo:'Bs.', tasa_oficial:36.50, tasa_paralelo:37.20, fecha_actualizacion:'2026-09-09', activa:true, es_base:true },
  { id:2, codigo:'USD', nombre:'Dólar Americano', simbolo:'$', tasa_oficial:1, tasa_paralelo:1, fecha_actualizacion:'2026-09-09', activa:true, es_base:false },
  { id:3, codigo:'EUR', nombre:'Euro', simbolo:'€', tasa_oficial:1.09, tasa_paralelo:1.10, fecha_actualizacion:'2026-09-08', activa:false, es_base:false },
  { id:4, codigo:'COP', nombre:'Peso Colombiano', simbolo:'$', tasa_oficial:0.00026, tasa_paralelo:0.00026, fecha_actualizacion:'2026-09-07', activa:false, es_base:false },
];

export default function ConfigMonedas() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Configuración</span><span>/</span><span className="text-electrico-600">Monedas y Tasas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Monedas y Tasas BCV</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configuración de monedas, tasa BCV oficial y tasa paralelo para el sistema.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Tasas sincronizadas con BCV')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Nueva moneda en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Nueva Moneda</span>
          </button>
        </div>
      </div>

      {/* Tasa del día */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-950 rounded-2xl p-5 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-electrico-300 font-bold uppercase mb-1">Tasa BCV Oficial — Hoy 09/09/2026</div>
            <div className="text-4xl font-extrabold font-rajdhani text-electrico-400">Bs. 36,50</div>
            <div className="text-sm text-white/60 mt-1">por USD 1.00</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60 mb-1">Tasa Paralelo</div>
            <div className="text-2xl font-extrabold font-rajdhani text-white">Bs. 37,20</div>
            <div className="flex items-center justify-end gap-1 mt-1 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" /><span>+0.8% vs ayer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de monedas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockData.map(m => (
          <div key={m.id} className={`bg-white rounded-2xl border ${m.activa ? 'border-gray-100' : 'border-gray-100 opacity-60'} p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center font-extrabold text-brand-900 font-mono text-sm">
                  {m.simbolo}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{m.nombre}</div>
                  <div className="text-xs font-mono text-gray-400">{m.codigo}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {m.es_base && <span className="text-[10px] font-bold bg-electrico-50 text-electrico-700 px-2 py-0.5 rounded-full">Base</span>}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.activa ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {m.activa ? 'Activa' : 'Inactiva'}
                </span>
                <button className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600"><Edit2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-[11px] text-gray-400 font-semibold">Tasa Oficial (BCV)</div>
                <div className="font-extrabold text-gray-900 font-rajdhani">{m.tasa_oficial === 1 ? 'Moneda base' : `Bs. ${m.tasa_oficial.toFixed(2)}`}</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <div className="text-[11px] text-amber-600 font-semibold">Tasa Paralelo</div>
                <div className="font-extrabold text-amber-700 font-rajdhani">{m.tasa_paralelo === 1 ? '—' : `Bs. ${m.tasa_paralelo.toFixed(2)}`}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">Actualizada: {m.fecha_actualizacion}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
