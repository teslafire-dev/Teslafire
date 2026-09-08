import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ModulePlaceholderProps {
  modulo: string;
  viewTitle: string;
  description?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  badge?: string;
}

export default function ModulePlaceholder({
  modulo,
  viewTitle,
  description = 'Gestión y control de registros del sistema.',
  primaryActionLabel = 'Nuevo Registro',
  onPrimaryAction,
  badge
}: ModulePlaceholderProps) {
  const [search, setSearch] = useState('');

  const handleAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    } else {
      toast(`Acción para ${viewTitle} en desarrollo`, { icon: '⚡' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>{modulo}</span>
            <span>/</span>
            <span className="text-electrico-600 font-semibold">{viewTitle}</span>
            {badge && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-electrico-50 text-electrico-700 border border-electrico-200">
                {badge}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-rajdhani tracking-wide mt-1">
            {viewTitle}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => toast.success('Datos actualizados')}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast('Exportando reporte...', { icon: '📊' })}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleAction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold transition-all shadow-md shadow-brand-900/20 active:scale-95"
          >
            <Plus className="w-4 h-4 text-electrico-500" />
            <span>{primaryActionLabel}</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, descripción o referencia..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-50/50"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Filtros</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Rango de Fecha</span>
          </button>
        </div>
      </div>

      {/* Content Canvas / Empty State */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 mb-4 border border-brand-100">
            <Layers className="w-7 h-7 text-electrico-600" />
          </div>
          <h3 className="text-lg font-bold font-rajdhani text-gray-900 mb-1">
            Módulo: {viewTitle}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mb-6">
            Este submódulo se encuentra completamente integrado a la estructura del ERP. Puedes conectar las consultas a las tablas correspondientes en Supabase para desplegar los registros.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAction}
              className="px-5 py-2.5 rounded-xl bg-brand-900 text-white text-xs font-bold hover:bg-brand-950 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4 text-electrico-500" />
              <span>{primaryActionLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
