import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Plus, Filter, Calendar, ChevronLeft, ChevronRight, Eye, CheckCircle, Clock, AlertTriangle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

interface PagoCXP {
  id: number; proveedor: string; rif: string; factura_ref: string;
  fecha_factura: string; fecha_vencimiento: string; monto_usd: number; monto_bs: number;
  saldo_pendiente: number; moneda: string; dias_vencido: number;
  estado: 'pendiente' | 'programado' | 'pagado' | 'vencido';
  banco: string;
}

const ESTADO: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendiente:   { label: 'Pendiente',   color: 'bg-gray-100 text-gray-600',    icon: Clock },
  programado:  { label: 'Programado',  color: 'bg-blue-50 text-blue-700',     icon: Calendar },
  pagado:      { label: 'Pagado',      color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  vencido:     { label: 'Vencido',     color: 'bg-red-50 text-red-700',       icon: AlertTriangle },
};

const mockData: PagoCXP[] = [
  { id:1, proveedor:'3M Venezuela', rif:'J-00304447-3', factura_ref:'FF-012345', fecha_factura:'2026-08-20', fecha_vencimiento:'2026-09-20', monto_usd:6200.00, monto_bs:0, saldo_pendiente:6200.00, moneda:'USD', dias_vencido:0, estado:'pendiente', banco:'' },
  { id:2, proveedor:'Distribuidora ProSeguridad C.A.', rif:'J-29876543-1', factura_ref:'FF-009871', fecha_factura:'2026-08-01', fecha_vencimiento:'2026-08-31', monto_usd:3420.00, monto_bs:0, saldo_pendiente:1500.00, moneda:'USD', dias_vencido:9, estado:'vencido', banco:'' },
  { id:3, proveedor:'EPP Total C.A.', rif:'J-40012233-5', factura_ref:'FF-004432', fecha_factura:'2026-09-01', fecha_vencimiento:'2026-09-16', monto_usd:0, monto_bs:45000, saldo_pendiente:0, moneda:'VES', dias_vencido:0, estado:'programado', banco:'Banco de Venezuela' },
  { id:4, proveedor:'Importaciones SafeGuard S.A.', rif:'J-31045678-9', factura_ref:'CD-00038', fecha_factura:'2026-09-05', fecha_vencimiento:'2026-09-05', monto_usd:1875.50, monto_bs:0, saldo_pendiente:0, moneda:'USD', dias_vencido:0, estado:'pagado', banco:'Banesco USD' },
];

export default function CXPPagos() {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = mockData.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.proveedor.toLowerCase().includes(q) || p.factura_ref.toLowerCase().includes(q) || p.rif.includes(q);
    const matchE = !estadoFilter || p.estado === estadoFilter;
    return matchQ && matchE;
  });
  const total = filtered.length;
  const pages = Math.ceil(total / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalPendiente = mockData.filter(p => p.estado !== 'pagado').reduce((s, p) => s + p.saldo_pendiente, 0);
  const totalVencido = mockData.filter(p => p.estado === 'vencido').reduce((s, p) => s + p.saldo_pendiente, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Cuentas por Pagar</span><span>/</span><span className="text-electrico-600">Pagar a Proveedor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Pagar a Proveedor</h1>
          <p className="text-sm text-gray-500 mt-0.5">Programación y liquidación de pagos multimoneda a proveedores.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
          <button onClick={() => toast('Registrar pago en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Registrar Pago</span>
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold uppercase">Total por Pagar</div>
          <div className="text-2xl font-extrabold font-rajdhani text-brand-900 mt-1">${totalPendiente.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-gray-400">{mockData.filter(p => p.estado !== 'pagado').length} facturas</div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-4 shadow-sm">
          <div className="text-xs text-red-400 font-semibold uppercase">Vencidas</div>
          <div className="text-2xl font-extrabold font-rajdhani text-red-600 mt-1">${totalVencido.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-gray-400">{mockData.filter(p => p.estado === 'vencido').length} en mora</div>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
          <div className="text-xs text-blue-400 font-semibold uppercase">Programados</div>
          <div className="text-2xl font-extrabold font-rajdhani text-blue-600 mt-1">{mockData.filter(p => p.estado === 'programado').length}</div>
          <div className="text-[11px] text-gray-400">pagos agendados</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por proveedor, factura o RIF..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none">
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Proveedor</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Factura Ref.</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Vencimiento</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Monto</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Saldo</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Estado</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(p => {
                const cfg = ESTADO[p.estado];
                const Icon = cfg.icon;
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800 max-w-[200px] truncate">{p.proveedor}</div>
                      <div className="text-gray-400 font-mono text-[11px]">{p.rif}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-brand-900">{p.factura_ref}</div>
                      <div className="text-gray-400">{p.fecha_factura}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-bold ${p.dias_vencido > 0 ? 'text-red-600' : 'text-gray-700'}`}>{p.fecha_vencimiento}</div>
                      {p.dias_vencido > 0 && <div className="text-red-500 text-[11px]">{p.dias_vencido}d vencida</div>}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">
                      {p.moneda === 'USD' ? `$${p.monto_usd.toFixed(2)}` : `Bs ${p.monto_bs.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${p.saldo_pendiente > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {p.moneda === 'USD' ? `$${p.saldo_pendiente.toFixed(2)}` : 'Bs 0'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        {p.estado !== 'pagado' && (
                          <button onClick={() => toast.success(`Pago a ${p.proveedor} procesado`)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"><Wallet className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{total} registro{total !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-bold text-gray-700 px-2">{page} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
