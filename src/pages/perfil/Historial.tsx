import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  FileText,
  Calendar,
  Package,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function Historial() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('ordenes')
        .select('*')
        .eq('cliente_email', user.email) // Fallback to email if user_id is not yet populated
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    }

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cargando Historial...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-12">
          <Link to="/" className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-primary-950 transition-colors group w-fit">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver a la tienda
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl md:text-6xl font-black font-outfit text-primary-950 uppercase tracking-tighter leading-none">
                Mis <span className="text-accent">Reservas</span>
              </h1>
              <p className="text-slate-500 font-bold text-sm tracking-tight">Seguimiento de sus solicitudes técnicas y cotizaciones.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-xl shadow-primary-950/5">
               <ShoppingBag className="w-5 h-5 text-accent" />
               <span className="text-sm font-black text-primary-950">{orders.length} Reservas</span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="flex flex-col gap-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 border-2 border-dashed border-slate-100 flex flex-col items-center text-center gap-6">
               <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center">
                  <Package className="w-10 h-10 text-slate-200" />
               </div>
               <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-black text-primary-950 uppercase tracking-tighter">No hay reservas activas</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest max-w-[300px]">Aún no ha realizado ninguna solicitud técnica en nuestro portal.</p>
               </div>
               <Link to="/productos" className="bg-primary-950 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all active:scale-95">
                  Explorar Catálogo
               </Link>
            </div>
          ) : (
            orders.map((order, index) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 hover:shadow-2xl hover:shadow-primary-950/10 transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/10 transition-standard"></div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                   {/* Status & Icon */}
                   <div className="flex md:flex-col items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-smooth ${
                        order.estado === 'completado' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-orange-50 border-orange-100 text-orange-600'
                      }`}>
                         {order.estado === 'completado' ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                      </div>
                      <div className="md:hidden">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
                         <p className="text-sm font-black text-primary-950 uppercase">{order.estado}</p>
                      </div>
                   </div>

                   {/* Info Grid */}
                   <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localizador</span>
                         <p className="text-lg font-black text-primary-950 font-outfit tracking-tighter uppercase">{order.localizador}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Solicitud</span>
                         <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-tight">
                            <Calendar className="w-3.5 h-3.5 text-accent" />
                            {format(new Date(order.created_at), "dd MMM yyyy", { locale: es })}
                         </div>
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimado</span>
                         <p className="text-lg font-black text-primary-950 font-outfit tracking-tighter leading-none">${order.total?.toFixed(2)}</p>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="flex flex-row md:flex-col items-center gap-3">
                      <Link 
                        to={`/gracias/${order.localizador}`}
                        className="flex-1 md:w-full h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center gap-3 px-8 text-[11px] font-black uppercase tracking-[0.1em] transition-all hover:bg-accent active:scale-95 shadow-xl shadow-slate-900/10"
                      >
                         <FileText className="w-5 h-5" /> Ver Ficha Técnica
                      </Link>
                   </div>
                </div>

                {/* Micro Product Preview Table */}
                <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-2 lg:grid-cols-4 gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                   {order.productos?.slice(0, 4).map((p: any, i: number) => (
                     <div key={i} className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest truncate">{p.nombre}</span>
                        <span className="text-[10px] font-black text-primary-950 uppercase tracking-tighter">{p.cantidad} Unid.</span>
                     </div>
                   ))}
                   {order.productos?.length > 4 && (
                     <div className="flex items-center text-[9px] font-black text-accent uppercase tracking-widest">
                        +{order.productos.length - 4} más
                     </div>
                   )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
