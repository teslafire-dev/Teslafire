import { Link } from "react-router-dom";
import { Eye, Plus, Minus, X, Star, Check } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import toast from "react-hot-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ProductCardProps {
  id: string;
  name: string;
  sku: string;
  slug: string;
  category: string;
  price: number | null;
  moneda?: string;
  image: string;
  isNew?: boolean;
  isOffer?: boolean;
}

export default function ProductCard({ 
  id, 
  name, 
  sku, 
  slug,
  category, 
  price, 
  moneda = "USD",
  image, 
  isNew, 
  isOffer 
}: ProductCardProps) {
  const { addItem, removeItem, updateQuantity, items: cartItems } = useCartStore();
  const cartItem = cartItems.find(item => item.id === id);
  const isInCart = !!cartItem;
  const quantity = cartItem?.quantity || 0;
  
  const { t } = useTranslation();
  const { usdRate, eurRate } = useCurrency();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, name, sku, price: price || 0, moneda, image, slug });
    toast.success("Producto añadido", {
      style: { borderRadius: '1rem', background: '#0F172A', color: '#fff' },
    });
  };

  const handleRemoveOne = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    } else {
      removeItem(id);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeItem(id);
    toast.error("Producto eliminado", {
      style: { borderRadius: '1rem', background: '#0F172A', color: '#fff' },
    });
  };

  return (
    <Link 
      to={`/productos/${slug}`}
      className={`group bg-white dark:bg-slate-900 rounded-[2.5rem] border overflow-hidden hover:shadow-xl hover:shadow-primary-950/5 transition-smooth flex flex-col h-full relative ${
        isInCart 
          ? 'border-accent shadow-lg shadow-accent/10 ring-1 ring-accent/20 bg-accent/[0.02]' 
          : 'border-slate-100 dark:border-slate-800'
      }`}
    >
      {/* Badges & Reset Action */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          {isInCart && (
            <span className="bg-primary-950 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary-950/20 animate-in zoom-in duration-300 flex items-center gap-1.5 border border-white/20">
              <Check className="w-2.5 h-2.5 text-accent" /> En Carrito
            </span>
          )}
          {isNew && (
            <span className="bg-accent text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-accent/20 animate-in zoom-in duration-500">
              Nuevo
            </span>
          )}
          {isOffer && (
            <span className="bg-destructive text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-destructive/20 animate-in zoom-in duration-500">
              Oferta
            </span>
          )}
        </div>

        {isInCart && (
          <button 
            onClick={handleReset}
            className="w-8 h-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-slate-100 dark:border-white/10 transition-all shadow-md active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800 p-4 group-hover:p-2 transition-smooth">
        <img 
          src={image || '/placeholder-product.png'} 
          alt={name} 
          className="w-full h-full object-contain group-hover:scale-105 transition-smooth duration-700"
        />
        <div className="absolute inset-0 bg-primary-950/0 group-hover:bg-primary-950/5 transition-smooth"></div>
        
        {/* Quick Actions Overlay (Hidden on Mobile) */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-smooth translate-y-2 group-hover:translate-y-0 hidden md:flex">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-primary-950 dark:text-white shadow-xl hover:bg-accent hover:text-white transition-smooth active:scale-95">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">{category}</span>
          <h3 className="text-[15px] font-black text-primary-950 dark:text-white leading-snug group-hover:text-accent transition-smooth line-clamp-2 uppercase tracking-tight">
            {name}
          </h3>
        </div>

        {t('mostrar_resegnas') === 'true' && (
          <div className="flex items-center gap-0.5">
             {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 fill-accent text-accent" />)}
             <span className="text-[8px] text-slate-400 font-bold ml-1 uppercase tracking-widest">(12)</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">SKU: {sku}</span>
            <div className="flex flex-col">
              <span className="text-lg font-black text-primary-950 dark:text-white font-outfit tracking-tighter leading-none">
                {Number(price) > 0 ? (
                  `${(moneda === 'EUR' || moneda === 'EUR_ONLY') ? '€' : '$'}${Number(price).toFixed(2)}`
                ) : t('consultar')}
              </span>
              {Number(price) > 0 && (moneda !== 'NONE' && moneda !== 'USD_ONLY' && moneda !== 'EUR_ONLY') && (
                <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                  Bs. {(((moneda === 'EUR' || moneda === 'EUR_ONLY') ? eurRate : usdRate) * Number(price)).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 group/actions" onClick={(e) => e.preventDefault()}>
            {isInCart ? (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 h-10 animate-in slide-in-from-right-4 duration-300">
                 <button 
                   onClick={handleRemoveOne}
                   className="w-10 h-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-slate-500 dark:text-slate-400"
                 >
                   <Minus className="w-3.5 h-3.5" />
                 </button>
                 <span className="w-8 text-center text-[13px] font-black text-primary-950 dark:text-white">{quantity}</span>
                 <button 
                   onClick={handleAddToCart}
                   className="w-10 h-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all text-slate-500 dark:text-slate-400"
                 >
                   <Plus className="w-3.5 h-3.5" />
                 </button>
              </div>
            ) : (
              <button 
                onClick={handleAddToCart}
                style={{ backgroundColor: `hsl(var(--button-bg, 222.2 47.4% 11.2%))` }}
                className="p-3 text-white rounded-xl transition-smooth shadow-lg shadow-primary-950/10 hover:brightness-110 active:scale-90"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
