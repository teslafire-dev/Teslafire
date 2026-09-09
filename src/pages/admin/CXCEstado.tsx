import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Filter, Eye, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface EstadoCuenta {
  id: number; cliente: string; rif: string; canal: string;
  limite_credito: number; saldo_actual: number; saldo_vencido: number;
  facturas_abiertas: number; dias_mora: number; ultimo_pago: string;
  estado: 'al_dia' | 'en_mora' | 'bloqueado';
}

const ESTADO: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  al_dia:   { label: 'Al Día',   color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  en_mora:  { label: 'En Mora',  color: 'bg-amber-50 text-amber-700',     icon: AlertTriangle },
  bloqueado:{ label: 'Bloqueado',color: 'bg-red-50 text-red-700',         icon: AlertTriangle },
};

const CANAL_COLOR: Record<string, string> = {
  Mayor: 'bg-brand-50 text-brand-700',
  Detal: 'bg-sky-50 text-sky-700',
  Corporativo: 'bg-amber-50 text-amber-700',
  Instalador: 'bg-emerald-50 text-emerald-700',
};

const mockData: EstadoCuenta[] = [
  { id:1, cliente:'Inversiones Alfa & Omega C.A.', rif:'J-40123456-7', canal:'Mayor', limite_credito:15000, saldo_actual:4800, saldo_vencido:0, facturas_abiertas:2, dias_mora:0, ultimo_pago:'2026-09-05', estado:'al_dia' },
  { id:2, cliente:'Constructora Oriente 2000 C.A.', rif:'J-31987654-2', canal:'Corporativo', limite_credito:30000, saldo_actual:22400, saldo_vencido:8000, facturas_abiertas:5, dias_mora:18, ultimo_pago:'2026-08-20', estado:'en_mora' },
  { id:3, cliente:'Ferretería El Martillo C.A.', rif:'J-20456789-3', canal:'Detal', limite_credito:5000, saldo_actual:5200, saldo_vencido:5200, facturas_abiertas:3, dias_mora:45, ultimo_pago:'2026-07-28', estado:'bloqueado' },
  { id:4, cliente:'Servicios Industriales Norven', rif:'J-29111222-5', canal:'Instalador', limite_credito:8000, saldo_actual:1200, saldo_vencido:0, facturas_abiertas:1, dias_mora:0, ultimo_pago:'2026-09-07', estado:'al_dia' },
  { id:5, cliente:'Consorcio Petrosa C.A.', rif:'J-40234567-8', canal:'Corporativo', limite_credito:50000, saldo_actual:34000, saldo_vencido:12000, facturas_abiertas:8, dias_mora:25, ultimo_pago:'2026-08-14', estado:'en_mora' },
];

const PER_PAGE = 10;

export default function CXCEstado() {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.cliente.toLowerCase().includes(q) || c.rif.includes(q);
    const matchE = !estadoFilter || c.estado === estadoFilter;
    return matchQ && matchE;
  });
  const total = filtered.length;
  const pages = Math.ceil(total / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalCartera = mockData.reduce((s, c) => s + c.saldo_actual, 0);
  const totalVencido = mockData.reduce((s, c) => s + c.saldo_vencido, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Cuentas por Cobrar</span><span>/</span><span className="text-electrico-600">Estado de Cuenta</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Estado de Cuenta</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cartera de clientes a crédito, cuentas vencidas y límites.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold uppercase">Cartera Total</div>
          <div className="text-2xl font-extrabold font-rajdhani text-brand-900 mt-1">${totalCartera.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-4 shadow-sm">
          <div className="text-xs text-red-400 font-semibold uppercase">Cartera Vencida</div>
          <div className="text-2xl font-extrabold font-rajdhani text-red-600 mt-1">${totalVencido.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold uppercase">En Mora</div>
          <div className="text-2xl font-extrabold font-rajdhani text-amber-600 mt-1">{mockData.filter(c => c.estado === 'en_mora').length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold uppercase">Bloqueados</div>
          <div className="text-2xl font-extrabold font-rajdhani text-red-600 mt-1">{mockData.filter(c => c.estado === 'bloqueado').length}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar cliente o RIF..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none">
          <option value="">Todos</option>
          {Object.entries(ESTADO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase">Cliente</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Canal</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Límite</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Saldo</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase">Vencido</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Días Mora</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Estado</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(c => {
                const cfg = ESTADO[c.estado];
                const Icon = cfg.icon;
                const pct = c.limite_credito > 0 ? (c.saldo_actual / c.limite_credito) * 100 : 0;
                return (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800 max-w-[200px] truncate">{c.cliente}</div>
                      <div className="text-gray-400 font-mono text-[11px]">{c.rif}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${CANAL_COLOR[c.canal] || 'bg-gray-100 text-gray-600'}`}>{c.canal}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-700">${c.limite_credito.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-gray-800">${c.saldo_actual.toLocaleString()}</div>
                      {c.limite_credito > 0 && (
                        <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 ml-auto">
                          <div className={`h-1 rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${c.saldo_vencido > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        ${c.saldo_vencido.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${c.dias_mora > 0 ? 'text-red-600' : 'text-gray-400'}`}>{c.dias_mora}d</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Eye className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{total} cliente{total !== 1 ? 's' : ''}</span>
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
