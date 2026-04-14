import { 
  ShieldCheck, 
  Users, 
  Target, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Box, 
  Send,
  X,
  ArrowUpRight,
  Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/contexts/TranslationContext';
import { Editable } from '@/components/admin/Editable';

export default function Servicios() {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      id: 0,
      title: "Asesoría y Servicio Post-Venta",
      icon: <ShieldCheck className="w-10 h-10" />,
      tag: "Continuidad",
      shortDesc: "Programas de conservación auditiva y protección respiratoria adaptables.",
      color: "from-blue-500/20 to-indigo-500/20",
      content: (
        <div className="flex flex-col gap-6">
          <div className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            <Editable keyName="servicios_card0_content_p1" as="p">
              Tenemos a su disposición los programas de conservación auditiva y protección respiratoria adaptables a cualquier centro de trabajo...
            </Editable>
          </div>
          <div className="bg-primary-950 p-8 rounded-[3rem] border border-white/10 shadow-2xl">
             <h5 className="text-white font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-3">
                <Box className="w-4 h-4 text-accent" /> 
                <Editable keyName="servicios_card0_note_title">Nota para Clientes Moldex</Editable>
             </h5>
             <div className="text-slate-400 text-sm font-medium italic">
                <Editable keyName="servicios_card0_note_desc" as="p">
                  Ambos programas están a disposición de los clientes que mantienen un consumo importante...
                </Editable>
             </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "Entrenamiento y Capacitación",
      icon: <Users className="w-10 h-10" />,
      tag: "Formación",
      shortDesc: "Personal certificado por INPSASEL con alta experiencia industrial.",
      color: "from-emerald-500/20 to-teal-500/20",
      content: (
        <div className="flex flex-col gap-8">
           <div className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
             <Editable keyName="servicios_card1_content_p1" as="p">
               Contamos con personal entrenado, capacitado y certificado (INPSASEL)...
             </Editable>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: '1', def: 'Capacitación Técnica Moldex' },
                { id: '2', def: 'Entrenamiento Uso Correcto EPP' },
                { id: '3', def: 'Protección Auditiva Industrial' },
                { id: '4', def: 'Protección Visual Avanzada' },
                { id: '5', def: 'Riesgos Mecánicos' }
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-accent transition-colors">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                   <span className="text-xs font-black uppercase tracking-widest text-primary-950 dark:text-white">
                      <Editable keyName={`servicios_card1_item${item.id}`}>{item.def}</Editable>
                   </span>
                </div>
              ))}
           </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Programa AnsellGUARDIAN®",
      icon: <Target className="w-10 h-10" />,
      tag: "Exclusivo",
      shortDesc: "Optimización operativa a través de 100 años de experiencia.",
      color: "from-orange-500/20 to-rose-500/20",
      content: (
        <div className="flex flex-col gap-8">
           <div className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
             <Editable keyName="servicios_card2_content_p1" as="p">
               Programa internacional enfocado en hacer que los trabajadores estén más seguros...
             </Editable>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {id: 1, t: 'Costos', d: 'Elección adecuada para máxima duración.'},
                {id: 2, t: 'Estandarización', d: 'Mismos productos para aplicaciones similares.'},
                {id: 3, t: 'Prevención', d: 'Reducción de riesgo y costo de accidentes.'},
                {id: 4, t: 'Controles', d: 'Optimización de dispensación y uso.'},
                {id: 5, t: 'Productividad', d: 'Mejora de producción y cero desperdicios.'}
              ].map((item) => (
                <div key={item.id} className="flex flex-col gap-2 p-6 bg-primary-950 rounded-3xl border border-white/5">
                   <span className="text-accent text-[10px] font-black uppercase tracking-widest">
                      <Editable keyName={`servicios_card2_feat${item.id}_t`}>{item.t}</Editable>
                   </span>
                   <span className="text-white text-xs font-medium">
                      <Editable keyName={`servicios_card2_feat${item.id}_d`}>{item.d}</Editable>
                   </span>
                </div>
              ))}
           </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Pruebas de Sello",
      icon: <Zap className="w-10 h-10" />,
      tag: "Técnico",
      shortDesc: "Verificación periódica para usuarios de la marca Moldex.",
      color: "from-sky-500/20 to-blue-500/20",
      content: (
        <div className="flex flex-col gap-8">
           <div className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
             <Editable keyName="servicios_card3_content_p1" as="p">
               Ofrecemos pruebas de sello en planta para verificar periódicamente...
             </Editable>
           </div>
           <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 flex flex-col gap-4">
                 <h5 className="text-xl font-black text-primary-950 dark:text-white uppercase tracking-tighter">
                   <Editable keyName="servicios_card3_kit_title">Kit de Ajuste BITREX®</Editable>
                 </h5>
                 <div className="text-slate-500 text-sm font-medium">
                   <Editable keyName="servicios_card3_kit_desc" as="p">Cumple con los estándares de OSHA...</Editable>
                 </div>
                 <button className="flex items-center gap-3 text-accent font-black uppercase text-[10px] tracking-widest hover:translate-x-2 transition-transform">
                   <Editable keyName="servicios_card3_kit_cta">Bajar Hoja de Datos</Editable> <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
              <div className="md:col-span-4 flex flex-col gap-2">
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                   <Editable keyName="servicios_card3_models_label">Modelos Disponibles</Editable>
                 </span>
                 <div className="flex flex-col gap-1">
                    {[
                      {id: 1, text: 'Kit 0102'}, 
                      {id: 2, text: 'Nebulizador 0301'}, 
                      {id: 3, text: 'Solución 0503'}
                    ].map((m) => (
                      <span key={m.id} className="text-xs font-bold text-primary-950 dark:text-white">
                        <Editable keyName={`servicios_card3_mod${m.id}`}>{m.text}</Editable>
                      </span>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Protección Contra Amoniaco",
      icon: <ShieldCheck className="w-10 h-10" />,
      tag: "Crítico",
      shortDesc: "Planes de respuesta ante gases químicos extremadamente peligrosos.",
      color: "from-red-500/20 to-orange-500/20",
      content: (
        <div className="flex flex-col gap-8">
           <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-[3rem] border border-red-100 dark:border-red-900 shadow-2xl">
              <h5 className="text-red-600 dark:text-red-400 font-black uppercase text-xs tracking-widest mb-3">
                <Editable keyName="servicios_card4_warn_title">Riesgo de Salud Extremo</Editable>
              </h5>
              <div className="text-red-900/70 dark:text-red-300/60 text-lg font-black italic tracking-tight">
                <Editable keyName="servicios_card4_warn_desc" as="p">
                  “El amoníaco es un gas corrosivo considerado un alto riesgo porque daña piel, ojos y pulmones de forma irreversible.”
                </Editable>
              </div>
           </div>
           <div className="flex flex-col gap-4">
              <h5 className="text-sm font-black text-primary-950 dark:text-white uppercase tracking-widest">
                <Editable keyName="servicios_card4_plan_title">Abordaje del Plan de Respuesta</Editable>
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                 {[
                   {id: 1, text: 'Auditoría diagnóstica de almacenamiento'},
                   {id: 2, text: 'Acondicionamiento de cuartos de seguridad'},
                   {id: 3, text: 'Capacitación de personal de inspección'},
                   {id: 4, text: 'Equipamiento de intervención ante emergencias'},
                   {id: 5, text: 'Determinación de zonas de riesgo'}
                 ].map((step) => (
                    <div key={step.id} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                       <span className="w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center text-[10px] font-black">{step.id}</span>
                       <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider leading-tight">
                         <Editable keyName={`servicios_card4_plan_item${step.id}`}>{step.text}</Editable>
                       </span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )
    },
    {
      id: 5,
      title: "DOBELL SOLUTIONS",
      icon: <Send className="w-10 h-10" />,
      tag: "Integral",
      shortDesc: "Innovación y consultoría a medida bajo nuestra marca propia.",
      color: "from-primary-500/20 to-accent/20",
      content: (
        <div className="flex flex-col gap-10">
           <div className="flex flex-col gap-6">
              <div className="text-xl text-primary-950 dark:text-white font-black uppercase tracking-tighter leading-tight">
                <Editable keyName="servicios_card5_content_p1" as="p">
                  Bajo nuestro sello distintivo, integramos ingeniería y seguridad para crear protocolos que las empresas estándar no pueden abordar.
                </Editable>
              </div>
              <div className="inline-flex items-center gap-4 bg-accent text-white px-8 py-4 rounded-2xl w-fit font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-accent/40">
                 <CheckCircle2 className="w-5 h-5" /> <Editable keyName="servicios_card5_badge">Sello de Excelencia Propio</Editable>
              </div>
           </div>
           
           <div className="relative h-64 rounded-[4rem] overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80" className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 transition-all duration-1000" alt="Dobell Solutions" />
              <div className="absolute inset-0 bg-primary-950/40 group-hover:bg-transparent transition-colors"></div>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-20 pt-44 pb-32 bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden text-left">
      
      {/* Hero Header */}
      <section className="container mx-auto px-6 relative">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6 max-w-4xl"
          >
            <div className="inline-flex items-center gap-3 bg-accent/10 border border-accent/20 px-6 py-3 rounded-full w-fit mb-4">
              <Editable keyName="servicios_hero_tag" className="text-accent text-[10px] font-black uppercase tracking-[0.4em] font-outfit">
                Ingeniería en Seguridad
              </Editable>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-primary-950 dark:text-white leading-[0.9] tracking-tighter font-outfit uppercase">
              <Editable keyName="servicios_hero_title_top" as="span">Servicios</Editable> <br />
              <Editable keyName="servicios_hero_title_accent" as="span" className="text-accent underline decoration-8 decoration-accent/10 underline-offset-[12px]">Certificados</Editable>
            </h1>
            <Editable 
              keyName="servicios_hero_subtitle" 
              as="p" 
              className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-4 max-w-xl" 
            >
              Ofrecemos asesoramiento técnico integral y programas de capacitación especializada para garantizar la máxima seguridad en sus operaciones industriales.
            </Editable>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-3"
          >
             <div className="hidden md:flex items-center gap-6 bg-slate-50 dark:bg-slate-900 px-8 py-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl group hover:border-accent transition-colors">
                <Settings className="w-5 h-5 text-accent group-hover:rotate-90 transition-transform" />
                <span className="text-[9px] font-black text-slate-400 group-hover:text-primary-950 dark:group-hover:text-white uppercase tracking-widest text-left">
                  <Editable keyName="servicios_hero_card1">Soporte Técnico</Editable>
                </span>
             </div>
             <div className="hidden md:flex items-center gap-6 bg-slate-950 px-8 py-4 rounded-[2rem] border border-white/5 shadow-2xl group hover:border-accent transition-colors">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-left">
                  <Editable keyName="servicios_hero_card2">Formación Inpsasel</Editable>
                </span>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-slate-50 dark:bg-slate-900 rounded-[3.5rem] p-10 border border-slate-100 dark:border-slate-800 hover:border-accent transition-all duration-500 flex flex-col h-full text-left"
            >
              <div className="w-16 h-16 bg-white dark:bg-slate-950 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:rotate-6 transition-transform">
                <div className="text-accent">{service.icon}</div>
              </div>
              <div className="mb-4">
                 <span className="text-[9px] font-black uppercase text-accent tracking-[0.2em] bg-accent/5 px-3 py-1 rounded-full">
                    <Editable keyName={`servicios_card${service.id}_tag`}>
                      {service.tag}
                    </Editable>
                 </span>
              </div>
              <h3 className="text-2xl font-black text-primary-950 dark:text-white uppercase tracking-tighter mb-4 leading-tight">
                <Editable keyName={`servicios_card${service.id}_title`}>
                  {service.title}
                </Editable>
              </h3>
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-10">
                <Editable keyName={`servicios_card${service.id}_shortDesc`} as="p">
                  {service.shortDesc}
                </Editable>
              </div>
              <button 
                onClick={() => setSelectedService(i)}
                className="mt-auto flex items-center justify-between w-full bg-primary-950 text-white px-8 py-5 rounded-2xl font-black uppercase text-[9px] tracking-widest group-hover:bg-accent transition-colors"
              >
                <Editable keyName="servicios_cta_explore">Explorar Detalle</Editable> <ArrowUpRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedService !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-primary-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-white dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-[4rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                      {services[selectedService].icon}
                   </div>
                   <div>
                      <span className="text-[10px] font-black uppercase text-accent tracking-widest">{services[selectedService].tag}</span>
                      <h2 className="text-2xl font-black text-primary-950 dark:text-white uppercase tracking-tighter">{services[selectedService].title}</h2>
                   </div>
                </div>
                <button onClick={() => setSelectedService(null)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition-colors">
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>
              <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
                {services[selectedService].content}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
