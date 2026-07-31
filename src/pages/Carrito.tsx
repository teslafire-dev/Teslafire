import { useCartStore } from "@/lib/store/cartStore";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  ChevronLeft, 
  User, 
  Phone, 
  Mail, 
  Fingerprint, 
  MessageSquare,
  Loader2,
  Target,
  Eye,
  X,
  PackageCheck
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const reservationSchema = z.object({
  nombre: z.string().min(3, 'El nombre completo es obligatorio'),
  telefono: z.string().min(10, 'Número de teléfono válido obligatorio'),
  email: z.string().email('Correo electrónico inválido'),
  cedula: z.string().min(7, 'ID Fiscal / Cédula obligatoria'),
  mensaje: z.string().optional(),
  aceptaMarketing: z.boolean().default(false),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Por favor acepta los términos.' }),
  }),
});

type ReservationData = z.infer<typeof reservationSchema>;

export default function Carrito() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { t, lang } = useTranslation();
  const { usdRate, eurRate } = useCurrency();
  const navigate = useNavigate();
  const { user, nombre_completo, telefono: authTelefono } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingLocalizer, setPendingLocalizer] = useState('');

  // Local storage fallback
  const [savedData] = useState(() => {
    const saved = localStorage.getItem('dobell_customer_data');
    return saved ? JSON.parse(saved) : {};
  });

  const total = items.reduce((acc, item) => acc + ((Number(item.price) || 0) * item.quantity), 0);
  const totalBs = items.reduce((acc, item) => {
    if (item.moneda === 'NONE' || item.moneda === 'USD_ONLY' || item.moneda === 'EUR_ONLY') return acc;
    const rate = (item.moneda === 'EUR' || item.moneda === 'EUR_ONLY') ? eurRate : usdRate;
    return acc + ((Number(item.price) || 0) * item.quantity * rate);
  }, 0);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReservationData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { 
      acceptTerms: true,
      nombre: nombre_completo || savedData.nombre || '',
      telefono: authTelefono || savedData.telefono || '',
      email: user?.email || savedData.email || '',
      cedula: savedData.cedula || '',
      aceptaMarketing: true
    }
  });

  // Load profile data into form
  useEffect(() => {
    if (user || nombre_completo || authTelefono) {
      reset({
        acceptTerms: true,
        nombre: nombre_completo || savedData.nombre || '',
        telefono: authTelefono || savedData.telefono || '',
        email: user?.email || savedData.email || '',
        cedula: savedData.cedula || '',
        aceptaMarketing: true
      });
    }
  }, [user, nombre_completo, authTelefono, reset]);

  const onSubmit = async (data: ReservationData) => {
    setIsSubmitting(true);
    try {
      const localizer = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error: orderError } = await supabase.from('ordenes').insert({
        localizador: localizer, 
        cliente_nombre: data.nombre, 
        cliente_telefono: data.telefono,
        cliente_email: data.email, 
        cliente_cedula: data.cedula, 
        mensaje: data.mensaje,
        productos: items,
        total: total, 
        estado: 'pendiente',
        acepta_marketing: data.aceptaMarketing
      });
      if (orderError) throw orderError;
      
      // Save data for next time
      localStorage.setItem('dobell_customer_data', JSON.stringify({
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email,
        cedula: data.cedula
      }));

      setPendingLocalizer(localizer);
      // Salto directo a página de gracias
      navigate(`/gracias/${localizer}`);
      
      // Limpiar después de navegar
      setTimeout(() => clearCart(), 100);
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/584141234567?text=${encodeURIComponent(`*NEW DOBELL RESERVATION*\n*ID:* ${pendingLocalizer}\n*TOTAL:* $${total.toFixed(2)}`)}`;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700" />
        </div>
        <h1 className="text-3xl font-black font-outfit text-primary-950 dark:text-white uppercase tracking-tight text-center">{t('cart.empty.title')}</h1>
        <p className="text-slate-500 text-center max-w-md font-medium tracking-wide">{t('cart.empty.desc')}</p>
        <Link 
          to="/productos" 
          className="bg-accent hover:bg-accent/80 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-smooth shadow-2xl shadow-accent/20 active:scale-95"
        >
          {t('cart.empty.cta')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-[1750px] mx-auto flex flex-col lg:flex-row min-h-screen pt-20">
        
        {/* COL 1: ITEMS REVIEW (LEFT) */}
        <div className="flex-1 lg:flex-[1] px-6 md:px-12 py-12 bg-slate-50/50 dark:bg-slate-900/20 border-r border-slate-50 dark:border-slate-900 lg:overflow-y-auto lg:max-h-[calc(100vh-6rem)] custom-scrollbar">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-10">
              <div>
                <Link to="/productos" className="inline-flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] hover:text-accent transition-colors mb-6 group">
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('cart.continue_shopping')}
                </Link>
                <h3 className="text-2xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-none">{t('reservation.details_title')}</h3>
              </div>
              <div className="flex flex-col gap-6">
                 {items.map((item) => (
                    <div key={item.id} className="relative bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-smooth">
                       <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl p-2 shrink-0 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-smooth" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">{t('cart.sku_label')}: {item.sku}</span>
                          <h4 className="text-sm font-black text-primary-950 dark:text-white uppercase tracking-tight truncate mb-2">{item.name}</h4>
                          <div className="flex items-center justify-between">
                             <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden h-10 border border-slate-200 dark:border-slate-700">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">-</button>
                                <span className="w-8 text-center text-[11px] font-black">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">+</button>
                             </div>
                             <div className="flex flex-col items-end">
                                <span className="text-sm font-black text-primary-950 dark:text-white">${((Number(item.price) || 0) * item.quantity).toFixed(2)}</span>
                             </div>
                          </div>
                       </div>
                       <button 
                         onClick={() => removeItem(item.id)} 
                         className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-smooth opacity-60 group-hover:opacity-100"
                         title="Eliminar producto"
                       >
                         <X className="w-5 h-5" />
                       </button>
                    </div>
                 ))}
              </div>
              
              <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col gap-4 mb-10">
                 <h4 className="text-xs font-black text-primary-950 dark:text-white uppercase tracking-widest">{t('cart.help_title')}</h4>
                 <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t('cart.help_desc')}</p>
                 <button className="text-[10px] font-black text-accent uppercase tracking-widest hover:pl-2 transition-all w-fit">{t('cart.chat_expert')} →</button>
              </div>
           </motion.div>
        </div>

        {/* COL 2: FORM (CENTER) */}
        <div className="flex-1 lg:flex-[1.1] px-6 md:px-12 lg:px-16 py-12 border-r border-slate-50 dark:border-slate-900">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-primary-950 dark:text-white uppercase tracking-tighter mb-2 leading-none">{t('cart.title')}</h1>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] mb-12">{t('cart.subtitle')}</p>

              <form id="reservation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {[
                      {id: 'nombre', label: t('reservation.form.name'), ph: t('reservation.form.name_placeholder'), icon: <User className="w-5 h-5 text-accent" />},
                      {id: 'telefono', label: t('reservation.form.phone'), ph: t('reservation.form.phone_placeholder'), icon: <Phone className="w-5 h-5 text-accent" />},
                      {id: 'cedula', label: t('reservation.form.id'), ph: t('reservation.form.id_placeholder'), icon: <Fingerprint className="w-5 h-5 text-accent" />},
                      {id: 'email', label: t('reservation.form.email'), ph: t('reservation.form.email_placeholder'), icon: <Mail className="w-5 h-5 text-accent" />}
                    ].map(f => (
                      <div key={f.id} className="space-y-3 group/field">
                        <label className="text-[11px] font-black text-primary-950 dark:text-slate-300 uppercase tracking-widest px-1 flex items-center gap-3">
                          {f.icon} {f.label}
                        </label>
                        <input {...register(f.id as any)} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-base font-bold text-primary-950 dark:text-white focus:border-accent outline-none transition-all placeholder:text-slate-300" placeholder={f.ph} />
                        {errors[f.id as keyof ReservationData] && <p className="text-[10px] text-red-600 font-black px-1 uppercase tracking-tighter italic">! {errors[f.id as keyof ReservationData]?.message}</p>}
                      </div>
                    ))}
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] font-black text-primary-950 dark:text-slate-300 uppercase tracking-widest flex items-center gap-3 px-1">
                      <MessageSquare className="w-5 h-5 text-accent" /> {t('reservation.form.requirements')}
                    </label>
                    <textarea {...register("mensaje")} rows={3} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] px-8 py-5 text-base font-bold text-primary-950 dark:text-white outline-none resize-none placeholder:text-slate-300 focus:border-accent transition-all" placeholder={t('reservation.form.requirements_placeholder')} />
                 </div>
              </form>
           </motion.div>
        </div>

        {/* COL 3: TOTAL & SUBMIT (RIGHT) */}
        <div className="w-full lg:w-[420px] xl:w-[460px] p-8 lg:p-12 py-8 bg-white dark:bg-black relative">
           <div className="sticky top-6 space-y-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                 <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                       <h3 className="text-xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-none">{t('cart.summary_title')}</h3>
                    </div>

                    <div className="p-6 md:p-8 bg-primary-950 dark:bg-accent text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                       <Target className="absolute -right-8 -bottom-8 w-32 h-32 opacity-[0.05] group-hover:scale-110 transition-transform pointer-events-none" />
                       <div className="relative z-10 flex flex-col items-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-70">{t('reservation.form.total_amount')}</span>
                          <span className="text-5xl md:text-6xl font-black font-outfit tracking-tighter leading-none mb-3">${total.toFixed(2)}</span>
                          <div className="w-full h-px bg-white/10 my-3" />
                          <span className="text-xs font-bold opacity-80 uppercase tracking-widest">Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                       </div>
                    </div>

                    <div className="space-y-4 pt-2">
                       <div className="flex flex-col gap-3 px-2">
                          <label className="flex items-start gap-3 cursor-pointer group/marketing">
                             <input {...register("aceptaMarketing")} type="checkbox" className="mt-0.5 w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-800 text-accent focus:ring-accent accent-accent transition-all cursor-pointer" />
                             <span className="text-[10px] font-black text-primary-950 dark:text-slate-400 uppercase leading-tight tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors">
                               {t('reservation.form.marketing')}
                             </span>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer group/terms">
                             <input {...register("acceptTerms")} type="checkbox" className="mt-0.5 w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-800 text-accent focus:ring-accent accent-accent transition-all cursor-pointer" />
                             <span className="text-[10px] font-black text-primary-950 dark:text-slate-400 uppercase leading-tight tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors">
                               {t('reservation.form.declare')}
                             </span>
                          </label>
                          {errors.acceptTerms && <p className="text-[9px] text-red-600 font-bold uppercase">{errors.acceptTerms.message}</p>}
                       </div>

                       <button 
                         onClick={handleSubmit(onSubmit)}
                         disabled={isSubmitting}
                         className="w-full min-h-[4.5rem] py-4 px-6 bg-[#FFB800] text-black rounded-2xl font-black uppercase text-xs sm:text-sm tracking-[0.1em] sm:tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl hover:bg-[#FFD700] transition-all active:scale-95 group shadow-[0_15px_30px_-5px_rgba(255,184,0,0.3)] mt-2 text-center"
                       >
                         {isSubmitting ? (
                           <Loader2 className="w-8 h-8 animate-spin" />
                         ) : (
                           <>
                             {t('reservation.form.confirm')}
                             <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                           </>
                         )}
                       </button>

                       <div className="flex flex-col items-center gap-2 pt-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                          <ShieldCheck className="w-4 h-4" /> {t('reservation.form.secure')}
                       </div>
                    </div>
                 </div>
              </motion.div>
           </div>
        </div>
      </div>

    </div>
  );
}
