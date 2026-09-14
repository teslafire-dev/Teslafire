import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Receipt, 
  Search, 
  Eye, 
  Printer, 
  X, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Loader2,
  Calendar,
  FileDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function PortalFacturas() {
  const { currentCliente } = useOutletContext<{ currentCliente: any }>();

  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFactura, setSelectedFactura] = useState<any | null>(null);
  const [facturaItems, setFacturaItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');

  useEffect(() => {
    fetchFacturas();
  }, [currentCliente]);

  const fetchFacturas = async () => {
    if (!currentCliente?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .eq('cliente_id', currentCliente.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setFacturas(data);
      }
    } catch (err) {
      console.error('Error cargando facturas B2B:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = async (fac: any) => {
    setSelectedFactura(fac);
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from('venta_items')
        .select('*')
        .eq('venta_id', fac.id);

      if (!error && data) {
        setFacturaItems(data);
      } else {
        setFacturaItems([]);
      }
    } catch (err) {
      console.error('Error cargando items de la factura:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const filteredFacturas = facturas.filter((f) => {
    const saldo = Number(f.saldo_pendiente_usd || 0);
    const estadoCobro = saldo > 0 ? 'POR_COBRAR' : 'PAGADA';
    if (filtroEstado !== 'TODAS' && estadoCobro !== filtroEstado) return false;

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const matchNum = (f.numero_factura || '').toLowerCase().includes(q);
      const matchDoc = (f.tipo_documento || '').toLowerCase().includes(q);
      if (!matchNum && !matchDoc) return false;
    }
    return true;
  });

  const totalPendiente = facturas.reduce((acc, f) => acc + Number(f.saldo_pendiente_usd || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Encabezado con Balance Por Cobrar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Facturación Fiscal y Cartera
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Mis Facturas Fiscales
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Consulta tus comprobantes fiscales, saldos pendientes y fechas de vencimiento de crédito.
          </p>
        </div>

        <div className="px-5 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Saldo Total Por Pagar
          </span>
          <span className={`text-xl font-black font-mono ${totalPendiente > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            ${totalPendiente.toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['TODAS', 'POR_COBRAR', 'PAGADA'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFiltroEstado(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filtroEstado === st
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              {st === 'TODAS' ? 'Todas' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por número de factura..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="text-xs uppercase tracking-wider font-bold">Cargando facturas...</span>
          </div>
        ) : filteredFacturas.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Receipt className="w-12 h-12 mx-auto text-slate-700" />
            <p className="text-sm font-bold text-slate-300">No hay facturas registradas</p>
            <p className="text-xs text-slate-500">Tus facturas fiscales aparecerán aquí una vez emitidas por Tesla Fire.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-950/40">
                  <th className="py-3.5 px-4">Documento</th>
                  <th className="py-3.5 px-4">Fecha Emisión</th>
                  <th className="py-3.5 px-4">Condición</th>
                  <th className="py-3.5 px-4">Total USD</th>
                  <th className="py-3.5 px-4">Total Bs (BCV)</th>
                  <th className="py-3.5 px-4">Saldo Pendiente</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFacturas.map((fac) => {
                  const saldo = Number(fac.saldo_pendiente_usd || 0);
                  const isPendiente = saldo > 0;

                  return (
                    <tr key={fac.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-white block">
                          {fac.numero_factura || fac.tipo_documento}
                        </span>
                        {fac.numero_control && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Ctrl: {fac.numero_control}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(fac.fecha_emision || fac.created_at).toLocaleDateString('es-VE')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-300">
                        {fac.condicion_pago}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        ${Number(fac.total_usd).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        Bs. {Number(fac.total_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={isPendiente ? 'text-amber-400' : 'text-slate-500'}>
                          ${saldo.toFixed(2)} USD
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-block ${
                          isPendiente
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {isPendiente ? 'Por Cobrar' : 'Pagada'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleVerDetalle(fac)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Factura</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETALLE DE FACTURA */}
      {selectedFactura && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">
                  Factura {selectedFactura.numero_factura || selectedFactura.tipo_documento}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Fecha: {new Date(selectedFactura.fecha_emision || selectedFactura.created_at).toLocaleDateString('es-VE')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFactura(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Info General */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Condición de Venta</span>
                  <span className="font-bold text-white uppercase">{selectedFactura.condicion_pago}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tasa BCV Aplicada</span>
                  <span className="font-mono font-bold text-white">Bs. {Number(selectedFactura.tasa_bcv || 36.5).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Saldo Pendiente</span>
                  <span className="font-mono font-bold text-amber-400">
                    ${Number(selectedFactura.saldo_pendiente_usd || 0).toFixed(2)} USD
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Estado</span>
                  <span className="font-bold text-emerald-400 uppercase">
                    {Number(selectedFactura.saldo_pendiente_usd || 0) > 0 ? 'Por Cobrar' : 'Pagada'}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Conceptos Facturados:
                </h4>
                {loadingItems ? (
                  <div className="py-6 text-center text-slate-400">Cargando items...</div>
                ) : facturaItems.length === 0 ? (
                  <p className="text-slate-500 italic">No hay detalle de items registrado</p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {facturaItems.map((it) => (
                      <div key={it.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white block">{it.descripcion}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {it.sku || 'SKU'} · {it.cantidad} und × ${Number(it.precio_unitario).toFixed(2)}
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
                  <span>Subtotal USD:</span>
                  <span className="font-mono font-bold">${Number(selectedFactura.subtotal_usd || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>IVA USD:</span>
                  <span className="font-mono font-bold">${Number(selectedFactura.iva_monto_usd || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-slate-800">
                  <span>Total Factura USD:</span>
                  <span className="font-mono text-cyan-400">${Number(selectedFactura.total_usd).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Equivalente en Bolívares:</span>
                  <span className="font-mono text-slate-200">Bs. {Number(selectedFactura.total_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => toast.success(`Imprimiendo factura fiscal ${selectedFactura.numero_factura || ''}...`)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Factura Fiscal</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFactura(null)}
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
