import { useParams, Link } from "react-router-dom";
import { 
  ChevronRight, 
  ShoppingCart, 
  Share2,
  AlertCircle,
  Package,
  Settings,
  ShieldCheck,
  Dna,
  Info,
  Globe,
  Box,
  TrendingUp,
  Moon,
  Sun,
  ArrowRight,
  Plane,
  Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cartStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import SEOHead from "@/components/seo/SEOHead";
import ProductCard from "@/components/productos/ProductCard";

export default function ProductDetail() {
  const { t, lang } = useTranslation();
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'ind'>('desc');
  const [isDark, setIsDark] = useState(false); // Local toggle for demo
  const { usdRate, eurRate } = useCurrency();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*, marcas(nombre), producto_categorias(categoria_id, categorias(nombre, nombre_en, slug))')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          setProduct(data);
          setSelectedImage(data.imagen_url || data.imagenes_urls?.[0] || "/placeholder-product.png");
          fetchSuggestions(data.id);
        }
      } catch (err) {
        console.error("❌ Error loading product:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchSuggestions(currentId: string) {
      try {
        const { data } = await supabase
         .from('productos')
         .select('*, marcas(nombre), producto_categorias(categoria_id, categorias(nombre, nombre_en))')
         .neq('id', currentId)
         .limit(4);
        if (data) setSuggestions(data);
      } catch (err) { console.error(err); }
    }

    if (slug) fetchProduct();
  }, [slug]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
      <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-950 dark:text-white">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Producto No Encontrado</h2>
      <Link to="/productos" className="bg-primary-950 dark:bg-white dark:text-slate-950 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest">Volver al Catálogo</Link>
    </div>
  );

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.nombre,
      sku: product.sku,
      price: product.precio || 0,
      moneda: product.moneda || 'USD',
      image: selectedImage,
      slug: product.slug
    }, quantity);
    toast.success(`${quantity} unidad(es) añadida(s)`, {
      style: { borderRadius: '1rem', background: isDark ? '#FFFFFF' : '#0F172A', color: isDark ? '#0F172A' : '#fff', fontWeight: 'bold' }
    });
  };

  const images = product.imagenes_urls && Array.isArray(product.imagenes_urls) ? product.imagenes_urls : [product.imagen_url || "/placeholder-product.png"];

  return (
    <>
    <SEOHead title={product.nombre} description={product.descripcion} image={product.imagen_url} />
    
    <div className={`${isDark ? 'dark' : ''} transition-all duration-500`}>
      <div className="bg-white dark:bg-slate-950 min-h-screen py-10 pt-32 pb-32 transition-colors duration-500">
        <div className="container mx-auto px-6">
          
          {/* Breadcrumbs Dual Mode */}
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[.3em] mb-6">
            <Link to="/" className="hover:text-accent transition-all">Home</Link>
            <ChevronRight className="w-3 h-3 text-accent" />
            <Link to="/productos" className="hover:text-accent transition-all">Catálogo</Link>
            <ChevronRight className="w-3 h-3 text-accent" />
            <span className="text-primary-950 dark:text-white truncate whitespace-nowrap overflow-hidden max-w-[200px]">{(lang === 'EN' && product.nombre_en) ? product.nombre_en : product.nombre}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Gallery Side */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="relative aspect-[4/3] max-h-[400px] rounded-[3rem] overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl group"
              >
                <img src={selectedImage} alt={product.nombre} className="w-full h-full object-contain p-2 transition-all duration-700 group-hover:scale-110" />
                <div className="absolute top-6 left-6">
                   <div className="bg-primary-950/80 dark:bg-white/10 backdrop-blur-xl text-white text-[9px] font-black px-4 py-2 rounded-xl border border-white/10 uppercase tracking-[0.2em] shadow-xl">
                      Elite Specification
                   </div>
                </div>
              </motion.div>
              
              <div className="grid grid-cols-4 gap-4">
                {images.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-[1.5rem] overflow-hidden border-2 transition-all p-2 ${selectedImage === img ? 'border-accent bg-accent/5 dark:bg-accent/20' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'}`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-contain dark:opacity-70 dark:hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info Side */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-3">
                   <span className="bg-primary-950 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black px-6 py-2.5 rounded-xl uppercase tracking-[0.2em] shadow-xl">
                      🛡️ PROTECCIÓN MECÁNICA
                   </span>
                   <span className="bg-accent text-white text-[10px] font-black px-6 py-2.5 rounded-xl uppercase tracking-[0.2em] shadow-xl">
                      🧤 MULTIUSOS
                   </span>
                   <span className="bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-500/20 text-[10px] font-black px-6 py-2.5 rounded-xl uppercase tracking-[0.2em]">
                      ⚠️ NIVEL MEDIO
                   </span>
                   <button 
                     onClick={() => setIsDark(!isDark)}
                     className="ml-auto p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:text-accent dark:hover:text-accent transition-all active:scale-95 shadow-sm"
                     title="Toggle Theme Mode"
                   >
                     {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                   </button>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-[1] font-outfit italic">
                  {(lang === 'EN' && product.nombre_en) ? product.nombre_en : product.nombre}
                </h1>

                <div className="flex items-center gap-8 py-8 border-y border-slate-100 dark:border-white/5">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 italic">Investment Certification</span>
                     <div className="flex items-end gap-3">
                       <span className="text-5xl font-black text-primary-950 dark:text-white font-outfit tracking-tighter leading-none">
                         {Number(product.precio) > 0 ? `${(product.moneda === 'EUR' || product.moneda === 'EUR_ONLY') ? '€' : '$'}${Number(product.precio).toFixed(2)}` : 'CONSULTAR'}
                       </span>
                       {product.precio && (
                         <div className="flex flex-col leading-none mb-1">
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Rate-Adjusted</span>
                            <span className="text-sm font-black text-slate-600 dark:text-slate-400">
                              {(((product.moneda === 'EUR' || product.moneda === 'EUR_ONLY') ? eurRate : usdRate) * product.precio).toLocaleString('es-VE')} Bs.
                            </span>
                         </div>
                       )}
                     </div>
                  </div>
                  <div className="ml-auto flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl">
                     <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                     <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest leading-none pt-0.5">Disponibilidad Inmediata</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden h-16 border border-slate-200 dark:border-white/5 shrink-0">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-16 h-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-all font-black text-slate-950 dark:text-white text-xl">-</button>
                    <span className="w-14 text-center font-black text-slate-950 dark:text-white text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-16 h-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-all font-black text-slate-950 dark:text-white text-xl">+</button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-primary-950 dark:bg-white text-white dark:text-slate-950 hover:bg-accent dark:hover:bg-accent hover:text-white font-black h-16 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-primary-950/20 dark:shadow-white/5 active:scale-95 uppercase text-[10px] tracking-widest group"
                  >
                    <ShoppingCart className="w-5 h-5 transition-transform group-hover:rotate-12" /> Adquirir Equipamiento
                  </button>

                  <AnimatePresence>
                    {useCartStore.getState().items.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 'auto' }}
                        exit={{ opacity: 0, x: -20, width: 0 }}
                        className="overflow-hidden"
                      >
                        <Link 
                          to="/carrito" 
                          className="whitespace-nowrap flex items-center gap-3 bg-accent text-white font-black h-16 px-8 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-accent/20 uppercase text-[10px] tracking-widest"
                        >
                          Ver Carrito <ArrowRight className="w-4 h-4" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button onClick={() => {}} className="w-16 h-16 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 text-slate-950 dark:text-white hover:text-accent transition-all active:scale-90 shrink-0">
                     <Share2 className="w-5 h-5" />
                  </button>
              </div>

              {/* Tabs System Dual */}
              <div className="flex flex-col gap-8 bg-slate-50/50 dark:bg-slate-900/50 p-8 md:p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-md">
                 <div className="flex gap-8 border-b border-slate-200 dark:border-white/5 pb-4 overflow-x-auto scrollbar-hide">
                    {[
                      { id: 'desc', label: 'Descripción', icon: Info },
                      { id: 'specs', label: 'Tabla Técnica', icon: Settings },
                      { id: 'ind', label: 'Industrias', icon: Globe }
                    ].map((tab) => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-primary-950 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                        {activeTab === tab.id && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-full" />}
                      </button>
                    ))}
                 </div>

                 <div className="min-h-[200px]">
                    {activeTab === 'desc' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                         <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                           {t('lang') === 'EN' ? (product.descripcion_en || product.descripcion) : product.descripcion}
                         </p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 bg-white dark:bg-slate-900/80 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                               <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center shrink-0"><ShieldCheck className="w-4 h-4 text-accent" /></div>
                               <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Protección Categoría II certificada bajo estándares internacionales.</span>
                            </div>
                            <div className="flex items-start gap-3 bg-white dark:bg-slate-900/80 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                               <div className="w-8 h-8 bg-sky-500/10 rounded-lg flex items-center justify-center shrink-0"><Dna className="w-4 h-4 text-sky-500" /></div>
                               <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Material base: Spandex Nylon de alta flexibilidad y memoria térmica.</span>
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {activeTab === 'specs' && (
                      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900">
                         <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-900 dark:bg-white/5 text-white">
                                 <tr>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Modelo</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Material Forro</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Recubrimiento</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Color</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-white/5 italic font-medium">
                                 <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-5 text-sm font-black text-primary-950 dark:text-white">48-701</td>
                                    <td className="px-6 py-5 text-xs text-slate-600 dark:text-slate-400">Tricotado Spandex Nylon</td>
                                    <td className="px-6 py-5 text-xs text-slate-600 dark:text-slate-400">Poliuretano (Palma)</td>
                                    <td className="px-6 py-5 text-xs text-slate-600 dark:text-slate-400">Blanco y Negro</td>
                                 </tr>
                                 <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-5 text-sm font-black text-primary-950 dark:text-white">48-705</td>
                                    <td className="px-6 py-5 text-xs text-slate-600 dark:text-slate-400">Nylon + Fibra de Vidrio</td>
                                    <td className="px-6 py-5 text-xs text-slate-600 dark:text-slate-400">Poliuretano Reforzado</td>
                                    <td className="px-6 py-5 text-xs text-slate-600 dark:text-slate-400">Gris Antigrasa</td>
                                 </tr>
                              </tbody>
                          </table>
                         </div>
                         <div className="bg-accent/5 p-4 flex items-center gap-3 border-t border-slate-100 dark:border-white/5">
                            <Package className="w-4 h-4 text-accent" />
                            <span className="text-[10px] font-black text-accent uppercase tracking-widest">EMBALAJE: 12 PARES POR BOLSA | 12 BOLSAS POR CAJA</span>
                         </div>
                      </motion.div>
                    )}

                    {activeTab === 'ind' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                         {[
                           { icon: Plane, label: "Aeronáutica" },
                           { icon: Settings, label: "Montaje" },
                           { icon: Box, label: "Inyección" },
                           { icon: Shield, label: "Manejo" }
                         ].map((ind, i) => (
                           <div key={i} className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
                              <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                                 <ind.icon className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-accent transition-colors" />
                              </div>
                              <span className="text-[10px] font-black text-primary-950 dark:text-white uppercase tracking-tighter text-center">{ind.label}</span>
                           </div>
                         ))}
                      </motion.div>
                    )}
                 </div>
              </div>
            </div>
          </div>

          {/* Related Products Section Dual */}
          {suggestions.length > 0 && (
            <div className="mt-32 pt-20 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-accent" /></div>
                    <h3 className="text-2xl font-black text-primary-950 dark:text-white uppercase tracking-tighter italic">Complementos de Seguridad</h3>
                 </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {suggestions.map((s) => (
                  <ProductCard 
                    key={s.id}
                    id={s.id}
                    name={s.nombre}
                    sku={s.sku}
                    slug={s.slug}
                    category={s.producto_categorias?.[0]?.categorias?.nombre || ''}
                    price={s.precio}
                    moneda={s.moneda}
                    image={s.imagen_url}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
