import { Link } from "react-router-dom";
import { ShoppingCart, Eye, Plus, Star } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import toast from "react-hot-toast";

interface ProductCardProps {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number | null;
  image: string;
  isNew?: boolean;
  isOffer?: boolean;
}

export default function ProductCard({ 
  id, 
  name, 
  sku, 
  category, 
  price, 
  image, 
  isNew, 
  isOffer 
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id, name, sku, price: price || 0, image, quantity: 1 });
    toast.success("Producto añadido al carrito", {
      style: {
        borderRadius: '1rem',
        background: '#0F172A',
        color: '#fff',
      },
    });
  };

  return (
    <Link 
      to={`/productos/${id}`}
      className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-primary-950/10 transition-smooth flex flex-col h-full relative"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {isNew && (
          <span className="bg-accent text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-accent/20 animate-in zoom-in duration-500">
            Nuevo
          </span>
        )}
        {isOffer && (
          <span className="bg-destructive text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-destructive/20 animate-in zoom-in duration-500">
            Oferta
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 p-8 group-hover:p-6 transition-smooth">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-contain group-hover:scale-110 transition-smooth duration-700"
        />
        <div className="absolute inset-0 bg-primary-950/0 group-hover:bg-primary-950/5 transition-smooth"></div>
        
        {/* Quick Actions Overlay (Hidden on Mobile) */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-smooth translate-y-4 group-hover:translate-y-0 hidden md:flex">
          <button className="p-4 bg-white rounded-2xl text-primary-950 shadow-xl hover:bg-accent hover:text-white transition-smooth">
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{category}</span>
          <h3 className="text-lg font-bold text-primary-950 leading-tight group-hover:text-accent transition-smooth line-clamp-2 min-h-[3rem]">
            {name}
          </h3>
        </div>

        <div className="flex items-center gap-1">
           {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-accent text-accent" />)}
           <span className="text-[9px] text-slate-400 font-bold ml-1 uppercase tracking-widest">(12 Reseñas)</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SKU: {sku}</span>
            <span className="text-2xl font-black text-primary-950 font-outfit tracking-tighter">
              {price ? `$${price.toFixed(2)}` : "Cotizar"}
            </span>
          </div>
          <button 
            onClick={handleAddToCart}
            className="p-4 bg-primary-950 text-white rounded-2xl hover:bg-accent transition-smooth shadow-lg shadow-primary-950/20 active:scale-90"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </Link>
  );
}
