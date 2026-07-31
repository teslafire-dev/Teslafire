import { 
  ShieldCheck, 
  Target, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  ArrowRight,
  History as HistoryIcon,
  Heart,
  ChevronDown,
  CheckCircle2,
  Globe,
  Zap,
  Award,
  Truck
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '@/contexts/TranslationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Editable } from '@/components/admin/Editable';

export default function Nosotros() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("historia");
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.error("Módulo de contacto en mantenimiento. Use WhatsApp por ahora.", {
        style: { borderRadius: '1rem', background: '#0F172A', color: '#fff' },
      });
      setIsSubmitting(false);
    }, 800);
  };

  const sections = [
    {
      id: "historia",
      title: "Reseña Histórica",
      icon: <HistoryIcon className="w-5 h-5" />,
      content: (
        <div className="flex flex-col gap-10">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
            <h4 className="text-xl font-black uppercase tracking-tighter text-primary-950 dark:text-white mb-4">Inicios y Trayectoria</h4>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm">
              Venemax Store inicia sus operaciones en Valencia, Venezuela, con el firme compromiso de proveer soluciones de computación, accesorios y soporte de redes de la más alta calidad tanto para personas como para el sector corporativo.
            </p>
          </div>

          <div className="relative pl-8 border-l-2 border-accent/20 flex flex-col gap-12 text-left">
            {[
              { year: "2008", title: "Apertura de Tienda Física", desc: "Inauguración de la sede principal y laboratorio de servicio técnico en Valencia." },
              { year: "2012", title: "Distribución de Marcas Líderes", desc: "Incorporación al catálogo de marcas de renombre como HP, Dell, Lenovo, Acer y Epson." },
              { year: "2016", title: "Soluciones de Infraestructura IT", desc: "Integración de servidores corporativos Dell y soluciones avanzadas de conectividad de red." },
              { year: "2021", title: "Transformación Digital", desc: "Lanzamiento del portal interactivo de reservas y catálogo en línea para envíos nacionales." }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[41px] top-0 w-5 h-5 bg-accent rounded-full border-4 border-white dark:border-slate-900 shadow-xl"></div>
                <span className="text-accent font-black text-xs uppercase tracking-widest mb-1 block">Año {item.year}</span>
                <h5 className="text-base font-black text-primary-950 dark:text-white uppercase mb-2">{item.title}</h5>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "mision",
      title: "Misión y Visión",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          <div className="flex flex-col gap-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-10 rounded-[2.5rem] border border-emerald-100/50">
              <h4 className="text-3xl font-black text-emerald-950 dark:text-emerald-400 uppercase tracking-tighter mb-4">Misión</h4>
              <p className="text-emerald-900/70 dark:text-slate-400 font-medium leading-relaxed text-sm">
                Proveer soluciones y equipos tecnológicos innovadores de marcas de prestigio global, garantizando asesoramiento experto y soporte técnico de primer nivel para potenciar la productividad y el desarrollo de nuestros clientes.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
               <h4 className="text-2xl font-black text-primary-950 dark:text-white uppercase tracking-tighter mb-4">Visión</h4>
               <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm">
                 Consolidarnos como la tienda de computación de referencia y el proveedor de soluciones de IT más confiable a nivel nacional, siendo reconocidos por la calidad de nuestros productos y la excelencia en el servicio postventa.
               </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
             <h4 className="text-xl font-black text-primary-950 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
               <Users className="w-5 h-5 text-accent" /> Clientes Clave
             </h4>
             <div className="grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
               {[
                 "OFICINAS CORPORATIVAS", 
                 "TIENDAS RETAIL", 
                 "INSTITUCIONES EDUCATIVAS", 
                 "EMPRENDEDORES", 
                 "CENTROS DE DISEÑO Y PROGRAMACIÓN", 
                 "PROFESIONALES INDEPENDIENTES", 
                 "PYMES Y COMERCIOS LOCALES"
               ].map((cliente, i) => (
                 <div key={i} className="py-2 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-smooth group flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-primary-950 dark:group-hover:text-white uppercase tracking-widest">{cliente}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )
    },
    {
      id: "valores",
      title: "Valores",
      icon: <Heart className="w-5 h-5" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            { v: "Respeto", q: "Desarrollo del respeto mutuo y sinceridad en cada consulta." },
            { v: "Honestidad", q: "Claridad absoluta en presupuestos y condiciones de garantía." },
            { v: "Compromiso", q: "Atención y soporte continuo ante las necesidades de tu infraestructura IT." },
            { v: "Calidad", q: "Distribución exclusiva de marcas de computación líderes." },
            { v: "Eficacia", q: "Diagnóstico preciso y soporte técnico ágil." },
            { v: "Garantía", q: "Seguridad y respaldo total en cada producto adquirido." }
          ].map((valor, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-smooth shadow-sm group">
               <h5 className="text-lg font-black text-primary-950 dark:text-white uppercase mb-2 group-hover:text-accent transition-colors">{valor.v}</h5>
               <p className="text-xs text-slate-500 font-medium">{valor.q}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "contacto",
      title: "Contáctenos",
      icon: <Send className="w-5 h-5" />,
      content: (
        <div className="flex flex-col gap-8 text-left">
           <div className="flex flex-col gap-2">
              <h4 className="text-2xl font-black text-primary-950 dark:text-white uppercase tracking-tighter">¿En qué podemos asesorarle?</h4>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">Estamos listos para atender sus dudas sobre computadoras y tecnología.</p>
           </div>
           <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input type="text" placeholder="Nombre completo" required className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-5 text-[10px] font-bold outline-none focus:ring-2 focus:ring-accent transition-smooth dark:text-white uppercase tracking-widest" />
                 <input type="email" placeholder="Correo corporativo" required className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-5 text-[10px] font-bold outline-none focus:ring-2 focus:ring-accent transition-smooth dark:text-white uppercase tracking-widest" />
              </div>
              <textarea rows={4} placeholder="Escriba su mensaje aquí..." required className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] px-6 py-5 text-[10px] font-bold outline-none focus:ring-2 focus:ring-accent transition-smooth resize-none dark:text-white uppercase tracking-widest"></textarea>
              <button className="h-20 bg-accent text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-primary-950 transition-smooth active:scale-95 flex items-center justify-center gap-4 shadow-xl shadow-accent/20">
                 ENVIAR CONSULTA <Send className="w-4 h-4" />
              </button>
           </form>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-8 lg:gap-12 pb-20 bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative">
      
      {/* Dynamic Blue Header Cut */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-primary diagonal-cut z-0 pointer-events-none">
        <div className="absolute inset-0 industrial-dots opacity-40"></div>
      </div>

      {/* Hero Nosotros - Map on the Right Side */}
      <section className="container mx-auto px-6 relative z-10 pt-44">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left: Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-left"
          >
            <div className="inline-flex items-center gap-3 bg-accent/20 border border-accent/20 px-5 py-2 rounded-2xl w-fit mb-6">
              <Editable keyName="nosotros_hero_tag" className="text-accent text-[10px] font-black uppercase tracking-[0.4em] font-outfit">
                Tecnología de Vanguardia
              </Editable>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter font-outfit uppercase mb-6 drop-shadow-lg">
              <Editable keyName="nosotros_hero_title_top" as="span">Venemax</Editable> <br />
              <Editable keyName="nosotros_hero_title_bottom" as="span" className="text-accent underline decoration-8 decoration-accent/10 underline-offset-[12px]">
                Store
              </Editable>
            </h1>
            <Editable 
              keyName="nosotros_hero_subtitle" 
              as="p" 
              className="text-xl text-slate-100/80 leading-relaxed max-w-xl font-medium mb-8" 
            >
              Distribución, servicio y venta de una amplia gama de productos dentro del campo tecnológico acompañado de un excelente equipo de expertos.
            </Editable>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
               <button 
                 onClick={() => navigate('/productos')}
                 className="bg-primary-950 dark:bg-accent text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-smooth hover:bg-accent dark:hover:bg-primary-950"
               >
                 <Editable keyName="nosotros_hero_cta">Ver Catálogo</Editable>
               </button>
            </div>
          </motion.div>

          {/* Right: Google Map instead of Pillars */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="lg:w-[500px] h-[500px] relative cursor-pointer"
          >
             <div className="absolute inset-x-10 bottom-10 top-20 bg-accent/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="relative h-full bg-white dark:bg-slate-900 rounded-[4rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl group transition-all duration-700">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d125629.7214027614!2d-67.94263542171021!3d10.2673212041815!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xe6ed8a9c781282e5!2sLa%20Gran%20tienda%20del%20Computador!5e0!3m2!1ses-419!2sve!4v1627133114252!5m2!1ses-419!2sve" 
                  className="w-full h-full border-none grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                  allowFullScreen={true} 
                  loading="lazy" 
                ></iframe>
                
                {/* Floating Map Label with extra hover pop */}
                <div className="absolute bottom-8 inset-x-8">
                   <motion.div 
                     whileHover={{ y: -5 }}
                     className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-7 rounded-[2.5rem] border border-white/20 shadow-2xl transition-all duration-500 group-hover:border-accent/40"
                   >
                      <p className="text-[11px] font-black text-accent uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                        <MapPin className="w-3 h-3 animate-bounce" />
                        <Editable keyName="nosotros_map_tag">¡AQUÍ ESTAMOS!</Editable>
                      </p>
                      <p className="text-[14px] font-black text-primary-950 dark:text-white uppercase leading-tight">
                        <Editable keyName="nosotros_map_location">C.C. La Asunción, Sector Santa Cecilia, Valencia</Editable>
                      </p>
                   </motion.div>
                </div>
              </div>
          </motion.div>
        </div>
      </section>

      {/* Identity Tabs Section */}
      <section className="container mx-auto px-6 mt-12">
        <div className="flex flex-col items-center gap-8 pt-12 pb-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-[5rem] border border-slate-100 dark:border-slate-800/50">
            <div className="flex flex-wrap justify-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800">
               {sections.map(sec => (
                 <button
                   key={sec.id}
                   onClick={() => setActiveTab(sec.id)}
                   className={`px-8 py-4 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest transition-smooth flex items-center gap-3 ${
                     activeTab === sec.id 
                      ? 'bg-slate-950 dark:bg-white text-white dark:text-primary-950 shadow-xl' 
                      : 'text-slate-400 dark:text-slate-500 hover:text-accent'
                   }`}
                 >
                   <Editable keyName={`nosotros_tab_${sec.id}`}>
                     {sec.title}
                   </Editable>
                 </button>
               ))}
            </div>
            
            <div className="w-full max-w-5xl px-4">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeTab}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                 >
                    <div className="bg-white dark:bg-slate-900 shadow-2xl shadow-primary-950/5 rounded-[4rem] border border-slate-100 dark:border-slate-800 p-12 md:p-16">
                      {sections.find(s => s.id === activeTab)?.content}
                    </div>
                 </motion.div>
               </AnimatePresence>
            </div>
        </div>
      </section>

    </div>
  );
}
