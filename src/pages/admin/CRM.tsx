import React, { useState, useEffect } from "react";
import { 
  Users, 
  Mail, 
  Send, 
  Filter, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ShoppingCart, 
  Zap,
  TrendingUp,
  AlertCircle,
  X,
  FileText,
  UserPlus,
  MessageSquare,
  BarChart3,
  PieChart,
  MousePointer2,
  MailOpen,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  segmento: 'suscriptor' | 'abandono' | 'completado' | 'pendiente';
  ultima_interaccion: string;
  total_inversion: number;
  acepta_marketing?: boolean;
  selected?: boolean;
}

export default function AdminCRM() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    asunto: '',
    mensaje: '',
    objetivo: 'todos'
  });
  const [selectedCount, setSelectedCount] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(true);

  useEffect(() => {
    fetchCRMData();
    fetchCampaigns();

    // Suscripción en tiempo real para progreso de campañas
    const channel = supabase.channel('campaign-progress')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'campanas' 
      }, (payload) => {
        setActiveCampaigns(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCampaigns = async () => {
    setIsCampaignsLoading(true);
    const { data, error } = await supabase
      .from('campanas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (!error && data) setActiveCampaigns(data);
    setIsCampaignsLoading(false);
  };

  const fetchCRMData = async () => {
    setLoading(true);
    try {
      // Obtenemos datos de la tabla de ordenes para derivar clientes
      const { data: ordenes, error } = await supabase
        .from('ordenes')
        .select('cliente_email, cliente_nombre, cliente_telefono, estado, total, created_at, acepta_marketing')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Procesamos datos únicos por email
      const customerMap = new Map<string, Customer>();
      
      ordenes?.forEach(o => {
        if (!customerMap.has(o.cliente_email)) {
          customerMap.set(o.cliente_email, {
            id: o.cliente_email,
            nombre: o.cliente_nombre,
            email: o.cliente_email,
            telefono: o.cliente_telefono,
            segmento: o.estado === 'pendiente' ? 'abandono' : o.estado === 'completada' ? 'completado' : 'pendiente',
            ultima_interaccion: o.created_at,
            total_inversion: Number(o.total || 0),
            acepta_marketing: o.acepta_marketing,
            selected: false
          });
        } else {
          const existing = customerMap.get(o.cliente_email)!;
          existing.total_inversion += Number(o.total || 0);
          if (new Date(o.created_at) > new Date(existing.ultima_interaccion)) {
            existing.ultima_interaccion = o.created_at;
            (existing as any).acepta_marketing = o.acepta_marketing;
          }
        }
      });

      setCustomers(Array.from(customerMap.values()));
    } catch (err) {
      console.error("Error CRM:", err);
      toast.error("Error al cargar base de datos de clientes");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = customers.every(c => c.selected);
    const updated = customers.map(c => ({ ...c, selected: !allSelected }));
    setCustomers(updated);
    setSelectedCount(updated.filter(c => c.selected).length);
  };

  const toggleSelect = (id: string) => {
    const updated = customers.map(c => c.id === id ? { ...c, selected: !c.selected } : c);
    setCustomers(updated);
    setSelectedCount(updated.filter(c => c.selected).length);
  };

  const handleSendCampaign = async () => {
    if (!campaignForm.asunto || !campaignForm.mensaje) {
      return toast.error("Complete el asunto y el mensaje");
    }
    
    const targetCount = selectedCount > 0 ? selectedCount : filteredCustomers.length;
    const targets = selectedCount > 0 
      ? customers.filter(c => c.selected) 
      : filteredCustomers;

    setLoading(true);
    try {
      // 1. Crear la campaña en la base de datos
      const { data: campaign, error: campError } = await supabase
        .from('campanas')
        .insert({
          asunto: campaignForm.asunto,
          mensaje: campaignForm.mensaje,
          segmento: filter,
          total_destinatarios: targetCount,
          estado: 'enviando',
          lote_tamano: 10
        })
        .select()
        .single();

      if (campError) throw campError;

      // 2. Crear los destinatarios individuales
      const recipients = targets.map(t => ({
        campana_id: campaign.id,
        email: t.email,
        nombre: t.nombre,
        estado: 'pendiente'
      }));

      const { error: recError } = await supabase
        .from('campana_destinatarios')
        .insert(recipients);

      if (recError) throw recError;

      toast.success("Campaña iniciada. El motor de envío procesará los lotes.");
      setIsCampaignModalOpen(false);
      setCampaignForm({ asunto: '', mensaje: '', objetivo: 'todos' });
      fetchCampaigns();
    } catch (err: any) {
      toast.error("Error al iniciar campaña: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesFilter = filter === 'todos' || c.segmento === filter;
    const matchesSearch = c.nombre.toLowerCase().includes(search.toLowerCase()) || 
                          c.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const kpis = [
    { label: "Base de Datos", value: customers.length, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Aceptan Marketing", value: customers.filter(c => (c as any).acepta_marketing).length || 0, icon: CheckCircle2, color: "bg-indigo-50 text-indigo-600" },
    { label: "Ventas de Hoy", value: customers.filter(c => format(new Date(c.ultima_interaccion), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length, icon: TrendingUp, color: "bg-green-50 text-green-600" },
    { label: "Tasa Conversión", value: customers.length > 0 ? `${((customers.filter(c => c.segmento === 'completado').length / customers.length) * 100).toFixed(1)}%` : "0%", icon: Zap, color: "bg-purple-50 text-purple-600" }
  ];

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-3 text-accent font-black uppercase text-[10px] tracking-[0.4em] font-outfit">
              <Zap className="w-3 h-3 animate-pulse" /> Estrategia de Crecimiento
           </div>
           <h1 className="text-4xl md:text-5xl font-black font-outfit text-primary-950 uppercase tracking-tighter leading-none">Centro de CRM</h1>
           <p className="text-slate-500 font-medium tracking-wide">Gestión de audiencias y campañas de anuncios técnicos.</p>
        </div>
        <button 
           onClick={() => setIsCampaignModalOpen(true)}
           className="bg-primary-950 text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary-950/20 hover:bg-accent transition-smooth flex items-center gap-4 active:scale-95"
        >
          <Send className="w-4 h-4" /> Crear Anuncio Masivo
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {kpis.map((kpi, i) => (
           <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-smooth">
              <div className={`p-4 rounded-2xl ${kpi.color} shadow-inner transition-smooth group-hover:scale-110`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                 <span className="text-3xl font-black font-outfit text-primary-950 tracking-tighter">{kpi.value}</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{kpi.label}</span>
              </div>
           </div>
         ))}
      </div>

      {/* NEW: Visual Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Performance Ring Chart */}
         <div className="col-span-1 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
            <div className="relative z-10 flex flex-col items-center">
               <div className="flex items-center gap-3 self-start mb-10">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                     <PieChart className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                     <h3 className="text-lg font-black text-primary-950 uppercase tracking-tight leading-none">Rendimiento</h3>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global de Campañas</span>
                  </div>
               </div>

               <div className="relative w-48 h-48 flex items-center justify-center mb-10">
                  <svg className="w-full h-full transform -rotate-90">
                     <circle cx="96" cy="96" r="80" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                     {activeCampaigns.length > 0 && activeCampaigns[0].total_destinatarios > 0 && (
                        <>
                           <motion.circle 
                              initial={{ strokeDasharray: "0, 502" }}
                              animate={{ strokeDasharray: `${((activeCampaigns[0].enviados / activeCampaigns[0].total_destinatarios) * 502)}, 502` }}
                              cx="96" cy="96" r="80" fill="transparent" stroke="#3b82f6" strokeWidth="16" strokeLinecap="round" 
                           />
                           <motion.circle 
                              initial={{ strokeDasharray: "0, 502" }}
                              animate={{ strokeDasharray: `${((activeCampaigns[0].abiertos / activeCampaigns[0].total_destinatarios) * 502)}, 502` }}
                              cx="96" cy="96" r="80" fill="transparent" stroke="#8b5cf6" strokeWidth="16" strokeLinecap="round" 
                           />
                           <motion.circle 
                              initial={{ strokeDasharray: "0, 502" }}
                              animate={{ strokeDasharray: `${((activeCampaigns[0].clics / activeCampaigns[0].total_destinatarios) * 502)}, 502` }}
                              cx="96" cy="96" r="80" fill="transparent" stroke="#10b981" strokeWidth="16" strokeLinecap="round" 
                           />
                        </>
                     )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-4xl font-black font-outfit text-primary-950 tracking-tighter">
                        {activeCampaigns.length > 0 ? (Math.round((activeCampaigns[0].abiertos / activeCampaigns[0].enviados) * 100) || 0) : 0}%
                     </span>
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Apertura Avg</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                     <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary-950 leading-none">Entregado</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{activeCampaigns[0]?.enviados || 0}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                     <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#8b5cf6]" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary-950 leading-none">Abierto</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{activeCampaigns[0]?.abiertos || 0}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Distribution & Interaction Charts */}
         <div className="col-span-1 xl:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                     <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                     <h3 className="text-lg font-black text-primary-950 uppercase tracking-tight leading-none">Interacción</h3>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Porcentaje de Clics y Conversión</span>
                  </div>
               </div>
               <div className="px-5 py-2.5 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Últimos 7 días
               </div>
            </div>

            <div className="space-y-10">
               {[
                  { label: "Emails Abiertos", value: activeCampaigns[0]?.abiertos || 0, max: activeCampaigns[0]?.total_destinatarios || 100, color: "bg-indigo-500", icon: MailOpen },
                  { label: "Clics en Enlaces", value: activeCampaigns[0]?.clics || 0, max: activeCampaigns[0]?.total_destinatarios || 100, color: "bg-green-500", icon: MousePointer2 },
                  { label: "Emails Fallidos", value: activeCampaigns[0]?.fallidos || 0, max: activeCampaigns[0]?.total_destinatarios || 100, color: "bg-red-500", icon: AlertTriangle },
               ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col gap-3">
                     <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3">
                           <bar.icon className="w-4 h-4 text-slate-400" />
                           <span className="text-[11px] font-black text-primary-950 uppercase tracking-tight">{bar.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-lg font-black font-outfit text-primary-950 leading-none">{bar.value}</span>
                           <span className="text-[10px] font-bold text-slate-300 uppercase leading-none">/ {bar.max}</span>
                        </div>
                     </div>
                     <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden p-1 shadow-inner">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(bar.value / bar.max) * 100}%` }}
                           className={`h-full ${bar.color} rounded-full shadow-lg relative`}
                        >
                           <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                        </motion.div>
                     </div>
                  </div>
               ))}
            </div>

            <div className="mt-12 pt-10 border-t border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-10">
                  <div className="flex flex-col text-center">
                     <span className="text-2xl font-black font-outfit text-primary-950">{(Math.round((activeCampaigns[0]?.clics / activeCampaigns[0]?.abiertos) * 100) || 0)}%</span>
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">CTR Estimado</span>
                  </div>
                  <div className="w-px h-10 bg-slate-100" />
                  <div className="flex flex-col text-center">
                     <span className="text-2xl font-black font-outfit text-primary-950">{activeCampaigns[0]?.fallidos || 0}</span>
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Bounces</span>
                  </div>
               </div>
               <div className="flex -space-x-3">
                  {[...Array(5)].map((_, i) => (
                     <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center font-black text-[9px] text-slate-400">
                        {String.fromCharCode(65 + i)}
                     </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-accent flex items-center justify-center font-black text-[9px] text-white">
                     +12
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Campaign Progress Section */}
      <AnimatePresence>
        {activeCampaigns.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeCampaigns.filter(c => c.estado === 'enviando').map(campaign => (
              <div key={campaign.id} className="bg-primary-950 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest leading-none">Procesando por Lotes</span>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate max-w-[250px]">{campaign.asunto}</h3>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-2xl font-black text-white font-outfit leading-none">{Math.round((campaign.enviados / campaign.total_destinatarios) * 100)}%</span>
                       <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Progreso Real</span>
                    </div>
                  </div>
                  
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(campaign.enviados / campaign.total_destinatarios) * 100}%` }}
                      className="h-full bg-accent"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-white/40 uppercase mb-1">Enviados</span>
                       <span className="text-sm font-black text-white whitespace-nowrap">{campaign.enviados} de {campaign.total_destinatarios}</span>
                    </div>
                    <div className="flex flex-col"><span className="text-[9px] font-black text-white/40 uppercase mb-1">Abiertos</span><span className="text-sm font-black text-accent">{campaign.abiertos}</span></div>
                    <div className="flex flex-col"><span className="text-[9px] font-black text-white/40 uppercase mb-1">Clics</span><span className="text-sm font-black text-green-400">{campaign.clics}</span></div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-white/40 uppercase mb-1">Estado</span>
                       <span className="text-[10px] font-black text-accent border border-accent/30 rounded px-2 py-0.5 uppercase tracking-tighter self-start animate-pulse">Lote Activo</span>
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      const batch = 10;
                      const newEnviados = Math.min(campaign.enviados + batch, campaign.total_destinatarios);
                      const isFinished = newEnviados === campaign.total_destinatarios;
                      
                      await supabase.from('campanas').update({ 
                        enviados: newEnviados,
                        estado: isFinished ? 'completada' : 'enviando'
                      }).eq('id', campaign.id);
                      
                      if(isFinished) toast.success("Simulación de campaña completada");
                    }}
                    className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-white/60 uppercase tracking-widest transition-colors border border-white/10"
                  >
                    Simular Envío de Lote (+10)
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main CRM Core */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
         {/* Filter Bar */}
         <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-50/30">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto custom-scrollbar">
               {['todos', 'completado', 'abandono', 'pendiente'].map((seg) => (
                 <button 
                   key={seg}
                   onClick={() => setFilter(seg)}
                   className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-smooth shrink-0 ${
                     filter === seg ? 'bg-primary-950 text-white shadow-lg' : 'bg-white border text-slate-400 hover:border-slate-300'
                   }`}
                 >
                   {seg === 'todos' ? 'Toda la Base' : seg === 'abandono' ? 'Cerrar Ventas' : seg === 'completado' ? 'Clientes VIP' : 'Prospectos'}
                 </button>
               ))}
            </div>
            <div className="relative w-full lg:w-96">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text"
                 placeholder="Buscar por nombre o correo..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold outline-none focus:ring-2 focus:ring-accent transition-smooth"
               />
            </div>
         </div>

         {/* Selection Actions */}
         <AnimatePresence>
            {selectedCount > 0 && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="bg-primary-950 text-white px-10 py-4 flex items-center justify-between"
               >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    {selectedCount} usuarios seleccionados
                  </span>
                  <div className="flex gap-4">
                     <button 
                       onClick={() => setIsCampaignModalOpen(true)}
                       className="bg-accent text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110"
                     >
                       Enviar Anuncio
                     </button>
                     <button 
                       onClick={() => toggleSelectAll()}
                       className="text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest"
                     >
                       Desmarcar Todo
                     </button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Customers Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50">
                     <th className="px-10 py-6">
                        <input type="checkbox" onChange={toggleSelectAll} checked={customers.length > 0 && customers.every(c => c.selected)} className="w-4 h-4 rounded border-slate-300 text-accent focus:ring-accent accent-accent cursor-pointer" />
                     </th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificación Cliente</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Segmento</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Inversión Total</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                       <td colSpan={5} className="py-20 text-center">
                          <Clock className="w-8 h-8 animate-spin mx-auto text-slate-200" />
                       </td>
                    </tr>
                  ) : filteredCustomers.map((c) => (
                    <tr key={c.id} className={`hover:bg-slate-50 transition-smooth group ${c.selected ? 'bg-blue-50/30' : ''}`}>
                       <td className="px-10 py-6">
                          <input 
                            type="checkbox" 
                            checked={c.selected} 
                            onChange={() => toggleSelect(c.id)}
                            className="w-4 h-4 rounded border-slate-300 text-accent focus:ring-accent accent-accent cursor-pointer" 
                          />
                       </td>
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-primary-950 font-black text-xs shadow-sm shadow-primary-950/5">
                                {c.nombre.charAt(0)}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-primary-950 uppercase tracking-tight">{c.nombre}</span>
                                <span className="text-[10px] font-black text-slate-400 flex items-center gap-2">
                                   <Mail className="w-2.5 h-2.5" /> {c.email}
                                </span>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            c.segmento === 'completado' ? 'bg-green-50 text-green-600 border-green-100' :
                            c.segmento === 'abandono' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>
                             {c.segmento === 'completado' ? 'VIP (Comprador)' : c.segmento === 'abandono' ? 'Recuperación' : 'Prospecto'}
                          </span>
                       </td>
                       <td className="px-10 py-6 text-right">
                          <span className="text-sm font-black text-primary-950 font-outfit">${c.total_inversion.toFixed(2)}</span>
                       </td>
                       <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
                             <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-accent hover:border-accent transition-smooth">
                                <FileText className="w-4 h-4" />
                             </button>
                             <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-accent hover:border-accent transition-smooth">
                                <MessageSquare className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Campaign Modal */}
      <AnimatePresence>
         {isCampaignModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => setIsCampaignModalOpen(false)}
                 className="absolute inset-0 bg-primary-950/80 backdrop-blur-md"
              />
              <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden"
              >
                 <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-primary-950 text-accent rounded-2xl">
                          <Send className="w-6 h-6" />
                       </div>
                       <div className="flex flex-col">
                          <h3 className="text-2xl font-black text-primary-950 uppercase tracking-tighter">Nueva Campaña</h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Anuncios de productos y recuperación</span>
                       </div>
                    </div>
                    <button onClick={() => setIsCampaignModalOpen(false)} className="p-4 hover:bg-slate-100 rounded-2xl transition-smooth">
                       <X className="w-6 h-6 text-slate-300" />
                    </button>
                 </div>

                 <div className="p-12 flex flex-col gap-8">
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-2xl flex items-start gap-4">
                       <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                       <div className="flex flex-col gap-1">
                          <h4 className="text-xs font-black text-amber-700 uppercase tracking-wide">Configuración Pendiente</h4>
                          <p className="text-[10px] text-amber-600 font-medium uppercase tracking-widest">El servidor de correo SMTP no está configurado. Esta acción registrará la campaña pero no disparará los correos reales.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Asunto del Anuncio</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-sm font-bold outline-none focus:ring-2 focus:ring-accent transition-smooth"
                            placeholder="Ej: ¡Solo hoy! 20% en Cascos Clase B"
                            value={campaignForm.asunto}
                            onChange={(e) => setCampaignForm({...campaignForm, asunto: e.target.value})}
                          />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contenido del Mensaje</label>
                          <textarea 
                            className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] py-8 px-8 text-sm font-bold outline-none focus:ring-2 focus:ring-accent min-h-[200px] resize-none transition-smooth"
                            placeholder="Hola {{NOMBRE}}, vimos que dejaste equipos en tu carrito..."
                            value={campaignForm.mensaje}
                            onChange={(e) => setCampaignForm({...campaignForm, mensaje: e.target.value})}
                          />
                          <p className="text-[9px] text-slate-300 font-medium px-4">Variables dinámicas: &#123;&#123;NOMBRE&#125;&#125;, &#123;&#123;CUPO_DESC&#125;&#125;</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audiencia Estimada</span>
                          <span className="text-xl font-black text-primary-950 uppercase tracking-tighter">
                            {selectedCount > 0 ? `${selectedCount} Personas seleccionadas` : `Toda la base (${customers.length})`}
                          </span>
                       </div>
                       <button 
                         onClick={handleSendCampaign}
                         className="bg-primary-950 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary-950/20 hover:bg-accent transition-smooth active:scale-95"
                       >
                         Ejecutar Campaña Técnica
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
      
      {/* Guía de Activación (Manual) */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden p-12">
         <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
               <FileText className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
               <h3 className="text-2xl font-black text-primary-950 uppercase tracking-tighter">Guía de Activación del Sistema</h3>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Pasos finales para habilitar el motor de envío</span>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
               <div className="w-8 h-8 bg-primary-950 text-white rounded-full flex items-center justify-center font-black text-xs">1</div>
               <h4 className="text-sm font-black text-primary-950 uppercase tracking-tight">Configurar Proveedor</h4>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-wide">
                  Regístrate en <span className="text-accent font-black">Resend.com</span>, verifica tu dominio corporativo y crea una API Key con permisos de envío.
               </p>
            </div>

            <div className="flex flex-col gap-4 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
               <div className="w-8 h-8 bg-primary-950 text-white rounded-full flex items-center justify-center font-black text-xs">2</div>
               <h4 className="text-sm font-black text-primary-950 uppercase tracking-tight">Vincular Llaves</h4>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-wide">
                  Ve a <span className="text-primary-950 font-black underline">Mi Configuración {'>'} Marketing</span> y pega tu API Key y el correo remitente verificado (Ej: ventas@tuempresa.com).
               </p>
            </div>

            <div className="flex flex-col gap-4 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
               <div className="w-8 h-8 bg-primary-950 text-white rounded-full flex items-center justify-center font-black text-xs">3</div>
               <h4 className="text-sm font-black text-primary-950 uppercase tracking-tight">Despliegue de Código</h4>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-wide">
                  Ejecuta <code className="bg-slate-200 px-1 rounded text-primary-950">supabase functions deploy</code> desde tu terminal para subir las funciones de envío y tracking al servidor.
               </p>
            </div>
         </div>

         <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
               <h5 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Nota sobre Tracking</h5>
               <p className="text-[9px] text-indigo-600 font-medium uppercase tracking-[0.05em] leading-relaxed">
                  El sistema ya cuenta con "Webhooks". Una vez desplegada la función `marketing-webhooks`, copia su URL desde el dashboard de Supabase y pégala en Resend para activar el seguimiento de aperturas y clics automáticamente.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
