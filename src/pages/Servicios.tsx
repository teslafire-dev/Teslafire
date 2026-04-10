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
  ArrowRight,
  X,
  Download,
  FileText,
  Info
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Servicios() {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const serviceCards = [
    {
      title: "Asesoría y Servicio Post-Venta",
      desc: "Seguimiento técnico continuo tras la adquisición de equipos para asegurar su correcto desempeño en campo.",
      shortDesc: "Programas de conservación auditiva y protección respiratoria adaptables.",
      icon: <Clock className="w-8 h-8" />,
      tag: "Continuidad",
      color: "from-blue-600 to-blue-400",
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Tenemos a su disposición los programas de conservación auditiva y protección respiratoria adaptables a cualquier centro de trabajo, y cuentan con los requerimientos legales e internacionales que se deben tener presentes en la industria cuando existe exposición a ruido y atmósferas contaminantes en el aire.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
            <h5 className="font-black text-blue-950 dark:text-blue-400 uppercase text-xs mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" /> Nota para Clientes Moldex
            </h5>
            <p className="text-sm text-blue-900/70 dark:text-slate-400 font-medium">
              Ambos programas están a disposición de los clientes que mantienen un consumo importante de productos de la marca MOLDEX. Incluyen asesoría teórica y práctica en planta y entrenamiento específico al Servicio de Seguridad y Salud.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Entrenamiento y Capacitación",
      desc: "Formación técnica especializada sobre el uso, cuidado y normativas legales de los equipos de protección.",
      shortDesc: "Personal certificado por INPSASEL con alta experiencia industrial.",
      icon: <GraduationCap className="w-8 h-8" />,
      tag: "Formación",
      color: "from-emerald-600 to-emerald-400",
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Contamos con personal entrenado, capacitado y certificado (INPSASEL) para la aplicación de entrenamientos técnicos en prevención de riesgos, Ergonomía, higiene industrial y prevención de incendios.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Capacitación Técnica Moldex",
              "Entrenamiento Uso Correcto EPP",
              "Protección Auditiva Industrial",
              "Protección Visual Avanzada",
              "Riesgos Mecánicos"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300 tracking-tight">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Programa AnsellGUARDIAN®",
      desc: "Metodología patentada para optimizar la selección de EPP, reduciendo costos operativos y mejorando la seguridad.",
      shortDesc: "Optimización operativa a través de 100 años de experiencia.",
      icon: <ShieldCheck className="w-8 h-8" />,
      tag: "Exclusivo",
      color: "from-amber-600 to-amber-400",
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Programa internacional enfocado en hacer que los trabajadores estén más seguros y las empresas más productivas, sirviendo como marco para resultados rápidos y sostenibles.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { t: "Costos", d: "Elección adecuada para máxima duración." },
              { t: "Estandarización", d: "Mismos productos para aplicaciones similares." },
              { t: "Prevención", d: "Reducción de riesgo y costo de accidentes." },
              { t: "Controles", d: "Optimización de dispensación y uso." },
              { t: "Productividad", d: "Mejora de producción y cero desperdicios." }
            ].map((item, i) => (
              <div key={i} className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
                <h6 className="font-black text-amber-600 uppercase text-[10px] tracking-widest mb-1">{item.t}</h6>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Pruebas de Sello",
      desc: "Validación técnica de ajuste para protección respiratoria, garantizando un sellado hermético y seguro.",
      shortDesc: "Verificación periódica para usuarios de la marca Moldex.",
      icon: <Gauge className="w-8 h-8" />,
      tag: "Técnico",
      color: "from-slate-600 to-slate-400",
      content: (
        <div className="flex flex-col gap-8">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Ofrecemos pruebas de sello en planta para verificar periódicamente el funcionamiento correcto de los respiradores y las tallas adecuadas.
          </p>
          
          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
            <h5 className="text-lg font-black uppercase tracking-tighter mb-4 text-accent">Kit de Ajuste BITREX®</h5>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Cumple con los estándares de OSHA para pruebas de ajuste cualitativas. Incluye aerosol, capucha, instrucciones y certificados.
            </p>
            <a 
              href="/bitrex_fit_test_datasheet-es.pdf" 
              download 
              className="inline-flex items-center gap-3 bg-white text-slate-900 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-accent hover:text-white transition-smooth"
            >
              <Download className="w-4 h-4" /> Bajar Hoja de Datos
            </a>
          </div>

          <div className="flex flex-col gap-2">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelos Disponibles:</span>
             <div className="flex flex-wrap gap-2">
                {["Kit 0102", "Nebulizador 0301", "Solución 0503"].map((mod, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">{mod}</span>
                ))}
             </div>
          </div>
        </div>
      )
    },
    {
      title: "Protección Contra Amoniaco",
      desc: "Protocolos y equipamiento específico para entornos con presencia de gases críticos y amoníaco.",
      shortDesc: "Planes de respuesta ante gases químicos extremadamente peligrosos.",
      icon: <AlertTriangle className="w-8 h-8" />,
      tag: "Crítico",
      color: "from-red-600 to-red-400",
      content: (
        <div className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/50">
             <h5 className="text-red-600 font-black text-xs uppercase mb-2">Riesgo de Salud Extremo</h5>
             <p className="text-red-900/70 dark:text-red-400 text-xs font-medium leading-relaxed italic">
               “El amoníaco es un gas corrosivo considerado un alto riesgo porque daña piel, ojos y pulmones de forma irreversible.”
             </p>
          </div>

          <h6 className="font-black text-primary-950 dark:text-white uppercase text-sm tracking-tight">Abordaje del Plan de Respuesta:</h6>
          <div className="flex flex-col gap-3">
             {[
               "Auditoría diagnóstica de almacenamiento",
               "Acondicionamiento de cuartos de seguridad",
               "Capacitación de personal de inspección",
               "Equipamiento de intervención ante emergencias",
               "Determinación de zonas de riesgo"
             ].map((msg, i) => (
               <div key={i} className="flex gap-4 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{msg}</p>
               </div>
             ))}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl mt-2 border border-slate-100 dark:border-slate-700">
             <h6 className="text-[10px] font-black uppercase text-slate-400 mb-4">Equipos Específicos:</h6>
             <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                   <span className="text-[11px] font-black text-primary-950 dark:text-white">Trajes Trellchem®</span>
                   <span className="text-[9px] text-slate-500">VPS Flash, NEO y Trellcover</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                   <span className="text-[11px] font-black text-primary-950 dark:text-white">Guantes Ansell®</span>
                   <span className="text-[9px] text-slate-500">Barrier y Butyl Plus</span>
                </div>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "DOBELL SOLUTIONS",
      desc: "Desarrollo de soluciones integrales personalizadas para retos complejos de seguridad industrial.",
      shortDesc: "Innovación y consultoría a medida bajo nuestra marca propia.",
      icon: <Layers className="w-8 h-8" />,
      tag: "Integral",
      color: "from-primary-950 to-slate-800",
      content: (
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[3rem] w-full flex items-center justify-center border border-slate-100 dark:border-slate-700">
             <img 
               src="/Dobell Solutions.png" 
               alt="Dobell Solutions Logo" 
               className="max-h-40 object-contain drop-shadow-2xl"
             />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
            Bajo nuestro sello distintivo, integramos ingeniería y seguridad para crear protocolos que las empresas estándar no pueden abordar.
          </p>
          <div className="flex items-center gap-4 py-2 px-6 bg-primary-950 text-white rounded-2xl w-fit">
             <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Sello de Excelencia Propio</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen pt-40 pb-40 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="container mx-auto px-6">
        
        {/* HERO SERVICES */}
        <div className="flex flex-col lg:flex-row gap-20 items-center mb-24">
           <motion.div 
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
             className="flex-1"
           >
              <div className="inline-flex items-center gap-3 bg-accent/20 border border-accent/20 px-5 py-2 rounded-2xl mb-8">
                 <Zap className="w-4 h-4 text-accent animate-pulse" />
                 <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em] font-outfit">Operatividad Real</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black font-outfit text-primary-950 dark:text-white uppercase tracking-tighter leading-[0.9] mb-10">
                Nuestros <br />
                <span className="text-accent">Servicios</span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 max-w-md">
                Nos enfocamos en el uso correcto y mantenimiento de los EPP para garantizar una mayor duración y eficiencia operativa.
              </p>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1 }}
             className="flex-1 relative hidden lg:block"
           >
              <div className="absolute inset-0 bg-accent/10 blur-[150px] rounded-full"></div>
              <div className="relative grid grid-cols-2 gap-4">
                 <div className="aspect-square bg-slate-950 rounded-[3rem] p-10 flex flex-col justify-between border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-smooth"></div>
                    <Settings className="w-10 h-10 text-accent" />
                    <span className="text-xl font-black text-white uppercase tracking-tighter">Soporte <br />Técnico</span>
                 </div>
                 <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-[3rem] p-10 mt-12 flex flex-col justify-between border border-slate-100 dark:border-slate-700 shadow-xl group">
                    <CheckCircle2 className="w-10 h-10 text-accent" />
                    <span className="text-xl font-black text-primary-950 dark:text-white uppercase tracking-tighter shrink-0">Formación <br />Inpsasel</span>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceCards.map((card, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-primary-950/10 transition-smooth relative overflow-hidden flex flex-col items-start h-[450px]"
            >
               <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-smooth rounded-bl-[8rem]`}></div>
               
               <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:bg-accent/10 transition-smooth group-hover:rotate-6">
                  <div className="text-accent">
                    {card.icon}
                  </div>
               </div>

               <div className="mb-4">
                  <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em] px-3 py-1 bg-accent/5 rounded-full">
                    {card.tag}
                  </span>
               </div>

               <h3 className="text-2xl font-black text-primary-950 dark:text-white uppercase tracking-tighter mb-4 leading-tight">
                 {card.title}
               </h3>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 leading-relaxed">
                 {card.shortDesc}
               </p>

               <button 
                 onClick={() => setSelectedService(i)}
                 className="mt-auto flex items-center gap-3 text-[11px] font-black text-primary-950 dark:text-white uppercase tracking-widest group-hover:text-accent transition-colors bg-slate-50 dark:bg-slate-800 py-4 px-8 rounded-2xl w-full border border-slate-100 dark:border-slate-700"
               >
                 Explorar Detalle <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
            </motion.div>
          ))}
        </div>

        {/* DETAILS MODAL */}
        <AnimatePresence>
          {selectedService !== null && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedService(null)}
                className="absolute inset-0 bg-primary-950/40 backdrop-blur-md"
              ></motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 50 }}
                className="bg-white dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative z-20"
              >
                {/* Modal Header */}
                <div className="p-10 md:p-14 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                      {serviceCards[selectedService].icon}
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] font-black text-accent uppercase tracking-widest">{serviceCards[selectedService].tag}</span>
                       <h2 className="text-3xl font-black text-primary-950 dark:text-white uppercase tracking-tighter font-outfit">
                         {serviceCards[selectedService].title}
                       </h2>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedService(null)}
                    className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-100 transition-smooth group"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-10 md:p-14 custom-scrollbar">
                   {serviceCards[selectedService].content}
                </div>

                {/* Modal Footer */}
                <div className="p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                      Dobell Service C.A. <span className="w-1 h-1 rounded-full bg-slate-300"></span> Consultoría Técnica Industrial
                   </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
