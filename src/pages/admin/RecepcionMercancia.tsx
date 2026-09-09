import React, { useState } from 'react';
import { Search, RefreshCw, Plus, Filter, Package, CheckCircle, XCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface RecepcionItem {
  id: number; codigo: string; descripcion: string; unidad: string;
  cantidad_oc: number; cantidad_recibida: number; costo_usd: number;
  estado: 'pendiente' | 'completo' | 'parcial' | 'exceso';
}

interface Recepcion {
  id: number; numero: string; oc_ref: string; proveedor: string;
  fecha: string; almacen: string; usuario: string;
  estado: 'abierta' | 'cerrada'; items: RecepcionItem[];
}

const mock: Recepcion[] = [
  {
    id: 1, numero: 'REC-00015', oc_ref: 'OC-00022', proveedor: '3M Venezuela',
    fecha: '2026-09-08', almacen: 'Almacén Principal', usuario: 'J. Rodríguez', estado: 'cerrada',
    items: [
      { id:1, codigo:'EX-CO2-010', descripcion:'Extintor CO₂ 10 lb', unidad:'Und', cantidad_oc:20, cantidad_recibida:20, costo_usd:48.50, estado:'completo' },
      { id:2, codigo:'EPP-CAS-001', descripcion:'Casco MSA V-Gard', unidad:'Und', cantidad_oc:15, cantidad_recibida:14, costo_usd:32.00, estado:'parcial' },
      { id:3, codigo:'EPP-GUA-003', descripcion:'Guantes Nitrilo L (100u)', unidad:'Caja', cantidad_oc:10, cantidad_recibida:10, costo_usd:42.00, estado:'completo' },
    ]
  },
  {
    id: 2, numero: 'REC-00016', oc_ref: 'OC-00023', proveedor: 'Importaciones SafeGuard S.A.',
    fecha: '2026-09-09', almacen: 'Almacén Principal', usuario: 'M. Pérez', estado: 'abierta',
    items: [
      { id:4, codigo:'SEG-SEN-010', descripcion:'Señal "Área Restringida"', unidad:'Und', cantidad_oc:50, cantidad_recibida:0, costo_usd:2.10, estado:'pendiente' },
      { id:5, codigo:'SEG-CON-090', descripcion:'Cono de Seguridad 90cm', unidad:'Und', cantidad_oc:30, cantidad_recibida:0, costo_usd:6.50, estado:'pendiente' },
    ]
  }
];

const ITEM_ESTADO: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendiente: { label: 'Pendiente', color: 'bg-gray-100 text-gray-600', icon: Package },
  completo:  { label: 'Completo',  color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  parcial:   { label: 'Parcial',   color: 'bg-amber-50 text-amber-700', icon: AlertTriangle },
  exceso:    { label: 'Exceso',    color: 'bg-red-50 text-red-700', icon: XCircle },
};

export default function RecepcionMercancia() {
  const [selected, setSelected] = useState<Recepcion | null>(null);
  const [search, setSearch] = useState('');

  const filtered = mock.filter(r => !search || r.numero.toLowerCase().includes(search.toLowerCase()) || r.proveedor.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Compras</span><span>/</span><span className="text-electrico-600">Recepción en Almacén</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Recepción en Almacén</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cotejo de compras contra órdenes y carga en Kardex.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Nueva recepción en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Recepcionar Carga</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Lista de recepciones */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar recepción..." className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-white shadow-sm" />
          </div>
          {filtered.map(r => (
            <button key={r.id} onClick={() => setSelected(r)} className={`w-full text-left bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all ${selected?.id === r.id ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-900 font-mono text-sm">{r.numero}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.estado === 'abierta' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>{r.estado === 'abierta' ? 'Abierta' : 'Cerrada'}</span>
              </div>
              <div className="text-xs font-semibold text-gray-700 mt-1 truncate">{r.proveedor}</div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400">
                <span>Ref: {r.oc_ref}</span><span>{r.fecha}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detalle */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-brand-900 font-mono">{selected.numero}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{selected.proveedor} · {selected.almacen}</div>
                  </div>
                  {selected.estado === 'abierta' && (
                    <button onClick={() => toast.success('Recepción cerrada')} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
                      Cerrar Recepción
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Producto</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">OC</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Recibido</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selected.items.map(item => {
                      const cfg = ITEM_ESTADO[item.estado];
                      const Icon = cfg.icon;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-800">{item.descripcion}</div>
                            <div className="text-gray-400 font-mono text-[11px]">{item.codigo}</div>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-gray-700">{item.cantidad_oc} {item.unidad}</td>
                          <td className="px-4 py-3 text-center">
                            {selected.estado === 'abierta' ? (
                              <input type="number" defaultValue={item.cantidad_recibida} min={0} className="w-16 text-center text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand-500" />
                            ) : (
                              <span className="font-bold text-gray-800">{item.cantidad_recibida}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-[11px] ${cfg.color}`}>
                              <Icon className="w-3 h-3" />{cfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-semibold">Selecciona una recepción para ver el detalle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
