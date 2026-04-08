import React, { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft, 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  Fingerprint,
  AlertCircle,
  PackageCheck,
  ClipboardList,
  Target,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';
import { supabase } from '@/lib/supabase/client';

const reservationSchema = z.object({
  nombre: z.string().min(3, 'El nombre es requerido'),
  telefono: z.string().min(10, 'Teléfono inválido'),
  email: z.string().email('Email inválido'),
  cedula: z.string().min(7, 'Identificación requerida'),
  mensaje: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Acepte los términos.' }),
  }),
});

type ReservationData = z.infer<typeof reservationSchema>;

const Reservar = () => {
  const { items, clearCart } = useCartStore();
  const { usdRate, eurRate } = useCurrency();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [pendingLocalizer, setPendingLocalizer] = useState('');

  const total = items.reduce((acc, item) => acc + ((Number(item.price) || 0) * item.quantity), 0);

  const { register, handleSubmit, formState: { errors } } = useForm<ReservationData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { acceptTerms: true }
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-6 px-6">
        <AlertCircle className="w-16 h-16 text-slate-300" />
        <h2 className="text-3xl font-black font-outfit uppercase tracking-tighter">Carrito Vacío</h2>
        <Link to="/productos" className="bg-accent text-white px-8 py-4 rounded-xl font-black uppercase text-xs">Ir a Productos</Link>
      </div>
    );
  }

  const onSubmit = async (data: ReservationData) => {
    setIsSubmitting(true);
    try {
      const localizer = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error: orderError } = await supabase.from('pedidos').insert({
        localizador: localizer, cliente_nombre: data.nombre, cliente_telefono: data.telefono,
        cliente_email: data.email, cliente_cedula: data.cedula, nota: data.mensaje,
        total_usd: total, estado: 'pendiente'
      });
      if (orderError) throw orderError;
      const orderItems = items.map(item => ({
        localizador: localizer, producto_id: item.id, cantidad: item.quantity,
        precio_unitario: item.price, subtotal: (item.price || 0) * item.quantity
      }));
      const { error: itemsError } = await supabase.from('pedidos_items').insert(orderItems);
      if (itemsError) throw itemsError;
      setPendingLocalizer(localizer);
      setShowWhatsappModal(true);
      clearCart();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al reservar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/584141234567?text=${encodeURIComponent(`*NUEVA RESERVA*\n*ID:* ${pendingLocalizer}\n*Total:* $${total.toFixed(2)}`)}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 pt-32 px-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-[1300px] mx-auto relative z-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h1 className="text-3xl font-black font-outfit text-primary-950 dark:text-white uppercase tracking-tighter leading-none">Finalizar Reserva</h1>
            <Link to="/carrito" className="flex items-center gap-2 text-primary-400 dark:text-slate-500 font-black uppercase text-[9px] tracking-widest hover:text-accent transition-smooth pb-1 group">
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> VOLVER
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1: PRODUCTOS */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col min-h-[490px] relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.05] transition-opacity"><PackageCheck className="w-24 h-24 dark:text-white" /></div>
               <div className="flex items-start justify-between mb-8">
                 <div className="flex flex-col">
                   <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">PRODUCTOS</h3>
                   <span className="text-[10px] font-bold text-accent tracking-[0.2em]">PASO 01</span>
                 </div>
                 <div className="w-10 h-10 bg-primary-50 dark:bg-accent/10 rounded-xl flex items-center justify-center text-primary-600 dark:text-accent font-black text-xs">1</div>
               </div>

               <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                 {items.map((item) => (
                   <div key={item.id} className="flex gap-4 items-center py-3 border-b border-slate-100/50 dark:border-slate-800/50 last:border-0 relative group/item">
                     <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-2 shrink-0 transition-transform group-hover/item:scale-105 shadow-sm">
                       <img src={item.image || "/placeholder.png"} className="w-full h-full object-contain" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="text-[11px] font-black uppercase truncate text-slate-800 dark:text-slate-100 leading-tight">{item.name}</h4>
                       <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1 block">X{item.quantity}</span>
                     </div>
                     <span className="text-xs font-black text-slate-950 dark:text-white font-outfit tracking-tighter">${((item.price || 0) * item.quantity).toFixed(2)}</span>
                   </div>
                 ))}
               </div>

               <div className="pt-8 border-t border-slate-100 dark:border-slate-800 mt-auto flex justify-between items-end relative z-10">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">SUBTOTAL</span>
                   <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">Bs. {Math.round(total * usdRate).toLocaleString()}</span>
                 </div>
                 <span className="text-5xl font-black text-accent tracking-tighter leading-none">${total.toFixed(2)}</span>
               </div>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
               {/* 2: CLIENTE */}
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col min-h-[490px] group relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.05] transition-opacity"><ClipboardList className="w-24 h-24 dark:text-white" /></div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">DATOS CLIENTE</h3>
                      <span className="text-[10px] font-bold text-accent tracking-[0.2em]">PASO 02</span>
                    </div>
                    <div className="w-10 h-10 bg-primary-50 dark:bg-accent/10 rounded-xl flex items-center justify-center text-primary-600 dark:text-accent font-black text-xs">2</div>
                  </div>

                  <div className="flex flex-col gap-5">
                    {[
                      {id: 'nombre', label: 'NOMBRE COMPLETO', ph: 'Juan Pérez', icon: <User className="w-3.5 h-3.5" />},
                      {id: 'telefono', label: 'WHATSAPP', ph: '0414 1234567', icon: <Phone className="w-3.5 h-3.5" />},
                      {id: 'cedula', label: 'CÉDULA / RIF', ph: 'V-12345678', icon: <Fingerprint className="w-3.5 h-3.5" />},
                      {id: 'email', label: 'CORREO ELECTRÓNICO', ph: 'admin@mail.com', icon: <Mail className="w-3.5 h-3.5" />}
                    ].map(f => (
                      <div key={f.id} className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                          {f.icon} {f.label}
                        </label>
                        <input {...register(f.id as any)} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-300 placeholder:text-slate-300 dark:placeholder:text-slate-700" placeholder={f.ph} />
                        {errors[f.id as keyof ReservationData] && <span className="text-[10px] font-bold text-red-500 px-1 italic">! {errors[f.id as keyof ReservationData]?.message}</span>}
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-3 block flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" /> REQUERIMIENTOS ESPECIALES
                    </label>
                    <textarea {...register("mensaje")} rows={1} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-xs font-bold text-slate-900 dark:text-white outline-none resize-none transition-all duration-300 placeholder:text-slate-300 dark:placeholder:text-slate-700" placeholder="Tallas, colores o notas..." />
                  </div>
               </motion.div>

               {/* 3: FINALIZAR */}
               <motion.div 
                 whileHover={{ y: -5, scale: 1.01 }}
                 className="bg-accent shadow-2xl shadow-accent/20 p-8 rounded-[2.5rem] border border-accent/20 flex flex-col min-h-[490px] group relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity"><Target className="w-24 h-24 text-white" /></div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">ENVIAR RESERVA</h3>
                      <span className="text-[10px] font-bold text-white/60 tracking-[0.2em]">PASO 03</span>
                    </div>
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center font-black text-xs">3</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-sm relative z-10">
                    <h4 className="text-[10px] font-black text-white uppercase mb-4 tracking-[.3em] border-b border-white/10 pb-2">AVISO LEGAL</h4>
                    <ul className="flex flex-col gap-4 text-[11px] font-black text-white uppercase tracking-tight">
                      <li className="flex items-start gap-3"><div className="w-2 h-2 bg-white rounded-full mt-1 shrink-0" /> Validez técnica de 48 horas.</li>
                      <li className="flex items-start gap-3"><div className="w-2 h-2 bg-white rounded-full mt-1 shrink-0" /> Stock sujeto a disponibilidad.</li>
                      <li className="flex items-start gap-3"><div className="w-2 h-2 bg-white rounded-full mt-1 shrink-0" /> Flete Industrial Dobell.</li>
                    </ul>
                  </div>

                  <div className="pt-8 border-t border-white/10 mt-auto flex flex-col gap-6 relative z-10">
                     <label className="flex items-start gap-4 cursor-pointer group/terms">
                       <input {...register("acceptTerms")} type="checkbox" className="mt-0.5 w-5 h-5 rounded border-white/30 text-white focus:ring-white bg-transparent transition-all" />
                       <span className="text-[11px] font-black text-white leading-snug uppercase tracking-wider transition-smooth group-hover/terms:opacity-80">
                         Confirmo que los datos suministrados son técnicos y correctos para el despacho.
                       </span>
                     </label>

                     <div className="flex flex-col gap-4">
                       <button type="submit" disabled={isSubmitting} className="w-full h-20 bg-white text-accent rounded-3xl font-black uppercase text-sm tracking-[0.25em] flex items-center justify-center gap-4 transition-all duration-300 shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 group/btn disabled:opacity-50">
                         {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>CONFIRMAR VENTA <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" /></>}
                       </button>
                       <div className="flex items-center justify-center gap-3 text-[10px] font-black text-white/70 uppercase tracking-widest text-center italic">
                         <ShieldCheck className="w-4 h-4" /> TRASACCIÓN SEGURA • PROTEGIDO
                       </div>
                     </div>
                  </div>
               </motion.div>
            </form>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showWhatsappModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl transition-all duration-500">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              className="bg-white dark:bg-slate-950 rounded-[3rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative z-10 flex flex-col items-center gap-8 max-w-md text-center border-4 border-slate-50 dark:border-accent/10"
            >
              <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center shadow-inner border border-green-100 dark:border-green-500/20">
                <PackageCheck className="w-12 h-12 text-green-500" />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-3xl font-black uppercase text-primary-950 dark:text-white tracking-tighter leading-none">¡Reserva Generada!</h3>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">LOCALIZADOR TÉCNICO</p>
                <div className="bg-slate-100 dark:bg-slate-900 px-8 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-3xl font-black text-primary-950 dark:text-accent font-outfit">
                  {pendingLocalizer}
                </div>
              </div>
              
              <div className="flex flex-col w-full gap-4 pt-4 border-t border-slate-100 dark:border-slate-900">
                <button 
                  onClick={() => { window.open(whatsappUrl, '_blank'); navigate(`/gracias/${pendingLocalizer}`); }} 
                  className="w-full h-16 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-4 transition-all duration-300 shadow-xl shadow-green-500/20 active:scale-95"
                >
                  <MessageSquare className="w-5 h-5" /> NOTIFICAR VÍA WHATSAPP
                </button>
                <button 
                  onClick={() => navigate(`/gracias/${pendingLocalizer}`)} 
                  className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-smooth tracking-widest pt-2 underline underline-offset-8 decoration-slate-200 dark:decoration-slate-800"
                >
                  Continuar sin reportar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reservar;
