import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Wrench, 
  Cpu, 
  Package, 
  Truck, 
  Phone, 
  Mail, 
  Instagram, 
  MessageCircle,
  Building,
  Computer,
  Database,
  Printer,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock
} from "lucide-react";
import ProductCard from "@/components/productos/ProductCard";
import { useTranslation } from '@/contexts/TranslationContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string>("Todos");
  const { t, lang } = useTranslation();
  
  const productsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoadingFeatured(true);
      setLoadingOffers(true);

      // 1. Fetch Categories
      const { data: categories } = await supabase
        .from('categorias')
        .select('*')
        .order('orden', { ascending: true });
      
      if (categories) {
        setDbCategories(categories);
      }

      // 2. Fetch Offers (is_offer = true)
      const { data: offersData } = await supabase
        .from('productos')
        .select(`
          *,
          marcas(nombre),
          producto_categorias(
            categoria_id,
            categorias(nombre, slug)
          )
        `)
        .eq('is_offer', true)
        .limit(6);
      
      if (offersData) {
        setOffers(offersData);
      }
      setLoadingOffers(false);

      // 3. Fetch Featured Products (is_new = true or general)
      const { data: featuredData } = await supabase
        .from('productos')
        .select(`
          *,
          marcas(nombre),
          producto_categorias(
            categoria_id,
            categorias(nombre, slug)
          )
        `)
        .eq('is_new', true)
        .limit(8);

      if (featuredData) {
        setFeaturedProducts(featuredData);
      }
      setLoadingFeatured(false);

    } catch (err) {
      console.error("❌ Home Fetch Error:", err);
      setLoadingFeatured(false);
      setLoadingOffers(false);
    }
  };

  const handleCategoryClick = async (cat: any) => {
    setActiveCategoryId(cat.id);
    setActiveCategoryName(cat.nombre);
    setLoadingFeatured(true);
    try {
      const { data: catProds } = await supabase
        .from('productos')
        .select(`
          *,
          marcas(nombre),
          producto_categorias!inner(
            categoria_id,
            categorias(nombre, slug)
          )
        `)
        .eq('producto_categorias.categoria_id', cat.id)
        .limit(8);
      
      if (catProds) {
        setFeaturedProducts(catProds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeatured(false);
      if (productsSectionRef.current) {
        productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const resetCategoryFilter = () => {
    setActiveCategoryId(null);
    setActiveCategoryName("Todos");
    fetchInitialData();
  };

  const formatImageUrl = (url: string) => {
    if (!url) return '/placeholder-product.png';
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `/${url}`;
  };

  return (
    <div className="flex flex-col gap-12 md:gap-24 overflow-hidden dark:bg-slate-950 transition-colors duration-500 text-left bg-slate-50/30">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden pb-20 pt-28 bg-primary">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/bg-1-1700x803.png" 
            alt="Venemax Banner Background" 
            className="w-full h-full object-cover brightness-[0.4]" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent"></div>
          {/* Decorative glows */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-8 flex flex-col gap-6"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span>
                <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] font-outfit">Venemax Store</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tighter uppercase italic font-outfit drop-shadow-2xl">
                Venemax
              </h1>
              
              <p className="text-lg md:text-2xl text-slate-200 leading-relaxed font-bold tracking-wide max-w-2xl border-l-4 border-accent pl-6 bg-gradient-to-r from-accent/10 to-transparent py-2">
                Una marca sustentable inspirada en la tecnología. Venta al mayor y detal de equipos tecnológicos.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 mt-4">
                <a 
                  href="#productos" 
                  className="group/btn flex items-center justify-center gap-4 bg-accent hover:bg-accent/90 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 shadow-xl shadow-accent/20 active:scale-95"
                >
                  Ver Catálogo
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                </a>
                <a 
                  href="#contacto" 
                  className="flex items-center justify-center bg-white/10 hover:bg-white/15 backdrop-blur-md text-white border border-white/10 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 active:scale-95"
                >
                  Contacto Directo
                </a>
              </div>
            </motion.div>

            {/* Parallax scene simulation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lg:col-span-4 relative hidden lg:block"
            >
              <div className="relative group rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl aspect-square bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-8">
                <img 
                  src="/images/parallax-item-1-563x532.png" 
                  alt="Processors" 
                  className="w-full h-auto object-contain animate-bounce" 
                  style={{ animationDuration: '6s' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nosotros Section */}
      <section className="container mx-auto px-6 py-12" id="nosotros">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
              <img 
                src="/images/home-1-570x703.png" 
                alt="Nosotros Venemax" 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 flex flex-col gap-6"
          >
            <span className="text-accent text-xs font-black uppercase tracking-[0.3em] font-outfit">Nosotros</span>
            <h2 className="text-5xl md:text-6xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-none font-outfit">
              Hacemos cosas <span className="text-accent italic underline decoration-8 decoration-accent/10 underline-offset-4">Increíbles</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-base">
              Venemax es una empresa dedicada a la distribución, servicio y venta de una amplia gama de productos dentro del campo tecnológico acompañado de un excelente equipo de expertos. Uno de nuestros objetivos es adaptarnos a cada tipo de negocio y brindarles todo el apoyo e ideas permitiéndoles que el diseño IT de cada tienda sea único en cuanto a tecnología se refiere.
            </p>
            <div className="bg-slate-100 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50">
              <p className="text-italic font-bold text-slate-700 dark:text-slate-300 font-outfit text-lg">
                "La tecnología es mejor cuando reúne a la gente"
              </p>
            </div>
            <a 
              href="#contacto" 
              className="bg-primary-950 hover:bg-accent text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all duration-300 w-fit active:scale-95 shadow-lg"
            >
              Conócenos
            </a>
          </motion.div>
        </div>
      </section>

      {/* Servicios Section */}
      <section className="bg-slate-100/50 dark:bg-slate-900/10 py-24 relative overflow-hidden" id="servicios">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <div className="lg:col-span-7 flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                <span className="text-accent text-xs font-black uppercase tracking-[0.3em] font-outfit">Servicios</span>
                <h2 className="text-5xl md:text-6xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-none font-outfit">
                  Estamos <span className="text-accent italic">Preparados</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                  Con más de 20 años de experiencia, ofrecemos a nuestros clientes el mejor soporte y consultoría tecnológica. Estas son algunas de las razones por las que nos eligen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    title: "Mantenimiento de Dispositivos",
                    desc: "Computadoras, Laptops, Impresoras, Servidores y más con soporte integral.",
                    icon: Wrench
                  },
                  {
                    title: "Soporte IT Especializado",
                    desc: "Licencias, recuperación de datos, instalación de programas y sistemas operativos.",
                    icon: Cpu
                  },
                  {
                    title: "Productos de Calidad",
                    desc: "Artículos nuevos de las mejores marcas globales y a los precios más competitivos.",
                    icon: Package
                  },
                  {
                    title: "Envíos Nacionales",
                    desc: "Envíos garantizados con máxima seguridad para recibir tus productos intactos.",
                    icon: Truck
                  }
                ].map((serv, index) => (
                  <div 
                    key={index}
                    className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="p-4 bg-accent/10 text-accent rounded-2xl w-fit group-hover:bg-accent group-hover:text-white transition-all duration-300">
                      <serv.icon className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-black text-primary-950 dark:text-white uppercase tracking-tight font-outfit">{serv.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{serv.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
                <img 
                  src="/images/home-2-636x480.png" 
                  alt="Soporte y Reparación" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" 
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-950 text-white py-20 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,184,0,0.1),transparent)] pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { value: "50", label: "Empresas Apoyadas", desc: "Consultoría y Soluciones IT" },
              { value: "1,500", label: "Equipos Reparados", desc: "Mantenimiento Técnico" },
              { value: "12,000", label: "Equipos Vendidos", desc: "Laptops, Desktops y Componentes" },
              { value: "500", label: "Servicios Empleados", desc: "Soporte e Instalaciones" }
            ].map((stat, index) => (
              <div key={index} className="flex flex-col gap-2">
                <span className="text-5xl md:text-6xl font-black text-accent font-outfit tracking-tighter">+{stat.value}</span>
                <span className="text-white text-xs font-black uppercase tracking-wider">{stat.label}</span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">{stat.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías / Productos Section */}
      <section ref={productsSectionRef} className="container mx-auto px-6 py-12" id="productos">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="flex flex-col gap-4">
              <span className="text-accent text-xs font-black uppercase tracking-[0.3em] font-outfit">Nuestros Equipos</span>
              <h2 className="text-5xl md:text-6xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-none font-outfit">
                Gamas de <span className="text-accent italic underline decoration-8 decoration-accent/10 underline-offset-4">Productos</span>
              </h2>
            </div>
            {activeCategoryId && (
              <button 
                onClick={resetCategoryFilter}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                Limpiar Filtros
              </button>
            )}
          </div>

          {/* Categorías Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {dbCategories.map((cat) => {
              const Icon = cat.slug === 'laptops' ? Computer : 
                          cat.slug === 'desktops' ? Building : 
                          cat.slug === 'redes' ? TrendingUp : 
                          cat.slug === 'impresoras' ? Printer : 
                          cat.slug === 'servidores' ? Database : Package;
              return (
                <button 
                  key={cat.id} 
                  onClick={() => handleCategoryClick(cat)}
                  className={`group flex flex-col items-center justify-center p-8 rounded-[2.5rem] border transition-all duration-300 ${
                    activeCategoryId === cat.id 
                      ? 'bg-accent border-accent text-black shadow-lg shadow-accent/20 scale-95' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:shadow-lg hover:-translate-y-2'
                  }`}
                >
                  <div className={`p-4 rounded-2xl mb-4 transition-all ${activeCategoryId === cat.id ? 'bg-white text-black' : 'bg-slate-50 dark:bg-slate-800 text-accent group-hover:bg-accent group-hover:text-black'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-center">{cat.nombre}</span>
                </button>
              );
            })}
          </div>

          {/* Grid de Productos Destacados/Nuevos */}
          <div className="min-h-[400px] relative mt-6">
            <AnimatePresence mode="wait">
              {loadingFeatured ? (
                <div className="absolute inset-0 flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Buscando productos...</span>
                  </div>
                </div>
              ) : (
                <motion.div 
                  key={activeCategoryId || 'all'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                  {featuredProducts.map((prod) => (
                    <ProductCard 
                      key={prod.id} 
                      id={prod.id} 
                      name={(lang === 'EN' && prod.nombre_en) ? prod.nombre_en : prod.nombre} 
                      sku={prod.sku} 
                      slug={prod.slug || prod.id} 
                      category={prod.producto_categorias?.length > 0 ? (lang === 'EN' && prod.producto_categorias[0].categorias?.nombre_en) ? prod.producto_categorias[0].categorias?.nombre_en : prod.producto_categorias[0].categorias?.nombre : 'General'} 
                      price={prod.precio} 
                      moneda={prod.moneda} 
                      image={formatImageUrl((prod.imagenes_urls && prod.imagenes_urls[0]) || prod.imagen_url)} 
                      isNew={prod.is_new || false} 
                      isOffer={prod.is_offer || false} 
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Ofertas Grid Section */}
      <section className="bg-slate-100/50 dark:bg-slate-900/10 py-24" id="ofertas">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-4 text-center mb-16">
            <span className="text-accent text-xs font-black uppercase tracking-[0.3em] font-outfit">Promociones Especiales</span>
            <h2 className="text-5xl md:text-6xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-none font-outfit">
              Conoce nuestras <span className="text-accent italic underline decoration-8 decoration-accent/10 underline-offset-4">Ofertas</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md">
              Adquiere los mejores dispositivos tecnológicos con precios promocionales directos a nuestro canal de ventas.
            </p>
          </div>

          <div className="min-h-[300px] relative">
            {loadingOffers ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {offers.map((prod) => (
                  <div 
                    key={prod.id} 
                    className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-6 relative group hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="absolute top-4 right-4 bg-destructive text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Oferta
                    </div>
                    
                    <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                      <img 
                        src={formatImageUrl(prod.imagen_url || (prod.imagenes_urls && prod.imagenes_urls[0]))} 
                        alt={prod.nombre} 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{prod.marcas?.nombre || 'General'}</span>
                      <h3 className="text-lg font-black text-primary-950 dark:text-white uppercase tracking-tight truncate">{prod.nombre}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-2xl font-black text-primary-950 dark:text-white">${prod.precio}</span>
                        <a 
                          href={`https://api.whatsapp.com/send?phone=584123419669&text=Hola!%20Estoy%20interesado%20en%20el%20producto:%20${encodeURIComponent(prod.nombre)}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                          title="Comprar por WhatsApp"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Marcas Banner */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-xl md:text-2xl font-black uppercase text-white tracking-widest font-outfit">
            Venta al mayor y detal de equipos tecnológicos
          </h3>
        </div>
      </section>

      {/* Contacto & Ubicación */}
      <section className="container mx-auto px-6 py-12" id="contacto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-4 flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <span className="text-accent text-xs font-black uppercase tracking-[0.3em] font-outfit">Contacto</span>
              <h2 className="text-4xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-none font-outfit">
                Encuentra el <span className="text-accent italic">Plan Perfecto</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Puedes comunicarte con nosotros por este medio y tener más información sobre el producto deseado.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex gap-6 items-start">
                <div className="p-4 bg-accent/10 text-accent rounded-2xl shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-black text-primary-950 dark:text-white uppercase tracking-wider">Teléfono</h4>
                  <a href="tel:+582418223844" className="text-slate-600 dark:text-slate-400 font-bold hover:text-accent transition-colors">+58 (241) 822.38.44</a>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="p-4 bg-accent/10 text-accent rounded-2xl shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-black text-primary-950 dark:text-white uppercase tracking-wider">Correo</h4>
                  <a href="mailto:venemax1@hotmail.com" className="text-slate-600 dark:text-slate-400 font-bold hover:text-accent transition-colors">venemax1@hotmail.com</a>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="p-4 bg-accent/10 text-accent rounded-2xl shrink-0">
                  <Instagram className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-black text-primary-950 dark:text-white uppercase tracking-wider">Redes Sociales</h4>
                  <div className="flex gap-4">
                    <a href="https://api.whatsapp.com/send?phone=584123419669" target="_blank" rel="noopener" className="text-slate-600 dark:text-slate-400 font-bold hover:text-accent transition-colors">WhatsApp</a>
                    <a href="https://www.instagram.com/venemaxstore/" target="_blank" rel="noopener" className="text-slate-600 dark:text-slate-400 font-bold hover:text-accent transition-colors">Instagram</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 h-[450px]">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d125629.7214027614!2d-67.94263542171021!3d10.2673212041815!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xe6ed8a9c781282e5!2sLa%20Gran%20tienda%20del%20Computador!5e0!3m2!1ses-419!2sve!4v1627133114252!5m2!1ses-419!2sve" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy"
                title="Venemax Google Maps Location"
              ></iframe>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
