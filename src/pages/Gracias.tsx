import { useParams, Link } from "react-router-dom";
import { 
  CheckCircle2 as CheckCircle2Icon, 
  Download as DownloadIcon, 
  ArrowRight as ArrowRightIcon, 
  Phone as PhoneIcon, 
  MapPin as MapPinIcon,
  Map as MapIcon,
  Copy as CopyIcon, 
  Check as CheckIcon,
  Share2 as Share2Icon,
  Package as PackageIcon,
  Loader2 as Loader2Icon
} from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import FichaReserva from "@/components/reservar/FichaReserva";
import { useCartStore } from "@/lib/store/cartStore";
import { useTranslation } from "@/contexts/TranslationContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Gracias() {
  const { t } = useTranslation();
  const { localizador } = useParams();
  const [isCopied, setIsCopied] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.8 },
        colors: ['#0f172a', '#F97316', '#ffffff']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.8 },
        colors: ['#0f172a', '#F97316', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    async function fetchOrder() {
      if (!localizador) return;
      const { data, error } = await supabase
        .from('ordenes')
        .select('*')
        .eq('localizador', localizador)
        .single();
      
      if (!error && data) {
        setOrderData(data);
        clearCart(); 
      }
      setLoading(false);
    }
    fetchOrder();
  }, [localizador, clearCart]);

  const handleCopy = () => {
    if (localizador) {
      navigator.clipboard.writeText(localizador);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success(t('success.copy_toast'));
    }
  };

  const handleShare = async () => {
    if (!orderData) return;

    const shareData = {
      title: 'Reserva Dobell Industrial',
      text: `Hola, mi localizador de reserva es ${localizador}. Cliente: ${orderData.cliente_nombre}.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        handleWhatsApp();
      }
    } else {
      handleWhatsApp();
    }
  };

  const handleWhatsApp = () => {
    if (!orderData) return;
    
    const productsList = orderData.productos
      ?.map((p: any) => `• ${p.name || p.nombre} (${p.quantity || p.cantidad})`)
      .join('\n') || '';

    const message = `*SOLICITUD DE PRESUPUESTO - DOBELL INDUSTRIAL*\n\n` +
      `*Localizador:* ${localizador}\n` +
      `*Cliente:* ${orderData.cliente_nombre?.toUpperCase()}\n\n` +
      `*DETALLE DE EQUIPOS:*\n${productsList}\n\n` +
      `*TOTAL ESTIMADO:* $${orderData.total}\n\n` +
      `_¡Hola! Ya procesé mi reserva técnica en el portal. Por favor validen el stock para este localizador._`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownload = () => {
    if (!orderData || loading) {
      toast.error(t('success.loading_master'));
      return;
    }
    toast.success(t('success.generating_pdf'));
    setTimeout(() => {
      toast.dismiss(); 
      window.print();
    }, 800);
  };

  return (
    <div className="min-h-screen pt-40 pb-20 flex items-center overflow-x-hidden selection:bg-accent/20 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="container mx-auto px-6 max-w-4xl flex flex-col items-center gap-12">
        
        {/* TOP SECTION: Success & Localizer (First Fold) */}
        <div className="w-full flex flex-col items-center gap-8 text-center animate-in fade-in zoom-in duration-1000">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl font-black font-outfit text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
              Reserva de Equipos <span className="text-accent underline decoration-4 decoration-accent/20 underline-offset-8">Exitosa</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md text-sm mx-auto leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-6 uppercase tracking-tight">
               Su solicitud técnica ha sido procesada. Por favor, conserve los siguientes detalles:
            </p>
          </div>

          {/* CRITICAL INFO: LOCALIZER MOVED UP FOR MOBILE FOLD */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-lg bg-primary-950 dark:bg-slate-900 p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
             <span className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-3 block">Localizador Oficial</span>
             <div className="flex items-center justify-center gap-6">
                <span className="text-4xl md:text-6xl font-black text-white font-outfit tracking-tighter">{localizador}</span>
                <button 
                  onClick={handleCopy}
                  className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-accent transition-all active:scale-90"
                >
                  {isCopied ? <CheckIcon className="w-6 h-6 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                </button>
             </div>
             <p className="mt-6 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-loose max-w-[280px] mx-auto">
               Conserve este código oficial para la validación y retiro de su orden en tienda física.
             </p>
          </motion.div>

          {/* Action Buttons Layer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4 mt-2">
            <button 
              onClick={handleDownload}
              disabled={loading || !orderData}
              className="h-16 bg-white dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-primary-950 dark:border-slate-700 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-50 shadow-xl flex items-center justify-center gap-3"
            >
               <DownloadIcon className="w-6 h-6" /> {t('success.download_pdf')}
            </button>

            <button 
              onClick={handleShare}
              disabled={loading || !orderData}
              className="h-16 bg-green-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all hover:bg-green-600 active:scale-95 disabled:opacity-50 shadow-xl flex items-center justify-center gap-3"
            >
               <Share2Icon className="w-6 h-6" /> {t('success.share_whatsapp')}
            </button>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[4rem] p-8 md:p-14 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
           <div className="flex flex-col gap-10">
              <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-50 dark:border-slate-800 pb-8">
                 <div className="flex flex-col">
                    <h3 className="text-2xl font-black font-outfit text-slate-950 dark:text-white uppercase tracking-tighter">
                      Equipamiento Reservado
                    </h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sujeto a validación física en tienda</span>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <PackageIcon className="w-5 h-5 text-accent" />
                    <span className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-widest">{(orderData?.productos?.length || 0)} Equipos</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orderData?.productos?.map((p: any, i: number) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 transition-smooth hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl group flex items-center gap-6">
                     <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl p-2 shrink-0 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                        <img src={p.image || '/placeholder-product.png'} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-smooth" />
                     </div>
                     <div className="flex-1 flex flex-col gap-1 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                           <span className="text-sm font-black text-slate-950 dark:text-white uppercase leading-tight line-clamp-2">{p.name || p.nombre}</span>
                           <span className="bg-accent text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center justify-center shrink-0">×{p.quantity || p.cantidad}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SKU: {p.sku || 'N/A'}</span>
                     </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {[
                  { icon: PhoneIcon, title: "Confirmación", desc: "Su asesor validará cantidades vía telefónica pronto." },
                  { icon: MapPinIcon, title: "Punto Retiro", desc: "Calle Principal #123. Use este localizador en taquilla." },
                  { icon: MapIcon, title: "Caja Digital", desc: "Válido para Zelle, Divisas y Pago Móvil." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-center bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                     <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                        <item.icon className="w-6 h-6 text-accent" />
                     </div>
                     <div>
                        <h4 className="text-[11px] font-black uppercase text-slate-950 dark:text-white tracking-widest leading-none mb-1">{item.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-tight uppercase">{item.desc}</p>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center gap-10">
           <Link to="/productos" className="flex items-center gap-4 text-accent font-black uppercase text-sm tracking-[0.2em] hover:gap-6 transition-all">
             Continuar Comprando <ArrowRightIcon className="w-6 h-6" />
           </Link>
        </div>
      </div>

      <FichaReserva order={orderData} />

      <style>{`
        @media print {
          body { margin: 0 !important; background: white !important; }
          #ficha-impresion { display: block !important; visibility: visible !important; width: 210mm; }
          .container, nav, header, footer, button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
