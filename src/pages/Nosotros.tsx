import { ShieldCheck, Target, Users, Award, Clock, Headphones } from 'lucide-react';

export default function Nosotros() {
  return (
    <div className="flex flex-col gap-24 py-20 pb-40">
      {/* Hero Nosotros */}
      <section className="container mx-auto px-6">
        <div className="max-w-4xl flex flex-col gap-8">
          <div className="inline-flex items-center gap-3 bg-accent/20 backdrop-blur-xl border border-accent/30 px-5 py-2 rounded-2xl w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span>
            <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em]">Nuestra Historia</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-primary-950 leading-[0.95] tracking-tighter">
            Líderes en <span className="text-accent">Seguridad</span> Industrial desde 2012
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed max-w-2xl font-medium">
            En Dobell Service nos dedicamos a proveer soluciones de protección personal de la más alta calidad para las industrias más exigentes de la región.
          </p>
        </div>
      </section>

      {/* Stats/Values Grid */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { 
              icon: ShieldCheck, 
              title: "Calidad Certificada", 
              desc: "Todos nuestros productos cumplen con normativas ISO, ANSI y EN para garantizar la máxima protección." 
            },
            { 
              icon: Target, 
              title: "Enfoque Técnico", 
              desc: "No solo vendemos equipos, asesoramos técnicamente a nuestros clientes para la elección correcta según el riesgo." 
            },
            { 
              icon: Users, 
              title: "Equipo Experto", 
              desc: "Contamos con especialistas en seguridad industrial listos para brindar soporte y capacitación." 
            }
          ].map((item, i) => (
            <div key={i} className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-accent/5 transition-smooth group grow">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-accent/10 transition-smooth">
                <item.icon className="w-8 h-8 text-primary-950 group-hover:text-accent transition-smooth" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Markers Section */}
      <section className="bg-primary-950 py-32 rounded-[5rem] mx-4 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 blur-[120px] rounded-full"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="flex flex-col gap-10">
              <h2 className="text-5xl font-black uppercase tracking-tighter leading-tight">
                Nuestro Compromiso <br/> con la <span className="text-accent">Protección</span>
              </h2>
              <div className="flex flex-col gap-6">
                {[
                  "Distribución oficial de marcas líderes mundiales.",
                  "Stock permanente en categorías críticas.",
                  "Entregas inmediatas y logística eficiente.",
                  "Asesoría técnica personalizada en sitio."
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                    </div>
                    <span className="text-slate-300 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Años de Exp.", value: "12+" },
                { label: "Clientes Felices", value: "2.5k" },
                { label: "Productos", value: "2k+" },
                { label: "Marcas", value: "50+" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] flex flex-col items-center text-center grow">
                   <span className="text-4xl font-black text-accent tracking-tighter mb-2">{stat.value}</span>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
