import React, { useState } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Plus, Filter, Eye, Edit2, ChevronLeft, ChevronRight, Building2, Phone, Mail, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface Proveedor {
  id: number; nombre: string; rif: string; contacto: string; telefono: string; email: string;
  ciudad: string; pais: string; moneda: 'USD' | 'VES' | 'EUR';
  dias_credito: number; condicion: 'contado' | 'credito';
  rating: 1 | 2 | 3 | 4 | 5; activo: boolean; categoria: string;
  compras_total: number;
}

const mockData: Proveedor[] = [
  { id:1, nombre:'Distribuidora ProSeguridad C.A.', rif:'J-29876543-1', contacto:'Ing. Luis Marcano', telefono:'0212-8871234', email:'ventas@proseguridad.com', ciudad:'Caracas', pais:'Venezuela', moneda:'USD', dias_credito:30, condicion:'credito', rating:5, activo:true, categoria:'EPP Nacional', compras_total:48200 },
  { id:2, nombre:'3M Venezuela', rif:'J-00304447-3', contacto:'Mariela Torres', telefono:'0212-9053600', email:'mariela.torres@mmm.com', ciudad:'Caracas', pais:'Venezuela', moneda:'USD', dias_credito:45, condicion:'credito', rating:5, activo:true, categoria:'EPP Premium', compras_total:126800 },
  { id:3, nombre:'Importaciones SafeGuard S.A.', rif:'J-31045678-9', contacto:'Carlos Ríos', telefono:'+1-305-5551234', email:'orders@safeguard.com', ciudad:'Miami', pais:'USA', moneda:'USD', dias_credito:0, condicion:'contado', rating:4, activo:true, categoria:'Importación', compras_total:34500 },
  { id:4, nombre:'EPP Total C.A.', rif:'J-40012233-5', contacto:'Ana Blanco', telefono:'0241-8871100', email:'ana@epptotal.com', ciudad:'Valencia', pais:'Venezuela', moneda:'VES', dias_credito:15, condicion:'credito', rating:3, activo:true, categoria:'EPP Nacional', compras_total:12400 },
  { id:5, nombre:'Honeywell Americas', rif:'', contacto:'Sales Team', telefono:'+1-800-4657771', email:'latinamerica@honeywell.com', ciudad:'Bogotá', pais:'Colombia', moneda:'USD', dias_credito:30, condicion:'credito', rating:4, activo:false, categoria:'EPP Premium', compras_total:22000 },
];

const PER_PAGE = 10;

export default function Proveedores() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(p => {
    const q = search.toLowerCase();
    return !q || p.nombre.toLowerCase().includes(q) || p.rif.includes(q) || p.ciudad.toLowerCase().includes(q);
  });
  const total = filtered.length;
  const pages = Math.ceil(total / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Compras</span><span>/</span><span className="text-electrico-600">Proveedores</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Proveedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Directorio de proveedores, RIF y condiciones de crédito.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Exportando...', { icon: '📊' })} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
          <button onClick={() => toast('Nuevo proveedor en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: mockData.length, sub: 'proveedores' },
          { label: 'Activos', value: mockData.filter(p => p.activo).length, sub: 'habilitados' },
          { label: 'A Crédito', value: mockData.filter(p => p.condicion === 'credito').length, sub: 'con cupo' },
          { label: 'Internacionales', value: mockData.filter(p => p.pais !== 'Venezuela').length, sub: 'países' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{s.label}</div>
            <div className="text-2xl font-extrabold font-rajdhani text-brand-900 mt-1">{s.value}</div>
            <div className="text-[11px] text-gray-400">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nombre, RIF o ciudad..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200"><Filter className="w-3.5 h-3.5 text-gray-400" /><span>Filtros</span></button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Proveedor</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Moneda</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Condición</th>
                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Compras $</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-brand-700" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 max-w-[200px] truncate">{p.nombre}</div>
                        <div className="text-gray-400 font-mono text-[11px]">{p.rif || 'Sin RIF'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700 font-semibold">{p.contacto}</div>
                    <div className="flex items-center gap-1 text-gray-400 mt-0.5"><Phone className="w-3 h-3" />{p.telefono}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.ciudad}, {p.pais}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 font-mono font-bold">{p.moneda}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${p.condicion === 'credito' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.condicion === 'credito' ? `Crédito ${p.dias_credito}d` : 'Contado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">${p.compras_total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= p.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
          <span className="text-xs text-gray-500">{total} proveedor{total !== 1 ? 'es' : ''}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-bold text-gray-700 px-2">{page} / {pages || 1}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
