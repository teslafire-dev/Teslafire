import { useCartStore } from "@/lib/store/cartStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
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
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

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
  const { items, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("+584141234567");

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

  const { register, handleSubmit, formState: { errors } } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate("/carrito");
    }
  }, [items, navigate]);

  const onSubmit = async (data: ReservationFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate localizer
      const dateStr = format(new Date(), "yyyyMMdd");
      const uniqueId = nanoid(4).toUpperCase();
      const localizer = `COT-${dateStr}-${uniqueId}`;

      // 1. Save to Supabase Ordenes table
      const { error } = await supabase.from('ordenes').insert({
        localizador: localizer,
        cliente_nombre: data.nombre,
        cliente_telefono: data.telefono,
        cliente_email: data.email,
        cliente_cedula: data.cedula,
        mensaje: data.mensaje,
        productos: items.map(i => ({ sku: i.sku, nombre: i.name, cantidad: i.quantity, precio: i.price })),
        total: getTotal(),
        estado: 'pendiente'
      });

      if (error) throw error;

      // 2. Prepare WhatsApp Message
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

      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;

      // 3. Clear and Redirect
      clearCart();
      
      // Delay slightly to show success or just open
      window.open(whatsappUrl, '_blank');
      navigate(`/gracias/${localizer}`);
      
    } catch (error: any) {
      console.error("Error saving reservation:", error);
      toast.error("Error al procesar la reserva: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col gap-12">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-2">
              <h1 className="text-5xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Finalizar Reserva</h1>
              <p className="text-slate-500 font-medium tracking-wide">Generar localizador oficial para retiro en tienda.</p>
            </div>
            <Link to="/carrito" className="flex items-center gap-3 text-accent font-black uppercase text-xs tracking-widest hover:gap-5 transition-smooth mb-1">
              <ChevronLeft className="w-5 h-5" /> Revisar Carrito
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form Side */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-10 md:p-16 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col gap-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Nombre */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 px-1">
                      <User className="w-4 h-4 text-accent" /> Nombre Completo
                    </label>
                    <input 
                      {...register("nombre")}
                      type="text" 
                      placeholder="Ej: Juan Pérez" 
                      className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-accent outline-none transition-smooth ${errors.nombre ? 'border-red-300 ring-red-100' : ''}`}
                    />
                    {errors.nombre && <span className="text-[10px] font-black text-red-500 flex items-center gap-2 px-1"><AlertCircle className="w-3 h-3"/> {errors.nombre.message}</span>}
                  </div>

                  {/* Telefono */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 px-1">
                      <Phone className="w-4 h-4 text-accent" /> Teléfono WhatsApp
                    </label>
                    <input 
                      {...register("telefono")}
                      type="tel" 
                      placeholder="Ej: 0414 1234567" 
                      className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-accent outline-none transition-smooth ${errors.telefono ? 'border-red-300' : ''}`}
                    />
                    {errors.telefono && <span className="text-[10px] font-black text-red-500 flex items-center gap-2 px-1"><AlertCircle className="w-3 h-3"/> {errors.telefono.message}</span>}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 px-1">
                      <Mail className="w-4 h-4 text-accent" /> Correo Corporativo
                    </label>
                    <input 
                      {...register("email")}
                      type="email" 
                      placeholder="nombre@empresa.com" 
                      className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-accent outline-none transition-smooth ${errors.email ? 'border-red-300' : ''}`}
                    />
                    {errors.email && <span className="text-[10px] font-black text-red-500 flex items-center gap-2 px-1"><AlertCircle className="w-3 h-3"/> {errors.email.message}</span>}
                  </div>

                  {/* Cedula/RIF */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 px-1">
                      <Fingerprint className="w-4 h-4 text-accent" /> Identificación / RIF
                    </label>
                    <input 
                      {...register("cedula")}
                      type="text" 
                      placeholder="Ej: J-12345678-0" 
                      className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-accent outline-none transition-smooth ${errors.cedula ? 'border-red-300' : ''}`}
                    />
                    {errors.cedula && <span className="text-[10px] font-black text-red-500 flex items-center gap-2 px-1"><AlertCircle className="w-3 h-3"/> {errors.cedula.message}</span>}
                  </div>
               </div>

                {/* Mensaje */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 px-1">
                    <MessageSquare className="w-4 h-4 text-accent" /> Requerimientos Especiales
                  </label>
                  <textarea 
                    {...register("mensaje")}
                    rows={4}
                    placeholder="Especifique tallas, colores o volumen masivo para cotización especial..." 
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-6 py-5 text-sm font-medium focus:ring-2 focus:ring-accent outline-none transition-smooth resize-none"
                  />
                </div>

                {/* Terms */}
                <div className="flex flex-col gap-3">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <input 
                      {...register("acceptTerms")}
                      type="checkbox" 
                      className="mt-1 w-5 h-5 rounded-lg border-slate-300 text-accent focus:ring-accent" 
                    />
                    <span className="text-[10px] font-bold text-slate-500 leading-relaxed group-hover:text-primary-950 transition-smooth uppercase tracking-wide">
                      Acepto que esta es una reserva formal. El stock se mantiene por 48h. El pago se liquida en tienda física (Divisas, Pago Móvil o Zelle).
                    </span>
                  </label>
                  {errors.acceptTerms && <span className="text-[10px] font-black text-red-500 flex items-center gap-2 px-1"><AlertCircle className="w-3 h-3"/> {errors.acceptTerms.message}</span>}
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full h-16 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 transition-smooth shadow-2xl ${isSubmitting ? 'bg-slate-100 text-slate-400' : 'bg-primary-950 text-white hover:bg-accent shadow-primary-950/20 active:scale-95'}`}
                >
                  {isSubmitting ? "Generando Localizador..." : (
                    <>Confirmar Reserva Técnica <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-t border-slate-100 pt-8">
                   <ShieldCheck className="w-5 h-5 text-primary-950" /> Operación Encriptada • Sin Pagos Online
                </div>
            </form>

            {/* Sidebar Summary */}
            <div className="flex-1 flex flex-col gap-10">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-8">
                  <h3 className="text-2xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Detalle de Productos</h3>
                  <div className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-6 items-center py-4 border-b border-slate-50 last:border-0 group">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden shrink-0 group-hover:scale-105 transition-smooth border border-slate-100">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-3" />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <h4 className="text-xs font-black text-primary-950 line-clamp-1 uppercase tracking-tight">{item.name}</h4>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Cant: {item.quantity} • {item.sku}</span>
                        </div>
                        <span className="text-lg font-black text-primary-950 font-outfit tracking-tighter shrink-0">
                           {item.price ? `$${(item.price * item.quantity).toFixed(2)}` : "Cotizar"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Total Estimado</span>
                    <span className="text-4xl font-black font-outfit text-accent tracking-tighter">${getTotal().toFixed(2)}</span>
                  </div>
               </div>

               <div className="bg-primary-950 p-10 rounded-[3rem] text-white flex flex-col gap-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-smooth duration-700"></div>
                  <h4 className="text-white font-black font-outfit uppercase tracking-tighter flex items-center gap-3 text-xl relative z-10">
                    <AlertCircle className="w-6 h-6 text-accent" /> Información Legal
                  </h4>
                  <ul className="flex flex-col gap-5 relative z-10">
                    {[
                      "Su localizador tendrá validez de 48 horas hábiles.",
                      "Debe presentar el código generado en la taquilla de retiro.",
                      "Contamos con servicios de flete para volumen industrial.",
                      "Aceptamos Zelle, Divisas y Pago Móvil en tienda."
                    ].map((text, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0"></div>
                        <span className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-wide">{text}</span>
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
