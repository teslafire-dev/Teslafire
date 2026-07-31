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
  Settings,
  HelpCircle,
  Truck,
  Monitor
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
      title: "Garantía y Soporte Post-Venta",
      icon: <ShieldCheck className="w-10 h-10" />,
      tag: "Respaldo",
      shortDesc: "Asistencia y soporte postventa garantizado en todas tus compras.",
      color: "from-blue-500/20 to-indigo-500/20",
      content: (
        <div className="flex flex-col gap-6 text-left">
          <div className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            <Editable keyName="servicios_card0_content_p1" as="p">
              En Venemax Store no solo vendemos equipos de computación; nos aseguramos de que funcionen perfectamente a largo plazo. Ofrecemos una garantía real directa de tienda y soporte postventa para solventar cualquier inconveniente técnico o duda de configuración de tu PC o laptop.
            </Editable>
          </div>
          <div className="bg-primary-950 p-8 rounded-[3rem] border border-white/10 shadow-2xl">
             <h5 className="text-white font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-3">
                <Box className="w-4 h-4 text-accent" /> 
                <Editable keyName="servicios_card0_note_title">Nota sobre Garantías</Editable>
             </h5>
             <div className="text-slate-400 text-sm font-medium italic">
                <Editable keyName="servicios_card0_note_desc" as="p">
                  Todos nuestros equipos nuevos cuentan con garantía establecida por escrito de hasta 12 meses. Los componentes y accesorios tienen coberturas específicas de fábrica que gestionamos de forma directa para tu total tranquilidad.
                </Editable>
             </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "Capacitación IT y Asesoría Técnica",
      icon: <Users className="w-10 h-10" />,
      tag: "Formación",
      shortDesc: "Asesoramiento profesional para la elección y uso de tu infraestructura tecnológica.",
      color: "from-emerald-500/20 to-teal-500/20",
      content: (
        <div className="flex flex-col gap-8 text-left">
           <div className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
             <Editable keyName="servicios_card1_content_p1" as="p">
               Ofrecemos consultoría personalizada para la selección de equipos a nivel personal, educativo o corporativo, ayudándote a dimensionar la potencia exacta que necesitas sin sobrecostos.
             </Editable>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: '1', def: 'Asesoramiento en Laptops Corporativas' },
                { id: '2', def: 'Selección de Periféricos e Impresoras' },
                { id: '3', def: 'Capacitación en Sistemas y Software básico' },
                { id: '4', def: 'Seguridad en Dispositivos Locales' },
                { id: '5', def: 'Optimización de Rendimiento en Equipos de Oficina' }
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
      title: "Mantenimiento Preventivo y Reparación",
      icon: <Settings className="w-10 h-10" />,
      tag: "Hardware y Software",
      shortDesc: "Servicios de limpieza interna profunda, cambio de pasta térmica e instalación de sistemas.",
      color: "from-orange-500/20 to-rose-500/20",
      content: (
        <div className="flex flex-col gap-8 text-left">
           <div className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
             <Editable keyName="servicios_card2_content_p1" as="p">
               Prolonga la vida útil de tus equipos de computación. Contamos con un taller especializado en Valencia para diagnósticos rápidos y reparaciones efectivas de fallas de hardware y software.
             </Editable>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {id: 1, t: 'Mantenimiento Físico', d: 'Limpieza de ventiladores, disipadores y cambio de pasta térmica de alta calidad.'},
                {id: 2, t: 'Instalación de Software', d: 'Formateo, instalación y configuración del sistema operativo y suites de oficina.'},
                {id: 3, t: 'Actualización de Componentes', d: 'Aumento de memoria RAM, cambio de disco HDD a SSD para una máxima velocidad.'},
                {id: 4, t: 'Desinfección de Virus', d: 'Limpieza profunda de malware y configuración de antivirus corporativos.'},
                {id: 5, t: 'Diagnóstico en Placa', d: 'Detección de cortos y fallas a nivel de microsoldadura y componentes de poder.'}
              ].map((item) => (
                <div key={item.id} className="flex flex-col gap-2 p-6 bg-primary-950 rounded-3xl border border-white/5 text-left">
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
      title: "Instalación y Optimización de Redes",
      icon: <Zap className="w-10 h-10" />,
      tag: "Conectividad",
      shortDesc: "Diseño y configuración de redes WiFi de alta fidelidad, extensores y cableado estructurado.",
      color: "from-sky-500/20 to-blue-500/20",
      content: (
        <div className="flex flex-col gap-8 text-left">
           <div className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
             <Editable keyName="servicios_card3_content_p1" as="p">
               Mejora la velocidad de internet en tu hogar u oficina. Instalamos y configuramos routers, switches, puntos de acceso y repetidores inalámbricos de las marcas Xiaomi y Mercusys para eliminar zonas sin señal.
             </Editable>
           </div>
           <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
              <div className="md:col-span-8 flex flex-col gap-4">
                 <h5 className="text-xl font-black text-primary-950 dark:text-white uppercase tracking-tighter">
                   <Editable keyName="servicios_card3_kit_title">Redes WiFi Corporativas</Editable>
                 </h5>
                 <div className="text-slate-500 text-sm font-medium">
                   <Editable keyName="servicios_card3_kit_desc" as="p">Optimizamos la topología física y lógica de red para evitar interferencias y caídas frecuentes de tus sistemas informáticos.</Editable>
                 </div>
              </div>
              <div className="md:col-span-4 flex flex-col gap-2">
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                   <Editable keyName="servicios_card3_models_label">Soporte Inalámbrico</Editable>
                 </span>
                 <div className="flex flex-col gap-1">
                    {[
                      {id: 1, text: 'Routers Xiaomi 4C'}, 
                      {id: 2, text: 'Equipos Mercusys'}, 
                      {id: 3, text: 'Extensores de Señal'}
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
      title: "Logística y Envíos Nacionales",
      icon: <Truck className="w-10 h-10" />,
      tag: "Seguridad",
      shortDesc: "Empaquetado especializado de seguridad y envíos rápidos a nivel nacional.",
      color: "from-red-500/20 to-orange-500/20",
      content: (
        <div className="flex flex-col gap-8 text-left">
           <div className="bg-emerald-50 dark:bg-emerald-950/20 p-8 rounded-[3rem] border border-emerald-100 dark:border-slate-800 shadow-2xl">
              <h5 className="text-emerald-600 dark:text-emerald-400 font-black uppercase text-xs tracking-widest mb-3">
                <Editable keyName="servicios_card4_warn_title">Entregas Aseguradas</Editable>
              </h5>
              <div className="text-emerald-900/70 dark:text-emerald-300/60 text-lg font-black italic tracking-tight">
                <Editable keyName="servicios_card4_warn_desc" as="p">
                  “Garantizamos que tus equipos delicados (pantallas, monitores, tarjetas de video, laptops) viajen con doble empaque protector burbuja y estén 100% asegurados ante pérdidas.”
                </Editable>
              </div>
           </div>
           <div className="flex flex-col gap-4">
              <h5 className="text-sm font-black text-primary-950 dark:text-white uppercase tracking-widest">
                <Editable keyName="servicios_card4_plan_title">Agencias de Envío Disponibles</Editable>
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                 {[
                   {id: 1, text: 'Zoom (Envíos Asegurados)'},
                   {id: 2, text: 'Tealca'},
                   {id: 3, text: 'MRW'},
                   {id: 4, text: 'Delivery local (Valencia)'},
                   {id: 5, text: 'Retiro directo por tienda'}
                 ].map((step) => (
                    <div key={step.id} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                       <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center text-[10px] font-black">{step.id}</span>
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
      title: "Consultoría y Servidores",
      icon: <Monitor className="w-10 h-10" />,
      tag: "Corporativo",
      shortDesc: "Dimensionamiento IT y servidores de alto rendimiento para bases de datos y archivos.",
      color: "from-primary-500/20 to-accent/20",
      content: (
        <div className="flex flex-col gap-10 text-left">
           <div className="flex flex-col gap-6">
              <div className="text-xl text-primary-950 dark:text-white font-black uppercase tracking-tighter leading-tight">
                <Editable keyName="servicios_card5_content_p1" as="p">
                  Apoyamos a tu empresa en la estructuración de servidores físicos Dell PowerEdge, sistemas de almacenamiento de red NAS y optimización de bases de datos locales.
                </Editable>
              </div>
              <div className="inline-flex items-center gap-4 bg-accent text-white px-8 py-4 rounded-2xl w-fit font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-accent/40">
                 <CheckCircle2 className="w-5 h-5" /> <Editable keyName="servicios_card5_badge">Infraestructura de Servidores</Editable>
              </div>
           </div>
           
           <div className="relative h-64 rounded-[4rem] overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80" className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 transition-all duration-1000" alt="Servidores de Tecnología" />
              <div className="absolute inset-0 bg-primary-950/40 group-hover:bg-transparent transition-colors"></div>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-20 pb-32 bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden text-left relative">
      
      {/* Dynamic Blue Header Cut */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-primary diagonal-cut z-0 pointer-events-none">
        <div className="absolute inset-0 industrial-dots opacity-40"></div>
      </div>

      {/* Hero Header */}
      <section className="container mx-auto px-6 relative z-10 pt-44">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6 max-w-4xl"
          >
            <div className="inline-flex items-center gap-3 bg-accent/10 border border-accent/20 px-6 py-3 rounded-full w-fit mb-4">
              <Editable keyName="servicios_hero_tag" className="text-accent text-[10px] font-black uppercase tracking-[0.4em] font-outfit">
                Tecnología y Conectividad
              </Editable>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter font-outfit uppercase drop-shadow-lg text-left">
              <Editable keyName="servicios_hero_title_top" as="span">Servicios</Editable> <br />
              <Editable keyName="servicios_hero_title_accent" as="span" className="text-accent underline decoration-8 decoration-accent/10 underline-offset-[12px]">Tecnológicos</Editable>
            </h1>
            <Editable 
              keyName="servicios_hero_subtitle" 
              as="p" 
              className="text-xl text-slate-100/80 leading-relaxed font-medium mt-4 max-w-xl text-left" 
            >
              Ofrecemos soporte técnico calificado, mantenimiento integral de hardware, estructuración de redes y consultoría informática para hogares y empresas.
            </Editable>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
             {/* Card 1: Soporte Técnico */}
             <div className="hidden md:flex flex-col gap-3 p-8 bg-white dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl group hover:border-accent/50 transition-all duration-700 hover:-translate-y-2 hover:-rotate-1 text-left">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-accent/10 rounded-xl group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                      <Settings className="w-5 h-5 text-accent group-hover:text-white" />
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent">Taller</span>
                </div>
                <h4 className="text-2xl font-black text-primary-950 dark:text-white uppercase tracking-tighter leading-none">
                  <Editable keyName="servicios_hero_card1">Soporte Técnico</Editable>
                </h4>
                <div className="w-12 h-1 bg-slate-200 dark:bg-white/10 rounded-full group-hover:w-full group-hover:bg-accent transition-all duration-700"></div>
             </div>

             {/* Card 2: Formación */}
             <div className="hidden md:flex flex-col gap-3 p-8 bg-primary-950 rounded-[2.5rem] border border-accent/20 shadow-2xl group hover:border-accent transition-all duration-700 hover:-translate-y-2 hover:rotate-1 text-left">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-accent/20 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent/80">Calidad</span>
                </div>
                <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                  <Editable keyName="servicios_hero_card2">Soporte Corporativo</Editable>
                </h4>
                <div className="flex gap-1 mt-1">
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className="w-4 h-1 bg-accent/20 rounded-full"></div>
                   ))}
                </div>
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
                   <div className="text-left">
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
