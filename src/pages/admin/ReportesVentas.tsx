import React, { useState, useEffect } from 'react';
import { 
  User, 
  Store, 
  Tag, 
  FileText, 
  Download, 
  Calendar, 
  DollarSign, 
  Coins, 
  Receipt, 
  Building2, 
  Filter, 
  Loader2,
  TrendingUp,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function ReportesVentas() {
  const [tab, setTab] = useState<'vendedor' | 'tienda' | 'precio_personalizado'>('vendedor');
  const [periodo, setPeriodo] = useState<'hoy' | 'ayer' | 'especifico' | 'rango'>('hoy');
  
  // Fechas
  const [fechaEspecifica, setFechaEspecifica] = useState('2026-09-08');
  const [desde, setDesde] = useState('2026-09-01');
  const [hasta, setHasta] = useState('2026-09-08');

  // Filtros
  const [vendedorFiltro, setVendedorFiltro] = useState('Todos los vendedores');
  const [tiendaFiltro, setTiendaFiltro] = useState('Tesla Fire');

  // Datos
  const [loading, setLoading] = useState(false);
  const [ventas, setVentas] = useState<any[]>([]);

  useEffect(() => {
    fetchVentas();
  }, [tab, periodo, fechaEspecifica, desde, hasta, vendedorFiltro]);

  const fetchVentas = async () => {
    setLoading(true);
    try {
      // Consultar ventas en base de datos
      const { data, error } = await supabase
        .from('ventas')
        .select('*');

      if (!error && data) {
        setVentas(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    toast.success('Generando reporte consolidado en PDF...');
  };

  // En "Hoy", como muestra la captura, no hay cobros (0.00)
  const isHoy = periodo === 'hoy' || periodo === 'ayer';

  return (
    <div className="min-h-screen bg-[#f8fafc]/70 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO DE LA PÁGINA
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Reportes de Ventas
        </h1>

        {/* Botón Descargar PDF */}
        <button
          type="button"
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#1e293b] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-white" />
          <span>PDF</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          PESTAÑAS DE VISTA: POR VENDEDOR / POR TIENDA / PRECIO PERSONALIZADO
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Tab 1: Por Vendedor */}
        <button
          type="button"
          onClick={() => setTab('vendedor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'vendedor'
              ? 'bg-[#343a40] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Por Vendedor</span>
        </button>

        {/* Tab 2: Por Tienda */}
        <button
          type="button"
          onClick={() => setTab('tienda')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'tienda'
              ? 'bg-[#343a40] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Por Tienda</span>
        </button>

        {/* Tab 3: Precio Personalizado */}
        <button
          type="button"
          onClick={() => setTab('precio_personalizado')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'precio_personalizado'
              ? 'bg-[#343a40] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-amber-500" />
          <span>Precio Personalizado</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          BARRA DE FILTROS TEMPORALES Y TIENDA/VENDEDOR
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs mb-6 space-y-2">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Botones de período */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPeriodo('hoy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodo === 'hoy'
                  ? 'bg-[#343a40] text-white shadow-xs'
                  : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Hoy
            </button>

            <button
              type="button"
              onClick={() => setPeriodo('ayer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodo === 'ayer'
                  ? 'bg-[#343a40] text-white shadow-xs'
                  : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ayer
            </button>

            <button
              type="button"
              onClick={() => setPeriodo('especifico')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodo === 'especifico'
                  ? 'bg-[#343a40] text-white shadow-xs'
                  : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Día específico
            </button>

            <button
              type="button"
              onClick={() => setPeriodo('rango')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodo === 'rango'
                  ? 'bg-[#343a40] text-white shadow-xs'
                  : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Por rango de fecha
            </button>
          </div>

          {/* Lado derecho: Selector de tienda y vendedor */}
          <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto">
            {/* Badge Tienda */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
              <span role="img" aria-label="store">🏪</span>
              <span>Tesla Fire</span>
            </div>

            {/* Selector Vendedor (solo en Por Vendedor y Precio Personalizado) */}
            {tab !== 'tienda' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 font-medium">Vendedor</span>
                <select
                  value={vendedorFiltro}
                  onChange={(e) => setVendedorFiltro(e.target.value)}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="Todos los vendedores">Todos los vendedores</option>
                  <option value="Mostrador">Mostrador</option>
                  <option value="Gerencia">Gerencia</option>
                </select>
              </div>
            )}
          </div>

        </div>

        {/* Sub-indicador de período */}
        <div className="text-[11px] text-gray-400 font-medium pl-1">
          {periodo === 'hoy' && 'Hoy'}
          {periodo === 'ayer' && 'Ayer'}
          {periodo === 'especifico' && (
            <div className="flex items-center gap-2 mt-2">
              <span>Seleccionar día:</span>
              <input
                type="date"
                value={fechaEspecifica}
                onChange={(e) => setFechaEspecifica(e.target.value)}
                className="px-2.5 py-1 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          )}
          {periodo === 'rango' && (
            <div className="flex items-center gap-2 mt-2">
              <span>Desde:</span>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-lg text-xs"
              />
              <span>Hasta:</span>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETAS KPI SUPERIORES (5 TARJETAS)
      ══════════════════════════════════════════════════ */}
      {tab !== 'precio_personalizado' ? (
        /* Tarjetas para "Por Vendedor" y "Por Tienda" */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
          
          {/* Divisa ($) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs text-center">
            <div className="text-xl sm:text-2xl font-black font-rajdhani text-emerald-600 leading-tight">
              $ 0.00
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              Divisa ($)
            </div>
          </div>

          {/* Ref Paralelo ($) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs text-center">
            <div className="text-xl sm:text-2xl font-black font-rajdhani text-gray-900 leading-tight">
              $ 0.00
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              Ref Paralelo ($)
            </div>
          </div>

          {/* Ref BCV ($) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs text-center">
            <div className="text-xl sm:text-2xl font-black font-rajdhani text-gray-900 leading-tight">
              $ 0.00
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              Ref BCV ($)
            </div>
          </div>

          {/* Bolívares (Bs) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs text-center">
            <div className="text-xl sm:text-2xl font-black font-rajdhani text-gray-900 leading-tight">
              Bs 0.00
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              Bolívares (Bs)
            </div>
          </div>

          {/* Pagos */}
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs text-center">
            <div className="text-xl sm:text-2xl font-black font-rajdhani text-gray-900 leading-tight">
              0
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              Pagos
            </div>
          </div>

        </div>
      ) : (
        /* Tarjetas para "Precio Personalizado" */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
          
          {/* Notas */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs text-center">
            <div className="text-xl sm:text-2xl font-black font-rajdhani text-gray-900 leading-tight">
              0
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              Notas
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs text-center">
            <div className="text-xl sm:text-2xl font-black font-rajdhani text-gray-900 leading-tight">
              0
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              Productos
            </div>
          </div>

          {/* Monto original */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs text-center">
            <div className="text-xl sm:text-2xl font-black font-rajdhani text-gray-900 leading-tight">
              $ 0.00
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              Monto original
            </div>
          </div>

          {/* Monto vendido */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs text-center">
            <div className="text-xl sm:text-2xl font-black font-rajdhani text-[#ea580c] leading-tight">
              $ 0.00
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              Monto vendido
            </div>
          </div>

          {/* Diferencia */}
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs text-center">
            <div className="text-xl sm:text-2xl font-black font-rajdhani text-emerald-600 leading-tight">
              $ 0.00
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              Diferencia
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TARJETA PRINCIPAL DE CONTENIDO / ESTADO VACÍO
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-16 text-center">
        
        {/* Ilustración / Ícono según pestaña */}
        {tab === 'vendedor' && (
          <div className="flex flex-col items-center justify-center">
            {/* Ícono de recibo de la captura */}
            <div className="w-14 h-14 mb-3 text-gray-700 flex items-center justify-center">
              <Receipt className="w-10 h-10 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">
              Sin cobros en el período seleccionado
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              Prueba con otro rango de fechas o tienda.
            </p>
          </div>
        )}

        {tab === 'tienda' && (
          <div className="flex flex-col items-center justify-center">
            {/* Ícono de tienda de la captura */}
            <div className="w-14 h-14 mb-3 text-gray-700 flex items-center justify-center">
              <Store className="w-10 h-10 text-brand-600 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">
              Sin cobros en el período seleccionado
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              Prueba con otro rango de fechas o tienda.
            </p>
          </div>
        )}

        {tab === 'precio_personalizado' && (
          <div className="flex flex-col items-center justify-center">
            {/* Ícono de etiqueta amarilla de la captura */}
            <div className="w-14 h-14 mb-3 text-amber-500 flex items-center justify-center">
              <Tag className="w-10 h-10 stroke-[2] fill-amber-400/20" />
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">
              Ningún producto se vendió con precio personalizado
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              En el período seleccionado nadie usó el precio manual (F5).
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
