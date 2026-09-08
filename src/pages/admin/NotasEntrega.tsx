import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Calendar, 
  Eye, 
  Printer, 
  MessageCircle, 
  Tag, 
  FileDown, 
  X, 
  Check, 
  Loader2, 
  Building2, 
  Truck, 
  DollarSign, 
  Clock,
  ShieldCheck,
  User
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface NotaItem {
  producto_id: string;
  nombre: string;
  sku: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface NotaEntrega {
  id: string;
  numero: string;
  cliente_nombre: string;
  cliente_documento: string;
  cliente_telefono?: string;
  vendedor: string;
  tienda: string;
  tipo_venta: 'CONTADO' | 'CRÉDITO';
  total: number;
  vencimiento: string;
  estado: 'Pagado' | 'Pendiente' | 'Anulado';
  despacho: 'Despachado' | 'Pendiente' | 'En Tránsito';
  fecha_hora: string;
  items?: NotaItem[];
  metodo_pago?: string;
  notas?: string;
}

// Datos iniciales fieles a la captura
const defaultNotasDemo: NotaEntrega[] = [
  {
    id: 'nt-1',
    numero: 'NTF-000001',
    cliente_nombre: 'CONSUMIDOR FINAL',
    cliente_documento: 'V-00000000',
    cliente_telefono: '0414-0000000',
    vendedor: 'Mostrador',
    tienda: 'Tesla Fire',
    tipo_venta: 'CONTADO',
    total: 219.96,
    vencimiento: '—',
    estado: 'Pagado',
    despacho: 'Despachado',
    fecha_hora: '03/09/2026 10:03 pm',
    metodo_pago: 'Efectivo Divisas USD',
    items: [
      {
        producto_id: 'p1',
        nombre: 'Extintor CO2 15 Lbs',
        sku: 'EXT-C02-15',
        cantidad: 1,
        precio_unitario: 219.96,
        subtotal: 219.96
      }
    ]
  }
];

export default function NotasEntrega() {
  const [notas, setNotas] = useState<NotaEntrega[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [desde, setDesde] = useState('2026-09-01');
  const [hasta, setHasta] = useState('2026-09-08');
  const [despachoFiltro, setDespachoFiltro] = useState('Todos');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [buscar, setBuscar] = useState('');

  // Modal de Detalle
  const [selectedNota, setSelectedNota] = useState<NotaEntrega | null>(null);

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = async () => {
    setLoading(true);
    try {
      // Consultar ventas registradas con tipo NOTA DE ENTREGA
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          id,
          numero_factura,
          numero_control,
          fecha_emision,
          total_usd,
          condicion_pago,
          estado,
          estado_despacho,
          fecha_vencimiento,
          tiendas ( nombre ),
          clientes ( nombre, documento, telefono ),
          venta_items ( sku, descripcion, cantidad, precio_unitario, subtotal )
        `)
        .eq('tipo_documento', 'NOTA DE ENTREGA')
        .order('fecha_emision', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: NotaEntrega[] = data.map((v: any) => {
          const fObj = new Date(v.fecha_emision);
          const fStr = `${fObj.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${fObj.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
          return {
            id: v.id,
            numero: v.numero_factura || `NTF-${v.id.slice(0, 6)}`,
            cliente_nombre: v.clientes?.nombre || 'CONSUMIDOR FINAL',
            cliente_documento: v.clientes?.documento || 'V-00000000',
            cliente_telefono: v.clientes?.telefono,
            vendedor: 'Mostrador',
            tienda: v.tiendas?.nombre || 'Tesla Fire',
            tipo_venta: v.condicion_pago === 'CREDITO' ? 'CRÉDITO' : 'CONTADO',
            total: Number(v.total_usd) || 0,
            vencimiento: v.fecha_vencimiento ? new Date(v.fecha_vencimiento).toLocaleDateString('es-VE') : '—',
            estado: v.estado === 'EMITIDA' ? 'Pagado' : v.estado === 'PENDIENTE_PAGO' ? 'Pendiente' : 'Anulado',
            despacho: v.estado_despacho || 'Despachado',
            fecha_hora: fStr,
            items: v.venta_items?.map((vi: any) => ({
              producto_id: vi.id,
              nombre: vi.descripcion,
              sku: vi.sku,
              cantidad: vi.cantidad,
              precio_unitario: vi.precio_unitario,
              subtotal: vi.subtotal
            }))
          };
        });
        setNotas(mapped);
      } else {
        loadLocalData();
      }
    } catch (err) {
      loadLocalData();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalData = () => {
    const local = localStorage.getItem('teslafire_notas_entrega');
    if (local) {
      setNotas(JSON.parse(local));
    } else {
      setNotas(defaultNotasDemo);
      localStorage.setItem('teslafire_notas_entrega', JSON.stringify(defaultNotasDemo));
    }
  };

  // Filtrado
  const filteredNotas = notas.filter(n => {
    if (despachoFiltro !== 'Todos' && n.despacho !== despachoFiltro) return false;
    if (estadoFiltro !== 'Todos' && n.estado !== estadoFiltro) return false;
    if (buscar.trim()) {
      const q = buscar.toLowerCase();
      const matchNum = n.numero.toLowerCase().includes(q);
      const matchNom = n.cliente_nombre.toLowerCase().includes(q);
      const matchDoc = n.cliente_documento.toLowerCase().includes(q);
      if (!matchNum && !matchNom && !matchDoc) return false;
    }
    return true;
  });

  // Total acumulado
  const totalMonto = filteredNotas.reduce((acc, n) => n.estado !== 'Anulado' ? acc + n.total : acc, 0);

  // WhatsApp
  const handleWhatsApp = (nota: NotaEntrega) => {
    const tel = nota.cliente_telefono ? nota.cliente_telefono.replace(/[^0-9]/g, '') : '';
    const phoneParam = tel.startsWith('0') ? `58${tel.slice(1)}` : tel || '584141234567';
    const text = encodeURIComponent(
      `Hola ${nota.cliente_nombre}, le adjuntamos su Nota de Entrega *${nota.numero}* de Tesla Fire por un monto de *$${nota.total.toFixed(2)}*. Estado: ${nota.despacho}. ¡Gracias por preferirnos!`
    );
    window.open(`https://wa.me/${phoneParam}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/70 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO DE LA PÁGINA
      ══════════════════════════════════════════════════ */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Notas de Entrega
          </h1>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          BARRA DE FILTROS
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          
          {/* Desde */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Hasta */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Hasta
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Despacho */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Despacho
            </label>
            <select
              value={despachoFiltro}
              onChange={(e) => setDespachoFiltro(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Despachado">Despachado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Tránsito">En Tránsito</option>
            </select>
          </div>

          {/* Estado */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Estado
            </label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Anulado">Anulado</option>
            </select>
          </div>

          {/* Buscar */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Buscar
            </label>
            <input
              type="text"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar por número o cliente..."
              className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-brand-500 placeholder:text-gray-400"
            />
          </div>

          {/* Botón Filtrar */}
          <div className="lg:col-span-1">
            <button
              type="button"
              className="w-full py-2 px-4 bg-[#343a40] hover:bg-[#23272b] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center cursor-pointer"
            >
              Filtrar
            </button>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TABLA DE NOTAS DE ENTREGA
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100/90 bg-gray-50/40">
                <th className="py-3 px-5 w-32">NÚMERO</th>
                <th className="py-3 px-5">CLIENTE</th>
                <th className="py-3 px-4">VENDEDOR</th>
                <th className="py-3 px-4">TIENDA</th>
                <th className="py-3 px-4 text-center">TIPO VENTA</th>
                <th className="py-3 px-4 text-right">TOTAL</th>
                <th className="py-3 px-4 text-center">VENCIMIENTO</th>
                <th className="py-3 px-4 text-center">ESTADO</th>
                <th className="py-3 px-4 text-center">DESPACHO</th>
                <th className="py-3 px-5">FECHA</th>
                <th className="py-3 px-5 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto mb-2" />
                    <span className="text-xs text-gray-400 font-semibold">Cargando notas de entrega...</span>
                  </td>
                </tr>
              ) : filteredNotas.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-xs text-gray-400 font-medium">
                    No se encontraron notas de entrega para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredNotas.map((nota) => {
                  return (
                    <tr 
                      key={nota.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* NÚMERO */}
                      <td className="py-4 px-5 align-middle font-mono font-bold text-gray-800 text-xs">
                        {nota.numero}
                      </td>

                      {/* CLIENTE */}
                      <td className="py-4 px-5 align-middle">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm leading-snug">
                          {nota.cliente_nombre}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          ({nota.cliente_documento})
                        </div>
                      </td>

                      {/* VENDEDOR */}
                      <td className="py-4 px-4 align-middle text-gray-600 text-xs">
                        {nota.vendedor}
                      </td>

                      {/* TIENDA */}
                      <td className="py-4 px-4 align-middle text-gray-600 text-xs">
                        {nota.tienda}
                      </td>

                      {/* TIPO VENTA */}
                      <td className="py-4 px-4 align-middle text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-[#d1fae5] text-[#065f46]">
                          {nota.tipo_venta}
                        </span>
                      </td>

                      {/* TOTAL */}
                      <td className="py-4 px-4 align-middle text-right font-rajdhani font-black text-gray-900 text-sm">
                        $ {nota.total.toFixed(2)}
                      </td>

                      {/* VENCIMIENTO */}
                      <td className="py-4 px-4 align-middle text-center text-gray-400 text-xs">
                        {nota.vencimiento}
                      </td>

                      {/* ESTADO */}
                      <td className="py-4 px-4 align-middle text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#d1fae5] text-[#065f46]">
                          {nota.estado}
                        </span>
                      </td>

                      {/* DESPACHO */}
                      <td className="py-4 px-4 align-middle text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#d1fae5] text-[#065f46]">
                          <span>✓</span>
                          <span>{nota.despacho}</span>
                        </span>
                      </td>

                      {/* FECHA */}
                      <td className="py-4 px-5 align-middle text-gray-500 text-xs">
                        {nota.fecha_hora}
                      </td>

                      {/* ACCIONES (5 iconos: Ojo, Impresora, WhatsApp, Etiqueta, PDF) */}
                      <td className="py-4 px-5 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Ver Detalle */}
                          <button
                            type="button"
                            onClick={() => setSelectedNota(nota)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                            title="Ver Nota"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Imprimir */}
                          <button
                            type="button"
                            onClick={() => toast.success(`Imprimiendo nota ${nota.numero}...`)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                            title="Imprimir"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* WhatsApp */}
                          <button
                            type="button"
                            onClick={() => handleWhatsApp(nota)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                            title="Enviar por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Etiqueta / Tag */}
                          <button
                            type="button"
                            onClick={() => toast.success(`Generando etiqueta de despacho para ${nota.numero}...`)}
                            className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Etiqueta de Despacho"
                          >
                            <Tag className="w-4 h-4" />
                          </button>

                          {/* Descargar PDF */}
                          <button
                            type="button"
                            onClick={() => toast.success(`Descargando PDF de ${nota.numero}...`)}
                            className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                            title="Descargar PDF"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ══════════════════════════════════════════════════
            PIE DE TABLA: RESUMEN TOTAL DE NOTAS MOSTRADAS
        ══════════════════════════════════════════════════ */}
        <div className="p-4 sm:p-5 border-t border-gray-100/90 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            TOTAL ({filteredNotas.length} NOTAS MOSTRADAS)
          </div>

          <div className="text-right">
            <div className="text-base font-black font-rajdhani text-gray-900 leading-none">
              $ {totalMonto.toFixed(2)}
            </div>
            <div className="text-[10px] text-gray-400 font-medium mt-0.5">
              neto de anuladas y devoluciones
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MODAL: VER NOTA DE ENTREGA
      ══════════════════════════════════════════════════ */}
      {selectedNota && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Nota de Entrega {selectedNota.numero}
                </h3>
                <span className="text-[11px] text-gray-400">
                  Emitida el {selectedNota.fecha_hora}
                </span>
              </div>
              <button 
                onClick={() => setSelectedNota(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              
              {/* Info Cliente y Tienda */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1">
                <div className="font-bold text-gray-900">{selectedNota.cliente_nombre}</div>
                <div className="text-gray-500">Documento: {selectedNota.cliente_documento}</div>
                <div className="text-gray-500">Tienda de Despacho: {selectedNota.tienda}</div>
                <div className="text-gray-500">Condición de Venta: {selectedNota.tipo_venta}</div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold">Estado:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {selectedNota.estado}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ✓ {selectedNota.despacho}
                  </span>
                </div>
              </div>

              {/* Items */}
              {selectedNota.items && selectedNota.items.length > 0 && (
                <div>
                  <span className="font-bold text-gray-700 block mb-2">Artículos Despachados:</span>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {selectedNota.items.map((it, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <div className="font-bold text-gray-900">{it.nombre}</div>
                          <div className="text-[10px] text-gray-400">{it.sku} · {it.cantidad} u × ${it.precio_unitario.toFixed(2)}</div>
                        </div>
                        <div className="font-rajdhani font-black text-gray-900 text-sm">
                          ${it.subtotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <span className="font-bold text-gray-700">Total Despacho:</span>
                <span className="font-black font-rajdhani text-lg text-gray-900">
                  $ {selectedNota.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleWhatsApp(selectedNota)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toast.success(`Imprimiendo nota ${selectedNota.numero}...`)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNota(null)}
                  className="px-4 py-2 bg-[#343a40] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
