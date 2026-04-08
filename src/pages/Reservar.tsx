import { useCartStore } from "@/lib/store/cartStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { nanoid } from "nanoid";
import { 
  User, 
  Phone, 
  Mail, 
  Fingerprint, 
  MessageSquare, 
  ArrowRight, 
  ChevronLeft,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { useCurrency } from "@/contexts/CurrencyContext";

const reservationSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  telefono: z.string().min(10, "Ingrese un número de teléfono válido"),
  email: z.string().email("Correo electrónico inválido"),
  cedula: z.string().min(5, "Cédula o RIF inválido"),
  mensaje: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, "Debe aceptar los términos"),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

export default function Reservar() {
  const { t } = useTranslation();
  const { items, getTotal } = useCartStore();
  const { usdRate, eurRate } = useCurrency();
  const { user, nombre_completo, apellido, telefono } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("+584141234567");
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [pendingLocalizer, setPendingLocalizer] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
  });

  useEffect(() => {
    if (user) {
      if (nombre_completo) setValue("nombre", `${nombre_completo} ${apellido || ""}`.trim());
      if (user.email) setValue("email", user.email);
      if (telefono) setValue("telefono", telefono);
    }
  }, [user, nombre_completo, apellido, telefono, setValue]);

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', 'telefono_whatsapp')
        .single();
      if (data) setWhatsappNumber(data.valor);
    }
    fetchConfig();
  }, []);

  useEffect(() => {
    // Only redirect if there are no items and we are NOT in the middle of a submission
    if (items.length === 0 && !isSubmitting) {
      navigate("/carrito");
    }
  }, [items.length, navigate, isSubmitting]);

  const onSubmit = async (data: ReservationFormValues) => {
    setIsSubmitting(true);
    
    try {
      const digits = Math.floor(1000 + Math.random() * 9000).toString(); 
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const randomLetters = Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
      const localizer = `COT-${digits}${randomLetters}`;

      const { error } = await supabase.from('ordenes').insert({
        localizador: localizer,
        user_id: user?.id,
        cliente_nombre: data.nombre,
        cliente_telefono: data.telefono,
        cliente_email: data.email,
        cliente_cedula: data.cedula,
        mensaje: data.mensaje,
        productos: items.map(i => ({ sku: i.sku, nombre: i.name, cantidad: i.quantity, precio: i.price, moneda: i.moneda })),
        total: getTotal(),
        estado: 'pendiente'
      });

      if (error) throw error;

      const productsList = items
        .map(i => `• ${i.name} (Cant: ${i.quantity})`)
        .join('\n');

      const message = `*SOLICITUD DE PRESUPUESTO - DOBELL INDUSTRIAL*\n\n` +
        `*Localizador:* ${localizer}\n` +
        `*Cliente:* ${data.nombre}\n` +
        `*Identificación:* ${data.cedula}\n` +
        `*Teléfono:* ${data.telefono}\n\n` +
        `*PRODUCTOS:*\n${productsList}\n\n` +
        `*TOTAL ESTIMADO:* $${getTotal().toFixed(2)}\n\n` +
        `*NOTAS:* ${data.mensaje || 'Ninguna'}\n\n` +
        `_Enviado desde el Portal de Seguridad Dobell_`;

      const url = `https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
      setWhatsappUrl(url);
      setPendingLocalizer(localizer);
      setShowWhatsappModal(true);
      
    } catch (error: any) {
      console.error("Error saving reservation:", error);
      toast.error("Error al procesar la reserva: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen pt-40 pb-32">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-black font-outfit text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
                {t('reservation.title')}
              </h1>
              <p className="text-slate-400 dark:text-slate-500 font-medium text-xs tracking-wide">
                {t('reservation.subtitle')}
              </p>
            </div>
            <Link to="/carrito" className="flex items-center gap-3 text-accent font-black uppercase text-[10px] tracking-widest hover:gap-5 transition-smooth pb-1">
              <ChevronLeft className="w-4 h-4" /> {t('reservation.back_to_cart')}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Sidebar Summary (LEFT) */}
            <div className="flex flex-col gap-6">
               <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6 transition-smooth">
                  <h3 className="text-xl font-black font-outfit text-slate-950 dark:text-white uppercase tracking-tighter">
                    {t('reservation.details_title')}
                  </h3>
                  <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-5 items-center py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0 group">
                        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 group-hover:scale-105 transition-smooth border border-slate-100 dark:border-slate-700">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                          <h4 className="text-[11px] font-black text-slate-950 dark:text-white truncate uppercase tracking-tight">{item.name}</h4>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5">Cant: {item.quantity} • {item.sku}</span>
                        </div>
                        <span className="text-base font-black text-slate-950 dark:text-white font-outfit tracking-tighter shrink-0">
                           {item.price ? `${(item.moneda === 'EUR' || item.moneda === 'EUR_ONLY') ? '€' : '$'}${(item.price * item.quantity).toFixed(2)}` : "Cotizar"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-lg font-black font-outfit text-slate-950 dark:text-white uppercase tracking-tighter">
                        {t('reservation.total_estimated')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Total Bs.{' '} 
                        {items.reduce((acc, item) => {
                          if (item.moneda === 'NONE' || item.moneda === 'USD_ONLY' || item.moneda === 'EUR_ONLY') return acc;
                          return acc + ((item.price || 0) * item.quantity * ((item.moneda === 'EUR' || item.moneda === 'EUR_ONLY') ? eurRate : usdRate));
                        }, 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className="text-3xl font-black font-outfit text-accent tracking-tighter shrink-0 block pl-2">${(items.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0)).toFixed(2)}</span>
                  </div>
               </div>

               <div className="bg-slate-950 dark:bg-slate-900/50 p-8 rounded-[2.5rem] text-white flex flex-col gap-4 relative overflow-hidden group border border-slate-800">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-smooth duration-700"></div>
                  <h4 className="text-white font-black font-outfit uppercase tracking-tighter flex items-center gap-3 text-lg relative z-10">
                    <AlertCircle className="w-5 h-5 text-accent" /> {t('reservation.legal_info')}
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 relative z-10">
                    {[
                      t('reservation.legal1'),
                      t('reservation.legal2'),
                      t('reservation.legal3'),
                      t('reservation.legal4')
                    ].map((text, i) => (
                      <li key={i} className="flex gap-3 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">{text}</span>
                      </li>
                    ))}
                  </ul>
               </div>
            </div>

            {/* Form Side (RIGHT) */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-primary-950/10 dark:shadow-black/40 flex flex-col gap-8 transition-smooth">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nombre */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                      <User className="w-3.5 h-3.5 text-accent" /> {t('reservation.form.name')}
                    </label>
                    <input 
                      {...register("nombre")}
                      type="text" 
                      placeholder={t('reservation.form.name_placeholder')} 
                      className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-5 py-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-accent outline-none transition-smooth ${errors.nombre ? 'border-red-300 ring-red-100' : ''}`}
                    />
                    {errors.nombre && <span className="text-[9px] font-black text-red-500 flex items-center gap-2 px-1"><AlertCircle className="w-3 h-3"/> {errors.nombre.message}</span>}
                  </div>

                  {/* Telefono */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Phone className="w-3.5 h-3.5 text-accent" /> {t('reservation.form.phone')}
                    </label>
                    <input 
                      {...register("telefono")}
                      type="tel" 
                      placeholder={t('reservation.form.phone_placeholder')}
                      className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-5 py-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-accent outline-none transition-smooth ${errors.telefono ? 'border-red-300' : ''}`}
                    />
                    {errors.telefono && <span className="text-[9px] font-black text-red-500 flex items-center gap-2 px-1"><AlertCircle className="w-3 h-3"/> {errors.telefono.message}</span>}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Mail className="w-3.5 h-3.5 text-accent" /> {t('reservation.form.email')}
                    </label>
                    <input 
                      {...register("email")}
                      type="email" 
                      placeholder={t('reservation.form.email_placeholder')}
                      className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-5 py-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-accent outline-none transition-smooth ${errors.email ? 'border-red-300' : ''}`}
                    />
                    {errors.email && <span className="text-[9px] font-black text-red-500 flex items-center gap-2 px-1"><AlertCircle className="w-3 h-3"/> {errors.email.message}</span>}
                  </div>

                  {/* Cedula/RIF */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Fingerprint className="w-3.5 h-3.5 text-accent" /> {t('reservation.form.id')}
                    </label>
                    <input 
                      {...register("cedula")}
                      type="text" 
                      placeholder={t('reservation.form.id_placeholder')} 
                      className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-5 py-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-accent outline-none transition-smooth ${errors.cedula ? 'border-red-300' : ''}`}
                    />
                    {errors.cedula && <span className="text-[9px] font-black text-red-500 flex items-center gap-2 px-1"><AlertCircle className="w-3 h-3"/> {errors.cedula.message}</span>}
                  </div>
               </div>

                {/* Mensaje */}
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <MessageSquare className="w-3.5 h-3.5 text-accent" /> {t('reservation.form.requirements')}
                  </label>
                  <textarea 
                    {...register("mensaje")}
                    rows={3}
                    placeholder={t('reservation.form.requirements_placeholder')}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-accent outline-none transition-smooth resize-none"
                  />
                </div>

                {/* Terms */}
                <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <input 
                      {...register("acceptTerms")}
                      type="checkbox" 
                      className="mt-1 w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-accent focus:ring-accent bg-transparent" 
                    />
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-slate-950 dark:group-hover:text-white transition-smooth uppercase tracking-wide">
                      {t('reservation.form.terms')}
                    </span>
                  </label>
                  {errors.acceptTerms && <span className="text-[9px] font-black text-red-500 flex items-center gap-1 px-1"><AlertCircle className="w-2.5 h-2.5"/> {errors.acceptTerms.message}</span>}
                </div>

                <div className="flex flex-col gap-6 mt-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full h-16 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-4 transition-smooth shadow-2xl ${isSubmitting ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-accent text-white hover:bg-orange-600 shadow-accent/40 active:scale-95'}`}
                  >
                    {isSubmitting ? t('reservation.form.processing') : (
                      <>{t('reservation.form.confirm')} <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] bg-slate-50 dark:bg-slate-800/50 py-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> {t('reservation.form.secure')}
                  </div>
                </div>
            </form>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal Confirmation */}
      <AnimatePresence>
        {showWhatsappModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary-950/40 backdrop-blur-md"
              onClick={() => navigate(`/gracias/${pendingLocalizer}`)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl relative z-10 flex flex-col items-center text-center gap-6"
            >
              <div className="w-20 h-20 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center">
                 <ShieldCheck className="w-10 h-10 text-green-500" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black font-outfit text-primary-950 dark:text-white uppercase tracking-tighter leading-none">
                  ¡Reserva Exitosa!
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 px-4">
                  ¿Desea enviar su reservación por WhatsApp a su asesor de ventas ahora?
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 mt-4">
                <button
                  onClick={() => {
                    window.open(whatsappUrl, '_blank');
                    navigate(`/gracias/${pendingLocalizer}`);
                  }}
                  className="w-full h-16 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 transition-smooth shadow-xl shadow-green-500/20 active:scale-95"
                >
                  <MessageSquare className="w-5 h-5" /> Enviar por WhatsApp
                </button>
                <button
                  onClick={() => navigate(`/gracias/${pendingLocalizer}`)}
                  className="w-full h-16 bg-slate-50 dark:bg-slate-800 text-primary-950 dark:text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-smooth active:scale-95"
                >
                  Ir al resumen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
