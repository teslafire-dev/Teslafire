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
  Target
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
    <div className="min-h-screen bg-slate-50 dark:bg-primary-950/20 py-8 pt-32 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-[1300px] mx-auto relative z-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h1 className="text-3xl font-black font-outfit text-primary-950 dark:text-white uppercase tracking-tighter leading-none">Finalizar Reserva</h1>
            <Link to="/carrito" className="flex items-center gap-2 text-primary-400 font-black uppercase text-[9px] tracking-widest hover:text-accent transition-smooth pb-1 group">
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> VOLVER
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1: PRODUCTOS */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col min-h-[490px] relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity"><PackageCheck className="w-24 h-24" /></div>
               <div className="flex items-start justify-between mb-6">
                 <div className="flex flex-col">
                   <h3 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">PRODUCTOS</h3>
                   <span className="text-[9px] font-bold text-accent tracking-[0.2em]">PASO 01</span>
                 </div>
                 <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 font-black text-xs">1</div>
               </div>

               <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                 {items.map((item) => (
                   <div key={item.id} className="flex gap-3 items-center py-2.5 border-b border-slate-100/50 dark:border-slate-800/50 last:border-0 relative group/item">
                     <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-1.5 shrink-0 transition-transform group-hover/item:scale-105">
                       <img src={item.image || "/placeholder.png"} className="w-full h-full object-contain" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="text-[10px] font-black uppercase truncate text-slate-800 dark:text-slate-200">{item.name}</h4>
                       <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">X{item.quantity}</span>
                     </div>
                     <span className="text-xs font-black text-slate-950 dark:text-white font-outfit">${((item.price || 0) * item.quantity).toFixed(2)}</span>
                   </div>
                 ))}
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto flex justify-between items-end relative z-10">
                 <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SUBTOTAL</span>
                   <span className="text-[10px] text-slate-400 font-bold uppercase">Bs. {Math.round(total * usdRate).toLocaleString()}</span>
                 </div>
                 <span className="text-4xl font-black text-accent tracking-tighter leading-none">${total.toFixed(2)}</span>
               </div>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
               {/* 2: CLIENTE */}
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col min-h-[490px] group relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity"><ClipboardList className="w-24 h-24" /></div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col">
                      <h3 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">DATOS CLIENTE</h3>
                      <span className="text-[9px] font-bold text-accent tracking-[0.2em]">PASO 02</span>
                    </div>
                    <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 font-black text-xs">2</div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {[
                      {id: 'nombre', label: 'NOMBRE COMPLETO', ph: 'Juan Pérez'},
                      {id: 'telefono', label: 'WHATSAPP', ph: '0414 1234567'},
                      {id: 'cedula', label: 'CÉDULA / RIF', ph: 'V-12345678'},
                      {id: 'email', label: 'ELECTRÓNICO', ph: 'admin@mail.com'}
                    ].map(f => (
                      <div key={f.id} className="flex flex-col gap-1.5 focus-within:z-10">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">{f.label}</label>
                        <input {...register(f.id as any)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-accent/20 transition-smooth" placeholder={f.ph} />
                        {errors[f.id as keyof ReservationData] && <span className="text-[8px] font-bold text-red-500 px-2 mt-0.5">{errors[f.id as keyof ReservationData]?.message}</span>}
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2 block">NOTAS / TALLAS</label>
                    <textarea {...register("mensaje")} rows={1} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white outline-none resize-none transition-smooth" />
                  </div>
               </motion.div>

               {/* 3: FINALIZAR */}
               <motion.div 
                 whileHover={{ y: -5, scale: 1.01 }}
                 className="bg-accent/5 p-6 rounded-[2.5rem] border border-accent/20 flex flex-col min-h-[490px] group relative overflow-hidden shadow-xl shadow-accent/5"
               >
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity"><Target className="w-24 h-24" /></div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col">
                      <h3 className="text-lg font-black text-accent uppercase tracking-tight">FINALIZAR VENTA</h3>
                      <span className="text-[9px] font-bold text-accent/60 tracking-[0.2em]">PASO 03</span>
                    </div>
                    <div className="w-8 h-8 bg-accent text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-accent/20">3</div>
                  </div>

                  <div className="bg-white/80 dark:bg-black/40 p-5 rounded-2xl border border-accent/10 shadow-sm relative z-10">
                    <h4 className="text-[9px] font-black text-accent uppercase mb-3 tracking-widest border-b border-accent/10 pb-1.5">CONDICIONES</h4>
                    <ul className="flex flex-col gap-2.5 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                      <li className="flex items-center gap-2.5"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full" /> Validez: 48 Horas.</li>
                      <li className="flex items-center gap-2.5"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full" /> Código en Taquilla.</li>
                      <li className="flex items-center gap-2.5"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full" /> Flete Industrial Dobell.</li>
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-accent/20 mt-auto flex flex-col gap-5 relative z-10">
                     <label className="flex items-start gap-3 cursor-pointer group">
                       <input {...register("acceptTerms")} type="checkbox" className="mt-0.5 w-4 h-4 rounded border-accent/30 text-accent focus:ring-accent bg-transparent" />
                       <span className="text-[10px] font-black text-orange-700 dark:text-orange-300 leading-tight uppercase tracking-wider transition-smooth group-hover:opacity-80">He leído y acepto los términos de la<br/>reserva técnica industrial.</span>
                     </label>

                     <div className="flex flex-col gap-3">
                       <button type="submit" disabled={isSubmitting} className="w-full h-16 bg-accent hover:bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-accent/20 active:scale-95 group/btn">
                         {isSubmitting ? "..." : <>CONFIRMAR VENTA <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform" /></>}
                       </button>
                       <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                         <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Operación Protegida • Sin Pagos
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary-950/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-3xl relative z-10 flex flex-col items-center gap-6 max-w-sm text-center border border-white dark:border-slate-800">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center shadow-inner"><ShieldCheck className="w-10 h-10 text-green-500" /></div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-2xl font-black uppercase tracking-tighter">¡Reserva Exitosa!</h3>
                <p className="text-xs font-bold text-slate-500 uppercase">Localizador: {pendingLocalizer}</p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button onClick={() => { window.open(whatsappUrl, '_blank'); navigate(`/gracias/${pendingLocalizer}`); }} className="w-full h-14 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-3 transition-smooth shadow-xl shadow-green-500/10 active:scale-95">WhatsApp <MessageSquare className="w-4 h-4" /></button>
                <button onClick={() => navigate(`/gracias/${pendingLocalizer}`)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-smooth">Saltar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reservar;
