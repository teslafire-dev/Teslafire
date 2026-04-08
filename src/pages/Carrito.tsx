import { useCartStore } from "@/lib/store/cartStore";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";

export default function Carrito() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const { t } = useTranslation();
  const { usdRate, eurRate } = useCurrency();

  const totalUsdStr = items.reduce((acc, item) => acc + ((Number(item.price) || 0) * item.quantity), 0).toFixed(2);

  const totalBs = items.reduce((acc, item) => {
    if (item.moneda === 'NONE' || item.moneda === 'USD_ONLY' || item.moneda === 'EUR_ONLY') return acc;
    const rate = (item.moneda === 'EUR' || item.moneda === 'EUR_ONLY') ? eurRate : usdRate;
    return acc + ((Number(item.price) || 0) * item.quantity * rate);
  }, 0);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-slate-300" />
        </div>
        <h1 className="text-3xl font-black font-outfit text-primary-950 uppercase tracking-tight text-center">{t('cart.empty.title')}</h1>
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
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-12">
           {/* Header */}
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-2">
              <h1 className="text-5xl font-black font-outfit text-primary-950 uppercase tracking-tighter">{t('cart.title')}</h1>
              <p className="text-slate-500 font-medium tracking-wide">{t('cart.subtitle')}</p>
            </div>
            <Link to="/productos" className="flex items-center gap-3 text-accent font-black uppercase text-xs tracking-widest hover:gap-5 transition-smooth mb-1">
              <ChevronLeft className="w-5 h-5" /> {t('cart.continue_shopping')}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Items List */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {items.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: i * 0.1 }}
                  key={item.id} 
                  className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 flex flex-col sm:flex-row gap-6 md:gap-8 items-center group transition-smooth hover:shadow-2xl hover:shadow-primary-950/10"
                >
                  <div className="w-40 h-40 md:w-32 md:h-32 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-smooth" />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('cart.sku_label')}: {item.sku}</span>
                    <h3 className="text-xl font-bold text-primary-950 group-hover:text-accent transition-smooth">{item.name}</h3>
                    <div className="flex flex-col gap-1">
                      <p className="text-primary-950 font-black text-2xl font-outfit tracking-tighter">
                        {item.price ? `${(item.moneda === 'EUR' || item.moneda === 'EUR_ONLY') ? '€' : '$'}${item.price.toFixed(2)}` : t('cart.price_quote')}
                      </p>
                      {item.price && (item.moneda !== 'NONE' && item.moneda !== 'USD_ONLY' && item.moneda !== 'EUR_ONLY') && (
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                          Bs. {(((item.moneda === 'EUR' || item.moneda === 'EUR_ONLY') ? eurRate : usdRate) * item.price).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden h-12 shadow-inner border border-slate-200">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-12 h-full hover:bg-slate-200 transition-smooth font-black text-primary-950 text-xl"
                      >-</button>
                      <span className="w-10 text-center font-black text-primary-950 text-lg">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-12 h-full hover:bg-slate-200 transition-smooth font-black text-primary-950 text-xl"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-smooth active:scale-90"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary Box */}
            <div className="flex flex-col gap-8 order-first lg:order-none">
              <div className="bg-primary-950 text-white p-10 rounded-[3rem] shadow-2xl shadow-primary-950/40 flex flex-col gap-10 h-fit sticky top-28 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <h3 className="text-3xl font-black font-outfit uppercase tracking-tighter relative z-10">{t('cart.summary_title')}</h3>
                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex justify-between items-center text-slate-400 font-black uppercase text-[10px] tracking-widest pb-6 border-b border-white/10">
                    <span>Total USD (Ref)</span>
                    <span className="text-white">${totalUsdStr}</span>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total en Bolívares</span>
                    <span className="text-4xl md:text-5xl font-black font-outfit text-accent tracking-tighter shrink-0 block overflow-hidden text-clip whitespace-nowrap">
                      Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic leading-relaxed font-medium mt-4">
                    * {t('cart.quote_disclaimer')}
                  </p>
                </div>
                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    <ShieldCheck className="w-6 h-6 text-accent" /> {t('cart.certification_label')}
                  </div>
                  <Link 
                    to="/reservar" 
                    className="bg-accent hover:bg-accent/80 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 transition-smooth shadow-2xl shadow-accent/40 active:scale-95"
                  >
                    {t('cart.finalize_btn')} <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* Assistance Box (Now after summary on mobile) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-6 group hover:border-accent/30 transition-smooth"
              >
                  <h4 className="text-xl font-black font-outfit text-primary-950 uppercase tracking-tighter leading-none">{t('cart.help_title')}</h4>
                  <p className="text-slate-500 font-medium tracking-wide text-sm">{t('cart.help_desc')}</p>
                  <button className="flex items-center gap-3 text-accent font-black uppercase text-[10px] tracking-widest group-hover:gap-5 transition-smooth">
                    {t('cart.chat_expert')} <ArrowRight className="w-4 h-4" />
                  </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
