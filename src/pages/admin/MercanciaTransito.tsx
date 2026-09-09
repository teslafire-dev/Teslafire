import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Filter, Calendar, ChevronLeft, ChevronRight, Truck, MapPin, Package, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Transito {
  id: number; numero_oc: string; proveedor: string; origen: string; destino: string;
  fecha_despacho: string; fecha_eta: string; bultos: number; peso_kg: number;
  total_usd: number; transportista: string; guia: string;
  estado: 'en_ruta' | 'aduanas' | 'entregado' | 'demorado';
  observacion?: string;
}

const ESTADO: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  en_ruta:   { label: 'En Ruta',     color: 'bg-blue-50 text-blue-700',    icon: Truck },
  aduanas:   { label: 'En Aduanas',  color: 'bg-amber-50 text-amber-700',  icon: Clock },
  entregado: { label: 'Entregado',   color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  demorado:  { label: 'Demorado',    color: 'bg-red-50 text-red-700',      icon: Clock },
};

const mockData: Transito[] = [
  { id:1, numero_oc:'OC-00023', proveedor:'Importaciones SafeGuard S.A.', origen:'Miami, FL', destino:'Almacén Principal', fecha_despacho:'2026-09-05', fecha_eta:'2026-09-12', bultos:6, peso_kg:142.5, total_usd:1875.50, transportista:'DHL Express', guia:'DHL-8821003456', estado:'en_ruta' },
  { id:2, numero_oc:'OC-00019', proveedor:'3M Supply Chain', origen:'Ciudad de México', destino:'Almacén Principal', fecha_despacho:'2026-08-30', fecha_eta:'2026-09-10', bultos:12, peso_kg:380.0, total_usd:4200.00, transportista:'FedEx International', guia:'FX-7799001122', estado:'aduanas', observacion:'Revisión SENIAT' },
  { id:3, numero_oc:'OC-00022', proveedor:'3M Venezuela', origen:'Caracas', destino:'Almacén Principal', fecha_despacho:'2026-09-06', fecha_eta:'2026-09-08', bultos:4, peso_kg:95.0, total_usd:6200.00, transportista:'MRW', guia:'MRW-00445521', estado:'entregado' },
  { id:4, numero_oc:'OC-00018', proveedor:'Honeywell Americas', origen:'Bogotá, CO', destino:'Tienda Oriente', fecha_despacho:'2026-08-25', fecha_eta:'2026-09-02', bultos:8, peso_kg:210.0, total_usd:3100.00, transportista:'Servientrega', guia:'SRV-20060087', estado:'demorado', observacion:'Retención fronteriza' },
];

export default function MercanciaTransito() {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const filtered = mockData.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || t.numero_oc.toLowerCase().includes(q) || t.proveedor.toLowerCase().includes(q) || t.guia.toLowerCase().includes(q);
    const matchE = !estadoFilter || t.estado === estadoFilter;
    return matchQ && matchE;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Compras</span><span>/</span><span className="text-electrico-600">Mercancía en Tránsito</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Mercancía en Tránsito</h1>
          <p className="text-sm text-gray-500 mt-0.5">Seguimiento de pedidos nacionales e internacionales en camino.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(ESTADO).map(([k, v]) => {
          const count = mockData.filter(t => t.estado === k).length;
          const Icon = v.icon;
          return (
            <div key={k} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className={`p-1.5 rounded-lg ${v.color}`}><Icon className="w-3.5 h-3.5" /></span>
                <div className="text-xs text-gray-400 font-semibold">{v.label}</div>
              </div>
              <div className="text-2xl font-extrabold font-rajdhani text-gray-900">{count}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por Nº OC, proveedor o guía..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
        <div className="flex items-center gap-2">
          <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none">
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Cards de tránsito */}
      <div className="space-y-3">
        {filtered.map(t => {
          const cfg = ESTADO[t.estado];
          const Icon = cfg.icon;
          return (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-brand-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-brand-900 font-mono text-sm">{t.numero_oc}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800 mt-0.5">{t.proveedor}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.origen} → {t.destino}</span>
                    </div>
                    {t.observacion && (
                      <div className="mt-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg inline-block">⚠ {t.observacion}</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 sm:gap-6 text-xs">
                  <div>
                    <div className="text-gray-400 font-semibold">Guía</div>
                    <div className="font-mono font-bold text-gray-800 text-[11px]">{t.guia}</div>
                    <div className="text-gray-500">{t.transportista}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 font-semibold">Bultos / Peso</div>
                    <div className="font-bold text-gray-800">{t.bultos} bto. / {t.peso_kg}kg</div>
                    <div className="text-gray-500">ETA: {t.fecha_eta}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 font-semibold">Valor</div>
                    <div className="font-bold text-brand-900">${t.total_usd.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
                    <div className="text-gray-500">Despacho: {t.fecha_despacho}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-semibold">No hay mercancía en tránsito</p>
          </div>
        )}
      </div>
    </div>
  );
}
