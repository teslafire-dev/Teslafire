import React, { useState } from 'react';
import { RefreshCw, Plus, Edit2, Percent, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface LineaPrecios {
  id: number; nombre: string; descripcion: string;
  margen_base: number; igtf: number; aplica_igtf: boolean; aplica_iva: boolean;
  canal: string; activa: boolean; color: string;
}

const mockData: LineaPrecios[] = [
  { id:1, nombre:'Lista Dólar Efectivo', descripcion:'Precio en USD efectivo con IGTF', margen_base:30, igtf:3, aplica_igtf:true, aplica_iva:false, canal:'Detal', activa:true, color:'bg-emerald-50 border-emerald-200' },
  { id:2, nombre:'Lista Bolívar Transferencia', descripcion:'Precio en Bs. conversión BCV', margen_base:35, igtf:0, aplica_igtf:false, aplica_iva:true, canal:'Detal / Mayor', activa:true, color:'bg-blue-50 border-blue-200' },
  { id:3, nombre:'Lista Precio Mayor USD', descripcion:'Precios al mayor en USD', margen_base:20, igtf:0, aplica_igtf:false, aplica_iva:false, canal:'Mayor', activa:true, color:'bg-brand-50 border-brand-200' },
  { id:4, nombre:'Lista Corporativa', descripcion:'Precios especiales para clientes corporativos', margen_base:25, igtf:0, aplica_igtf:false, aplica_iva:true, canal:'Corporativo', activa:true, color:'bg-amber-50 border-amber-200' },
  { id:5, nombre:'Lista Instaladores', descripcion:'Precios con descuento para instaladores', margen_base:22, igtf:0, aplica_igtf:false, aplica_iva:true, canal:'Instalador', activa:true, color:'bg-purple-50 border-purple-200' },
];

export default function ConfigPrecios() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Configuración</span><span>/</span><span className="text-electrico-600">Lista de Precios</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Configuración de Precios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Márgenes de ganancia, IGTF e IVA por lista de precios y canal.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Nueva lista en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Nueva Lista</span>
          </button>
        </div>
      </div>

      {/* Info IGTF */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Percent className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-700">
          <strong>IGTF 3%</strong> — Impuesto a las Grandes Transacciones Financieras aplicable a pagos en divisas (USD/EUR) en efectivo o criptomonedas. Las transferencias en Bs no están gravadas.
        </div>
      </div>

      {/* Listas de precios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockData.map(lista => (
          <div key={lista.id} className={`bg-white rounded-2xl border-2 ${lista.color} p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-gray-800 text-sm">{lista.nombre}</div>
                <div className="text-xs text-gray-500 mt-0.5">{lista.descripcion}</div>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600 flex-shrink-0"><Edit2 className="w-3.5 h-3.5" /></button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{lista.canal}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lista.activa ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {lista.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-xl p-2.5">
                <div className="text-[10px] text-gray-400 font-semibold">Margen Base</div>
                <div className="font-extrabold text-brand-900 font-rajdhani">{lista.margen_base}%</div>
              </div>
              <div className={`${lista.aplica_iva ? 'bg-blue-50' : 'bg-gray-50'} rounded-xl p-2.5`}>
                <div className="text-[10px] text-gray-400 font-semibold">IVA 16%</div>
                <div className={`font-extrabold font-rajdhani ${lista.aplica_iva ? 'text-blue-700' : 'text-gray-400'}`}>
                  {lista.aplica_iva ? 'Sí' : 'No'}
                </div>
              </div>
              <div className={`${lista.aplica_igtf ? 'bg-amber-50' : 'bg-gray-50'} rounded-xl p-2.5`}>
                <div className="text-[10px] text-gray-400 font-semibold">IGTF</div>
                <div className={`font-extrabold font-rajdhani ${lista.aplica_igtf ? 'text-amber-700' : 'text-gray-400'}`}>
                  {lista.aplica_igtf ? `${lista.igtf}%` : 'No'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
