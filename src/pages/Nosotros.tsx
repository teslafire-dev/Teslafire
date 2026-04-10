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

  const pilares = [
    {
      title: "Distribución Global",
      desc: "Fabricantes mundiales.",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      title: "Asesoría en Sitio",
      desc: "Evaluación de riesgos.",
      icon: <Zap className="w-5 h-5" />,
    },
    {
      title: "Calidad Certificada",
      desc: "Normas ANSI / ISO.",
      icon: <Award className="w-5 h-5" />,
    },
    {
      title: "Logística Ágil",
      desc: "Respuestas directas.",
      icon: <Truck className="w-5 h-5" />,
    }
  ];

  const sections = [
    {
      id: "historia",
      title: "Reseña Histórica",
      icon: <HistoryIcon className="w-5 h-5" />,
      content: (
        <div className="flex flex-col gap-10">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
            <h4 className="text-xl font-black uppercase tracking-tighter text-primary-950 dark:text-white mb-4">Inicios y Trayectoria</h4>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Dobell Service, C.A. Inicia sus operaciones en Julio de 2008, dedicándose al suministro y asesoramiento en la selección de los Equipos de Protección Personal.
            </p>
          </div>

          <div className="relative pl-8 border-l-2 border-accent/20 flex flex-col gap-12">
            {[
              { year: "2009", title: "Marca MOLDEX", desc: "Representación exclusiva en Venezuela de protección respiratoria/auditiva." },
              { year: "2011", title: "Alianza Radians", desc: "Incorporación de protección visual, facial y vial de alta gama." },
              { year: "2014", title: "Distribuidor Ansell", desc: "Suministro de guantes industriales líder con más de 110 años de historia." },
              { year: "2015", title: "Distribución Bullard", desc: "Especialistas en protección craneal y facial de excelencia mundial." }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[41px] top-0 w-5 h-5 bg-accent rounded-full border-4 border-white dark:border-slate-900 shadow-xl"></div>
                <span className="text-accent font-black text-sm uppercase tracking-widest mb-1 block">Año {item.year}</span>
                <h5 className="text-lg font-black text-primary-950 dark:text-white uppercase mb-2">{item.title}</h5>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-10 rounded-[2.5rem] border border-emerald-100/50">
              <h4 className="text-3xl font-black text-emerald-950 dark:text-emerald-400 uppercase tracking-tighter mb-4">Misión</h4>
              <p className="text-emerald-900/70 dark:text-slate-400 font-medium leading-relaxed">
                Asesorar a nuestros clientes para una correcta Selección de los EPP, suministrando marcas certificadas a nivel mundial.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
               <h4 className="text-2xl font-black text-primary-950 dark:text-white uppercase tracking-tighter mb-4">Visión</h4>
               <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                 Ser el aliado comercial estratégico más reconocido en el mercado nacional de seguridad industrial.
               </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
             <h4 className="text-xl font-black text-primary-950 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
               <Users className="w-5 h-5 text-accent" /> Clientes Clave
             </h4>
             <div className="grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
               {[
                 "ALIMENTOS POLAR", "AVICOLA LA GUASIMA", "BRIGESTONE FIRESTONE", "GOODYEAR VENEZUELA", "CHRYSLER", "INDUSTRIAS UNICON", "INLACA", "MMC AUTOMOTRIZ", "PIRELLI DE VENEZUELA"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { v: "Respeto", q: "Desarrollo del respeto mutuo y sinceridad." },
            { v: "Honestidad", q: "Claridad en nuestros negocios y relaciones." },
            { v: "Compromiso", q: "Atención total a las necesidades del cliente." },
            { v: "Diálogo", q: "Escucha efectiva y respuesta creativa." },
            { v: "Responsabilidad", q: "Alcance cimentado en la objetividad." },
            { v: "Perseverancia", q: "Constancia para un negocio sólido." }
          ].map((valor, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-smooth shadow-sm group">
               <h5 className="text-lg font-black text-primary-950 dark:text-white uppercase mb-2 group-hover:text-accent transition-colors">{valor.v}</h5>
               <p className="text-xs text-slate-500 font-medium">{valor.q}</p>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-8 lg:gap-12 pt-44 pb-20 bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      
      {/* Hero Nosotros - Side by Side Layout */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center lg:items-center">
          
          {/* Left: Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-left"
          >
            <div className="inline-flex items-center gap-3 bg-accent/20 border border-accent/20 px-5 py-2 rounded-2xl w-fit mb-6">
              <span className="text-accent text-[10px] font-black uppercase tracking-[0.4em] font-outfit">Suministro con Valor</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-primary-950 dark:text-white leading-[0.9] tracking-tighter font-outfit uppercase mb-6">
              Dobell <br />
              <span className="text-accent underline decoration-8 decoration-accent/10 underline-offset-[12px]">Service</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl font-medium mb-8">
               Suministrar Equipos de Protección Personal de Alta Calidad con asesoramiento técnica integral para los sectores más exigentes de Venezuela.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
               <button 
                 onClick={() => navigate('/productos')}
                 className="bg-primary-950 dark:bg-accent text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-smooth hover:bg-accent dark:hover:bg-primary-950"
               >
                 Ver Catálogo
               </button>
            </div>
          </motion.div>

          {/* Right: Compact Pillars Grid */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="lg:w-[500px] relative"
          >
             <div className="absolute inset-0 bg-accent/10 blur-[120px] rounded-full"></div>
             <div className="relative grid grid-cols-2 gap-4">
                {pilares.map((pilar, i) => (
                  <div 
                    key={i} 
                    className="aspect-square bg-white dark:bg-slate-900 text-primary-950 dark:text-white rounded-[3rem] p-8 flex flex-col justify-between border border-slate-100 dark:border-slate-800 shadow-xl transition-all duration-500 group cursor-default hover:bg-accent hover:text-white hover:border-accent hover:scale-[1.05]"
                  >
                     <div className="p-3 bg-accent/20 w-fit rounded-xl text-accent group-hover:bg-white/20 group-hover:text-white transition-colors">
                        {pilar.icon}
                     </div>
                     <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-black uppercase tracking-tighter leading-tight">{pilar.title}</h3>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 leading-tight">{pilar.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </motion.div>

        </div>
      </section>

      {/* Identity Tabs Section - DRATICALLY REDUCED SEPARATION */}
      <section className="container mx-auto px-6 -mt-4 lg:-mt-8">
        <div className="flex flex-col items-center gap-8 pt-12 pb-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-[5rem] border border-slate-100 dark:border-slate-800/50">
            <div className="flex flex-wrap justify-center gap-6 p-2 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-primary-950/5 border border-slate-100 dark:border-slate-800">
               {sections.map(sec => (
                 <button
                   key={sec.id}
                   onClick={() => setActiveTab(sec.id)}
                   className={`px-10 py-5 rounded-[2.5rem] font-black uppercase text-[11px] tracking-widest transition-smooth flex items-center gap-4 ${
                     activeTab === sec.id 
                      ? 'bg-slate-950 dark:bg-white text-white dark:text-primary-950 shadow-[20px_20px_60px_rgba(0,0,0,0.1)] scale-105' 
                      : 'text-slate-400 dark:text-slate-500 hover:text-accent'
                   }`}
                 >
                   <div className={`${activeTab === sec.id ? 'text-accent' : 'text-slate-300'}`}>
                     {sec.icon}
                   </div>
                   {sec.title}
                 </button>
               ))}
            </div>
            
            <div className="w-full max-w-5xl px-4">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeTab}
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -15 }}
                   transition={{ duration: 0.3 }}
                 >
                   <div className="bg-white dark:bg-slate-900 shadow-2xl shadow-primary-950/5 rounded-[4rem] border border-slate-100 dark:border-slate-800 p-12 md:p-16">
                      {sections.find(s => s.id === activeTab)?.content}
                   </div>
                 </motion.div>
               </AnimatePresence>
            </div>
        </div>
      </section>

      {/* Trust Markers Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="bg-primary-950 py-32 rounded-[5rem] mx-4 text-white overflow-hidden relative"
      >
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Años de Exp.", value: "15+" },
              { label: "Clientes", value: "2.5k" },
              { label: "Productos", value: "2k+" },
              { label: "Marcas", value: "50+" }
            ].map((stat, i) => (
              <div key={i}>
                 <span className="text-4xl font-black text-accent tracking-tighter mb-2 font-outfit block">{stat.value}</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final Contact Section */}
      <motion.section 
        id="contacto" 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container mx-auto px-6 mb-20"
      >
         <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-2/5 flex flex-col gap-10">
               <h2 className="text-6xl font-black font-outfit text-primary-950 dark:text-white uppercase tracking-tighter leading-[0.85]">
                  Hablemos <br />con <span className="text-accent">Valor</span>
               </h2>
               <div className="flex flex-col gap-4 max-w-xs">
                  {[
                    { icon: Phone, title: "WhatsApp", val: "+58 (424) 451-1155" },
                    { icon: Mail, title: "Email", val: "ventas@dobellservice.com" }
                  ].map((inf, i) => (
                    <div key={i} className="flex gap-5 items-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 group/info transition-smooth hover:border-accent">
                       <inf.icon className="w-6 h-6 text-accent group-hover/info:scale-110 transition-smooth" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{inf.title}</span>
                          <span className="text-sm font-black text-primary-950 dark:text-white uppercase tracking-tight">{inf.val}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex-1 w-full">
               <form onSubmit={handleContactSubmit} className="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-[0_30px_100px_rgba(0,0,0,0.05)] flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input type="text" placeholder="Nombre completo" required className="bg-slate-50 dark:bg-slate-800 border border-slate-50 dark:border-slate-700 rounded-2xl px-6 py-5 text-xs font-bold outline-none focus:ring-2 focus:ring-accent transition-smooth dark:text-white" />
                     <input type="email" placeholder="Correo corporativo" required className="bg-slate-50 dark:bg-slate-800 border border-slate-50 dark:border-slate-700 rounded-2xl px-6 py-5 text-xs font-bold outline-none focus:ring-2 focus:ring-accent transition-smooth dark:text-white" />
                  </div>
                  <textarea rows={4} placeholder="¿En qué podemos asesorarle?" required className="bg-slate-50 dark:bg-slate-800 border border-slate-50 dark:border-slate-700 rounded-[2rem] px-6 py-5 text-xs font-bold outline-none focus:ring-2 focus:ring-accent transition-smooth resize-none dark:text-white"></textarea>
                  <button className="h-20 bg-primary-950 dark:bg-accent text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-accent dark:hover:bg-primary-950 transition-smooth active:scale-95 flex items-center justify-center gap-4 shadow-2xl shadow-primary-950/20">
                     ENVIAR CONSULTA <Send className="w-4 h-4" />
                  </button>
               </form>
            </div>
         </div>
      </motion.section>
    </div>
  );
}
