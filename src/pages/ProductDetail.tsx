import { useParams, Link } from "react-router-dom";
import { 
  ChevronRight, 
  ShoppingCart, 
  Star,
  Share2,
  AlertCircle,
  Loader2,
  Package,
  TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cartStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/productos/ProductCard";
import { useTranslation } from "@/contexts/TranslationContext";

export default function ProductDetail() {
  const { t, lang } = useTranslation();
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*, categorias(id, nombre), marcas(nombre)')
          .eq('id', id)
          .single();
        if (error) throw error;
        setProduct(data);
        if (data.imagenes_urls && data.imagenes_urls.length > 0) {
          setSelectedImage(data.imagenes_urls[0]);
        } else {
          setSelectedImage("https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80"); // fallback
        }
        
        // Fetch suggestions now that we have the product category
        fetchSuggestions(data.categoria_id, data.id);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchSuggestions(categoryId: string, currentId: string) {
       setSuggestionsLoading(true);
       try {
         const { data, error } = await supabase
          .from('productos')
          .select('*, categorias(nombre)')
          .eq('categoria_id', categoryId)
          .neq('id', currentId)
          .limit(4);
         
         if (!error && data) {
           setSuggestions(data);
         }
       } catch (err) {
         console.error("Error fetching suggestions:", err);
       } finally {
         setSuggestionsLoading(false);
       }
    }

    if (id) fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <Loader2 className="w-12 h-12 animate-spin text-accent" />
    </div>
  );

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.nombre,
      sku: product.sku,
      price: product.precio || 0,
      image: selectedImage
    }, quantity);

    setIsAdded(true);
    toast.success(`${quantity} ${quantity > 1 ? t('cart.units_added') : t('cart.unit_added')}`, {
      style: {
        borderRadius: '1rem',
        background: '#0F172A',
        color: '#fff',
      },
    });
  };

  const images = (product.imagenes_urls && product.imagenes_urls.length > 0) ? product.imagenes_urls : [selectedImage];

  return (
    <div className="bg-white min-h-screen py-8 pb-32">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[.2em] mb-8">
          <Link to="/" className="hover:text-accent transition-smooth">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/productos" className="hover:text-accent transition-smooth">{t('nav.productos')}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary-950 font-black">
            {(lang === 'EN' && product.nombre_en) ? product.nombre_en : product.nombre}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery Side */}
          <div className="flex flex-col gap-6">
            <div className="relative aspect-square max-h-[500px] rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100 group shadow-inner">
              <img src={selectedImage} alt={product.nombre} className="w-full h-full object-contain p-8 transition-smooth group-hover:scale-105" />
              <button className="absolute top-6 right-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl text-slate-600 hover:text-accent transition-smooth shadow-xl">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {images.map((img: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square rounded-[2rem] overflow-hidden border-4 transition-all p-3 ${selectedImage === img ? 'border-accent bg-accent/5' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                >
                  <img src={img} alt={`${product.nombre} visual ${i}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Info Side */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-accent/10 text-accent text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    {product.categorias?.nombre || 'Sin Categoría'}
                  </span>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">SKU: {product.sku}</span>
                </div>
                {t('mostrar_resegnas') === 'true' && (
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-accent text-accent" />)}
                    <span className="text-[10px] text-slate-400 font-black ml-1 uppercase tracking-widest leading-none">4.9 (124 reviews)</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-primary-950 uppercase tracking-tighter leading-[0.95]">
                {(lang === 'EN' && product.nombre_en) ? product.nombre_en : product.nombre}
              </h1>

              <div className="flex items-center gap-6 py-4 border-y border-slate-100">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('product.unit_price')}</span>
                   <span className="text-4xl font-black text-primary-950 font-outfit tracking-tighter leading-none">
                     {product.precio ? `$${product.precio.toFixed(2)}` : t('product.get_quote')}
                   </span>
                </div>
                {product.precio && (
                  <span className="text-slate-300 line-through text-xl font-bold mt-2">${(product.precio * 1.2).toFixed(2)}</span>
                )}
                <div className="ml-auto px-4 py-2 bg-green-50 rounded-xl border border-green-100">
                   <div className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      {t('product.in_stock')}
                   </div>
                </div>
              </div>
            </div>

            <p className="text-base text-slate-500 leading-relaxed font-medium">
              {(lang === 'EN' && product.descripcion_en) ? product.descripcion_en : (product.descripcion || t('product.no_description'))}
            </p>

            {/* Actions Area */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-slate-50 rounded-2xl overflow-hidden h-16 border border-slate-100 shrink-0">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-16 h-full hover:bg-slate-200 transition-smooth font-black text-primary-950 text-xl"
                  >-</button>
                  <span className="w-14 text-center font-black text-primary-950 text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-16 h-full hover:bg-slate-200 transition-smooth font-black text-primary-950 text-xl"
                  >+</button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary-950 hover:bg-primary-900 text-white font-black h-16 rounded-2xl flex items-center justify-center gap-4 transition-smooth shadow-2xl shadow-primary-950/20 active:scale-95 uppercase text-xs tracking-widest"
                >
                  <ShoppingCart className="w-5 h-5" /> {t('product.add_to_cart')}
                </button>
              </div>

              <AnimatePresence>
                {isAdded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                  >
                    <Link 
                      to="/carrito"
                      className="w-full bg-accent hover:bg-orange-600 text-white font-black h-16 rounded-2xl flex items-center justify-center gap-4 transition-smooth shadow-2xl shadow-accent/30 uppercase text-xs tracking-widest"
                    >
                      {t('cart.go_to_cart')} <ChevronRight className="w-5 h-5" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

