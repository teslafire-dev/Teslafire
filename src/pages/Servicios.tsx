import { 
  ShieldCheck, 
  Settings, 
  GraduationCap, 
  Gauge, 
  AlertTriangle, 
  Layers, 
  ChevronRight,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function Servicios() {
  const serviceCards = [
    {
      title: "Asesoría y Servicio Post-Venta",
      desc: "Seguimiento técnico continuo tras la adquisición de equipos para asegurar su correcto desempeño en campo.",
      icon: <Clock className="w-8 h-8" />,
      tag: "Continuidad",
      color: "from-blue-600 to-blue-400"
    },
    {
      title: "Entrenamiento y Capacitación",
      desc: "Formación técnica especializada sobre el uso, cuidado y normativas legales de los equipos de protección.",
      icon: <GraduationCap className="w-8 h-8" />,
      tag: "Formación",
      color: "from-emerald-600 to-emerald-400"
    },
    {
      title: "Programa Ansell GUARDIAN®",
      desc: "Metodología patentada para optimizar la selección de EPP, reduciendo costos operativos y mejorando la seguridad.",
      icon: <ShieldCheck className="w-8 h-8" />,
      tag: "Exclusivo",
      color: "from-amber-600 to-amber-400"
    },
    {
      title: "Pruebas de Sello",
      desc: "Validación técnica de ajuste para protección respiratoria, garantizando un sellado hermético y seguro.",
      icon: <Gauge className="w-8 h-8" />,
      tag: "Técnico",
      color: "from-slate-600 to-slate-400"
    },
    {
      title: "Prevención contra Amoníaco",
      desc: "Protocolos y equipamiento específico para entornos con presencia de gases críticos y amoníaco.",
      icon: <AlertTriangle className="w-8 h-8" />,
      tag: "Crítico",
      color: "from-red-600 to-red-400"
    },
    {
      title: "DOBELL SOLUTIONS",
      desc: "Desarrollo de soluciones integrales personalizadas para retos complejos de seguridad industrial.",
      icon: <Layers className="w-8 h-8" />,
      tag: "Integral",
      color: "from-primary-950 to-slate-800"
    }
  ];

  return (
    <div className="min-h-screen pt-40 pb-40 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="container mx-auto px-6">
        
        {/* HERO SERVICES */}
        <div className="flex flex-col lg:flex-row gap-20 items-center mb-40">
           <motion.div 
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
             className="flex-1"
           >
              <div className="inline-flex items-center gap-3 bg-accent/20 border border-accent/30 px-5 py-2 rounded-2xl mb-8">
                 <Zap className="w-4 h-4 text-accent animate-pulse" />
                 <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em]">Servicios de Alto Valor</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black font-outfit text-primary-950 dark:text-white uppercase tracking-tighter leading-[0.9] mb-10">
                Nuestros <br />
                <span className="text-accent">Servicios</span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 max-w-xl">
                Nos especializamos en el asesoramiento técnico y específico en la selección de los equipos de protección personal adecuados para cada operación en los lugares de trabajo, el uso correcto y el mantenimiento para una mayor duración.
              </p>
              <div className="h-1 bg-slate-100 dark:bg-slate-800 w-24 mb-10"></div>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-md">
                Garantizamos eficiencia en costos y formación técnica alineada con los marcos legales vigentes.
              </p>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1 }}
             className="flex-1 relative"
           >
              <div className="absolute inset-0 bg-accent/10 blur-[150px] rounded-full"></div>
              <div className="relative grid grid-cols-2 gap-4">
                 <div className="aspect-square bg-slate-900 rounded-[3rem] p-10 flex flex-col justify-between border border-white/5 shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-smooth"></div>
                    <Settings className="w-12 h-12 text-accent" />
                    <span className="text-xl font-black text-white uppercase tracking-tighter">Soporte <br />Técnico</span>
                 </div>
                 <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-[3rem] p-10 mt-12 flex flex-col justify-between border border-slate-100 dark:border-slate-700 group">
                    <CheckCircle2 className="w-12 h-12 text-accent" />
                    <span className="text-xl font-black text-primary-950 dark:text-white uppercase tracking-tighter">Eficiencia <br />Certificada</span>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-40">
          {serviceCards.map((card, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-primary-950/10 dark:hover:shadow-black/40 transition-smooth relative overflow-hidden flex flex-col items-start"
            >
               <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-smooth rounded-bl-[8rem]`}></div>
               
               <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:bg-accent/10 transition-smooth group-hover:scale-110">
                  <div className="text-accent">
                    {card.icon}
                  </div>
               </div>

               <div className="mb-4">
                  <span className="text-[9px] font-black text-accent uppercase tracking-[0.3em] px-3 py-1 bg-accent/5 rounded-full border border-accent/10">
                    {card.tag}
                  </span>
               </div>

               <h3 className="text-2xl font-black text-primary-950 dark:text-white uppercase tracking-tighter mb-4 leading-tight">
                 {card.title}
               </h3>
               
               <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                 {card.desc}
               </p>

               <button className="mt-auto flex items-center gap-2 text-[10px] font-black text-primary-950 dark:text-white uppercase tracking-widest group-hover:text-accent transition-colors">
                 Más Información <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
            </motion.div>
          ))}
        </div>

        {/* BOTTOM CTA / BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary-950 rounded-[5rem] p-12 md:p-24 text-white relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 blur-[120px] rounded-full"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl">
                 <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
                   Optimice la seguridad de su <span className="text-accent underline decoration-8 decoration-accent/10 underline-offset-8">Operación</span>
                 </h2>
                 <p className="text-slate-400 font-medium">
                   Nuestro equipo técnico está listo para realizar auditorías de EPP y programas de capacitación personalizados en su sede.
                 </p>
              </div>
              <button className="bg-white text-primary-950 px-12 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-accent hover:text-white transition-smooth active:scale-95 whitespace-nowrap">
                 Contactar Asesor Técnico
              </button>
           </div>
        </motion.div>

      </div>
    </div>
  );
}
