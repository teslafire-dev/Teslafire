import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  DollarSign, 
  AlertOctagon, 
  Trophy, 
  Building2, 
  Download, 
  Calendar, 
  Filter, 
  Loader2, 
  TrendingUp, 
  PieChart, 
  Coins, 
  Boxes,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface TopVendidoItem {
  id: string;
  rank: number;
  nombre: string;
  sku: string;
  tienda: string;
  unidades: number;
  total_dolares: number;
  porcentaje_barra: number;
}

interface MenosVendidoItem {
  id: string;
  rank: number;
  nombre: string;
  sku: string;
  tienda: string;
  vendido: number;
  stock: number;
}

interface AbcItem {
  sku: string;
  nombre: string;
  categoria: string;
  stock: number;
  costo: number;
  valor_total: number;
  porcentaje_acumulado: number;
  zona: 'A' | 'B' | 'C';
}

interface UtilidadItem {
  sku: string;
  nombre: string;
  precio_venta: number;
  costo: number;
  utilidad_unitaria: number;
  margen_porcentaje: number;
  unidades_vendidas: number;
  utilidad_total: number;
}

// Datos iniciales exactamente fieles a la captura de pantalla
const defaultTopVendidosDemo: TopVendidoItem[] = [
  {
    id: 'top-1',
    rank: 1,
    nombre: 'Extintor CO2 15 Lbs',
    sku: 'EXT-C02-15',
    tienda: 'Tesla Fire',
    unidades: 1,
    total_dolares: 219.96,
    porcentaje_barra: 100
  },
  {
    id: 'top-2',
    rank: 2,
    nombre: 'Estación manual de alarma',
    sku: 'DET-EST-01',
    tienda: 'Tesla Fire',
    unidades: 1,
    total_dolares: 39.36,
    porcentaje_barra: 100
  },
  {
    id: 'top-3',
    rank: 3,
    nombre: 'Extintor Clase K 6 Lts (cocinas)',
    sku: 'EXT-CLK-06',
    tienda: 'Tesla Fire',
    unidades: 1,
    total_dolares: 194.36,
    porcentaje_barra: 100
  },
  {
    id: 'top-4',
    rank: 4,
    nombre: 'Detector de humo fotoeléctrico',
    sku: 'DET-HUM-01',
    tienda: 'Tesla Fire',
    unidades: 1,
    total_dolares: 35.67,
    porcentaje_barra: 100
  }
];

const defaultMenosVendidosDemo: MenosVendidoItem[] = [
  {
    id: 'men-1',
    rank: 1,
    nombre: 'Pasador de seguridad + precinto',
    sku: 'REP-PAS-01',
    tienda: 'Tesla Fire',
    vendido: 0,
    stock: 180
  },
  {
    id: 'men-2',
    rank: 2,
    nombre: 'Polvo Químico Seco ABC (Kg)',
    sku: 'REP-PQS-KG',
    tienda: 'Tesla Fire',
    vendido: 0,
    stock: 95
  },
  {
    id: 'men-3',
    rank: 3,
    nombre: 'Señal fotoluminiscente "Extintor"',
    sku: 'SEN-EXT-01',
    tienda: 'Tesla Fire',
    vendido: 0,
    stock: 85
  },
  {
    id: 'men-4',
    rank: 4,
    nombre: 'Señal fotoluminiscente "Salida"',
    sku: 'SEN-SAL-01',
    tienda: 'Tesla Fire',
    vendido: 0,
    stock: 72
  },
  {
    id: 'men-5',
    rank: 5,
    nombre: 'Señal "Ruta de Evacuación"',
    sku: 'SEN-RUT-01',
    tienda: 'Tesla Fire',
    vendido: 0,
    stock: 66
  }
];

const defaultAbcDemo: AbcItem[] = [
  { sku: 'EXT-CO2-15', nombre: 'Extintor CO2 15 Lbs', categoria: 'Extintores CO2', stock: 12, costo: 115.00, valor_total: 1380.00, porcentaje_acumulado: 28.5, zona: 'A' },
  { sku: 'EXT-CLK-06', nombre: 'Extintor Clase K 6 Lts (cocinas)', categoria: 'Extintores Especiales', stock: 10, costo: 95.00, valor_total: 950.00, porcentaje_acumulado: 48.1, zona: 'A' },
  { sku: 'DET-PAN-04', nombre: 'Panel de alarma 4 zonas', categoria: 'Detección y Alarma', stock: 6, costo: 135.00, valor_total: 810.00, porcentaje_acumulado: 64.8, zona: 'A' },
  { sku: 'REP-PQS-KG', nombre: 'Polvo Químico Seco ABC (Kg)', categoria: 'Repuestos y Accesorios', stock: 95, costo: 6.20, valor_total: 589.00, porcentaje_acumulado: 76.9, zona: 'B' },
  { sku: 'EXT-PQS-10', nombre: 'Extintor PQS 10 Lbs', categoria: 'Extintores PQS', stock: 18, costo: 28.00, valor_total: 504.00, porcentaje_acumulado: 87.3, zona: 'B' },
  { sku: 'DET-HUM-01', nombre: 'Detector de humo fotoeléctrico', categoria: 'Detección y Alarma', stock: 14, costo: 18.50, valor_total: 259.00, porcentaje_acumulado: 92.6, zona: 'C' },
  { sku: 'REP-PAS-01', nombre: 'Pasador de seguridad + precinto', categoria: 'Repuestos y Accesorios', stock: 180, costo: 1.10, valor_total: 198.00, porcentaje_acumulado: 96.7, zona: 'C' },
  { sku: 'SEN-EXT-01', nombre: 'Señal fotoluminiscente "Extintor"', categoria: 'Señalización y Seguridad', stock: 85, costo: 1.80, valor_total: 153.00, porcentaje_acumulado: 100.0, zona: 'C' },
];

export default function ReportesInventario() {
  const [activeTab, setActiveTab] = useState<'top' | 'abc' | 'utilidad' | 'catalogo'>('top');
  const [tiendaFiltro, setTiendaFiltro] = useState('Todas');
  const [mesFiltro, setMesFiltro] = useState('2026-09');
  const [loading, setLoading] = useState(false);

  // KPIs
  const [kpiActivos, setKpiActivos] = useState(41);
  const [kpiStock, setKpiStock] = useState(907);
  const [kpiValorizado, setKpiValorizado] = useState(9744.60);
  const [kpiCriticos, setKpiCriticos] = useState(47);

  // Listas
  const [topVendidos, setTopVendidos] = useState<TopVendidoItem[]>(defaultTopVendidosDemo);
  const [menosVendidos, setMenosVendidos] = useState<MenosVendidoItem[]>(defaultMenosVendidosDemo);
  const [abcList, setAbcList] = useState<AbcItem[]>(defaultAbcDemo);
  const [tiendas, setTiendas] = useState<any[]>([]);

  useEffect(() => {
    fetchReporteData();
  }, [tiendaFiltro, mesFiltro]);

  const fetchReporteData = async () => {
    setLoading(true);
    try {
      // 1. Tiendas
      const { data: stores } = await supabase
        .from('tiendas')
        .select('id, nombre')
        .order('nombre');
      if (stores) setTiendas(stores);

      // 2. Productos y Stock
      const { data: prods } = await supabase
        .from('productos')
        .select(`
          id,
          sku,
          nombre,
          precio,
          costo_promedio,
          stock,
          stock_minimo,
          activo,
          categorias ( nombre )
        `)
        .eq('activo', true);

      if (prods && prods.length > 0) {
        setKpiActivos(prods.length);
        const totalUds = prods.reduce((acc, p) => acc + (p.stock || 0), 0);
        const totalVal = prods.reduce((acc, p) => acc + ((p.stock || 0) * (Number(p.costo_promedio) || 0)), 0);
        const crit = prods.filter(p => (p.stock || 0) <= (p.stock_minimo || 5)).length;

        if (totalUds > 0) setKpiStock(totalUds);
        if (totalVal > 0) setKpiValorizado(totalVal);
        if (crit > 0) setKpiCriticos(crit);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular total ingresos del Top 10 Más Vendidos
  const totalIngresosTop = topVendidos.reduce((acc, item) => acc + item.total_dolares, 0);

  const handleExportarExcel = () => {
    toast.success('Descargando reporte de inventario en Excel (.xlsx)...');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/70 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO DE LA PÁGINA + SELECTORES GLOBALES
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Reportes de Inventario
          </h1>
        </div>

        {/* Controles de Tienda y Fecha a la derecha */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector Tienda */}
          <select
            value={tiendaFiltro}
            onChange={(e) => setTiendaFiltro(e.target.value)}
            className="text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-2xs focus:outline-none cursor-pointer"
          >
            <option value="Todas">Todas las tiendas</option>
            {tiendas.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>

          {/* Selector Fecha / Mes */}
          <div className="relative flex items-center">
            <input
              type="month"
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-2xs focus:outline-none cursor-pointer"
            />
          </div>

          {/* Botón Aplicar */}
          <button
            type="button"
            onClick={fetchReporteData}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          4 TARJETAS KPI SUPERIORES
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* KPI 1: Productos activos */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
          <div className="text-2xl mb-2" role="img" aria-label="box">
            📦
          </div>
          <div className="text-3xl font-black text-gray-900 font-rajdhani leading-none">
            {kpiActivos}
          </div>
          <div className="text-xs text-gray-400 font-medium mt-1">
            Productos activos
          </div>
        </div>

        {/* KPI 2: Unidades en stock */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
          <div className="text-2xl mb-2" role="img" aria-label="chart">
            📊
          </div>
          <div className="text-3xl font-black text-gray-900 font-rajdhani leading-none">
            {kpiStock}
          </div>
          <div className="text-xs text-gray-400 font-medium mt-1">
            Unidades en stock
          </div>
        </div>

        {/* KPI 3: Inventario valorizado */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
          <div className="text-2xl mb-2" role="img" aria-label="money">
            💰
          </div>
          <div className="text-3xl font-black text-gray-900 font-rajdhani leading-none">
            $ {kpiValorizado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 font-medium mt-1">
            Inventario valorizado
          </div>
        </div>

        {/* KPI 4: Críticos / quiebre */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-500 rounded-l-2xl"></div>
          <div className="text-2xl mb-2" role="img" aria-label="alert">
            🚨
          </div>
          <div className="text-3xl font-black text-red-500 font-rajdhani leading-none">
            {kpiCriticos}
          </div>
          <div className="text-xs text-gray-400 font-medium mt-1">
            Críticos / quiebre
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════
          PESTAÑAS DE NAVEGACIÓN
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center gap-2.5 mb-6">
        
        {/* Tab 1: Top 10 Más Vendidos */}
        <button
          type="button"
          onClick={() => setActiveTab('top')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'top'
              ? 'bg-[#343a40] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span role="img" aria-label="trophy">🏆</span>
          <span>Top 10 Más Vendidos</span>
        </button>

        {/* Tab 2: Rotación ABC */}
        <button
          type="button"
          onClick={() => setActiveTab('abc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'abc'
              ? 'bg-[#343a40] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span role="img" aria-label="chart">📊</span>
          <span>Rotación ABC</span>
        </button>

        {/* Tab 3: Mayor Utilidad */}
        <button
          type="button"
          onClick={() => setActiveTab('utilidad')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'utilidad'
              ? 'bg-[#343a40] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span role="img" aria-label="diamond">💎</span>
          <span>Mayor Utilidad</span>
        </button>

        {/* Tab 4: Catálogo */}
        <button
          type="button"
          onClick={() => setActiveTab('catalogo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'catalogo'
              ? 'bg-[#343a40] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span role="img" aria-label="catalog">📋</span>
          <span>Catálogo</span>
        </button>

      </div>

      {/* ══════════════════════════════════════════════════
          CONTENIDO SEGÚN PESTAÑA ACTIVA
      ══════════════════════════════════════════════════ */}

      {/* ─── PESTAÑA 1: TOP 10 MÁS Y MENOS VENDIDOS ─── */}
      {activeTab === 'top' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMNA IZQUIERDA: TOP 10 MÁS VENDIDOS (5 columnas) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div>
              {/* Cabecera de la tarjeta */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5">
                  <span role="img" aria-label="trophy" className="text-base">🏆</span>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900">
                    Top 10 Más Vendidos
                  </h2>
                </div>
                <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                  September 2026
                </div>
              </div>

              {/* Lista de productos más vendidos */}
              <div className="space-y-4">
                {topVendidos.map((item) => {
                  return (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Medalla o número */}
                          <div className="w-5 text-center shrink-0">
                            {item.rank === 1 && <span className="text-lg">🥇</span>}
                            {item.rank === 2 && <span className="text-lg">🥈</span>}
                            {item.rank === 3 && <span className="text-lg">🥉</span>}
                            {item.rank > 3 && (
                              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 font-bold text-[11px] inline-flex items-center justify-center">
                                {item.rank}
                              </span>
                            )}
                          </div>

                          {/* Nombre y Tienda */}
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                              {item.nombre}
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                              <span role="img" aria-label="store">🏪</span>
                              <span>{item.tienda}</span>
                            </div>
                          </div>
                        </div>

                        {/* Cantidad e Ingreso */}
                        <div className="text-right shrink-0">
                          <span className="text-xs text-gray-500 font-medium mr-2">
                            {item.unidades} u
                          </span>
                          <span className="text-xs sm:text-sm font-black font-rajdhani text-gray-900">
                            $ {item.total_dolares.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Barra de progreso azul */}
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#0284c7] h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.porcentaje_barra}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pie de tarjeta: Total Ingresos */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold">
                Total ingresos
              </span>
              <span className="text-base font-black font-rajdhani text-gray-900">
                $ {totalIngresosTop.toFixed(2)}
              </span>
            </div>
          </div>

          {/* COLUMNA DERECHA: TOP 10 MENOS VENDIDOS (6 columnas) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              {/* Cabecera suave color crema/amarillo */}
              <div className="p-5 sm:p-6 bg-[#fffbeb]/50 border-b border-[#fef3c7]/80">
                <div className="flex items-center gap-1.5">
                  <span role="img" aria-label="warning" className="text-base">⚠️</span>
                  <h2 className="text-sm sm:text-base font-bold text-[#92400e]">
                    Top 10 Menos Vendidos
                  </h2>
                </div>
                <div className="text-[11px] text-[#b45309] font-medium mt-0.5">
                  Con stock activo — candidatos a liquidar o promover
                </div>
              </div>

              {/* Tabla de menos vendidos */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100/90">
                      <th className="py-3 px-4 w-10 text-center">#</th>
                      <th className="py-3 px-4">PRODUCTO</th>
                      <th className="py-3 px-4">TIENDA</th>
                      <th className="py-3 px-4 text-center">VENDIDO</th>
                      <th className="py-3 px-5 text-right">STOCK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/80 text-xs font-medium">
                    {menosVendidos.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-center text-gray-400 font-bold">
                          {item.rank}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900 text-xs leading-snug">
                            {item.nombre}
                          </div>
                          <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                            {item.sku}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <span role="img" aria-label="store">🏪</span>
                            <span>{item.tienda}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-500 border border-red-100">
                            {item.vendido} u
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right font-rajdhani font-bold text-gray-900 text-sm">
                          {item.stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pie de tarjeta con sugerencia de rotación */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
              <span>5 productos inmovilizados identificados</span>
              <span className="font-bold text-gray-700">Stock total parado: 498 uds</span>
            </div>
          </div>

        </div>
      )}

      {/* ─── PESTAÑA 2: ROTACIÓN ABC ─── */}
      {activeTab === 'abc' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Clasificación de Inventario ABC (Pareto)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Zona A: 80% de inversión/rotación · Zona B: 15% · Zona C: 5% (baja rotación).
              </p>
            </div>
            <button
              onClick={handleExportarExcel}
              className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all self-start cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel</span>
            </button>
          </div>

          {/* Tarjetas resumen de zonas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Zona A (Estratégicos)</span>
              <span className="text-2xl font-black text-emerald-900 font-rajdhani block">$ 3,140.00</span>
              <span className="text-[11px] text-emerald-600 font-medium">3 productos clave (64.8% del valor)</span>
            </div>
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">Zona B (Intermedios)</span>
              <span className="text-2xl font-black text-blue-900 font-rajdhani block">$ 1,093.00</span>
              <span className="text-[11px] text-blue-600 font-medium">2 productos (22.5% del valor)</span>
            </div>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">Zona C (Baja inversión)</span>
              <span className="text-2xl font-black text-amber-900 font-rajdhani block">$ 610.00</span>
              <span className="text-[11px] text-amber-600 font-medium">3 productos (12.7% del valor)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100/90 bg-gray-50/50">
                  <th className="py-3 px-4 w-16">ZONA</th>
                  <th className="py-3 px-4">SKU / PRODUCTO</th>
                  <th className="py-3 px-4">CATEGORÍA</th>
                  <th className="py-3 px-4 text-center">STOCK</th>
                  <th className="py-3 px-4 text-right">COSTO PROM.</th>
                  <th className="py-3 px-4 text-right">VALOR TOTAL</th>
                  <th className="py-3 px-5 text-right">% ACUMULADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium">
                {abcList.map((item) => (
                  <tr key={item.sku} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        item.zona === 'A' ? 'bg-emerald-100 text-emerald-800' :
                        item.zona === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        ZONA {item.zona}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{item.nombre}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{item.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">{item.categoria}</td>
                    <td className="py-3.5 px-4 text-center font-rajdhani font-bold text-gray-800 text-sm">{item.stock}</td>
                    <td className="py-3.5 px-4 text-right font-rajdhani font-semibold text-gray-700">${item.costo.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-rajdhani font-black text-gray-900 text-sm">${item.valor_total.toFixed(2)}</td>
                    <td className="py-3.5 px-5 text-right font-rajdhani font-bold text-gray-600">{item.porcentaje_acumulado}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── PESTAÑA 3: MAYOR UTILIDAD ─── */}
      {activeTab === 'utilidad' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900">
              Productos con Mayor Margen y Utilidad Real
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Identifica los productos que generan mayor rentabilidad bruta por venta individual y acumulada.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100/90 bg-gray-50/50">
                  <th className="py-3 px-4">PRODUCTO</th>
                  <th className="py-3 px-4 text-right">PRECIO DETAL</th>
                  <th className="py-3 px-4 text-right">COSTO</th>
                  <th className="py-3 px-4 text-right">UTILIDAD UNIT.</th>
                  <th className="py-3 px-4 text-center">MARGEN %</th>
                  <th className="py-3 px-4 text-center">UNIDADES</th>
                  <th className="py-3 px-5 text-right">UTILIDAD TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium">
                <tr className="hover:bg-gray-50/60">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">Extintor CO2 15 Lbs</div>
                    <div className="text-[11px] text-gray-400 font-mono">EXT-C02-15</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-rajdhani font-bold text-gray-800">$219.96</td>
                  <td className="py-3.5 px-4 text-right font-rajdhani text-gray-500">$115.00</td>
                  <td className="py-3.5 px-4 text-right font-rajdhani font-black text-emerald-600">+$104.96</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[11px]">
                      47.7%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-rajdhani font-bold">1 u</td>
                  <td className="py-3.5 px-5 text-right font-rajdhani font-black text-emerald-700 text-sm">$104.96</td>
                </tr>
                <tr className="hover:bg-gray-50/60">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">Extintor Clase K 6 Lts (cocinas)</div>
                    <div className="text-[11px] text-gray-400 font-mono">EXT-CLK-06</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-rajdhani font-bold text-gray-800">$194.36</td>
                  <td className="py-3.5 px-4 text-right font-rajdhani text-gray-500">$95.00</td>
                  <td className="py-3.5 px-4 text-right font-rajdhani font-black text-emerald-600">+$99.36</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[11px]">
                      51.1%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-rajdhani font-bold">1 u</td>
                  <td className="py-3.5 px-5 text-right font-rajdhani font-black text-emerald-700 text-sm">$99.36</td>
                </tr>
                <tr className="hover:bg-gray-50/60">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">Estación manual de alarma</div>
                    <div className="text-[11px] text-gray-400 font-mono">DET-EST-01</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-rajdhani font-bold text-gray-800">$39.36</td>
                  <td className="py-3.5 px-4 text-right font-rajdhani text-gray-500">$19.00</td>
                  <td className="py-3.5 px-4 text-right font-rajdhani font-black text-emerald-600">+$20.36</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[11px]">
                      51.7%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-rajdhani font-bold">1 u</td>
                  <td className="py-3.5 px-5 text-right font-rajdhani font-black text-emerald-700 text-sm">$20.36</td>
                </tr>
                <tr className="hover:bg-gray-50/60">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">Detector de humo fotoeléctrico</div>
                    <div className="text-[11px] text-gray-400 font-mono">DET-HUM-01</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-rajdhani font-bold text-gray-800">$35.67</td>
                  <td className="py-3.5 px-4 text-right font-rajdhani text-gray-500">$18.50</td>
                  <td className="py-3.5 px-4 text-right font-rajdhani font-black text-emerald-600">+$17.17</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[11px]">
                      48.1%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-rajdhani font-bold">1 u</td>
                  <td className="py-3.5 px-5 text-right font-rajdhani font-black text-emerald-700 text-sm">$17.17</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── PESTAÑA 4: CATÁLOGO VALORIZADO ─── */}
      {activeTab === 'catalogo' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Valoración Total de Existencias por Producto
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Cálculo de costo promedio ponderado contra stock actual en almacenes.
              </p>
            </div>
            <button
              onClick={handleExportarExcel}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#343a40] hover:bg-black text-white rounded-xl text-xs font-bold transition-all self-start cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Descargar Catálogo (.xlsx)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Costo Total en Existencia</span>
              <span className="text-2xl font-black font-rajdhani text-gray-900">$ {kpiValorizado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Unidades Almacenadas</span>
              <span className="text-2xl font-black font-rajdhani text-gray-900">{kpiStock} unidades</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Costo Promedio por Unidad</span>
              <span className="text-2xl font-black font-rajdhani text-gray-900">$ {(kpiValorizado / (kpiStock || 1)).toFixed(2)} / ud</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
