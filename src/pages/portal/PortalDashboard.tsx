import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  FileText, 
  Receipt, 
  Package, 
  ArrowUpRight, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function PortalDashboard() {
  const { user } = useAuth();
  const { currentCliente } = useOutletContext<{ currentCliente: any }>();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    limiteCredito: 0,
    saldoPendiente: 0,
    creditoDisponible: 0,
    diasCredito: 0,
    pedidosTotales: 0,
    pedidosPendientes: 0,
    facturasTotales: 0,
    facturasPorCobrar: 0
  });

  const [ultimosPedidos, setUltimosPedidos] = useState<any[]>([]);
  const [ultimasFacturas, setUltimasFacturas] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const clienteId = currentCliente?.id;
        const limite = Number(currentCliente?.limite_credito || 0);
        const dias = Number(currentCliente?.dias_credito || 0);

        // Facturas / ventas del cliente
        let saldoPendienteCalculado = 0;
        let facturasCount = 0;
        let facturasPorCobrarCount = 0;

        if (clienteId) {
          const { data: facturasData } = await supabase
            .from('ventas')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('created_at', { ascending: false });

          if (facturasData) {
            facturasCount = facturasData.length;
            setUltimasFacturas(facturasData.slice(0, 5));

            facturasData.forEach((f) => {
              const pendiente = Number(f.saldo_pendiente_usd || 0);
              if (pendiente > 0) {
                saldoPendienteCalculado += pendiente;
                facturasPorCobrarCount++;
              }
            });
          }
        }

        // Pedidos B2B
        let pedidosCount = 0;
        let pedidosPendientesCount = 0;

        let query = supabase.from('pedidos_b2b').select('*');
        if (clienteId && user?.id) {
          query = query.or(`cliente_id.eq.${clienteId},user_id.eq.${user.id}`);
        } else if (user?.id) {
          query = query.eq('user_id', user.id);
        }

        const { data: pedidosData } = await query.order('created_at', { ascending: false });

        if (pedidosData) {
          pedidosCount = pedidosData.length;
          setUltimosPedidos(pedidosData.slice(0, 5));
          pedidosPendientesCount = pedidosData.filter((p) => p.estado === 'PENDIENTE').length;
        }

        const disponible = Math.max(0, limite - saldoPendienteCalculado);

        setStats({
          limiteCredito: limite,
          saldoPendiente: saldoPendienteCalculado,
          creditoDisponible: disponible,
          diasCredito: dias,
          pedidosTotales: pedidosCount,
          pedidosPendientes: pedidosPendientesCount,
          facturasTotales: facturasCount,
          facturasPorCobrar: facturasPorCobrarCount
        });
      } catch (err) {
        console.error('Error cargando dashboard B2B:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentCliente, user]);

  return (
    <div className="space-y-6">
      
      {/* Saludo y Botón de Nueva Orden */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
              Cuenta Mayorista Activa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            {currentCliente?.nombre || 'Panel Corporativo'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            RIF: <span className="font-mono text-slate-300">{currentCliente?.documento || 'No registrado'}</span> · Canal: <span className="uppercase text-cyan-400 font-bold">{currentCliente?.canal_venta || 'Mayor'}</span>
          </p>
        </div>

        <Link
          to="/portal/catalogo"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Hacer Pedido Mayorista</span>
        </Link>
      </div>

      {/* TARJETAS FINANCIERAS (ESTADO DE CUENTA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Límite de Crédito */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Línea Autorizada</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-white">
              ${stats.limiteCredito.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-semibold block mt-0.5">
              Plazo: {stats.diasCredito} días de crédito
            </span>
          </div>
        </div>

        {/* Saldo Pendiente */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Por Pagar</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-black font-mono ${stats.saldoPendiente > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              ${stats.saldoPendiente.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-semibold block mt-0.5">
              {stats.facturasPorCobrar} factura(s) pendiente(s)
            </span>
          </div>
        </div>

        {/* Crédito Disponible */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Crédito Disponible</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-emerald-400">
              ${stats.creditoDisponible.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-semibold block mt-0.5">
              Listo para nuevos pedidos
            </span>
          </div>
        </div>

        {/* Solicitudes B2B */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pedidos / Cotizaciones</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-cyan-400">
              {stats.pedidosTotales}
            </span>
            <span className="text-xs text-slate-500 font-semibold block mt-0.5">
              {stats.pedidosPendientes} en revisión por ventas
            </span>
          </div>
        </div>

      </div>

      {/* DOS COLUMNAS: ÚLTIMOS PEDIDOS Y ÚLTIMAS FACTURAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ÚLTIMOS PEDIDOS B2B */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Últimos Pedidos / Cotizaciones
              </h3>
            </div>
            <Link to="/portal/pedidos" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {ultimosPedidos.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No hay pedidos recientes</p>
            ) : (
              ultimosPedidos.map((ped) => (
                <div key={ped.id} className="p-3 bg-slate-950/60 border border-slate-800/70 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold font-mono text-white block">{ped.numero}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ped.created_at).toLocaleDateString('es-VE')} · {ped.condicion_pago}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-black font-mono text-white block">${Number(ped.total_usd).toFixed(2)} USD</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                      ped.estado === 'PENDIENTE'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : ped.estado === 'APROBADO_COTIZACION'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : ped.estado === 'APROBADO_FACTURA'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {ped.estado.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ÚLTIMAS FACTURAS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Facturas Fiscales Emitidas
              </h3>
            </div>
            <Link to="/portal/facturas" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
              <span>Ver todas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {ultimasFacturas.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No hay facturas registradas a esta empresa</p>
            ) : (
              ultimasFacturas.map((fac) => (
                <div key={fac.id} className="p-3 bg-slate-950/60 border border-slate-800/70 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold font-mono text-white block">
                      {fac.numero_factura || fac.tipo_documento}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(fac.fecha_emision || fac.created_at).toLocaleDateString('es-VE')} · {fac.condicion_pago}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-black font-mono text-white block">${Number(fac.total_usd).toFixed(2)} USD</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                      Number(fac.saldo_pendiente_usd || 0) > 0
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {Number(fac.saldo_pendiente_usd || 0) > 0 ? 'Por Cobrar' : 'Pagada'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
