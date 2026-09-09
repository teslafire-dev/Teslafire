import React, { useState } from 'react';
import { RefreshCw, Plus, Edit2, Printer, Wifi, Settings, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Medio {
  id: number; nombre: string; tipo: 'impresora_fiscal' | 'impresora_ticket' | 'impresora_laser' | 'visor_cliente';
  modelo: string; ip: string; puerto: string; estado: 'conectado' | 'desconectado' | 'error';
  almacen: string; defecto: boolean;
}

const ESTADO: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  conectado:     { label: 'Conectado',     color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  desconectado:  { label: 'Desconectado',  color: 'bg-gray-100 text-gray-600', icon: XCircle },
  error:         { label: 'Error',         color: 'bg-red-50 text-red-700', icon: XCircle },
};

const TIPO_ICON: Record<string, React.ElementType> = {
  impresora_fiscal: Printer,
  impresora_ticket: Printer,
  impresora_laser: Printer,
  visor_cliente: Settings,
};

const mockData: Medio[] = [
  { id:1, nombre:'Fiscal Principal', tipo:'impresora_fiscal', modelo:'Bixolon SRP-350III', ip:'192.168.1.201', puerto:'9100', estado:'conectado', almacen:'Mostrador Principal', defecto:true },
  { id:2, nombre:'Ticket Almacén', tipo:'impresora_ticket', modelo:'Epson TM-T20III', ip:'192.168.1.202', puerto:'9100', estado:'conectado', almacen:'Almacén Principal', defecto:false },
  { id:3, nombre:'Laser Gerencia', tipo:'impresora_laser', modelo:'HP LaserJet Pro M404n', ip:'192.168.1.150', puerto:'515', estado:'desconectado', almacen:'Gerencia', defecto:false },
  { id:4, nombre:'Visor Cliente', tipo:'visor_cliente', modelo:'Posiflex PD-310', ip:'192.168.1.205', puerto:'COM3', estado:'conectado', almacen:'Mostrador Principal', defecto:false },
];

export default function ConfigMedios() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Configuración</span><span>/</span><span className="text-electrico-600">Medios de Emisión</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Medios de Emisión</h1>
          <p className="text-sm text-gray-500 mt-0.5">Impresoras fiscales, de tickets, láser y visores de cliente conectados al sistema.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Dispositivos escaneados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><Wifi className="w-4 h-4" /></button>
          <button onClick={() => toast('Nuevo medio en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Agregar Dispositivo</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-emerald-600" /><div className="text-xs text-gray-400 font-semibold">Conectados</div></div>
          <div className="text-2xl font-extrabold font-rajdhani text-emerald-700">{mockData.filter(m => m.estado === 'conectado').length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><XCircle className="w-4 h-4 text-gray-400" /><div className="text-xs text-gray-400 font-semibold">Desconectados</div></div>
          <div className="text-2xl font-extrabold font-rajdhani text-gray-500">{mockData.filter(m => m.estado === 'desconectado').length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Total Dispositivos</div>
          <div className="text-2xl font-extrabold font-rajdhani text-brand-900 mt-1">{mockData.length}</div>
        </div>
      </div>

      {/* Cards de dispositivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockData.map(d => {
          const cfg = ESTADO[d.estado];
          const StatusIcon = cfg.icon;
          const TypeIcon = TIPO_ICON[d.tipo];
          return (
            <div key={d.id} className={`bg-white rounded-2xl border ${d.estado === 'error' ? 'border-red-200' : 'border-gray-100'} p-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${d.estado === 'conectado' ? 'bg-emerald-50' : 'bg-gray-50'} flex items-center justify-center`}>
                    <TypeIcon className={`w-5 h-5 ${d.estado === 'conectado' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{d.nombre}</div>
                    <div className="text-xs text-gray-400">{d.modelo}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => toast.success(`Prueba de impresión enviada`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Printer className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <div className="text-[10px] text-gray-400 font-semibold">IP / Puerto</div>
                  <div className="font-mono font-bold text-gray-800">{d.ip}:{d.puerto}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <div className="text-[10px] text-gray-400 font-semibold">Almacén</div>
                  <div className="font-semibold text-gray-800">{d.almacen}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${cfg.color}`}>
                  <StatusIcon className="w-3 h-3" />{cfg.label}
                </span>
                {d.defecto && <span className="text-[10px] font-bold bg-brand-50 text-brand-900 px-2 py-0.5 rounded-full">Por defecto</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
