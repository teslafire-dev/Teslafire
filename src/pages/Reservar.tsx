import React, { useState, useEffect } from 'react';
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
  PackageCheck,
  ClipboardList,
  Loader2,
  Lock,
  ShoppingBag,
  Target,
  Eye,
  X,
  Package,
  Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';
import { supabase } from '@/lib/supabase/client';

const reservationSchema = z.object({
  nombre: z.string().min(3, 'Full name is required'),
  telefono: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
  cedula: z.string().min(7, 'Tax ID is required'),
  mensaje: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Please accept terms.' }),
  }),
});

type ReservationData = z.infer<typeof reservationSchema>;

const Reservar = () => {
  const { items, clearCart } = useCartStore();
  const { usdRate } = useCurrency();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [pendingLocalizer, setPendingLocalizer] = useState('');
  
  // State for Quick View
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const total = items.reduce((acc, item) => acc + ((Number(item.price) || 0) * item.quantity), 0);

  const { register, handleSubmit, formState: { errors } } = useForm<ReservationData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { acceptTerms: true }
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-6 px-6 bg-slate-50 dark:bg-slate-950">
        <ShoppingBag className="w-12 h-12 text-slate-300" />
        <h2 className="text-3xl font-black font-outfit uppercase tracking-tighter dark:text-white">Empty Cart</h2>
        <Link to="/productos" className="bg-primary-950 dark:bg-accent text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl">Go to Catalog</Link>
      </div>
    );
  }

  const handleQuickView = async (productId: string) => {
    setIsQuickViewOpen(true);
    setLoadingProduct(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*, marcas(nombre)')
        .eq('id', productId)
        .single();
      
      if (!error) {
        setSelectedProduct(data);
      }
    } catch (err) {
      console.error("Error loading details:", err);
    } finally {
      setLoadingProduct(false);
    }
  };

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/584141234567?text=${encodeURIComponent(`*NEW DOBELL RESERVATION*\n*ID:* ${pendingLocalizer}\n*TOTAL:* $${total.toFixed(2)}`)}`;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row min-h-screen">
        
        {/* COL 1: CHECKOUT / FORM (LEFT) */}
        <div className="flex-1 lg:flex-[1.2] px-6 md:px-12 lg:px-16 pt-24 pb-16 border-r border-slate-50 dark:border-slate-900">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/carrito" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] hover:text-accent transition-colors mb-4 group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK TO CART
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-950 dark:text-white uppercase tracking-tighter mb-1 leading-none">SECURE CHECKOUT</h1>
            <p className="text-slate-600 dark:text-slate-500 font-bold text-xs uppercase tracking-[0.25em] mb-8">Industrial Identification Portal</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {[
                  {id: 'nombre', label: 'Authorized Full Name / Company', ph: 'Ex: Arthur Morgan', icon: <User className="w-5 h-5 text-accent" />},
                  {id: 'telefono', label: 'Contact Phone / WhatsApp', ph: 'Ex: +58 414 0000000', icon: <Phone className="w-5 h-5 text-accent" />},
                  {id: 'cedula', label: 'Tax ID / DNI / RIF', ph: 'Ex: J-12345678-0', icon: <Fingerprint className="w-5 h-5 text-accent" />},
                  {id: 'email', label: 'Corporate Email Address', ph: 'client@company.com', icon: <Mail className="w-5 h-5 text-accent" />}
                ].map(f => (
                  <div key={f.id} className="space-y-3 group/field">
                    <label className="text-[11px] font-black text-slate-950 dark:text-slate-300 uppercase tracking-widest px-1 flex items-center gap-3">
                      {f.icon} {f.label}
                    </label>
                    <input {...register(f.id as any)} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-base font-bold text-slate-950 dark:text-white focus:border-accent outline-none transition-all placeholder:text-slate-200" placeholder={f.ph} />
                    {errors[f.id as keyof ReservationData] && <p className="text-[10px] text-red-600 font-black px-1 uppercase tracking-tighter italic">! {errors[f.id as keyof ReservationData]?.message}</p>}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-950 dark:text-slate-300 uppercase tracking-widest flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-accent" /> Technical Specs / Special Notes
                </label>
                <textarea {...register("mensaje")} rows={3} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl px-8 py-5 text-base font-bold text-slate-950 dark:text-white outline-none resize-none placeholder:text-slate-200 focus:border-accent transition-all" placeholder="Enter sizes, colors or delivery details here..." />
              </div>
            </form>
          </motion.div>
        </div>

        {/* COL 2: ORDER SUMMARY (CENTER) */}
        <div className="flex-1 lg:flex-[0.8] px-6 lg:px-10 pt-28 pb-16 bg-slate-50/50 dark:bg-slate-950/20 border-r border-slate-50 dark:border-slate-900 overflow-y-auto custom-scrollbar max-h-screen">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tighter mb-8 leading-none">ORDER ITEMS</h3>
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="group relative flex gap-5 p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-accent/40">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-xl p-2 shrink-0 border border-slate-50 dark:border-slate-700 relative overflow-hidden">
                    <img src={item.image || "/placeholder.png"} className="w-full h-full object-contain" />
                    <button 
                      onClick={() => handleQuickView(item.id)}
                      className="absolute inset-0 bg-accent/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-[11px] font-black uppercase text-slate-950 dark:text-slate-200 truncate tracking-tight">{item.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                      <span className="text-base font-black text-slate-950 dark:text-white font-outfit">${((item.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* COL 3: TOTAL & ACTION (RIGHT) */}
        <div className="w-full lg:w-[400px] xl:w-[480px] p-8 lg:p-12 pt-28 pb-16 bg-white dark:bg-black relative">
          <div className="sticky top-28 space-y-12">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tighter mb-2">QUOTATION</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Referential Industry Quote</p>
                 </div>

                 <div className="p-10 bg-primary-950 dark:bg-accent text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <Target className="absolute -right-10 -bottom-10 w-48 h-48 opacity-[0.05] group-hover:scale-110 transition-transform pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center">
                       <span className="text-xs font-black uppercase tracking-[0.4em] mb-4 opacity-70">Total Amount</span>
                       <span className="text-6xl md:text-7xl font-black font-outfit tracking-tighter leading-none mb-4">${total.toFixed(2)}</span>
                       <div className="w-full h-px bg-white/10 my-4" />
                       <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Bs. {(total * usdRate).toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="space-y-6 pt-6">
                    <label className="flex items-start gap-4 cursor-pointer group/terms px-2">
                       <input {...register("acceptTerms")} type="checkbox" className="mt-1 w-6 h-6 rounded-lg border-2 border-slate-300 text-accent focus:ring-accent transition-all shadow-sm" />
                       <span className="text-[11px] font-black text-slate-900 dark:text-slate-400 uppercase leading-relaxed tracking-wider group-hover:text-black dark:group-hover:text-white transition-colors">
                         I declare that all technical specs are valid for shipping.
                       </span>
                    </label>
                    <button 
                      onClick={handleSubmit(onSubmit)} 
                      disabled={isSubmitting} 
                      className="w-full h-24 bg-[#FFB800] text-black rounded-[2rem] font-black uppercase text-base tracking-[.3em] flex items-center justify-center gap-6 shadow-2xl hover:bg-[#FFD700] transition-all active:scale-95 group shadow-[0_20px_40px_-10px_rgba(255,184,0,0.3)]"
                    >
                       {isSubmitting ? <Loader2 className="w-10 h-10 animate-spin text-black" /> : <>PROCESS NOW <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" /></>}
                    </button>
                    <div className="flex flex-col items-center gap-3 pt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                       <ShieldCheck className="w-5 h-5" /> SECURE DOBELL v2.0
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      <AnimatePresence>
        {isQuickViewOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 relative">
              <button onClick={() => setIsQuickViewOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-accent transition-colors z-10"><X className="w-6 h-6" /></button>
              {loadingProduct ? (
                <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-accent" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Specs...</p>
                </div>
              ) : selectedProduct ? (
                <div className="flex flex-col md:flex-row min-h-[500px]">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-center p-12">
                     <img src={selectedProduct.imagen_url || selectedProduct.imagenes_urls?.[0] || "/placeholder.png"} className="w-full h-full object-contain max-h-[400px] drop-shadow-2xl" alt={selectedProduct.nombre} onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }} />
                  </div>
                  <div className="flex-1 p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="bg-accent/10 text-accent text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{selectedProduct.marcas?.nombre || 'PRO SPECS'}</span>
                      <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">SKU: {selectedProduct.sku}</span>
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-6">{selectedProduct.nombre}</h2>
                    <div className="space-y-6 mb-10">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Technical Specs</label>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{(lang === 'EN' && selectedProduct.descripcion_en) ? selectedProduct.descripcion_en : (selectedProduct.descripcion || 'No description.')}</p>
                      </div>
                      <div className="flex items-center gap-8 py-6 border-y border-slate-50 dark:border-slate-800">
                         <div className="flex flex-col"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price</span><span className="text-4xl font-black text-slate-900 dark:text-white font-outfit leading-none">${Number(selectedProduct.precio).toFixed(2)}</span></div>
                         <div className="flex items-center gap-2 text-green-500 font-black text-[11px] uppercase tracking-widest"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>IN STOCK</div>
                      </div>
                    </div>
                    <button onClick={() => setIsQuickViewOpen(false)} className="w-full h-16 bg-slate-900 dark:bg-accent text-white rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Dismiss</button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWhatsappModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-950 rounded-[4rem] p-16 max-w-lg w-full text-center shadow-2xl border-4 border-slate-50 dark:border-accent/10">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-green-500/20"><PackageCheck className="w-12 h-12 text-green-500 animate-bounce" /></div>
              <h2 className="text-4xl font-black uppercase tracking-tighter dark:text-white mb-4 leading-none text-balance">SUCCESSFULLY PLACED</h2>
              <div className="bg-slate-100 dark:bg-slate-900 px-10 py-5 rounded-[2.5rem] text-4xl font-black text-primary-950 dark:text-accent font-outfit shadow-inner mb-12 uppercase tracking-tighter">{pendingLocalizer}</div>
              <div className="space-y-4">
                <button onClick={() => { window.open(whatsappUrl, '_blank'); navigate(`/gracias/${pendingLocalizer}`); }} className="w-full h-20 bg-[#25D366] text-white rounded-[1.8rem] font-black uppercase text-sm tracking-widest flex items-center justify-center gap-4 active:scale-95 shadow-xl">Notify WhatsApp</button>
                <button onClick={() => navigate(`/gracias/${pendingLocalizer}`)} className="text-[11px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors tracking-widest pt-4">Dismiss</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reservar;
