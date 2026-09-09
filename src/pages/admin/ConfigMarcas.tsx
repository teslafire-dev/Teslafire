import React, { useState } from 'react';
import { Search, RefreshCw, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface Marca {
  id: number; nombre: string; pais_origen: string; descripcion: string;
  activa: boolean; productos: number; logo_inicial: string;
}

const mockData: Marca[] = [
  { id:1, nombre:'3M', pais_origen:'USA', descripcion:'Soluciones de seguridad y EPP premium', activa:true, productos:48, logo_inicial:'3M' },
  { id:2, nombre:'MSA Safety', pais_origen:'USA', descripcion:'Equipos de protección personal industrial', activa:true, productos:22, logo_inicial:'MSA' },
  { id:3, nombre:'Honeywell', pais_origen:'USA', descripcion:'Seguridad industrial y automatización', activa:true, productos:35, logo_inicial:'HW' },
  { id:4, nombre:'SIKA', pais_origen:'Suiza', descripcion:'Impermeabilizantes y selladores', activa:true, productos:14, logo_inicial:'SK' },
  { id:5, nombre:'Pematech', pais_origen:'Venezuela', descripcion:'Fabricante nacional de señalización', activa:true, productos:8, logo_inicial:'PM' },
  { id:6, nombre:'DuPont', pais_origen:'USA', descripcion:'Trajes de protección química Tyvek', activa:false, productos:6, logo_inicial:'DP' },
];

const PER_PAGE = 10;
const COLORES = ['bg-blue-100 text-blue-800', 'bg-emerald-100 text-emerald-800', 'bg-amber-100 text-amber-800', 'bg-purple-100 text-purple-800', 'bg-red-100 text-red-800', 'bg-brand-100 text-brand-800'];

export default function ConfigMarcas() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(m => !search || m.nombre.toLowerCase().includes(search.toLowerCase()) || m.pais_origen.toLowerCase().includes(search.toLowerCase()));
  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Configuración</span><span>/</span><span className="text-electrico-600">Marcas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">Marcas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Catálogo de marcas disponibles para asignar a productos del inventario.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success('Datos actualizados')} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => toast('Nueva marca en desarrollo', { icon: '⚡' })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold shadow-md shadow-brand-900/20 active:scale-95">
            <Plus className="w-4 h-4 text-electrico-500" /><span>Nueva Marca</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Total Marcas</div>
          <div className="text-2xl font-extrabold font-rajdhani text-brand-900 mt-1">{mockData.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Activas</div>
          <div className="text-2xl font-extrabold font-rajdhani text-emerald-700 mt-1">{mockData.filter(m => m.activa).length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold">Total Productos</div>
          <div className="text-2xl font-extrabold font-rajdhani text-gray-800 mt-1">{mockData.reduce((s, m) => s + m.productos, 0)}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar marca o país de origen..." className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50" />
        </div>
      </div>

      {/* Grid de marcas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {paged.map((m, i) => (
          <div key={m.id} className={`bg-white rounded-2xl border ${m.activa ? 'border-gray-100' : 'border-gray-100 opacity-60'} p-4 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${COLORES[i % COLORES.length]} flex items-center justify-center font-extrabold text-xs font-rajdhani`}>
                {m.logo_inicial}
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600"><Edit2 className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="font-bold text-gray-800">{m.nombre}</div>
            <div className="text-xs text-gray-400 mt-0.5">{m.pais_origen}</div>
            <div className="text-xs text-gray-500 mt-2 line-clamp-2">{m.descripcion}</div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-1 text-xs text-gray-400"><Tag className="w-3 h-3" />{m.productos} prod.</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.activa ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {m.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{filtered.length} marca{filtered.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs font-bold text-gray-700 px-2">{page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
