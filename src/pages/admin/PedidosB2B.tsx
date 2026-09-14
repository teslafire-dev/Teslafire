import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Calendar, 
  Eye, 
  FileText, 
  Receipt, 
  Check, 
  X, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Printer, 
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface PedidoB2B {
  id: string;
  numero: string;
  cliente_id?: string;
  user_id?: string;
  cliente_nombre: string;
  cliente_documento: string;
  cliente_telefono?: string;
  cliente_email?: string;
  cliente_direccion?: string;
  estado: 'PENDIENTE' | 'APROBADO_COTIZACION' | 'APROBADO_FACTURA' | 'RECHAZADO';
  condicion_pago: 'CREDITO' | 'CONTADO';
  subtotal_usd: number;
  iva_usd: number;
  total_usd: number;
  tasa_bcv: number;
  total_bs: number;
  notas?: string;
  cotizacion_id?: string;
  venta_id?: string;
  created_at: string;
}

export default function PedidosB2B() {
  const [pedidos, setPedidos] = useState<PedidoB2B[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // Modal detalle
  const [selectedPedido, setSelectedPedido] = useState<PedidoB2B | null>(null);
  const [pedidoItems, setPedidoItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchPedidos();

    // Suscripción Realtime
    const channel = supabase
      .channel('realtime-pedidos-b2b')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos_b2b' },
        () => fetchPedidos()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos_b2b')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPedidos(data as PedidoB2B[]);
      }
    } catch (err) {
      console.error('Error cargando pedidos B2B:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = async (pedido: PedidoB2B) => {
    setSelectedPedido(pedido);
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from('pedido_b2b_items')
        .select('*')
        .eq('pedido_id', pedido.id);

      if (!error && data) {
        setPedidoItems(data);
      } else {
        setPedidoItems([]);
      }
    } catch (err) {
      console.error('Error cargando items:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  // 1. CONVERTIR PEDIDO A COTIZACIÓN FORMAL
  const handleConvertirACotizacion = async (pedido: PedidoB2B) => {
    setProcessingAction(true);
    try {
      // 1. Obtener correlativo de cotizaciones
      const { count } = await supabase.from('cotizaciones').select('id', { count: 'exact', head: true });
      const seq = (count || 0) + 1;
      const numCot = `PRTF-${seq.toString().padStart(6, '0')}`;

      const validez = new Date();
      validez.setDate(validez.getDate() + 15);

      // 2. Insertar en tabla cotizaciones
      const { data: cotData, error: cotError } = await supabase
        .from('cotizaciones')
        .insert([
          {
            numero: numCot,
            cliente_nombre: pedido.cliente_nombre,
            cliente_documento: pedido.cliente_documento,
            cliente_telefono: pedido.cliente_telefono,
            vendedor_nombre: 'Portal B2B (Automático)',
            subtotal: pedido.subtotal_usd,
            iva: pedido.iva_usd,
            total: pedido.total_usd,
            estado: 'Vigente',
            fecha_validez: validez.toISOString().split('T')[0],
            notas: `Generado a partir del pedido B2B ${pedido.numero}. ${pedido.notas || ''}`
          }
        ])
        .select()
        .single();

      if (cotError) throw cotError;

      // 3. Actualizar estado del pedido B2B
      await supabase
        .from('pedidos_b2b')
        .update({
          estado: 'APROBADO_COTIZACION',
          cotizacion_id: cotData.id
        })
        .eq('id', pedido.id);

      toast.success(`Pedido ${pedido.numero} convertido a Cotización ${numCot}`);
      setSelectedPedido(null);
      fetchPedidos();
    } catch (err: any) {
      console.error('Error convirtiendo a cotización:', err);
      toast.error(err.message || 'Error al emitir cotización');
    } finally {
      setProcessingAction(false);
    }
  };

  // 2. FACTURAR DIRECTO
  const handleFacturarDirecto = async (pedido: PedidoB2B) => {
    setProcessingAction(true);
    try {
      // Cargar items si no están cargados
      let itemsToInvoice = pedidoItems;
      if (itemsToInvoice.length === 0) {
        const { data: itData } = await supabase
          .from('pedido_b2b_items')
          .select('*')
          .eq('pedido_id', pedido.id);
        if (itData) itemsToInvoice = itData;
      }

      // Correlativo factura fiscal
      const { count } = await supabase.from('ventas').select('id', { count: 'exact', head: true });
      const seq = (count || 0) + 1;
      const numFac = `FFTF-${seq.toString().padStart(6, '0')}`;
      const numCtrl = `00-${seq.toString().padStart(6, '0')}`;

      const saldoPendiente = pedido.condicion_pago === 'CREDITO' ? pedido.total_usd : 0.00;
      const estadoFactura = pedido.condicion_pago === 'CREDITO' ? 'EMITIDA' : 'EMITIDA';

      // 1. Insertar factura en ventas
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .insert([
          {
            tipo_documento: 'FACTURA FISCAL',
            numero_factura: numFac,
            numero_control: numCtrl,
            cliente_id: pedido.cliente_id || null,
            condicion_pago: pedido.condicion_pago,
            subtotal_usd: pedido.subtotal_usd,
            iva_monto_usd: pedido.iva_usd,
            total_usd: pedido.total_usd,
            tasa_bcv: pedido.tasa_bcv || 36.50,
            total_bs: pedido.total_bs || pedido.total_usd * 36.50,
            saldo_pendiente_usd: saldoPendiente,
            estado: estadoFactura
          }
        ])
        .select()
        .single();

      if (ventaError) throw ventaError;

      // 2. Insertar items en venta_items
      if (itemsToInvoice.length > 0) {
        const vItems = itemsToInvoice.map((it) => ({
          venta_id: ventaData.id,
          producto_id: it.producto_id,
          sku: it.sku,
          descripcion: it.nombre,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
          subtotal: it.subtotal
        }));
        await supabase.from('venta_items').insert(vItems);
      }

      // 3. Actualizar estado del pedido B2B
      await supabase
        .from('pedidos_b2b')
        .update({
          estado: 'APROBADO_FACTURA',
          venta_id: ventaData.id
        })
        .eq('id', pedido.id);

      toast.success(`Pedido facturado con éxito: Factura Fiscal ${numFac}`);
      setSelectedPedido(null);
      fetchPedidos();
    } catch (err: any) {
      console.error('Error facturando pedido B2B:', err);
      toast.error(err.message || 'Error al emitir factura fiscal');
    } finally {
      setProcessingAction(false);
    }
  };

  // 3. RECHAZAR PEDIDO
  const handleRechazar = async (pedido: PedidoB2B) => {
    if (!confirm(`¿Estás seguro de rechazar el pedido ${pedido.numero}?`)) return;

    setProcessingAction(true);
    try {
      await supabase
        .from('pedidos_b2b')
        .update({ estado: 'RECHAZADO' })
        .eq('id', pedido.id);

      toast.success(`Pedido ${pedido.numero} marcado como RECHAZADO`);
      setSelectedPedido(null);
      fetchPedidos();
    } catch (err) {
      console.error(err);
      toast.error('Error al rechazar el pedido');
    } finally {
      setProcessingAction(false);
    }
  };

  const filteredPedidos = pedidos.filter((p) => {
    if (filtroEstado !== 'TODOS' && p.estado !== filtroEstado) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const matchNum = p.numero.toLowerCase().includes(q);
      const matchNom = p.cliente_nombre.toLowerCase().includes(q);
      const matchDoc = p.cliente_documento.toLowerCase().includes(q);
      if (!matchNum && !matchNom && !matchDoc) return false;
    }
    return true;
  });

  const pendientesCount = pedidos.filter((p) => p.estado === 'PENDIENTE').length;

  return (
    <div className="min-h-screen bg-[#f8fafc]/80 pb-16 font-sans">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-slate-800" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Bandeja de Pedidos B2B
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Solicitudes de pedidos y cotizaciones mayoristas enviadas por empresas desde el portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
            <span className={`w-2 h-2 rounded-full ${pendientesCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span>{pendientesCount} pendientes de revisión</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['TODOS', 'PENDIENTE', 'APROBADO_COTIZACION', 'APROBADO_FACTURA', 'RECHAZADO'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFiltroEstado(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filtroEstado === st
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
              }`}
            >
              {st === 'TODOS' ? 'Todos' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente, RIF o número..."
            className="w-full text-xs font-medium px-3 pl-10 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
            <span className="text-xs uppercase tracking-wider font-bold">Cargando pedidos B2B...</span>
          </div>
        ) : filteredPedidos.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Inbox className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No hay pedidos registrados</p>
            <p className="text-xs text-slate-400">Las solicitudes de empresas aparecerán aquí en tiempo real.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/70">
                  <th className="py-3.5 px-5">Pedido</th>
                  <th className="py-3.5 px-5">Empresa / RIF</th>
                  <th className="py-3.5 px-5">Contacto / Tel</th>
                  <th className="py-3.5 px-5">Condición</th>
                  <th className="py-3.5 px-5">Total USD</th>
                  <th className="py-3.5 px-5">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPedidos.map((ped) => (
                  <tr key={ped.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-slate-900 block">{ped.numero}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ped.created_at).toLocaleDateString('es-VE')} {new Date(ped.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-800 block">{ped.cliente_nombre}</span>
                      <span className="text-[10px] font-mono text-slate-400">{ped.cliente_documento}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-slate-700 block">{ped.cliente_telefono || 'Sin teléfono'}</span>
                      <span className="text-[10px] text-slate-400">{ped.cliente_email}</span>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-700">
                      {ped.condicion_pago}
                    </td>
                    <td className="py-4 px-5 font-mono font-black text-slate-900 text-sm">
                      ${Number(ped.total_usd).toFixed(2)}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-block ${
                        ped.estado === 'PENDIENTE'
                          ? 'bg-amber-100 text-amber-800'
                          : ped.estado === 'APROBADO_COTIZACION'
                          ? 'bg-blue-100 text-blue-800'
                          : ped.estado === 'APROBADO_FACTURA'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ped.estado === 'PENDIENTE' && 'Pendiente'}
                        {ped.estado === 'APROBADO_COTIZACION' && 'Cotizado'}
                        {ped.estado === 'APROBADO_FACTURA' && 'Facturado'}
                        {ped.estado === 'RECHAZADO' && 'Rechazado'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleVerDetalle(ped)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Gestionar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL GESTIÓN DE PEDIDO B2B */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-slate-800" />
                  <h3 className="text-base font-bold text-slate-900">
                    Gestionar Pedido B2B {selectedPedido.numero}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Emitido por {selectedPedido.cliente_nombre} ({selectedPedido.cliente_documento})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPedido(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              
              {/* Información de la Empresa */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Empresa</span>
                  <span className="font-bold text-slate-800">{selectedPedido.cliente_nombre}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">RIF</span>
                  <span className="font-mono font-bold text-slate-800">{selectedPedido.cliente_documento}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Condición de Pago</span>
                  <span className="font-bold text-slate-900">{selectedPedido.condicion_pago}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Teléfono</span>
                  <span className="text-slate-700">{selectedPedido.cliente_telefono || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Correo</span>
                  <span className="text-slate-700 truncate block">{selectedPedido.cliente_email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Estado Actual</span>
                  <span className="font-bold text-brand-600">{selectedPedido.estado.replace('_', ' ')}</span>
                </div>
              </div>

              {selectedPedido.notas && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 text-xs">
                  <span className="font-bold block text-[11px]">Notas del Cliente:</span>
                  {selectedPedido.notas}
                </div>
              )}

              {/* Items Solicitados */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Productos del Pedido Mayorista:
                </h4>
                {loadingItems ? (
                  <div className="py-8 text-center text-slate-400">Cargando productos...</div>
                ) : pedidoItems.length === 0 ? (
                  <p className="text-slate-400 italic">No hay productos registrados</p>
                ) : (
                  <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                    {pedidoItems.map((it) => (
                      <div key={it.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <span className="font-bold text-slate-800 block">{it.nombre}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {it.sku} · {it.cantidad} unidades × ${Number(it.precio_unitario).toFixed(2)} USD
                          </span>
                        </div>
                        <span className="font-mono font-black text-slate-900 text-sm">
                          ${Number(it.subtotal).toFixed(2)} USD
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totales */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Mayorista:</span>
                  <span className="font-mono font-bold">${Number(selectedPedido.subtotal_usd).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>IVA (16%):</span>
                  <span className="font-mono font-bold">${Number(selectedPedido.iva_usd).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total Pedido:</span>
                  <span className="font-mono text-brand-600">${Number(selectedPedido.total_usd).toFixed(2)} USD</span>
                </div>
              </div>

            </div>

            {/* BOTONES DE ACCIÓN ADMINISTRATIVA */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                disabled={processingAction}
                onClick={() => handleRechazar(selectedPedido)}
                className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Rechazar</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={processingAction || selectedPedido.estado === 'APROBADO_COTIZACION'}
                  onClick={() => handleConvertirACotizacion(selectedPedido)}
                  className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{selectedPedido.estado === 'APROBADO_COTIZACION' ? 'Ya Cotizado' : 'Convertir a Cotización'}</span>
                </button>

                <button
                  type="button"
                  disabled={processingAction || selectedPedido.estado === 'APROBADO_FACTURA'}
                  onClick={() => handleFacturarDirecto(selectedPedido)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {processingAction ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{selectedPedido.estado === 'APROBADO_FACTURA' ? 'Ya Facturado' : 'Facturar Directo (Fiscal)'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
