import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Headphones,
  Play,
  Zap,
  CheckCircle2,
  Box,
  Globe,
  Filter} from "lucide-react";
import ProductCard from "@/components/productos/ProductCard";
import { useTranslation } from '@/contexts/TranslationContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string>("Referentes");
  const { t, lang } = useTranslation();
  
  const productsSectionRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  const y2 = useTransform(scrollY, [0, 500], [0, -50]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async (catId: string | null = null, catName: string | null = null) => {
    try {
      setLoadingFeatured(true);
      if (catName) setActiveCategoryName(catName);
      
      if (dbCategories.length === 0) {
        const { data: categories } = await supabase
            .from('categorias')
            .select('id, nombre, slug, imagen_url')
            .is('parent_id', null)
            .order('orden', { ascending: true });
        if (categories) setDbCategories(categories);
      }

      const highlightedProdsMap = new Map();
      if (!catId) {
        const categoriesToFetch = dbCategories.length > 0 ? dbCategories : (await supabase.from('categorias').select('id').is('parent_id', null).order('orden')).data || [];
        for (const cat of categoriesToFetch.slice(0, 8)) {
          const { data: prod } = await supabase
            .from('productos')
            .select(`*, marcas(nombre), producto_categorias!inner(categoria_id, categorias(nombre, nombre_en))`)
            .eq('producto_categorias.categoria_id', cat.id)
            .limit(1)
            .order('created_at', { ascending: false });
          
          if (prod && prod.length > 0) {
            const item = prod[0];
            if (!highlightedProdsMap.has(item.id)) {
              highlightedProdsMap.set(item.id, item);
            }
          }
        }
      } else {
        const { data: subCats } = await supabase.from('categorias').select('id').eq('parent_id', catId);
        const targetIds = [catId, ...(subCats?.map(s => s.id) || [])];
        const { data: prod } = await supabase
          .from('productos')
          .select(`*, marcas(nombre), producto_categorias!inner(categoria_id, categorias(nombre, nombre_en))`)
          .in('producto_categorias.categoria_id', targetIds)
          .limit(8)
          .order('created_at', { ascending: false });
        
        if (prod) {
          prod.forEach(item => {
            if (!highlightedProdsMap.has(item.id)) {
              highlightedProdsMap.set(item.id, item);
            }
          });
        }
      }
      setFeaturedProducts(Array.from(highlightedProdsMap.values()));
    } catch (err) {
      console.error("❌ Home Catch:", err);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const handleCategoryClick = (cat: any) => {
    setActiveCategoryId(cat.id);
    fetchData(cat.id, cat.nombre);
    setTimeout(() => {
      productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="flex flex-col gap-12 md:gap-24 overflow-hidden dark:bg-slate-950 transition-colors duration-500 bg-grid-slate-900/[0.05] dark:bg-grid-white/[0.02]">
      
      {/* Hero Section - REDESIGNED FOR IMPACT & SPACE */}
      <section className="relative min-h-[95vh] flex flex-col bg-primary-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            style={{ y: y2 }}
            src={t('home.hero.imagen_url')} 
            alt={t('home.hero.tag')} 
            className="w-full h-full object-cover brightness-[0.22] scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/40 to-primary-950/20"></div>
          
          {/* Decorative Glows */}
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[160px] animate-pulse"></div>
          <div className="absolute top-1/2 -right-20 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[140px] animate-pulse delay-700"></div>
        </div>

        <div className="flex-grow flex items-center relative z-10 pt-32 pb-12">
          <div className="container mx-auto px-6">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Side: Messaging & Actions (7 Columns) */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-7 flex flex-col gap-10"
              >
                <div className="flex flex-col gap-6">
                  <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full w-fit">
                    <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span>
                    <span className="text-accent text-[9px] font-black uppercase tracking-[0.4em] font-outfit">{t('home.hero.tag')}</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-black text-white leading-[1.1] tracking-tighter font-outfit uppercase italic drop-shadow-2xl">
                    {(t('home.hero.title') || 'Protección Superior').split(' ').map((word, i) => (
                      word.toLowerCase() === 'superior' 
                      ? <span key={i} className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-accent via-orange-400 to-accent px-2 py-1">
                          Superior 
                          <span className="absolute -bottom-1 left-0 w-full h-1 bg-accent/20 blur-xl"></span>
                        </span> 
                      : word + ' '
                    ))}
                  </h1>
                  
                  <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium tracking-wide max-w-xl border-l-4 border-accent pl-8 bg-gradient-to-r from-accent/5 to-transparent py-2">
                     {t('home.hero.subtitle') || 'Protección para cada desafío industrial.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                   <Link to="/productos" className="group/btn flex items-center gap-4 bg-accent hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-500 shadow-2xl shadow-accent/20 active:scale-95">
                      {t('home.hero.cta.catalog') || 'Explorar Catálogo'}
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-smooth" />
                   </Link>
                   <Link to="/nosotros" className="flex items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white border border-white/10 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-500 active:scale-95">
                      {t('home.hero.cta.company') || 'Conocer Empresa'}
                   </Link>
                </div>
              </motion.div>

              {/* Right Side: Cinematic Video (5 Columns) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="lg:col-span-5 relative"
              >
                <div className="relative group rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-slate-900 group aspect-[4/3] lg:aspect-square xl:aspect-video">
                  <iframe 
                    className="w-full h-full relative z-10 brightness-90 group-hover:brightness-100 transition-all duration-700 scale-105"
                    src={t('hero_video_url') || "https://www.youtube.com/embed/qim10BqdIgk?autoplay=0&mute=1&controls=1&showinfo=0&rel=0&modestbranding=1"} 
                    title="Dobell Hero Video"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                  {/* Decorative Glass Overlay on corner */}
                </div>
                
                {/* Visual Weight Under the Video */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent/20 blur-[100px] pointer-events-none"></div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Global Statistics Strip (Floating at bottom) */}
        <div className="relative z-20 mt-6 container mx-auto px-6 mb-16">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white/[0.03] backdrop-blur-[40px] border border-white/10 p-8 md:p-10 rounded-[3rem] shadow-3xl items-center text-center">
              {[
                { label: t('nosotros.stats.products') || 'En Inventario', value: "2,145", icon: Box },
                { label: t('nosotros.stats.brands') || 'Marcas Aliadas', value: "54", icon: ShieldCheck },
                { label: t('nosotros.stats.clients') || 'Clientes Satisfechos', value: "15k", icon: Headphones },
                { label: "Soporte Técnico", value: "24/7", icon: Clock }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-2 border-l first:border-0 border-white/10 grow group/stat hover:bg-white/5 transition-smooth py-2">
                  <span className="text-3xl md:text-5xl font-black text-white font-outfit tracking-tighter group-hover:text-accent transition-all duration-500">{stat.value}</span>
                  <div className="flex items-center gap-2 opacity-60">
                    <stat.icon className="w-3 h-3 text-accent" />
                    <span className="text-white text-[8px] font-black uppercase tracking-[0.3em]">{stat.label}</span>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Categories Grid - REFINED SELECTOR */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        className="container mx-auto px-6 py-12"
      >
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="flex flex-col gap-6">
            <h2 className="text-5xl md:text-6xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-none font-outfit">Explorar <span className="text-accent underline decoration-8 decoration-accent/10 underline-offset-4">Gamas</span></h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium tracking-wide max-w-lg">Haz clic en un área para ver sus equipos certificados.</p>
          </div>
          <button 
            onClick={() => { setActiveCategoryId(null); fetchData(null, "Referentes"); }}
            className={`flex items-center gap-4 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-500 ${!activeCategoryId ? 'bg-slate-100 text-slate-300 dark:bg-slate-900 pointer-events-none' : 'bg-primary-950 text-white shadow-2xl hover:bg-accent hover:translate-x-3'}`}
          >
            {activeCategoryId ? 'Ver Todo el Inventario' : 'Catálogo Filtrable'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {dbCategories.map((cat) => (
            <button key={cat.id} onClick={() => handleCategoryClick(cat)} className={`group relative h-72 rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-700 ${activeCategoryId === cat.id ? 'ring-8 ring-accent/30 scale-95 shadow-accent/40' : 'hover:shadow-accent/20 hover:-translate-y-3'}`}>
              <img src={cat.imagen_url || "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80"} alt={cat.nombre} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-smooth duration-1000" />
              <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-700 ${activeCategoryId === cat.id ? 'from-accent/95 via-accent/40 to-transparent' : 'from-primary-950/95 via-primary-950/20 to-transparent group-hover:from-accent/60'}`}></div>
              <div className="absolute bottom-8 left-10 right-10 text-left">
                <span className={`text-[8px] font-black uppercase tracking-[0.3em] mb-2 block ${activeCategoryId === cat.id ? 'text-white' : 'text-accent'}`}>{activeCategoryId === cat.id ? 'SELECCIONADO' : 'ÁREA TÉCNICA'}</span>
                <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter font-outfit">{cat.nombre}</h3>
              </div>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Featured Products */}
      <motion.section 
        ref={productsSectionRef}
        className="bg-slate-50 dark:bg-slate-900/50 py-32 rounded-[6rem] mx-4 shadow-inner relative z-10 border border-slate-100 dark:border-slate-800 transition-colors duration-500 scroll-mt-28"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-3 bg-primary-950 text-white px-5 py-2 rounded-xl w-fit">
                <Zap className="w-4 h-4 text-accent fill-current animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">{activeCategoryId ? `Enfoque en ${activeCategoryName}` : `Selección Dobell Service`}</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-none font-outfit">{activeCategoryId ? activeCategoryName : 'Equipos'} <span className="text-accent underline decoration-8 decoration-accent/10 underline-offset-8 italic">Referentes</span></h2>
            </div>
            <Link to={activeCategoryId ? `/productos?categoria=${dbCategories.find(c => c.id === activeCategoryId)?.slug}` : "/productos"} className="bg-primary-950 dark:bg-accent text-white px-10 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-smooth shadow-2xl active:scale-95 flex items-center gap-4">
               {activeCategoryId ? 'Ver Toda la Gama' : 'Explorar Todo el Arsenal'}
               <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="min-h-[400px] relative">
            <AnimatePresence mode="wait">
              {loadingFeatured ? (
                <div className="absolute inset-0 flex items-center justify-center p-20">
                   <div className="flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 border-8 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Inventario...</span>
                   </div>
                </div>
              ) : (
                <motion.div key={activeCategoryId || 'all'} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                  {featuredProducts.map((prod) => (
                    <ProductCard key={prod.id} id={prod.id} name={(lang === 'EN' && prod.nombre_en) ? prod.nombre_en : prod.nombre} sku={prod.sku} slug={prod.slug || prod.id} category={prod.producto_categorias?.length > 0 ? (lang === 'EN' && prod.producto_categorias[0].categorias?.nombre_en) ? prod.producto_categorias[0].categorias?.nombre_en : prod.producto_categorias[0].categorias?.nombre : 'General'} price={prod.precio} moneda={prod.moneda} image={(prod.imagenes_urls && prod.imagenes_urls[0]) || prod.imagen_url || '/placeholder-product.png'} isNew={prod.is_new || false} isOffer={prod.is_offer || false} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Trust Markers */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="container mx-auto px-6 mb-48">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 bg-slate-900 border border-white/10 rounded-[5rem] overflow-hidden shadow-2xl">
          {[
            { icon: ShieldCheck, title: t('home.trust.cert.title'), desc: t('home.trust.cert.desc') },
            { icon: Truck, title: t('home.trust.delivery.title'), desc: t('home.trust.delivery.desc') },
            { icon: Clock, title: t('home.trust.stock.title'), desc: t('home.trust.stock.desc') },
            { icon: Headphones, title: t('home.trust.support.title'), desc: t('home.trust.support.desc') }
          ].map((item, i) => (
            <div key={i} className="bg-slate-900/50 backdrop-blur-3xl p-16 flex flex-col gap-6 text-center items-center hover:bg-white/5 transition-all duration-700 group border-r border-white/5 last:border-0">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:bg-accent/20 group-hover:rotate-[360deg] transition-all duration-1000">
                <item.icon className="w-10 h-10 text-accent" />
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tighter font-outfit text-white italic">{item.title}</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
