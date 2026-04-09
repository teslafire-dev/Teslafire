import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Headphones 
} from "lucide-react";
import ProductCard from "@/components/productos/ProductCard";
import { useTranslation } from '@/contexts/TranslationContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const { t, lang } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log("🔍 Home: Cargando destacados con relaciones...");
      const prodRes = await supabase
          .from('productos')
          .select(`
            *,
            marcas(nombre),
            producto_categorias(
              categoria_id,
              categorias(nombre, nombre_en)
            )
          `)
          .limit(8)
          .order('created_at', { ascending: false });

      const catRes = await supabase
          .from('categorias')
          .select('*, count:producto_categorias(count)');
      
      if (!prodRes.error && prodRes.data) {
        setFeaturedProducts(prodRes.data);
      }

      if (!catRes.error && catRes.data) {
        setDbCategories(catRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeatured(false);
    }
  };

  return (
    <div className="flex flex-col gap-24 overflow-hidden dark:bg-slate-950 transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col bg-primary-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={t('home.hero.imagen_url')} 
            alt={t('home.hero.tag')} 
            className="w-full h-full object-cover brightness-[0.35] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-transparent to-primary-950/40"></div>
        </div>

        <div className="flex-grow flex items-center relative z-10 pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="container mx-auto px-6">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center animate-in fade-in slide-in-from-left-12 duration-1000">
              
              {/* Left Column (Main Text) */}
              <div className="flex flex-col gap-8 lg:gap-10">
                <div className="inline-flex items-center gap-3 bg-accent/20 backdrop-blur-xl border border-accent/30 px-5 py-2 rounded-2xl w-fit">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-lg shadow-accent/50"></span>
                  <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em] font-outfit">{t('home.hero.tag')}</span>
                </div>
                
                <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black text-white leading-[0.95] tracking-tighter font-outfit">
                  {t('home.hero.title').split(' ').map((word, i) => (
                    word.toLowerCase() === 'superior' ? <span key={i} className="text-accent underline decoration-accent/30 decoration-4">Superior </span> : word + ' '
                  ))}
                </h1>
                
                <p className="text-xl text-slate-200 leading-relaxed font-medium tracking-wide max-w-xl">
                   {t('home.hero.subtitle')}
                </p>
              </div>

              {/* Right Column (Badges & CTA) */}
              <div className="flex flex-col gap-10 bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                
                <div className="flex flex-col gap-6 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-5 py-5 rounded-[2rem] border border-white/10 group-hover:bg-white/10 transition-smooth">
                      <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6 text-accent" />
                      </div>
                      <span className="text-[10px] text-white font-black uppercase tracking-widest leading-tight">
                        {t('home.hero.stats.products').split('<br/>').map((line, i) => <div key={i}>{line}</div>)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-5 py-5 rounded-[2rem] border border-white/10 group-hover:bg-white/10 transition-smooth">
                      <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center shrink-0">
                        <Truck className="w-6 h-6 text-accent" />
                      </div>
                      <span className="text-[10px] text-white font-black uppercase tracking-widest leading-tight">
                        {t('home.hero.stats.delivery').split('<br/>').map((line, i) => <div key={i}>{line}</div>)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 px-6 py-5 rounded-[2rem] border border-white/5 text-center">
                    <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px]">
                      {t('home.hero.stats.brands')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                  <Link 
                    to="/productos" 
                    className="flex-1 justify-center bg-accent hover:bg-orange-600 text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-3 transition-smooth shadow-2xl shadow-accent/40 active:scale-95"
                  >
                    {t('home.hero.cta.catalog')} <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link 
                    to="/nosotros" 
                    className="flex-1 justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-5 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-smooth active:scale-95 flex items-center"
                  >
                    {t('home.hero.cta.company')}
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative z-10 py-20 bg-primary-950/80 backdrop-blur-md border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 bg-white/5 border border-white/10 p-10 md:p-14 rounded-[4rem] shadow-2xl overflow-hidden group/stats">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              {[
                { label: t('nosotros.stats.products'), value: "2,145" },
                { label: t('nosotros.stats.brands'), value: "54" },
                { label: t('nosotros.stats.clients'), value: "15k" },
                { label: "Soporte", value: "24/7" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col border-l border-white/10 pl-8 first:border-0 grow group/item">
                  <span className="text-4xl md:text-5xl font-black text-white font-outfit tracking-tighter group-hover/item:text-accent transition-all duration-300">{stat.value}</span>
                  <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em] mt-1 opacity-80">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-5xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-none font-outfit">{t('home.categories.title')}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">{t('home.categories.subtitle')}</p>
          </div>
          <Link to="/productos" className="flex items-center gap-3 text-accent font-black uppercase text-xs tracking-widest hover:gap-5 transition-smooth mb-1">
            {t('home.categories.view_all')} <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {dbCategories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/productos?categoria=${cat.slug}`}
              className="group relative h-96 rounded-[3rem] overflow-hidden shadow-2xl hover:shadow-accent/20 transition-smooth"
            >
              <img src={cat.imagen_url || "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80"} alt={cat.nombre} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-950/20 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10">
                <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-3 block">{cat.count?.[0]?.count || 0} {t('nosotros.stats.products')}</span>
                <h3 className="text-3xl font-black text-white leading-none uppercase tracking-tighter font-outfit">{cat.nombre}</h3>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Featured Products */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1 }}
        className="bg-slate-50 dark:bg-slate-900/50 py-32 rounded-[5rem] mx-4 shadow-inner relative z-10 border border-slate-100 dark:border-slate-800 transition-colors duration-500"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-5xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-none font-outfit">{t('home.featured.title')}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">{t('home.featured.subtitle')}</p>
            </div>
            <Link to="/productos" className="bg-primary-950 dark:bg-accent text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-smooth shadow-xl active:scale-95">
              {t('home.featured.cta')}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 min-h-[400px] relative">
            {loadingFeatured ? (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
              </div>
            ) : (
              featuredProducts.map((prod) => (
                <ProductCard 
                  key={prod.id} 
                  id={prod.id}
                  name={(lang === 'EN' && prod.nombre_en) ? prod.nombre_en : prod.nombre}
                  sku={prod.sku}
                  slug={prod.slug || prod.id}
                  category={
                    prod.producto_categorias?.length > 0
                      ? (lang === 'EN' && prod.producto_categorias[0].categorias?.nombre_en)
                        ? prod.producto_categorias[0].categorias?.nombre_en
                        : prod.producto_categorias[0].categorias?.nombre
                      : 'General'
                  }
                  price={prod.precio}
                  moneda={prod.moneda}
                  image={(prod.imagenes_urls && prod.imagenes_urls[0]) || prod.imagen_url || '/placeholder-product.png'}
                  isNew={prod.is_new || false}
                  isOffer={prod.is_offer || false}
                />
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* Trust Markers */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container mx-auto px-6 mb-32"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 bg-primary-950 rounded-[4rem] p-16 text-white shadow-2xl shadow-primary-950/40 relative overflow-hidden group border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent"></div>
          {[
            { icon: ShieldCheck, title: t('home.trust.cert.title'), desc: t('home.trust.cert.desc') },
            { icon: Truck, title: t('home.trust.delivery.title'), desc: t('home.trust.delivery.desc') },
            { icon: Clock, title: t('home.trust.stock.title'), desc: t('home.trust.stock.desc') },
            { icon: Headphones, title: t('home.trust.support.title'), desc: t('home.trust.support.desc') }
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-5 text-center items-center grow relative z-10 group-hover:scale-105 transition-smooth">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-accent/20 transition-smooth">
                <item.icon className="w-8 h-8 text-accent" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tighter font-outfit">{item.title}</h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
