import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Calendar, 
  Eye, 
  Printer, 
  MessageCircle, 
  Tag, 
  X, 
  Check, 
  Loader2, 
  Building2, 
  Receipt, 
  DollarSign, 
  Clock,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface FacturaItem {
  producto_id: string;
  nombre: string;
  sku: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface FacturaFiscal {
  id: string;
  numero: string;
  numero_control?: string;
  cliente_nombre: string;
  cliente_documento: string;
  cliente_telefono?: string;
  cliente_direccion?: string;
  vendedor: string;
  tienda: string;
  tipo_venta: 'CONTADO' | 'CRÉDITO';
  total: number;
  saldo_pendiente?: number;
  impuestos_iva: number;
  estado: 'Pagado' | 'Por Cobrar' | 'Anulado';
  origen: string;
  fecha_hora: string;
  tasa_bcv: number;
  total_bs: number;
  items?: FacturaItem[];
  metodo_pago?: string;
}

// Datos iniciales fieles a la captura
const defaultFacturasDemo: FacturaFiscal[] = [
  {
    id: 'fac-2',
    numero: 'FFTF-000002',
    numero_control: '00-000002',
    cliente_nombre: 'roberth diaz',
    cliente_documento: 'V24969560',
    cliente_telefono: '0412-1234567',
    cliente_direccion: 'Caracas, Venezuela',
    vendedor: 'Mostrador',
    tienda: 'Tesla Fire',
    tipo_venta: 'CRÉDITO',
    total: 266.83,
    saldo_pendiente: 266.83,
    impuestos_iva: 36.80,
    estado: 'Por Cobrar',
    origen: 'Directa',
    fecha_hora: '06/09/2026 10:04 am',
    tasa_bcv: 36.50,
    total_bs: 9739.30,
    items: [
      {
        producto_id: 'p1',
        nombre: 'Extintor CO2 15 Lbs',
        sku: 'EXT-C02-15',
        cantidad: 1,
        precio_unitario: 219.96,
        subtotal: 219.96
      },
      {
        producto_id: 'p2',
        nombre: 'Detector de humo fotoeléctrico',
        sku: 'DET-HUM-01',
        cantidad: 1,
        precio_unitario: 46.87,
        subtotal: 46.87
      }
    ]
  },
  {
    id: 'fac-1',
    numero: 'FFTF-000001',
    numero_control: '00-000001',
    cliente_nombre: 'CONSUMIDOR FINAL',
    cliente_documento: 'V-00000000',
    cliente_telefono: '0414-0000000',
    vendedor: 'Mostrador',
    tienda: 'Tesla Fire',
    tipo_venta: 'CONTADO',
    total: 45.66,
    saldo_pendiente: 0,
    impuestos_iva: 6.30,
    estado: 'Pagado',
    origen: 'Directa',
    fecha_hora: '03/09/2026 10:01 pm',
    tasa_bcv: 36.50,
    total_bs: 1666.59,
    items: [
      {
        producto_id: 'p3',
        nombre: 'Estación manual de alarma',
        sku: 'DET-EST-01',
        cantidad: 1,
        precio_unitario: 39.36,
        subtotal: 39.36
      }
    ]
  }
];

export default function Facturas() {
  const [facturas, setFacturas] = useState<FacturaFiscal[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [desde, setDesde] = useState('2026-09-01');
  const [hasta, setHasta] = useState('2026-09-08');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [buscar, setBuscar] = useState('');

  // Modal Factura
  const [selectedFactura, setSelectedFactura] = useState<FacturaFiscal | null>(null);

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          id,
          numero_factura,
          numero_control,
          fecha_emision,
          total_usd,
          subtotal_usd,
          iva_monto_usd,
          tasa_bcv,
          total_bs,
          saldo_pendiente_usd,
          condicion_pago,
          estado,
          tiendas ( nombre ),
          clientes ( nombre, documento, telefono, direccion ),
          venta_items ( sku, descripcion, cantidad, precio_unitario, subtotal )
        `)
        .eq('tipo_documento', 'FACTURA FISCAL')
        .order('fecha_emision', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: FacturaFiscal[] = data.map((v: any) => {
          const fObj = new Date(v.fecha_emision);
          const fStr = `${fObj.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${fObj.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
          const esCredito = v.condicion_pago === 'CREDITO';
          const saldo = Number(v.saldo_pendiente_usd) || 0;

          return {
            id: v.id,
            numero: v.numero_factura || `FFTF-${v.id.slice(0, 6)}`,
            numero_control: v.numero_control || '00-000001',
            cliente_nombre: v.clientes?.nombre || 'CONSUMIDOR FINAL',
            cliente_documento: v.clientes?.documento || 'V-00000000',
            cliente_telefono: v.clientes?.telefono,
            cliente_direccion: v.clientes?.direccion,
            vendedor: 'Mostrador',
            tienda: v.tiendas?.nombre || 'Tesla Fire',
            tipo_venta: esCredito ? 'CRÉDITO' : 'CONTADO',
            total: Number(v.total_usd) || 0,
            saldo_pendiente: esCredito ? (saldo > 0 ? saldo : Number(v.total_usd)) : 0,
            impuestos_iva: Number(v.iva_monto_usd) || 0,
            estado: esCredito && (saldo > 0 || v.estado === 'PENDIENTE_PAGO') ? 'Por Cobrar' : v.estado === 'ANULADA' ? 'Anulado' : 'Pagado',
            origen: 'Directa',
            fecha_hora: fStr,
            tasa_bcv: Number(v.tasa_bcv) || 36.50,
            total_bs: Number(v.total_bs) || 0,
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
        setFacturas(mapped);
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
    const local = localStorage.getItem('teslafire_facturas_fiscales');
    if (local) {
      setFacturas(JSON.parse(local));
    } else {
      setFacturas(defaultFacturasDemo);
      localStorage.setItem('teslafire_facturas_fiscales', JSON.stringify(defaultFacturasDemo));
    }
  };

  // Filtrado
  const filteredFacturas = facturas.filter(f => {
    if (estadoFiltro !== 'Todos' && f.estado !== estadoFiltro) return false;
    if (buscar.trim()) {
      const q = buscar.toLowerCase();
      const matchNum = f.numero.toLowerCase().includes(q);
      const matchNom = f.cliente_nombre.toLowerCase().includes(q);
      const matchDoc = f.cliente_documento.toLowerCase().includes(q);
      if (!matchNum && !matchNom && !matchDoc) return false;
    }
    return true;
  });

  // Total consolidado
  const totalMonto = filteredFacturas.reduce((acc, f) => f.estado !== 'Anulado' ? acc + f.total : acc, 0);

  // WhatsApp
  const handleWhatsApp = (f: FacturaFiscal) => {
    const tel = f.cliente_telefono ? f.cliente_telefono.replace(/[^0-9]/g, '') : '';
    const phoneParam = tel.startsWith('0') ? `58${tel.slice(1)}` : tel || '584141234567';
    const text = encodeURIComponent(
      `Estimado(a) ${f.cliente_nombre}, le enviamos su Factura Fiscal *${f.numero}* de Tesla Fire C.A. por un monto total de *$${f.total.toFixed(2)}* (Bs. ${f.total_bs.toFixed(2)}). ¡Agradecemos su compra!`
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
          <div className="p-1 rounded bg-purple-100/70 text-purple-700">
            <Receipt className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Factura Fiscal
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
              <option value="Por Cobrar">Por Cobrar</option>
              <option value="Anulado">Anulado</option>
            </select>
          </div>

          {/* Buscar */}
          <div className="lg:col-span-5">
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
          TABLA DE FACTURAS FISCALES
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
                <th className="py-3 px-4">IMPUESTOS</th>
                <th className="py-3 px-4 text-center">ESTADO</th>
                <th className="py-3 px-4">ORIGEN</th>
                <th className="py-3 px-5">FECHA</th>
                <th className="py-3 px-5 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto mb-2" />
                    <span className="text-xs text-gray-400 font-semibold">Cargando facturas fiscales...</span>
                  </td>
                </tr>
              ) : filteredFacturas.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-xs text-gray-400 font-medium">
                    No se encontraron facturas fiscales para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredFacturas.map((fac) => {
                  const esPorCobrar = fac.estado === 'Por Cobrar';

                  return (
                    <tr 
                      key={fac.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* NÚMERO (color morado característico) */}
                      <td className="py-4 px-5 align-middle font-mono font-bold text-[#7c3aed] text-xs">
                        {fac.numero}
                      </td>

                      {/* CLIENTE */}
                      <td className="py-4 px-5 align-middle">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm leading-snug">
                          {fac.cliente_nombre}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          ({fac.cliente_documento})
                        </div>
                      </td>

                      {/* VENDEDOR */}
                      <td className="py-4 px-4 align-middle text-gray-600 text-xs">
                        {fac.vendedor}
                      </td>

                      {/* TIENDA */}
                      <td className="py-4 px-4 align-middle text-gray-600 text-xs">
                        {fac.tienda}
                      </td>

                      {/* TIPO VENTA */}
                      <td className="py-4 px-4 align-middle text-center">
                        {fac.tipo_venta === 'CRÉDITO' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-[#fef3c7] text-[#92400e]">
                            CRÉDITO
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-[#d1fae5] text-[#065f46]">
                            CONTADO
                          </span>
                        )}
                      </td>

                      {/* TOTAL + DEBE */}
                      <td className="py-4 px-4 align-middle text-right">
                        <div className="font-rajdhani font-black text-gray-900 text-sm">
                          $ {fac.total.toFixed(2)}
                        </div>
                        {esPorCobrar && fac.saldo_pendiente && fac.saldo_pendiente > 0 && (
                          <div className="text-[10px] font-bold text-red-500 font-rajdhani mt-0.5">
                            Debe: $ {fac.saldo_pendiente.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* IMPUESTOS */}
                      <td className="py-4 px-4 align-middle text-xs text-gray-600">
                        IVA (16%): <span className="font-bold text-gray-800 font-rajdhani">${fac.impuestos_iva.toFixed(2)}</span>
                      </td>

                      {/* ESTADO */}
                      <td className="py-4 px-4 align-middle text-center">
                        {esPorCobrar ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#fef3c7] text-[#92400e]">
                            Por Cobrar
                          </span>
                        ) : fac.estado === 'Pagado' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#d1fae5] text-[#065f46]">
                            Pagado
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700">
                            Anulado
                          </span>
                        )}
                      </td>

                      {/* ORIGEN */}
                      <td className="py-4 px-4 align-middle text-gray-400 text-xs">
                        {fac.origen}
                      </td>

                      {/* FECHA */}
                      <td className="py-4 px-5 align-middle text-gray-500 text-xs">
                        {fac.fecha_hora}
                      </td>

                      {/* ACCIONES (Ojo, Impresora, WhatsApp, Etiqueta) */}
                      <td className="py-4 px-5 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Ver Detalle */}
                          <button
                            type="button"
                            onClick={() => setSelectedFactura(fac)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                            title="Ver Factura"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Imprimir */}
                          <button
                            type="button"
                            onClick={() => toast.success(`Imprimiendo Factura Fiscal ${fac.numero}...`)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                            title="Imprimir Factura Fiscal"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* WhatsApp */}
                          <button
                            type="button"
                            onClick={() => handleWhatsApp(fac)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                            title="Enviar por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Etiqueta / Tag */}
                          <button
                            type="button"
                            onClick={() => toast.success(`Generando etiqueta fiscal para ${fac.numero}...`)}
                            className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Etiqueta Fiscal"
                          >
                            <Tag className="w-4 h-4" />
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
            PIE DE TABLA: TOTAL CONSOLIDADO
        ══════════════════════════════════════════════════ */}
        <div className="p-4 sm:p-5 border-t border-gray-100/90 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            TOTAL ({filteredFacturas.length} FACTURAS MOSTRADAS)
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
          MODAL: VISTA FACTURA FISCAL SENIAT
      ══════════════════════════════════════════════════ */}
      {selectedFactura && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Factura Fiscal {selectedFactura.numero}
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    N° Control: {selectedFactura.numero_control}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFactura(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              
              {/* Emisor y Cliente */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">Emisor: TESLA FIRE C.A.</span>
                  <span className="font-mono text-gray-500">RIF: J-50428931-2</span>
                </div>
                <div className="text-gray-600 pt-1 border-t border-gray-200/60">
                  <strong>Cliente:</strong> {selectedFactura.cliente_nombre} ({selectedFactura.cliente_documento})
                </div>
                <div className="text-gray-500">Tienda: {selectedFactura.tienda} · Tipo: {selectedFactura.tipo_venta}</div>
                <div className="text-gray-500">Fecha: {selectedFactura.fecha_hora}</div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold">Estado:</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    selectedFactura.estado === 'Pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedFactura.estado}
                  </span>
                </div>
              </div>

              {/* Items Facturados */}
              {selectedFactura.items && selectedFactura.items.length > 0 && (
                <div>
                  <span className="font-bold text-gray-700 block mb-2">Desglose de Renglones Fiscales:</span>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {selectedFactura.items.map((it, idx) => (
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

              {/* Resumen Fiscal */}
              <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 border border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Base Imponible:</span>
                  <span className="font-rajdhani font-bold">${(selectedFactura.total - selectedFactura.impuestos_iva).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (16%):</span>
                  <span className="font-rajdhani font-bold">${selectedFactura.impuestos_iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black text-gray-900 pt-1.5 border-t border-gray-200">
                  <span>Total Factura USD:</span>
                  <span className="font-rajdhani font-black text-base text-brand-600">
                    $ {selectedFactura.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                  <span>Tasa Oficial BCV ({selectedFactura.tasa_bcv.toFixed(2)} Bs/$):</span>
                  <span className="font-rajdhani font-bold text-gray-800">
                    Bs. {selectedFactura.total_bs.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleWhatsApp(selectedFactura)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toast.success(`Imprimiendo Factura Fiscal ${selectedFactura.numero}...`)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFactura(null)}
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
