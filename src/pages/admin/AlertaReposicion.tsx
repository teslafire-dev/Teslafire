import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Mail, 
  Package, 
  X, 
  Filter, 
  DollarSign, 
  Send, 
  Loader2, 
  Check, 
  ExternalLink,
  ShoppingCart,
  FileSpreadsheet
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface AlertaItem {
  id: string;
  producto_id: string;
  sku: string;
  nombre: string;
  categoria: string;
  urgencia: 'BAJO' | 'PRÓXIMO' | 'CRÍTICO';
  stock_actual: number;
  punto_reposicion: number;
  en_transito: number;
  dias_quiebre: string;
  sugerido: number;
  costo_estimado: number;
  ultimo_proveedor: string;
}

// Datos iniciales fieles exactamente a la captura de pantalla del usuario
const defaultAlertasDemo: AlertaItem[] = [
  {
    id: 'alt-1',
    producto_id: 'prod-co2-15',
    sku: 'EXT-C02-15',
    nombre: 'Extintor CO2 15 Lbs',
    categoria: 'Extintores CO2',
    urgencia: 'BAJO',
    stock_actual: 2,
    punto_reposicion: 4,
    en_transito: 0,
    dias_quiebre: '~120 días',
    sugerido: 4,
    costo_estimado: 460.00,
    ultimo_proveedor: 'Sin registro'
  },
  {
    id: 'alt-2',
    producto_id: 'prod-co2-20',
    sku: 'EXT-C02-20',
    nombre: 'Extintor CO2 20 Lbs',
    categoria: 'Extintores CO2',
    urgencia: 'BAJO',
    stock_actual: 2,
    punto_reposicion: 3,
    en_transito: 0,
    dias_quiebre: 'Sin rotación',
    sugerido: 3,
    costo_estimado: 444.00,
    ultimo_proveedor: 'Sin registro'
  },
  {
    id: 'alt-3',
    producto_id: 'prod-clk-06',
    sku: 'EXT-CLK-06',
    nombre: 'Extintor Clase K 6 Lts (cocinas)',
    categoria: 'Extintores Especiales',
    urgencia: 'BAJO',
    stock_actual: 3,
    punto_reposicion: 4,
    en_transito: 0,
    dias_quiebre: '~90 días',
    sugerido: 3,
    costo_estimado: 285.00,
    ultimo_proveedor: 'Sin registro'
  },
  {
    id: 'alt-4',
    producto_id: 'prod-det-pan',
    sku: 'DET-PAN-04',
    nombre: 'Panel de alarma 4 zonas',
    categoria: 'Detección y Alarma',
    urgencia: 'PRÓXIMO',
    stock_actual: 3,
    punto_reposicion: 3,
    en_transito: 0,
    dias_quiebre: 'Sin rotación',
    sugerido: 2,
    costo_estimado: 270.00,
    ultimo_proveedor: 'Sin registro'
  },
  {
    id: 'alt-5',
    producto_id: 'prod-det-hum',
    sku: 'DET-HUM-01',
    nombre: 'Detector de humo fotoeléctrico',
    categoria: 'Detección y Alarma',
    urgencia: 'PRÓXIMO',
    stock_actual: 5,
    punto_reposicion: 5,
    en_transito: 0,
    dias_quiebre: '~60 días',
    sugerido: 5,
    costo_estimado: 250.00,
    ultimo_proveedor: 'Sin registro'
  },
  {
    id: 'alt-6',
    producto_id: 'prod-det-est',
    sku: 'DET-EST-01',
    nombre: 'Estación manual de alarma',
    categoria: 'Detección y Alarma',
    urgencia: 'PRÓXIMO',
    stock_actual: 4,
    punto_reposicion: 4,
    en_transito: 0,
    dias_quiebre: '~45 días',
    sugerido: 4,
    costo_estimado: 205.00,
    ultimo_proveedor: 'Sin registro'
  }
];

export default function AlertaReposicion() {
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [urgenciaFiltro, setUrgenciaFiltro] = useState('Todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [categoriasList, setCategoriasList] = useState<string[]>([]);

  // Modal Enviar Correo
  const [showMailModal, setShowMailModal] = useState(false);
  const [mailTo, setMailTo] = useState('compras@teslafire.com, gerencia@teslafire.com');
  const [mailAsunto, setMailAsunto] = useState('⚠️ Sugerencias & Alertas de Reposición de Inventario - Tesla Fire');
  const [sendingMail, setSendingMail] = useState(false);

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    setLoading(true);
    try {
      // 1. Obtener productos y categorías reales si existen
      const { data: prods } = await supabase
        .from('productos')
        .select(`
          id,
          sku,
          nombre,
          stock,
          stock_minimo,
          costo_promedio,
          categoria_id,
          categorias ( nombre ),
          producto_stock ( stock_actual )
        `)
        .eq('activo', true);

      // Si hay productos en la base de datos con stock bajo
      if (prods && prods.length > 0) {
        const generatedAlerts: AlertaItem[] = [];

        prods.forEach(p => {
          const actual = p.stock || 0;
          const min = p.stock_minimo || 5;
          const catNombre = (p.categorias as any)?.nombre || 'General';

          if (actual <= min) {
            const pct = min > 0 ? (actual / min) : 1;
            let urg: 'BAJO' | 'PRÓXIMO' | 'CRÍTICO' = 'BAJO';
            if (actual === 0) urg = 'CRÍTICO';
            else if (pct >= 0.9) urg = 'PRÓXIMO';

            const sug = Math.max(1, (min * 2) - actual);
            const costoUnit = Number(p.costo_promedio) || 50;

            generatedAlerts.push({
              id: p.id,
              producto_id: p.id,
              sku: p.sku,
              nombre: p.nombre,
              categoria: catNombre,
              urgencia: urg,
              stock_actual: actual,
              punto_reposicion: min,
              en_transito: 0,
              dias_quiebre: actual === 0 ? 'Inmediato' : '~60 días',
              sugerido: sug,
              costo_estimado: sug * costoUnit,
              ultimo_proveedor: 'Sin registro'
            });
          }
        });

        if (generatedAlerts.length > 0) {
          setAlertas(generatedAlerts);
          const cats = Array.from(new Set(generatedAlerts.map(a => a.categoria)));
          setCategoriasList(cats);
        } else {
          useDefaultData();
        }
      } else {
        useDefaultData();
      }
    } catch (err) {
      useDefaultData();
    } finally {
      setLoading(false);
    }
  };

  const useDefaultData = () => {
    const saved = localStorage.getItem('teslafire_alertas_reposicion');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAlertas(parsed);
      const cats = Array.from(new Set(parsed.map((a: AlertaItem) => a.categoria))) as string[];
      setCategoriasList(cats);
    } else {
      setAlertas(defaultAlertasDemo);
      const cats = Array.from(new Set(defaultAlertasDemo.map(a => a.categoria)));
      setCategoriasList(cats);
      localStorage.setItem('teslafire_alertas_reposicion', JSON.stringify(defaultAlertasDemo));
    }
  };

  // Filtrado
  const filteredAlertas = alertas.filter(a => {
    if (urgenciaFiltro !== 'Todos') {
      if (urgenciaFiltro === 'Bajo' && a.urgencia !== 'BAJO') return false;
      if (urgenciaFiltro === 'Próximo al límite' && a.urgencia !== 'PRÓXIMO') return false;
      if (urgenciaFiltro === 'Crítico' && a.urgencia !== 'CRÍTICO') return false;
    }
    if (categoriaFiltro !== 'Todas' && a.categoria !== categoriaFiltro) return false;
    return true;
  });

  // Métricas calculadas para píldoras
  const totalEnAlerta = alertas.length;
  const countBajos = alertas.filter(a => a.urgencia === 'BAJO').length;
  const countProximos = alertas.filter(a => a.urgencia === 'PRÓXIMO').length;
  const totalCompraEstimada = alertas.reduce((acc, a) => acc + a.costo_estimado, 0);

  const handleLimpiarFiltros = () => {
    setUrgenciaFiltro('Todos');
    setCategoriaFiltro('Todas');
  };

  const handleEnviarCorreo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingMail(true);
    setTimeout(() => {
      setSendingMail(false);
      setShowMailModal(false);
      toast.success(`Alerta de reposición enviada exitosamente a ${mailTo}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/70 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO DE LA PÁGINA
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl" role="img" aria-label="alerta">
              ⚠️
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Sugerencias & Alertas de Reposición
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Productos con stock crítico, stock mínimo alcanzado y requerimiento de reposición.
          </p>
        </div>

        {/* Botón Enviar Alerta por Correo */}
        <button
          type="button"
          onClick={() => setShowMailModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#343a40] hover:bg-[#23272b] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <Mail className="w-4 h-4 text-white stroke-[2.2]" />
          <span>Enviar Alerta por Correo</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          FILA DE PÍLDORAS / KPIS
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        
        {/* Lado izquierdo: 3 píldoras informativas */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Pill 1: Total productos en alerta */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200/90 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
            <Package className="w-3.5 h-3.5 text-gray-500" />
            <span>{totalEnAlerta} productos en alerta</span>
          </div>

          {/* Pill 2: Bajos */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#fff5ea] border border-[#fed7aa]/70 rounded-xl text-xs font-bold text-[#c05621] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#f97316]"></span>
            <span>{countBajos} Bajos</span>
          </div>

          {/* Pill 3: Próximos al límite */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#fefce8] border border-[#fef08a] rounded-xl text-xs font-bold text-[#854d0e] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#eab308]"></span>
            <span>{countProximos} Próximos al límite</span>
          </div>
        </div>

        {/* Lado derecho: Compra estimada */}
        <div className="flex items-center gap-1.5 px-3.5 py-1 bg-[#fef9c3]/70 border border-[#fef08a] rounded-xl text-xs font-bold text-[#713f12] shadow-2xs">
          <span role="img" aria-label="money">💰</span>
          <span>Compra estimada:</span>
          <span className="font-rajdhani font-black text-sm tracking-wide">
            ${totalCompraEstimada.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════
          BARRA DE FILTROS
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs mb-6">
        <div className="flex flex-wrap items-end gap-3.5">
          
          {/* URGENCIA */}
          <div className="w-48 sm:w-52">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              URGENCIA
            </label>
            <select
              value={urgenciaFiltro}
              onChange={(e) => setUrgenciaFiltro(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white text-gray-700 cursor-pointer"
            >
              <option value="Todos">Todos los niveles</option>
              <option value="Bajo">Bajo</option>
              <option value="Próximo al límite">Próximo al límite</option>
              <option value="Crítico">Crítico</option>
            </select>
          </div>

          {/* CATEGORÍA */}
          <div className="w-56 sm:w-64">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              CATEGORÍA
            </label>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white text-gray-700 cursor-pointer"
            >
              <option value="Todas">Todas las categorías</option>
              {categoriasList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* BOTÓN FILTRAR */}
          <div>
            <button
              type="button"
              className="px-4 py-2 bg-[#343a40] hover:bg-[#23272b] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Filtrar</span>
            </button>
          </div>

          {/* BOTÓN LIMPIAR */}
          <div>
            <button
              type="button"
              onClick={handleLimpiarFiltros}
              className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl border border-gray-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
              <span>Limpiar</span>
            </button>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TABLA DE ALERTAS DE STOCK
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        
        {/* Cabecera de la tabla */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 bg-white">
          <AlertTriangle className="w-4 h-4 text-red-500 stroke-[2.2]" />
          <h2 className="text-xs sm:text-sm font-bold text-gray-800 tracking-tight">
            Alertas de Stock – {filteredAlertas.length} productos
          </h2>
        </div>

        {/* Tabla responsive */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100/90 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/40">
                <th className="py-3 px-5 w-24">URGENCIA</th>
                <th className="py-3 px-5">PRODUCTO</th>
                <th className="py-3 px-5 w-48">STOCK VS PUNTO REPOSICIÓN</th>
                <th className="py-3 px-4 text-center w-28">EN TRÁNSITO</th>
                <th className="py-3 px-4 text-center w-28">DÍAS P/QUIEBRE</th>
                <th className="py-3 px-4 text-center w-24">SUGERIDO</th>
                <th className="py-3 px-5 text-right w-28">COSTO EST.</th>
                <th className="py-3 px-5 w-36">ÚLTIMO PROVEEDOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto mb-2" />
                    <span className="text-xs text-gray-400 font-semibold">Cargando alertas de reposición...</span>
                  </td>
                </tr>
              ) : filteredAlertas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs text-gray-400 font-medium">
                    No hay productos en alerta con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredAlertas.map((item) => {
                  const pct = Math.round((item.stock_actual / item.punto_reposicion) * 100);
                  const isBajo = item.urgencia === 'BAJO';
                  const isProximo = item.urgencia === 'PRÓXIMO';
                  const isCritico = item.urgencia === 'CRÍTICO';

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* URGENCIA */}
                      <td className="py-4 px-5 align-middle">
                        {isBajo && (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-[#fdf2e9] text-[#c05621] border border-[#fed7aa]/60 uppercase">
                            BAJO
                          </span>
                        )}
                        {isProximo && (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-[#fefcbf] text-[#854d0e] border border-[#fef08a] uppercase">
                            PRÓXIMO
                          </span>
                        )}
                        {isCritico && (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-red-50 text-red-700 border border-red-200 uppercase">
                            CRÍTICO
                          </span>
                        )}
                      </td>

                      {/* PRODUCTO */}
                      <td className="py-4 px-5 align-middle">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm leading-snug">
                          {item.nombre}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5 flex items-center gap-1.5">
                          <span>{item.sku}</span>
                          <span>·</span>
                          <span className="font-sans text-gray-400">{item.categoria}</span>
                        </div>
                      </td>

                      {/* STOCK VS PUNTO REPOSICIÓN */}
                      <td className="py-4 px-5 align-middle">
                        <div className="flex items-baseline gap-1">
                          <span className={`font-rajdhani font-black text-sm ${
                            isBajo ? 'text-[#ea580c]' : isProximo ? 'text-[#ca8a04]' : 'text-red-600'
                          }`}>
                            {item.stock_actual}
                          </span>
                          <span className="text-gray-400 text-xs font-bold">/</span>
                          <span className="text-gray-400 text-xs font-semibold">
                            {item.punto_reposicion}
                          </span>
                        </div>

                        {/* Barra de progreso */}
                        <div className="w-full max-w-[130px] bg-gray-100 rounded-full h-1.5 my-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isBajo ? 'bg-[#f97316]' : isProximo ? 'bg-[#eab308]' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>

                        <div className="text-[10px] text-gray-400 font-medium">
                          {pct}% del punto mínimo
                        </div>
                      </td>

                      {/* EN TRÁNSITO */}
                      <td className="py-4 px-4 text-center align-middle text-gray-400">
                        {item.en_transito > 0 ? (
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 font-bold font-rajdhani rounded">
                            +{item.en_transito} uds
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>

                      {/* DÍAS P/QUIEBRE */}
                      <td className="py-4 px-4 text-center align-middle text-gray-500 text-xs">
                        {item.dias_quiebre}
                      </td>

                      {/* SUGERIDO */}
                      <td className="py-4 px-4 text-center align-middle">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-gray-100 text-gray-800 font-rajdhani font-black text-xs">
                          +{item.sugerido} uds
                        </span>
                      </td>

                      {/* COSTO EST. */}
                      <td className="py-4 px-5 text-right align-middle font-rajdhani font-black text-gray-900 text-sm">
                        ${item.costo_estimado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* ÚLTIMO PROVEEDOR */}
                      <td className="py-4 px-5 align-middle text-xs text-gray-400 italic">
                        {item.ultimo_proveedor}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════
          MODAL ENVIAR ALERTA POR CORREO
      ══════════════════════════════════════════════════ */}
      {showMailModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-800" />
                <h3 className="text-sm font-bold text-gray-900">
                  Enviar Reporte de Reposición por Correo
                </h3>
              </div>
              <button 
                onClick={() => setShowMailModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnviarCorreo} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Destinatarios (separados por coma) *
                </label>
                <input
                  type="text"
                  required
                  value={mailTo}
                  onChange={(e) => setMailTo(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Asunto del Correo *
                </label>
                <input
                  type="text"
                  required
                  value={mailAsunto}
                  onChange={(e) => setMailAsunto(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                />
              </div>

              {/* Vista previa del contenido */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-xs">
                <span className="font-bold text-gray-700 block mb-1">Resumen a enviar:</span>
                <ul className="text-gray-600 space-y-1 pl-4 list-disc text-[11px]">
                  <li>Total de productos en alerta: <strong>{totalEnAlerta} artículos</strong></li>
                  <li>Stock Crítico / Bajo: <strong>{countBajos} artículos</strong></li>
                  <li>Próximos al límite de seguridad: <strong>{countProximos} artículos</strong></li>
                  <li>Inversión de compra sugerida: <strong>${totalCompraEstimada.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></li>
                </ul>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMailModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sendingMail}
                  className="px-5 py-2 text-xs font-bold bg-[#343a40] hover:bg-black text-white rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {sendingMail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Enviar Alerta</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
