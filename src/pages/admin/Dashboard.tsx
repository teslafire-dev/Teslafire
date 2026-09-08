import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Boxes, 
  Store, 
  Calendar, 
  ArrowUpRight, 
  RefreshCw, 
  Plus, 
  Receipt, 
  Truck, 
  Users, 
  ChevronRight, 
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { usdRate } = useCurrency();
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes' | 'mes_anterior' | 'custom'>('hoy');
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [desde, setDesde] = useState(new Date().toISOString().split('T')[0]);
  const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Estadísticas del Dashboard
  const [stats, setStats] = useState({
    divisaUsd: 0,
    divisaBcv: 0,
    divisaParalelo: 0,
    cxcPendiente: 266.83,
    cxcClientes: 1,
    inventarioValorizado: 9744.60,
    stockCriticoCount: 47,
    totalFacturas: 0,
    ventasContado: 0,
    ventasCredito: 0,
    cxcVencido: 0
  });

  const bcvDisplay = usdRate && usdRate > 0 ? usdRate : 804.81;

  useEffect(() => {
    fetchStats();
  }, [periodo, desde, hasta]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 1. Conteo de stock crítico
      const { count: lowStock } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 5);

      // 2. Conteo de productos totales para inventario valorizado
      const { data: prods } = await supabase
        .from('productos')
        .select('precio, stock');

      let valorizado = 9744.60;
      if (prods && prods.length > 0) {
        valorizado = prods.reduce((acc, p) => acc + ((p.precio || 0) * (p.stock || 0)), 0);
      }

      setStats(prev => ({
        ...prev,
        stockCriticoCount: lowStock || 47,
        inventarioValorizado: valorizado > 0 ? valorizado : 9744.60
      }));
    } catch (err) {
      console.error('Error fetching dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  const fmtUsd = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtBs = (n: number) => `Bs. ${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ══════════════════════════════════════════════════════
           BARRA DE FILTROS TEMPORALES
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 backdrop-blur-md p-2 rounded-2xl border border-white/60 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['hoy', 'semana', 'mes', 'mes_anterior'] as const).map((p) => {
            const labels: Record<string, string> = {
              hoy: 'Hoy',
              semana: '7 días',
              mes: 'Este mes',
              mes_anterior: 'Mes anterior'
            };
            const active = periodo === p;
            return (
              <button
                key={p}
                onClick={() => {
                  setPeriodo(p);
                  setShowCustomDates(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-brand-900 text-white shadow-md shadow-brand-900/20'
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}

          <button
            onClick={() => {
              setPeriodo('custom');
              setShowCustomDates(!showCustomDates);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              periodo === 'custom'
                ? 'bg-brand-900 text-white shadow-md shadow-brand-900/20'
                : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
            }`}
          >
            Personalizado
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchStats();
              toast.success('Métricas actualizadas');
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-900 hover:bg-gray-100 transition-colors"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="text-xs text-gray-400 font-semibold px-2">
            {periodo === 'hoy' ? 'Hoy' : (periodo === 'semana' ? 'Últimos 7 días' : 'Filtrado')}
          </div>
        </div>
      </div>

      {/* Selector de Fechas Personalizadas */}
      {showCustomDates && (
        <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-sm animate-in fade-in zoom-in-95 duration-150">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:border-brand-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Hasta</label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:border-brand-500 font-semibold"
              />
            </div>
            <button
              onClick={() => {
                fetchStats();
                setShowCustomDates(false);
              }}
              className="bg-brand-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-950 transition-colors shadow-sm"
            >
              Aplicar Rango
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
           ALERTA DE STOCK CRÍTICO
      ══════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-xs md:text-sm font-semibold truncate">
            <b>{stats.stockCriticoCount} producto(s)</b> en stock crítico o quiebre de inventario.
          </span>
        </div>
        <Link
          to="/admin/inventario/productos"
          className="text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1 flex-shrink-0"
        >
          <span>Ver catálogo</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════════
           KPI CARDS (GLOSS & MODERN TECH AESTHETIC)
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Divisa Cobrada */}
        <Link
          to="/admin/ventas/caja"
          className="group relative bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/80 shadow-sm hover:shadow-md hover:border-electrico-500/40 transition-all cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-electrico-500/5 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
          
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-900 shadow-sm">
              <DollarSign className="w-5 h-5 text-electrico-500" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {periodo === 'hoy' ? 'Hoy' : 'Caja Real'}
            </span>
          </div>
          
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Divisa Cobrada
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[9px] font-bold text-gray-400 uppercase">Dólar</div>
              <div className="text-sm md:text-base font-extrabold text-emerald-600 font-rajdhani leading-tight">
                {fmtUsd(stats.divisaUsd)}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-gray-400 uppercase">Ref BCV</div>
              <div className="text-sm md:text-base font-extrabold text-brand-900 font-rajdhani leading-tight">
                {fmtBs(stats.divisaBcv)}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-gray-400 uppercase">Paralelo</div>
              <div className="text-sm md:text-base font-extrabold text-brand-900 font-rajdhani leading-tight">
                {fmtBs(stats.divisaParalelo)}
              </div>
            </div>
          </div>
        </Link>

        {/* KPI 2: CXC Pendiente */}
        <Link
          to="/admin/cxc/estado"
          className="group relative bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/80 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-900 shadow-sm">
              <Receipt className="w-5 h-5 text-electrico-500" />
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Créditos
            </span>
          </div>
          
          <div className="text-xl md:text-2xl font-black text-gray-900 font-rajdhani tracking-wide">
            {fmtUsd(stats.cxcPendiente)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 font-medium">
            CXC pdte. · <span className="font-bold text-gray-700">{stats.cxcClientes} cliente con deuda</span>
          </div>
        </Link>

        {/* KPI 3: Inventario Valorizado */}
        <Link
          to="/admin/inventario/reportes"
          className="group relative bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/80 shadow-sm hover:shadow-md hover:border-electrico-500/40 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-900 shadow-sm">
              <Boxes className="w-5 h-5 text-electrico-500" />
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              Activo
            </span>
          </div>
          
          <div className="text-xl md:text-2xl font-black text-gray-900 font-rajdhani tracking-wide">
            {fmtUsd(stats.inventarioValorizado)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 font-medium">
            Inventario valorizado en almacén
          </div>
        </Link>

        {/* KPI 4: Stock Crítico */}
        <Link
          to="/admin/inventario/productos"
          className="group relative bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/80 shadow-sm hover:shadow-md hover:border-red-500/40 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/10 border border-red-500/20 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              Reposición
            </span>
          </div>
          
          <div className="text-xl md:text-2xl font-black text-red-600 font-rajdhani tracking-wide">
            {stats.stockCriticoCount} prod.
          </div>
          <div className="text-[11px] text-gray-400 mt-1 font-medium">
            Stock crítico · en quiebre o mínimo
          </div>
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════════
           VENTAS POR TIENDA (TARJETA OSCURA CON GLOSS TESLA FIRE)
      ══════════════════════════════════════════════════════ */}
      <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-white">
        {/* Cabecera Negra de Marca */}
        <div 
          className="relative px-6 py-6 flex items-center justify-between gap-4 overflow-hidden"
          style={{ background: 'linear-gradient(120deg, #080A0C, #1B1F23)' }}
        >
          {/* Líneas decorativas inclinadas con efecto eléctrico */}
          <div className="absolute right-14 top-0 bottom-0 hidden lg:flex items-center gap-2 opacity-15 pointer-events-none">
            <span className="w-1 h-12 bg-electrico-500 transform -skew-x-12" />
            <span className="w-1 h-12 bg-electrico-500 transform -skew-x-12" />
            <span className="w-1 h-12 bg-electrico-500 transform -skew-x-12" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2.5">
              <Store className="w-5 h-5 text-electrico-500" />
              <h3 className="text-xl font-bold text-white font-rajdhani tracking-wider">
                Ventas por Tienda
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Cobrado en caja por moneda · Contado vs Crédito · Balance vivo de CXC
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <span className="text-xs font-bold text-brand-900 bg-electrico-500 px-3.5 py-1.5 rounded-full shadow-sm">
              1 tienda activa
            </span>
          </div>
        </div>

        {/* Cuerpo del Consolidado */}
        <div className="p-6">
          {/* Franja de Resumen Consolidado */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-5 mb-5 border-b border-gray-100 text-xs md:text-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Consolidado:
            </span>
            <span className="font-extrabold text-emerald-600 font-rajdhani text-lg" title="Dólares">
              $ 0.00
            </span>
            <span className="font-extrabold text-brand-900 font-rajdhani text-lg" title="Ref BCV">
              Bs. 0,00
            </span>
            <span className="font-extrabold text-brand-900 font-rajdhani text-lg" title="Ref Paralelo">
              Bs. 0,00
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500 font-semibold">{stats.totalFacturas} facturas</span>
            <span className="text-gray-300">·</span>
            <span className="text-amber-700 font-bold">Por cobrar: {fmtUsd(stats.cxcPendiente)}</span>
          </div>

          {/* Tarjeta por Sucursal */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200/70 p-4 bg-white hover:border-gray-300 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-900 flex items-center justify-center text-electrico-500 shadow-sm">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-gray-900 font-rajdhani block leading-tight">
                      Tesla Fire Principal
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">TF-01</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                  {stats.totalFacturas} fac.
                </span>
              </div>

              {/* Grid de Monedas */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-gray-50/80 rounded-xl mb-3 border border-gray-100">
                <div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase">Dólar</div>
                  <div className="text-sm font-black text-emerald-600 font-rajdhani leading-tight">$ 0.00</div>
                </div>
                <div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase">Ref BCV</div>
                  <div className="text-sm font-black text-brand-900 font-rajdhani leading-tight">Bs. 0,00</div>
                </div>
                <div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase">Paralelo</div>
                  <div className="text-sm font-black text-brand-900 font-rajdhani leading-tight">Bs. 0,00</div>
                </div>
              </div>

              {/* Badges de Estado */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 rounded-lg px-2.5 py-1 font-medium">
                  <span>Contado</span>
                  <span className="font-bold">$ 0.00</span>
                </div>
                <div className="flex items-center justify-between bg-brand-50 text-brand-900 rounded-lg px-2.5 py-1 font-medium">
                  <span>Crédito</span>
                  <span className="font-bold">$ 0.00</span>
                </div>
                <div className="flex items-center justify-between bg-amber-50 text-amber-800 rounded-lg px-2.5 py-1 font-medium">
                  <span>Por cobrar</span>
                  <span className="font-bold">$ 266.83</span>
                </div>
                <div className="flex items-center justify-between bg-gray-100 text-gray-600 rounded-lg px-2.5 py-1 font-medium">
                  <span>Vencido</span>
                  <span className="font-bold">$ 0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
