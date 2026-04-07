import { 
  ShoppingBag, 
  Package, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  MoreHorizontal,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useState } from "react";

export default function AdminDashboard() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportXLS = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Generando reporte Excel...");
    try {
      // Fetch full inventory
      const { data, error } = await supabase.from('productos').select('*').order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error("No hay productos para exportar", { id: toastId });
        return;
      }

      // Map data to a cleaner format for Excel
      const exportData = data.map(item => ({
        'SKU': item.sku || '-',
        'Categoría': item.categoria || '-',
        'Nombre': item.nombre,
        'Precio (USD)': item.precio,
        'Stock': item.stock || 0,
        'Marca': item.marca || '-',
        'Estado': item.en_alerta ? 'ALERTA' : (item.stock > 0 ? 'DISPONIBLE' : 'AGOTADO'),
        'Fecha Registro': new Date(item.created_at).toLocaleDateString()
      }));

      // Create Excel workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventario");
      
      // Trigger download
      XLSX.writeFile(wb, `Inventario_Dobell_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("¡Reporte XLS descargado existosamente!", { id: toastId });
      
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      toast.error("Error al generar el archivo", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const kpis = [
    { label: "Total Productos", value: "2,145", change: "+12.5%", trending: "up", icon: Package, color: "bg-blue-100 text-blue-600" },
    { label: "Reservas Hoy", value: "54", change: "+4.2%", trending: "up", icon: ShoppingBag, color: "bg-green-100 text-green-600" },
    { label: "Clientes Activos", value: "892", change: "+8.1%", trending: "up", icon: Users, color: "bg-purple-100 text-purple-600" },
    { label: "Stock Bajo", value: "12", change: "-2.3%", trending: "down", icon: AlertCircle, color: "bg-red-100 text-red-600" }
  ];

  const recentReservations = [
    { id: "COT-20251117-0042", cliente: "Juan Pérez", total: "125.50", estado: "Pendiente", fecha: "Hoy, 10:45 AM" },
    { id: "COT-20251117-0041", cliente: "Caracas Construction C.A", total: "845.00", estado: "Confirmada", fecha: "Hoy, 09:30 AM" },
    { id: "COT-20251116-0039", cliente: "Maria Rodriguez", total: "45.00", estado: "Completada", fecha: "Ayer, 04:15 PM" },
    { id: "COT-20251116-0038", cliente: "Inversiones del Norte", total: "2,450.10", estado: "Cancelada", fecha: "Ayer, 11:20 AM" }
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Panel de Gestión</h1>
          <p className="text-slate-500 font-medium tracking-wide leading-none">Resumen ejecutivo del inventario y reservas industriales.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
             onClick={handleExportXLS}
             disabled={isExporting}
             className={`bg-white border text-slate-600 font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-2xl transition-smooth active:scale-95 ${isExporting ? 'border-slate-200 opacity-50 cursor-not-allowed' : 'border-slate-200 hover:border-accent'}`}
          >
            {isExporting ? 'Exportando...' : 'Exportar XLS'}
          </button>
          <Link 
            to="/admin/productos" 
            className="bg-primary-950 text-white font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-2xl hover:bg-black transition-smooth shadow-2xl shadow-primary-950/20 active:scale-95"
          >
            Nuevo Producto
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-smooth group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-smooth duration-700"></div>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className={`p-4 rounded-2xl ${kpi.color} shadow-inner group-hover:scale-110 transition-smooth`}>
                <kpi.icon className="w-7 h-7" />
              </div>
              <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${kpi.trending === 'up' ? 'text-green-600' : 'text-red-500'} group-hover:translate-x-2 transition-smooth`}>
                {kpi.trending === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {kpi.change}
              </div>
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-4xl font-black font-outfit text-primary-950 tracking-tighter group-hover:text-accent transition-smooth leading-none">{kpi.value}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{kpi.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Reservations */}
        <div className="lg:col-span-2 bg-white rounded-[4rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-2xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Reservas Críticas</h3>
            <Link to="/admin/productos" className="text-[10px] font-black text-accent uppercase tracking-[0.3em] hover:gap-3 flex items-center transition-smooth">
              Administrar <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Localizador</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente Corporativo</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estatus</th>
                  <th className="px-10 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentReservations.map((res, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-smooth group cursor-pointer active:bg-slate-100">
                    <td className="px-10 py-6">
                      <span className="text-sm font-black font-outfit text-primary-950 tracking-tighter group-hover:text-accent transition-smooth">{res.id}</span>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex flex-col">
                         <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{res.cliente}</span>
                         <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{res.fecha}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-lg font-black text-primary-900 font-outfit tracking-tighter">${res.total}</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                        res.estado === 'Pendiente' ? 'bg-orange-100 text-orange-600' :
                        res.estado === 'Confirmada' ? 'bg-blue-100 text-blue-600' :
                        res.estado === 'Completada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {res.estado}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button className="p-3 text-slate-300 hover:text-accent transition-smooth bg-slate-50 rounded-xl active:scale-90">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Sidebar */}
        <div className="bg-primary-950 text-white rounded-[4rem] p-10 shadow-2xl shadow-primary-950/40 flex flex-col gap-10 h-fit relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-smooth duration-1000"></div>
           <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter flex items-center gap-4 relative z-10">
             <Clock className="w-6 h-6 text-accent" /> Actividad Log
           </h3>
           <div className="flex flex-col gap-8 relative z-10">
              {[
                { title: "Importación Masiva", time: "Hace 14 min", desc: "Se agregaron 25 items Ansell vía XLS." },
                { title: "Alerta de Stock", time: "Hace 45 min", desc: "SKU: CAS-003 crítico (2 unidades)." },
                { title: "Caché Refrescada", time: "Hace 2 horas", desc: "Catálogo sincronizado exitosamente." },
                { title: "Configuración", time: "Ayer, 06:12 PM", desc: "Se actualizó el banner del Home." }
              ].map((activity, i) => (
                <div key={i} className="flex gap-6 group cursor-help">
                   <div className="relative flex flex-col items-center shrink-0">
                      <div className="w-3 h-3 rounded-full bg-accent z-10 shadow-xl shadow-accent/50 group-hover:scale-150 transition-smooth"></div>
                      {i !== 3 && <div className="absolute top-3 w-[2px] h-20 bg-white/10 group-hover:bg-accent/20 transition-smooth"></div>}
                   </div>
                   <div className="flex flex-col gap-1.5 pb-2 group-hover:translate-x-3 transition-smooth">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{activity.title}</h4>
                      <span className="text-[9px] text-accent font-black uppercase tracking-widest">{activity.time}</span>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium mt-1">{activity.desc}</p>
                   </div>
                </div>
              ))}
           </div>
           <button className="w-full h-14 text-[10px] font-black uppercase tracking-[0.3em] border border-white/10 rounded-2xl hover:bg-white/5 hover:border-accent transition-smooth active:scale-95 relative z-10">
              Ver Historial Completo
           </button>
        </div>
      </div>
    </div>
  );
}
