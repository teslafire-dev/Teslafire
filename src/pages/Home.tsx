import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Headphones 
} from "lucide-react";
import { categories, featuredProducts } from "@/data/mockData";
import ProductCard from "@/components/productos/ProductCard";
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col gap-24 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col bg-primary-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero.png" 
            alt="Seguridad Industrial" 
            className="w-full h-full object-cover brightness-[0.35] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-transparent to-primary-950/40"></div>
        </div>

        <div className="flex-grow flex items-center relative z-10 pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl flex flex-col gap-10 animate-in fade-in slide-in-from-left-12 duration-1000">
              <div className="inline-flex items-center gap-3 bg-accent/20 backdrop-blur-xl border border-accent/30 px-5 py-2 rounded-2xl w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-lg shadow-accent/50"></span>
                <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em]">Equipamiento Profesional</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter">
                Protección <span className="text-accent">Superior</span> para cada Desafío Industrial
              </h1>
              
              <div className="flex flex-col gap-8 max-w-2xl">
                <p className="text-xl text-slate-200 leading-relaxed font-medium tracking-wide">
                  Equipamiento certificado para las industrias más exigentes. Garantizamos seguridad de alto nivel con las marcas líderes del mercado.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl">
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">+2000 Productos Certificados</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl">
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                      <Truck className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Retiro Inmediato en Tienda</span>
                  </div>
                </div>
                
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.25em] bg-white/10 w-fit px-6 py-3 rounded-full border border-white/5">
                  Distribuidores Oficiales: <span className="text-white">Ansell • Radians • Bullard</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-6">
                <Link 
                  to="/productos" 
                  className="bg-accent hover:bg-accent/80 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 transition-all duration-300 shadow-2xl shadow-accent/40 active:scale-95"
                >
                  Explorar Catálogo <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/nosotros" 
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all duration-300 active:scale-95"
                >
                  Conocer la Empresa
                </Link>
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
                { label: "Productos", value: "2,145" },
                { label: "Marcas", value: "54" },
                { label: "Clientes", value: "15k" },
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
      <section className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-5xl font-black text-primary-950 uppercase tracking-tighter leading-none">Categorías Principales</h2>
            <p className="text-slate-500 font-medium tracking-wide">Encuentra el equipo adecuado según tu necesidad de protección profesional.</p>
          </div>
          <Link to="/productos" className="flex items-center gap-3 text-accent font-black uppercase text-xs tracking-widest hover:gap-5 transition-smooth mb-1">
            Ver todas <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/productos?categoria=${cat.slug}`}
              className="group relative h-96 rounded-[3rem] overflow-hidden shadow-2xl hover:shadow-accent/20 transition-smooth"
            >
              <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-950/20 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10">
                <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-3 block">{cat.count} Productos</span>
                <h3 className="text-3xl font-black text-white leading-none uppercase tracking-tighter">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-slate-50 py-32 rounded-[5rem] mx-4 shadow-inner">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-5xl font-black text-primary-950 uppercase tracking-tighter leading-none">Productos Destacados</h2>
              <p className="text-slate-500 font-medium tracking-wide">Selección premium de equipos con alta demanda y confiabilidad certificada.</p>
            </div>
            <Link to="/productos" className="bg-primary-950 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-smooth shadow-xl active:scale-95">
              Explorar Todo
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {featuredProducts.slice(0, 8).map((prod) => (
              <ProductCard key={prod.id} {...prod} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Markers */}
      <section className="container mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 bg-primary-950 rounded-[4rem] p-16 text-white shadow-2xl shadow-primary-950/40 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent"></div>
          {[
            { icon: ShieldCheck, title: "Certificación", desc: "Cumplimos normativas ISO, ANSI y EN." },
            { icon: Truck, title: "Envío Rápido", desc: "Entrega inmediata en tienda o despacho local." },
            { icon: Clock, title: "Disponibilidad", desc: "Monitor de stock en tiempo real 24/7." },
            { icon: Headphones, title: "Asesoría", desc: "Expertos técnicos listos para ayudarte." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-5 text-center items-center grow relative z-10 group-hover:scale-105 transition-smooth">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-accent/20 transition-smooth">
                <item.icon className="w-8 h-8 text-accent" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tighter">{item.title}</h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
