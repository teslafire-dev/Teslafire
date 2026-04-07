import { ShoppingBag, Loader2, Search, Filter, Eye, CheckCircle2, XCircle, Clock, Trash2, Calendar, User, Phone, Mail, Hash, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
  id: string;
  localizador: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string;
  cliente_cedula: string;
  total: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  created_at: string;
  productos: any[];
  mensaje?: string;
}

export default function AdminOrdenes() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ordenes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error("Error al cargar órdenes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('ordenes')
        .update({ estado: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success(`Estado actualizado a ${newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: newStatus as any } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, estado: newStatus as any } : null);
      }
    } catch (error) {
      toast.error("Error al actualizar estado");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'todos' || o.estado === filter;
    const matchesSearch = 
      o.localizador.toLowerCase().includes(search.toLowerCase()) || 
      o.cliente_nombre.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-lg border border-amber-200">Pendiente</span>;
      case 'completada':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-lg border border-green-200">Completada</span>;
      case 'cancelada':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-lg border border-red-200">Cancelada</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
      {/* Header Secction */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-accent font-black uppercase text-[10px] tracking-[0.4em] font-outfit">
             <ShoppingBag className="w-4 h-4" /> Administración Técnica
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-outfit text-primary-950 uppercase tracking-tighter leading-none">Gestión de Órdenes</h1>
          <p className="text-slate-500 font-medium tracking-wide text-sm">Seguimiento y control de reservas industriales.</p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex gap-4">
           <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 flex flex-col items-center">
              <span className="text-2xl font-black text-primary-950 leading-none">{orders.length}</span>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">Total</span>
           </div>
           <div className="bg-amber-100/50 px-6 py-4 rounded-3xl border border-amber-100 flex flex-col items-center">
              <span className="text-2xl font-black text-amber-600 leading-none">{orders.filter(o => o.estado === 'pendiente').length}</span>
              <span className="text-[9px] font-black uppercase text-amber-600/60 tracking-widest mt-1 text-center">Pendientes</span>
           </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[2.5rem] flex flex-col lg:flex-row gap-4 items-center shadow-xl shadow-primary-950/5">
        <div className="relative flex-1 group w-full lg:w-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-smooth w-4 h-4" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Localizador o Cliente..."
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-14 pr-6 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-accent outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scroll-hide">
           {['todos', 'pendiente', 'completada', 'cancelada'].map((s) => (
             <button 
               key={s}
               onClick={() => setFilter(s)}
               className={`px-5 py-3 rounded-xl transition-all font-black uppercase text-[9px] tracking-[0.2em] whitespace-nowrap ${
                 filter === s 
                   ? 'bg-primary-950 text-white shadow-xl shadow-primary-950/20 active:scale-95' 
                   : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
               }`}
             >
               {s}
             </button>
           ))}
        </div>
      </div>

      {/* Orders Table Layout Container */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl shadow-primary-950/5 relative">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800 shadow-inner">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-slate-800 w-40">Localizador</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-slate-800">Cliente</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-slate-800">Fecha</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-slate-800 text-center">Total</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-slate-800 text-center">Estado</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-slate-800">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              <AnimatePresence mode="popLayout">
                {filteredOrders.length > 0 ? filteredOrders.map((o) => (
                  <motion.tr 
                    layout
                    key={o.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-smooth group"
                  >
                    <td className="px-8 py-6 text-sm font-black text-primary-950 dark:text-white font-outfit uppercase tracking-tighter">
                       <span className="bg-accent px-2.5 py-1 rounded-md text-white text-[10px] font-black tracking-normal mr-2">COT</span>
                       {o.localizador.split('-')[1] || o.localizador}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-primary-950 dark:text-white uppercase leading-none">{o.cliente_nombre}</span>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wide mt-1 uppercase truncate max-w-[200px]">{o.cliente_email}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col leading-none">
                         <span className="text-[11px] font-black text-slate-500 mb-1">{format(new Date(o.created_at), 'dd MMM, yyyy', { locale: es })}</span>
                         <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
                            {format(new Date(o.created_at), 'hh:mm aa')}
                         </span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center font-black font-outfit text-accent text-lg tracking-tighter">
                       ${Number(o.total || 0).toFixed(2)}
                    </td>
                    <td className="px-8 py-6 text-center">
                       {getStatusBadge(o.estado)}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                        onClick={() => setSelectedOrder(o)}
                        className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-primary-950 dark:hover:bg-accent text-slate-400 hover:text-white rounded-2xl transition-all active:scale-90"
                       >
                         <Eye className="w-5 h-5" />
                       </button>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                       {loading ? (
                         <div className="flex flex-col items-center gap-4">
                           <Loader2 className="w-10 h-10 text-accent animate-spin" />
                           <span className="text-[10px] font-black uppercase text-slate-400">Consultando Base de Datos...</span>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center gap-4">
                           <ShoppingBag className="w-12 h-12 text-slate-100" />
                           <span className="text-[10px] font-black uppercase text-slate-400">No se encontraron órdenes registradas.</span>
                         </div>
                       )}
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 md:px-0">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedOrder(null)}
               className="absolute inset-0 bg-primary-950/60 backdrop-blur-md"
            ></motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[4rem] shadow-2xl relative z-10 overflow-hidden flex flex-col border border-white/20"
            >
               {/* Modal Header */}
               <div className="p-8 md:p-12 pb-6 flex justify-between items-start border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800">
                  <div className="flex flex-col gap-1">
                     <span className="bg-accent px-3 py-1 rounded-lg text-white text-[10px] font-black uppercase w-fit mb-2">Reserva Industrial</span>
                     <h2 className="text-3xl md:text-5xl font-black font-outfit text-primary-950 dark:text-white uppercase tracking-tighter leading-none">
                        Localizador: {selectedOrder.localizador}
                     </h2>
                     <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                           <Clock className="w-3.5 h-3.5" /> {format(new Date(selectedOrder.created_at), 'PPPP', { locale: es })}
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        {getStatusBadge(selectedOrder.estado)}
                     </div>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-4 bg-white dark:bg-slate-900 rounded-3xl text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
               </div>

               {/* Modal Content - Scrollable */}
               <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                     {/* Information Column */}
                     <div className="lg:col-span-1 flex flex-col gap-8">
                        <div className="flex flex-col gap-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Datos del Cliente</h4>
                           <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-4 group">
                                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm transition-smooth group-hover:scale-110">
                                    <User className="w-5 h-5 text-accent" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Nombre</span>
                                    <span className="text-sm font-black text-primary-950 dark:text-white uppercase">{selectedOrder.cliente_nombre}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4 group">
                                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm transition-smooth group-hover:scale-110">
                                    <Hash className="w-5 h-5 text-accent" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Cédula / RIF</span>
                                    <span className="text-sm font-black text-primary-950 dark:text-white uppercase">{selectedOrder.cliente_cedula}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4 group">
                                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm transition-smooth group-hover:scale-110">
                                    <Phone className="w-5 h-5 text-accent" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Teléfono</span>
                                    <span className="text-sm font-black text-primary-950 dark:text-white uppercase">{selectedOrder.cliente_telefono}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4 group">
                                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm transition-smooth group-hover:scale-110">
                                    <Mail className="w-5 h-5 text-accent" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Correo</span>
                                    <span className="text-sm font-black text-primary-950 dark:text-white uppercase truncate max-w-[150px]">{selectedOrder.cliente_email}</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {selectedOrder.mensaje && (
                           <div className="flex flex-col gap-4">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Notas Especiales</h4>
                              <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-3xl text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                 "{selectedOrder.mensaje}"
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Products List Column */}
                     <div className="lg:col-span-2 flex flex-col gap-8">
                        <div className="flex justify-between items-end">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                             <Package className="w-4 h-4" /> Equipos Reservados
                           </h4>
                           <span className="text-sm font-black text-primary-950 dark:text-white font-outfit uppercase tracking-tighter">
                             Total Reserva: <span className="text-accent text-2xl ml-2 shadow-accent/5">${Number(selectedOrder.total || 0).toFixed(2)}</span>
                           </span>
                        </div>

                        <div className="bg-slate-50/50 dark:bg-slate-800/10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-inner flex flex-col">
                           <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto custom-scrollbar">
                              {selectedOrder.productos.map((prod, i) => (
                                 <div key={i} className="p-6 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 transition-smooth group">
                                    <div className="flex flex-col gap-1">
                                       <span className="text-sm font-black text-primary-950 dark:text-white uppercase tracking-tight group-hover:text-accent transition-colors">{prod.nombre}</span>
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU: {prod.sku || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-8">
                                       <div className="flex flex-col items-end">
                                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Cant</span>
                                          <span className="text-lg font-black text-primary-950 dark:text-white font-outfit leading-none">×{prod.cantidad}</span>
                                       </div>
                                       {prod.precio && (
                                         <div className="flex flex-col items-end w-20">
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">P. Unit</span>
                                            <span className="text-sm font-black text-accent font-outfit leading-none">${Number(prod.precio).toFixed(2)}</span>
                                         </div>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Modal Footer (Actions) */}
               <div className="p-8 md:p-12 pt-0 flex flex-col md:flex-row gap-4">
                  <div className="flex-1 flex gap-2">
                     <button 
                        onClick={() => updateStatus(selectedOrder.id, 'pendiente')}
                        disabled={selectedOrder.estado === 'pendiente' || isUpdating}
                        className={`flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-smooth flex items-center justify-center gap-2 border-2 ${
                           selectedOrder.estado === 'pendiente' 
                           ? 'bg-slate-50 border-transparent text-slate-300' 
                           : 'border-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white hover:border-amber-600 active:scale-95'
                        }`}
                     >
                        <Clock className="w-4 h-4" /> Marcar Pendiente
                     </button>
                     <button 
                        onClick={() => updateStatus(selectedOrder.id, 'completada')}
                        disabled={selectedOrder.estado === 'completada' || isUpdating}
                        className={`flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-smooth flex items-center justify-center gap-2 border-2 ${
                           selectedOrder.estado === 'completada' 
                           ? 'bg-slate-50 border-transparent text-slate-300' 
                           : 'border-green-100 text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 active:scale-95'
                        }`}
                     >
                        <CheckCircle2 className="w-4 h-4" /> Marcar Entregado
                     </button>
                     <button 
                        onClick={() => updateStatus(selectedOrder.id, 'cancelada')}
                        disabled={selectedOrder.estado === 'cancelada' || isUpdating}
                        className={`flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-smooth flex items-center justify-center gap-2 border-2 ${
                           selectedOrder.estado === 'cancelada' 
                           ? 'bg-slate-50 border-transparent text-slate-300' 
                           : 'border-red-100 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-95'
                        }`}
                     >
                        <XCircle className="w-4 h-4" /> Cancelar Orden
                     </button>
                  </div>
                  <button 
                    className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-black active:scale-95"
                    onClick={() => {
                        toast("Función de impresión todavía en desarrollo", {
                            icon: '🖨️',
                        });
                    }}
                  >
                    <DownloadIcon className="w-4 h-4" /> Imprimir Comprobante
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function DownloadIcon(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
