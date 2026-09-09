import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Plus, Filter, Calendar, ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface MovimientoBanco {
  id: number; fecha: string; descripcion: string; tipo: 'ingreso' | 'egreso';
  categoria: string; referencia: string; monto: number; moneda: string;
  cuenta: string; banco: string; saldo: number;
}

const mockData: MovimientoBanco[] = [
  { id:1, fecha:'2026-09-09', descripcion:'Cobro Factura FF-002810 – Norven', tipo:'ingreso', categoria:'Cobro CXC', referencia:'TRF-MOV-992211', monto:1200, moneda:'USD', cuenta:'Cuenta USD Operaciones', banco:'Mercantil', saldo:45200 },
  { id:2, fecha:'2026-09-09', descripcion:'Pago OC-00022 – 3M Venezuela', tipo:'egreso', categoria:'Pago Proveedor', referencia:'TRF-PROV-881', monto:6200, moneda:'USD', cuenta:'Cuenta USD Operaciones', banco:'Mercantil', saldo:44000 },
  { id:3, fecha:'2026-09-08', descripcion:'Cobro Factura FF-002790 – Alfa & Omega', tipo:'ingreso', categoria:'Cobro CXC', referencia:'TRF-110045', monto:3800, moneda:'USD', cuenta:'Cuenta USD Operaciones', banco:'Mercantil', saldo:50200 },
  { id:4, fecha:'2026-09-08', descripcion:'Gasto Operativo – Servicio de Internet', tipo:'egreso', categoria:'Gastos Fijos', referencia:'CANT-00991', monto:150000, moneda:'VES', cuenta:'Cuenta Principal Bs', banco:'Banesco', saldo:8420000 },
  { id:5, fecha:'2026-09-07', descripcion:'Nómina Quincena Sep-I', tipo:'egreso', categoria:'Nómina', referencia:'NOM-2026-09-I', monto:2800000, moneda:'VES', cuenta:'Cuenta Nómina', banco:'Banco de Venezuela', saldo:1200000 },
  { id:6, fecha:'2026-09-05', descripcion:'Cobro Factura FF-002775 – Oriente 2000', tipo:'ingreso', categoria:'Cobro CXC', referencia:'TRF-009881', monto:3000, moneda:'USD', cuenta:'Cuenta USD Operaciones', banco:'Mercantil', saldo:46400 },
];

const PER_PAGE = 10;

export default function BancosMovimientos() {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(m => {
    const q = search.toLowerCase();
    const matchQ = !q || m.descripcion.toLowerCase().includes(q) || m.referencia.toLowerCase().includes(q) || m.cuenta.toLowerCase().includes(q);
    const matchT = !tipoFilter || m.tipo === tipoFilter;
    return matchQ && matchT;
  });
  const total = filtered.length;
  const pages = Math.ceil(total / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalIngresosUSD = mockData.filter(m => m.tipo === 'ingreso' && m.moneda === 'USD').reduce((s, m) => s + m.monto, 0);
  const totalEgresosUSD = mockData.filter(m => m.tipo === 'egreso' && m.moneda === 'USD').reduce((s, m) => s + m.monto, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Bancos</span><span>/</span><span className="text-electrico-600">Movimientos Bancarios</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Movimientos Bancarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Libro de bancos con ingresos, egresos y comisiones.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
          <button onClick={() => toast('Nuevo movimiento en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Nuevo Movimiento</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><ArrowDownLeft className="w-4 h-4 text-emerald-600" /><div className="text-xs text-gray-400 font-semibold uppercase">Ingresos USD (período)</div></div>
          <div className="text-2xl font-extrabold font-rajdhani text-emerald-700">${totalIngresosUSD.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><ArrowUpRight className="w-4 h-4 text-red-500" /><div className="text-xs text-gray-400 font-semibold uppercase">Egresos USD (período)</div></div>
          <div className="text-2xl font-extrabold font-rajdhani text-red-600">${totalEgresosUSD.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold uppercase mb-1">Flujo Neto USD</div>
          <div className={`text-2xl font-extrabold font-rajdhani ${totalIngresosUSD - totalEgresosUSD >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            ${(totalIngresosUSD - totalEgresosUSD).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar descripción, referencia o cuenta..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <select value={tipoFilter} onChange={e => { setTipoFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none">
            <option value="">Todos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200"><Calendar className="w-3.5 h-3.5 text-gray-400" /><span>Fecha</span></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Fecha</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Descripción</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Cuenta / Banco</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Categoría</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Referencia</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Monto</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(m => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 font-semibold">{m.fecha}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded-lg ${m.tipo === 'ingreso' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        {m.tipo === 'ingreso' ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-red-500" />}
                      </span>
                      <div className="font-semibold text-gray-800 max-w-[200px] truncate">{m.descripcion}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700 font-semibold">{m.cuenta}</div>
                    <div className="text-gray-400 text-[11px]">{m.banco}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.categoria}</td>
                  <td className="px-4 py-3 font-mono text-gray-500 text-[11px]">{m.referencia}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${m.tipo === 'ingreso' ? 'text-emerald-700' : 'text-red-600'}`}>
                      {m.tipo === 'ingreso' ? '+' : '-'}{m.moneda === 'USD' ? '$' : 'Bs '}{m.monto.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-brand-900">
                    {m.moneda === 'USD' ? '$' : 'Bs '}{m.saldo.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{total} movimiento{total !== 1 ? 's' : ''}</span>
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
