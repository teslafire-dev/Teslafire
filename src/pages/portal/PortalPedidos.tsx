import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Calendar, 
  Eye, 
  Printer, 
  X, 
  Check, 
  Clock, 
  AlertCircle, 
  Package, 
  Loader2,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function PortalPedidos() {
  const { user } = useAuth();
  const { currentCliente } = useOutletContext<{ currentCliente: any }>();

  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<any | null>(null);
  const [pedidoItems, setPedidoItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  useEffect(() => {
    fetchPedidos();
  }, [currentCliente, user]);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const clienteId = currentCliente?.id;
      let query = supabase.from('pedidos_b2b').select('*');

      if (clienteId && user?.id) {
        query = query.or(`cliente_id.eq.${clienteId},user_id.eq.${user.id}`);
      } else if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        setPedidos(data);
      }
    } catch (err) {
      console.error('Error cargando pedidos B2B:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = async (pedido: any) => {
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
      console.error('Error cargando items del pedido:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const filteredPedidos = pedidos.filter((p) => {
    if (filtroEstado !== 'TODOS' && p.estado !== filtroEstado) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const matchNum = p.numero.toLowerCase().includes(q);
      const matchNotas = (p.notas || '').toLowerCase().includes(q);
      if (!matchNum && !matchNotas) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Gestión Comercial B2B
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Mis Solicitudes y Cotizaciones
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Historial de pedidos emitidos y estado de revisión por el equipo comercial de Tesla Fire.
          </p>
        </div>

        <Link
          to="/portal/catalogo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>+ Nuevo Pedido</span>
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['TODOS', 'PENDIENTE', 'APROBADO_COTIZACION', 'APROBADO_FACTURA', 'RECHAZADO'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFiltroEstado(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filtroEstado === st
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              {st === 'TODOS' ? 'Todos' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por número de pedido..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="text-xs uppercase tracking-wider font-bold">Cargando pedidos...</span>
          </div>
        ) : filteredPedidos.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Package className="w-12 h-12 mx-auto text-slate-700" />
            <p className="text-sm font-bold text-slate-300">No hay pedidos que coincidan con la búsqueda</p>
            <Link to="/portal/catalogo" className="text-xs text-cyan-400 font-bold hover:underline inline-block">
              Crear una nueva solicitud mayorista →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-950/40">
                  <th className="py-3.5 px-4">Número</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Condición</th>
                  <th className="py-3.5 px-4">Subtotal</th>
                  <th className="py-3.5 px-4">Total (con IVA)</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPedidos.map((ped) => (
                  <tr key={ped.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {ped.numero}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(ped.created_at).toLocaleDateString('es-VE')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-300">
                      {ped.condicion_pago}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      ${Number(ped.subtotal_usd || 0).toFixed(2)} USD
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-cyan-400 text-sm">
                      ${Number(ped.total_usd || 0).toFixed(2)} USD
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-block ${
                        ped.estado === 'PENDIENTE'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : ped.estado === 'APROBADO_COTIZACION'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : ped.estado === 'APROBADO_FACTURA'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {ped.estado === 'PENDIENTE' && 'En Revisión'}
                        {ped.estado === 'APROBADO_COTIZACION' && 'Cotizado'}
                        {ped.estado === 'APROBADO_FACTURA' && 'Facturado'}
                        {ped.estado === 'RECHAZADO' && 'Rechazado'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleVerDetalle(ped)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Detalle</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETALLE DE PEDIDO */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">
                  Pedido {selectedPedido.numero}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Emitido el {new Date(selectedPedido.created_at).toLocaleString('es-VE')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPedido(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Info General */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Condición Solicitada</span>
                  <span className="font-bold text-white uppercase">{selectedPedido.condicion_pago}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Estado Actual</span>
                  <span className="font-bold text-cyan-400 uppercase">{selectedPedido.estado.replace('_', ' ')}</span>
                </div>
                {selectedPedido.notas && (
                  <div className="col-span-2 pt-2 border-t border-slate-900">
                    <span className="text-slate-500 block">Notas / Observaciones:</span>
                    <span className="text-slate-300 italic">{selectedPedido.notas}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Artículos Solicitados:
                </h4>
                {loadingItems ? (
                  <div className="py-6 text-center text-slate-400">Cargando productos...</div>
                ) : pedidoItems.length === 0 ? (
                  <p className="text-slate-500 italic">No hay detalle de items</p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {pedidoItems.map((it) => (
                      <div key={it.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white block">{it.nombre}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {it.sku} · {it.cantidad} und × ${Number(it.precio_unitario).toFixed(2)}
                          </span>
                        </div>
                        <span className="font-mono font-black text-white">
                          ${Number(it.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totales */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">${Number(selectedPedido.subtotal_usd).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>IVA (16%):</span>
                  <span className="font-mono font-bold">${Number(selectedPedido.iva_usd).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-slate-800">
                  <span>Total Documento:</span>
                  <span className="font-mono text-cyan-400">${Number(selectedPedido.total_usd).toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => toast.success(`Preparando impresión de pedido ${selectedPedido.numero}...`)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPedido(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
