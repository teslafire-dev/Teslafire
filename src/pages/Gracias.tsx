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
      ?.map((p: any) => `• ${p.nombre} (${p.cantidad})`)
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
    <div className="min-h-screen pt-40 pb-20 flex items-center overflow-x-hidden selection:bg-accent/20">
      <div className="container mx-auto px-6 max-w-4xl flex flex-col items-center gap-8">
        
        {/* Success Header - Premium Layout */}
        <div className="flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in slide-in-from-bottom-10 duration-1000">
          <div className="relative">
             <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 animate-pulse"></div>
             <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-8 border-green-50 dark:border-green-950/30 shadow-2xl relative z-10 transition-smooth hover:scale-110">
                <CheckCircle2Icon className="w-10 h-10 text-green-600 dark:text-green-400" />
             </div>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl md:text-5xl font-black font-outfit text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
              {t('success.title').split(' ').map((word, i) => (
                word.toLowerCase().includes('exitosa') || word.toLowerCase().includes('successful')
                ? <span key={i} className="text-accent">{word} </span>
                : word + ' '
              ))}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-lg text-sm mx-auto leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-4 px-4 md:px-10 uppercase tracking-tight">
              {t('success.subtitle')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4 mt-2">
            <button 
              onClick={handleDownload}
              disabled={loading || !orderData}
              className="group relative h-16 bg-primary-950 dark:bg-accent text-white rounded-2xl font-black uppercase text-[11px] tracking-widest overflow-hidden transition-all hover:bg-black dark:hover:bg-accent/80 active:scale-95 disabled:opacity-50 shadow-xl"
            >
              <div className="flex items-center justify-center gap-3 relative z-10">
                 <DownloadIcon className="w-6 h-6" /> {t('success.download_pdf')}
              </div>
            </button>

            <button 
              onClick={handleShare}
              disabled={loading || !orderData}
              className="group relative h-16 bg-white dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-slate-900 dark:border-slate-700 rounded-2xl font-black uppercase text-[11px] tracking-widest overflow-hidden transition-all hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-50 shadow-lg"
            >
              <div className="flex items-center justify-center gap-3">
                 <Share2Icon className="w-6 h-6 text-accent" /> {t('success.share_whatsapp')}
              </div>
            </button>
          </div>
        </div>

        {/* Info & Localizer Card */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-16 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-primary-950/10 dark:shadow-black/40 flex flex-col gap-12 relative overflow-hidden group/card transition-smooth">
           {/* Section 1: Digital Localizer Centered */}
           <div className="flex flex-col items-center gap-4 text-center pb-10 border-b-2 border-slate-50 dark:border-slate-800/50 relative z-10 transition-standard group-hover/card:border-accent/10">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em] animate-in fade-in slide-in-from-top duration-700">
                {t('success.localizer_title')}
              </span>
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <div className="text-4xl md:text-7xl font-black font-outfit text-slate-950 dark:text-white tracking-tighter leading-none animate-in zoom-in duration-500">
                  {localizador}
                </div>
                <button 
                  onClick={handleCopy} 
                  className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-slate-400 dark:text-slate-500 hover:bg-primary-950 dark:hover:bg-accent hover:text-white transition-all active:scale-95 shadow-inner border border-slate-100 dark:border-slate-700 group/copy"
                  title={t('success.copy')}
                >
                  {isCopied ? (
                    <div className="flex items-center gap-3">
                       <CheckIcon className="w-8 h-8 text-green-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">{t('success.copied')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                       <CopyIcon className="w-8 h-8 group-hover/copy:rotate-12 transition-transform" />
                       <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">{t('success.copy')}</span>
                    </div>
                  )}
                </button>
              </div>
           </div>

           {/* Section 2: Full Width Products Detailed Summary */}
           <div className="flex flex-col gap-6 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-end gap-4 px-2">
                <div className="flex flex-col">
                  <h3 className="text-xl font-black font-outfit text-slate-950 dark:text-white uppercase tracking-tighter">
                    {t('success.reserved_equipment')}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {t('success.validation_hint')}
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-accent/5 px-4 py-2 rounded-xl border border-accent/10">
                   <PackageIcon className="w-4 h-4 text-accent" />
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                     {t('success.different_items').replace('{count}', (orderData?.productos?.length || 0).toString())}
                   </span>
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-800/10 p-6 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner group/box overflow-hidden max-h-[450px] flex flex-col">
                <div className="overflow-y-auto custom-scrollbar flex-1 pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orderData?.productos?.map((p: any, i: number) => (
                      <div 
                        key={i} 
                        className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-50 dark:border-slate-700 shadow-sm flex flex-col gap-1.5 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-xl hover:shadow-primary-950/5 dark:hover:shadow-black/20 group/item"
                      >
                         <div className="flex justify-between items-start gap-4">
                            <span className="text-[11px] font-black text-slate-950 dark:text-white uppercase tracking-tight line-clamp-2 leading-tight group-hover/item:text-accent transition-colors flex-1">{p.nombre}</span>
                            <span className="bg-primary-950 dark:bg-accent text-white text-[9px] font-black w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-primary-950/20">×{p.cantidad}</span>
                         </div>
                         <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-50 dark:border-slate-700 overflow-hidden">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 truncate transition-colors group-hover/item:text-slate-400">SKU: {p.sku || 'N/A'}</span>
                         </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="col-span-full py-10 flex flex-col items-center gap-4">
                        <Loader2Icon className="w-10 h-10 text-accent animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t('success.fetching_record')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
           </div>

           {/* Section 3: Professional Info Cards Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative z-10 pt-6">
              {[
                { icon: PhoneIcon, title: t('success.confirmation_title'), desc: t('success.confirmation_desc') },
                { icon: MapPinIcon, title: t('success.pickup_title'), desc: t('success.pickup_desc') },
                { icon: MapIcon, title: t('success.digital_box_title'), desc: t('success.digital_box_desc') }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5 bg-slate-50/80 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-50 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-primary-950/5 dark:hover:shadow-black/20 group/micro">
                    <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-600 shadow-sm transition-smooth group-hover/micro:scale-110">
                       <item.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase leading-none mb-1.5 tracking-tighter">{item.title}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight font-bold uppercase tracking-tight">{item.desc}</p>
                    </div>
                </div>
              ))}
           </div>
        </div>

        {/* Action Footer Navigation */}
        <div className="flex flex-col md:flex-row items-center gap-10 pt-10">
           <Link to="/productos" className="flex items-center gap-4 text-accent font-black uppercase text-sm tracking-[0.2em] hover:gap-6 transition-all group">
             {t('success.continue_shopping')} <ArrowRightIcon className="w-6 h-6" />
           </Link>
           <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full hidden md:block"></div>
           <Link to="/" className="text-slate-400 dark:text-slate-500 font-black uppercase text-sm tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">
              {t('success.go_home')}
           </Link>
        </div>
      </div>

      <FichaReserva order={orderData} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

        @media print {
          @page { size: auto; margin: 0mm; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            margin: 0 !important; 
            padding: 0 !important;
            background: white !important; 
          }
          canvas { display: none !important; }
          #ficha-impresion { display: block !important; visibility: visible !important; width: 210mm; }
          .container, nav, header, footer, button, [role="status"], .go2072402232 { display: none !important; }
        }
      `}</style>
    </div>
  );
}
