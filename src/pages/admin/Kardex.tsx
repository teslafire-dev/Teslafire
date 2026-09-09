import React, { useState } from 'react';
import {
  Search, RefreshCw, FileSpreadsheet, Filter, Calendar,
  ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle,
  ArrowLeftRight, Package, Clock, Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MovimientoKardex {
  id: number;
  fecha: string;
  hora: string;
  tipo: 'entrada' | 'salida' | 'traslado' | 'ajuste' | 'consumo';
  documento: string;
  numero_doc: string;
  producto: string;
  codigo: string;
  almacen_origen: string;
  almacen_destino?: string;
  cantidad: number;
  costo_unit: number;
  saldo: number;
  usuario: string;
  referencia?: string;
}

const TIPO_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  entrada:  { label: 'Entrada',  color: 'bg-emerald-50 text-emerald-700',  icon: ArrowUpCircle },
  salida:   { label: 'Salida',   color: 'bg-red-50 text-red-700',          icon: ArrowDownCircle },
  traslado: { label: 'Traslado', color: 'bg-blue-50 text-blue-700',        icon: ArrowLeftRight },
  ajuste:   { label: 'Ajuste',   color: 'bg-amber-50 text-amber-700',      icon: Filter },
  consumo:  { label: 'Consumo',  color: 'bg-purple-50 text-purple-700',    icon: Package },
};

const mockData: MovimientoKardex[] = [
  { id: 1, fecha: '2026-09-09', hora: '09:14', tipo: 'entrada', documento: 'Compra Directa', numero_doc: 'CD-00042', producto: 'Extintor CO₂ 10 lb', codigo: 'EX-CO2-010', almacen_origen: 'Almacén Principal', cantidad: 20, costo_unit: 48.50, saldo: 85, usuario: 'J. Rodríguez' },
  { id: 2, fecha: '2026-09-09', hora: '08:52', tipo: 'salida',  documento: 'Nota de Entrega', numero_doc: 'NE-00391', producto: 'Extintor CO₂ 10 lb', codigo: 'EX-CO2-010', almacen_origen: 'Almacén Principal', cantidad: 5, costo_unit: 48.50, saldo: 65, usuario: 'M. Pérez' },
  { id: 3, fecha: '2026-09-08', hora: '16:30', tipo: 'traslado',documento: 'Traslado', numero_doc: 'TR-00015', producto: 'Casco MSA V-Gard', codigo: 'EPP-CAS-001', almacen_origen: 'Almacén Principal', almacen_destino: 'Tienda Oriente', cantidad: 10, costo_unit: 32.00, saldo: 45, usuario: 'J. Rodríguez' },
  { id: 4, fecha: '2026-09-08', hora: '11:05', tipo: 'ajuste',  documento: 'Ajuste Inventario', numero_doc: 'AJ-00008', producto: 'Guantes de Nitrilo L', codigo: 'EPP-GUA-003', almacen_origen: 'Almacén Principal', cantidad: -3, costo_unit: 4.20, saldo: 212, usuario: 'Admin' },
  { id: 5, fecha: '2026-09-07', hora: '14:22', tipo: 'consumo', documento: 'Consumo Interno', numero_doc: 'CI-00019', producto: 'Lentes de Seguridad 3M', codigo: 'EPP-LEN-002', almacen_origen: 'Almacén Principal', cantidad: 6, costo_unit: 8.75, saldo: 94, usuario: 'C. Morales' },
  { id: 6, fecha: '2026-09-07', hora: '09:00', tipo: 'entrada', documento: 'OC Recepcionada', numero_doc: 'OC-00021', producto: 'Señal "Área Restringida"', codigo: 'SEG-SEN-010', almacen_origen: 'Almacén Principal', cantidad: 50, costo_unit: 2.10, saldo: 143, usuario: 'M. Pérez' },
  { id: 7, fecha: '2026-09-06', hora: '17:45', tipo: 'salida',  documento: 'Factura Fiscal', numero_doc: 'FF-002813', producto: 'Cono de Seguridad 90cm', codigo: 'SEG-CON-090', almacen_origen: 'Almacén Principal', cantidad: 12, costo_unit: 6.50, saldo: 38, usuario: 'A. González' },
  { id: 8, fecha: '2026-09-06', hora: '10:11', tipo: 'entrada', documento: 'Compra Directa', numero_doc: 'CD-00041', producto: 'Arnés de Seguridad 3M', codigo: 'EPP-ARN-001', almacen_origen: 'Almacén Principal', cantidad: 15, costo_unit: 92.00, saldo: 29, usuario: 'J. Rodríguez' },
];

const PER_PAGE = 8;

export default function Kardex() {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(m => {
    const q = search.toLowerCase();
    const matchQ = !q || m.producto.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q) || m.numero_doc.toLowerCase().includes(q);
    const matchT = !tipoFilter || m.tipo === tipoFilter;
    return matchQ && matchT;
  });

  const total = filtered.length;
  const pages = Math.ceil(total / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Inventario</span><span>/</span>
            <span className="text-electrico-600">Kardex / Buscador</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Kardex / Buscador</h1>
          <p className="text-sm text-gray-500 mt-0.5">Trazabilidad cronológica de movimientos de entrada, salida y saldos en tiempo real.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm" title="Actualizar">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => toast('Exportando Kardex...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por producto, código o Nº documento..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <select value={tipoFilter} onChange={e => { setTipoFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-brand-500">
            <option value="">Todos los tipos</option>
            {Object.entries(TIPO_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-gray-400" /><span>Rango de Fecha</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200">
            <Hash className="w-3.5 h-3.5 text-gray-400" /><span>Por Almacén</span>
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Almacén</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Costo U.</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Saldo</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(m => {
                const cfg = TIPO_CONFIG[m.tipo];
                const Icon = cfg.icon;
                return (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800">{m.fecha}</div>
                      <div className="flex items-center gap-1 text-gray-400 mt-0.5"><Clock className="w-3 h-3" />{m.hora}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700 font-semibold">{m.documento}</div>
                      <div className="text-gray-400 font-mono text-[11px]">{m.numero_doc}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800 max-w-[180px] truncate">{m.producto}</div>
                      <div className="text-gray-400 font-mono text-[11px]">{m.codigo}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{m.almacen_origen}</div>
                      {m.almacen_destino && <div className="text-blue-500">→ {m.almacen_destino}</div>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${m.cantidad < 0 ? 'text-red-600' : m.tipo === 'salida' || m.tipo === 'consumo' ? 'text-red-600' : 'text-emerald-700'}`}>
                        {m.tipo === 'salida' || m.tipo === 'consumo' ? '-' : '+'}{Math.abs(m.cantidad)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">${m.costo_unit.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-brand-900">{m.saldo}</td>
                    <td className="px-4 py-3 text-gray-500">{m.usuario}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{total} movimiento{total !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-bold text-gray-700 px-2">{page} / {pages || 1}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
