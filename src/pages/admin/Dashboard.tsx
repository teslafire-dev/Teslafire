import { 
  ShoppingBag, 
  Package, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  MoreHorizontal,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  ShoppingCart,
  TrendingDown,
  Mail,
  Phone,
  Globe,
  Zap,
  MousePointer2,
  RefreshCcw
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function AdminDashboard() {
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { usdRate, eurRate, loading: currencyLoading } = useCurrency();
  const [stats, setStats] = useState({
    totalProducts: 0,
    ordersToday: 0,
    activeCustomers: 0,
    lowStock: 0,
    visitorPeak: 0,
    visitorsToday: 0,
    recentOrders: [] as any[]
  });
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
  const [abandonedLoading, setAbandonedLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchAbandonedCarts();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Total Products
      const { count: productsCount } = await supabase.from('productos').select('*', { count: 'exact', head: true });
      
      // 2. Orders Today
      const today = new Date();
      today.setHours(0,0,0,0);
      const { count: ordersTodayCount } = await supabase
        .from('ordenes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // 3. Active Customers (Unique users in orders)
      const { data: uniqueUsers } = await supabase.from('ordenes').select('cliente_email');
      const activeCustomersCount = new Set(uniqueUsers?.map(u => u.cliente_email)).size;

      // 4. Low Stock Items
      const { count: lowStockCount } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 5);

      // 5. Recent Orders
      const { data: recent } = await supabase
        .from('ordenes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // 6. Visitor Stats
      const { data: peakData } = await supabase.from('configuracion').select('valor').eq('clave', 'max_concurrent_visitors').single();
      const { data: todayVisitors } = await supabase.from('visitantes_por_dia').select('total_visitantes').eq('fecha', new Date().toISOString().split('T')[0]).single();

      setStats({
        totalProducts: productsCount || 0,
        ordersToday: ordersTodayCount || 0,
        activeCustomers: activeCustomersCount || 0,
        lowStock: lowStockCount || 0,
        visitorPeak: parseInt(peakData?.valor || '1'),
        visitorsToday: todayVisitors?.total_visitantes || 0,
        recentOrders: recent || []
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAbandonedCarts = async () => {
    setAbandonedLoading(true);
    try {
      // Ordenes pendientes de hace más de 1 hora = carrito abandonado potencial
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('ordenes')
        .select('id, cliente_nombre, cliente_email, cliente_telefono, total, created_at, items')
        .eq('estado', 'pendiente')
        .lt('created_at', oneHourAgo)
        .order('created_at', { ascending: false })
        .limit(5);
      setAbandonedCarts(data || []);
    } catch (err) {
      console.error("Error fetching abandoned carts:", err);
    } finally {
      setAbandonedLoading(false);
    }
  };

  const handleExportXLS = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Generando reporte Excel...");
    try {
      const { data, error } = await supabase.from('productos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      const exportData = data.map(item => ({
        'SKU': item.sku || '-',
        'Nombre': item.nombre,
        'Precio (USD)': item.precio,
        'Stock': item.stock || 0,
        'Estado': item.stock < 5 ? 'CRÍTICO' : 'OK',
        'Fecha Registro': new Date(item.created_at).toLocaleDateString()
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventario");
      XLSX.writeFile(wb, `Reporte_Industrial_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Reporte descargado", { id: toastId });
    } catch (error) {
      toast.error("Error en exportación", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const kpis = [
    { label: "Total Productos", value: stats.totalProducts.toLocaleString(), icon: Package, color: "bg-blue-100 text-blue-600" },
    { label: "Reservas Hoy", value: stats.ordersToday.toLocaleString(), icon: ShoppingBag, color: "bg-green-100 text-green-600" },
    { label: "Clientes Únicos", value: stats.activeCustomers.toLocaleString(), icon: Users, color: "bg-purple-100 text-purple-600" },
    { label: "Alertas Stock", value: stats.lowStock.toLocaleString(), icon: AlertCircle, color: "bg-red-100 text-red-600" },
    { label: "Visitas Hoy", value: stats.visitorsToday.toLocaleString(), icon: Globe, color: "bg-orange-100 text-accent" },
    { label: "Record Online", value: stats.visitorPeak.toLocaleString(), icon: Zap, color: "bg-yellow-100 text-yellow-600" }
  ];

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-accent font-black uppercase text-[10px] tracking-[0.4em] font-outfit">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Sincronizado en Tiempo Real
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-outfit text-primary-950 uppercase tracking-tighter leading-none">Panel de Gestión</h1>
          <p className="text-slate-500 font-medium tracking-wide">Control operativo del inventario y reservas industriales.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
             onClick={handleExportXLS}
             disabled={isExporting}
             className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-2xl hover:border-accent transition-smooth active:scale-95 disabled:opacity-50"
          >
            {isExporting ? 'Procesando...' : 'Exportar XLS'}
          </button>
          <Link 
            to="/admin/productos" 
            className="flex-1 md:flex-none text-center bg-primary-950 text-white font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-2xl hover:bg-accent transition-smooth shadow-2xl shadow-primary-950/20 active:scale-95"
          >
            Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Tasa BCV Widget en vivo */}
      <div className="bg-primary-950 p-10 rounded-[4rem] shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-8 overflow-hidden relative border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
        <div className="flex flex-col gap-3 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3">
            <RefreshCcw className={`w-3.5 h-3.5 ${currencyLoading ? 'animate-spin' : ''}`} /> Monitor de Cambio BCV
          </span>
          <h3 className="text-3xl font-black uppercase tracking-tighter leading-none font-outfit">Tasa Activa del Sistema</h3>
          <p className="text-sm text-slate-400 font-medium tracking-wide">Incluye el valor BCV oficial más tus ajustes fijos ("markup").</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 relative z-10">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 px-8 py-6 rounded-[2.5rem] flex flex-col items-center min-w-[180px] hover:bg-white/10 transition-smooth">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">1 USD =</span>
            <span className="text-3xl font-black font-outfit text-white tracking-tighter">Bs. {usdRate.toLocaleString('es-VE', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 px-8 py-6 rounded-[2.5rem] flex flex-col items-center min-w-[180px] hover:bg-white/10 transition-smooth">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">1 EUR =</span>
            <span className="text-3xl font-black font-outfit text-white tracking-tighter">Bs. {eurRate.toLocaleString('es-VE', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-44 bg-slate-100 rounded-[3rem] animate-pulse"></div>
        )) : kpis.map((kpi, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-smooth group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-smooth duration-700"></div>
            <div className={`p-4 rounded-2xl ${kpi.color} shadow-inner group-hover:scale-110 transition-smooth w-fit mb-8 relative z-10`}>
              <kpi.icon className="w-7 h-7" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-5xl font-black font-outfit text-primary-950 tracking-tighter group-hover:text-accent transition-smooth leading-none">{kpi.value}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 leading-none">{kpi.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Abandoned Carts Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-[3rem] border border-amber-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-amber-50 bg-amber-50/30 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Carritos Abandonados</h3>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Clientes que iniciaron cotización y no completaron (más de 1h pendiente)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {abandonedCarts.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">
                {abandonedCarts.length} sin cerrar
              </span>
            )}
            <button
              onClick={fetchAbandonedCarts}
              className="p-3 bg-white border border-slate-100 rounded-xl hover:border-accent text-slate-400 hover:text-accent transition-smooth"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {abandonedLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          </div>
        ) : abandonedCarts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-300">
            <ShoppingCart className="w-10 h-10" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Sin carritos abandonados. ¡Excelente!
            </span>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {abandonedCarts.map((order) => {
              const itemsCount = Array.isArray(order.items) ? order.items.length : 0;
              const whatsappMsg = encodeURIComponent(`Hola ${order.cliente_nombre}, vi que iniciaste una cotización con nosotros por $${Number(order.total).toFixed(2)}. ¿Podemos ayudarte a completarla?`);
              const phone = (order.cliente_telefono || '').replace(/\D/g, '');
              return (
                <div key={order.id} className="flex items-center gap-6 px-8 py-5 hover:bg-amber-50/30 transition-smooth group">
                  <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-primary-950 uppercase tracking-tight truncate">{order.cliente_nombre}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                        {itemsCount} item{itemsCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[9px] text-accent font-black uppercase tracking-widest">
                        ${Number(order.total).toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-300 font-medium">
                        {format(new Date(order.created_at), 'dd/MM HH:mm', { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
                    {order.cliente_email && (
                      <a
                        href={`mailto:${order.cliente_email}?subject=Tu cotización pendiente&body=Hola ${order.cliente_nombre}, vi que iniciaste una cotización con nosotros...`}
                        className="p-2.5 bg-slate-100 text-slate-500 hover:bg-primary-950 hover:text-white rounded-xl transition-smooth"
                        title="Enviar email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {phone && (
                      <a
                        href={`https://wa.me/${phone}?text=${whatsappMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-green-100 text-green-600 hover:bg-green-500 hover:text-white rounded-xl transition-smooth"
                        title="Contactar por WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Reservations Table */}
        <div className="lg:col-span-2 bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
             <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Reservas Recientes</h3>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Últimos movimientos del sistema</span>
             </div>
             <Link to="/admin/ordenes" className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:border-accent hover:text-accent transition-smooth flex items-center gap-2">
                Ver Todas <ChevronRight className="w-4 h-4" />
             </Link>
          </div>
          <div className="overflow-x-auto min-h-[350px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4 text-slate-300">
                <Loader2 className="w-10 h-10 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Consultando Base de Datos...</span>
              </div>
            ) : stats.recentOrders.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Localizador</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Inversión</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.recentOrders.map((res, i) => (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition-smooth group active:bg-slate-100">
                      <td className="px-10 py-6">
                        <span className="text-sm font-black font-outfit text-primary-950 tracking-tighter group-hover:text-accent transition-smooth uppercase">COT-{res.localizador || res.id.slice(0,8)}</span>
                      </td>
                      <td className="px-10 py-6">
                         <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{res.cliente_nombre}</span>
                           <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" /> {format(new Date(res.created_at), 'dd/MM/yyyy HH:mm')}
                           </span>
                         </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className="text-lg font-black text-primary-950 font-outfit tracking-tighter shadow-primary-950/5">${Number(res.total).toFixed(2)}</span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${
                          res.estado === 'pendiente' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          res.estado === 'completada' ? 'bg-green-50 text-green-600 border-green-100' :
                          'bg-red-50 text-red-500 border-red-100'
                        }`}>
                          {res.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 gap-4 text-slate-300">
                 <ShoppingBag className="w-12 h-12" />
                 <span className="text-[10px] font-black uppercase tracking-widest">No hay reservas recientes</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Activity Summary */}
        <div className="flex flex-col gap-8">
           <div className="bg-primary-950 text-white rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-smooth duration-1000"></div>
              <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter flex items-center gap-4 mb-10 relative z-10">
                <Clock className="w-6 h-6 text-accent" /> Historial Operativo
              </h3>
              <div className="flex flex-col gap-8 relative z-10">
                 {[
                   { title: "Control de Stock", time: "Sistema", desc: `Actualmente hay ${stats.lowStock} productos en niveles críticos.` },
                   { title: "Ventas de Hoy", time: "Comercial", desc: `Se han procesado ${stats.ordersToday} nuevas reservas técnicas.` },
                   { title: "Base de Datos", time: "Catálogo", desc: `Total de ${stats.totalProducts} SKUs sincronizados exitosamente.` }
                 ].map((activity, i) => (
                   <div key={i} className="flex gap-6 group/item">
                      <div className="relative flex flex-col items-center shrink-0">
                         <div className="w-3 h-3 rounded-full bg-accent z-10 shadow-[0_0_15px_rgba(249,115,22,0.6)] group-hover/item:scale-150 transition-smooth"></div>
                         {i !== 2 && <div className="absolute top-3 w-[1px] h-20 bg-white/10 group-hover/item:bg-accent/30 transition-smooth"></div>}
                      </div>
                      <div className="flex flex-col gap-1 pb-4 group-hover/item:translate-x-2 transition-smooth">
                         <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{activity.title}</h4>
                         <span className="text-[9px] text-accent font-black uppercase tracking-widest opacity-60">{activity.time}</span>
                         <p className="text-xs text-slate-400 leading-relaxed font-medium mt-1">{activity.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Quick Access Card */}
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 leading-none">Accesos Rápidos</h4>
              <div className="grid grid-cols-2 gap-4">
                 <Link to="/admin/config" className="p-6 bg-slate-50 rounded-3xl hover:bg-accent hover:text-white transition-smooth flex flex-col items-center gap-3 group">
                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-smooth">
                      <ArrowUpRight className="w-5 h-5 text-accent group-hover:text-primary-950" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-center">Ajustes Globales</span>
                 </Link>
                 <Link to="/admin/usuarios" className="p-6 bg-slate-50 rounded-3xl hover:bg-primary-950 hover:text-white transition-smooth flex flex-col items-center gap-3 group">
                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-smooth">
                      <Users className="w-5 h-5 text-primary-950" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-center">Gestionar Staff</span>
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
