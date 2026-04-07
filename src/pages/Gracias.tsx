import { useParams, Link } from "react-router-dom";
import { 
  CheckCircle2, 
  Download, 
  MessageCircle, 
  Home, 
  ArrowRight, 
  Phone, 
  MapPin,
  Map,
  FileText
} from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function Gracias() {
  const { localizador } = useParams();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Celebration confetti
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0f172a', '#F97316']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#0f172a', '#F97316']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handleCopy = () => {
    if (localizador) {
      navigator.clipboard.writeText(localizador);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-24 flex items-center">
      <div className="container mx-auto px-6 max-w-5xl flex flex-col items-center gap-16">
        
        {/* Success Header */}
        <div className="flex flex-col items-center gap-8 text-center animate-in fade-in zoom-in duration-1000">
          <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center border-4 border-white shadow-2xl shadow-green-100/50">
            <CheckCircle2 className="w-14 h-14 text-green-600" />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-5xl md:text-7xl font-black font-outfit text-primary-950 uppercase tracking-tighter">¡Reserva Registrada!</h1>
            <p className="text-slate-500 font-medium max-w-lg text-lg leading-relaxed">Su solicitud técnica ha sido procesada con éxito. Por favor, conserve su número de localizador para el retiro.</p>
          </div>
        </div>

        {/* Localizer Card */}
        <div className="w-full bg-white rounded-[4rem] p-12 md:p-20 border border-slate-100 shadow-2xl shadow-primary-950/5 flex flex-col items-center gap-10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-smooth">
              <FileText className="w-48 h-48 text-primary-950" />
           </div>
           
           <div className="flex flex-col items-center gap-4 relative z-10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Código de Seguimiento Oficial</span>
              <div 
                onClick={handleCopy}
                className="text-5xl md:text-8xl font-black font-outfit text-primary-950 tracking-tighter cursor-pointer hover:scale-105 transition-smooth active:scale-95"
              >
                {localizador}
              </div>
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-smooth ${isCopied ? 'text-green-600' : 'text-accent'}`}
              >
                {isCopied ? "¡Copiado con éxito!" : "Haga clic para copiar localizador"}
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6 relative z-10">
              <button className="bg-primary-950 hover:bg-black text-white h-18 py-6 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 transition-smooth shadow-2xl shadow-primary-950/20 active:scale-95">
                <Download className="w-6 h-6" /> Descargar Ficha Reserva
              </button>
              <button className="bg-[#25D366] hover:bg-[#128C7E] text-white h-18 py-6 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 transition-smooth shadow-2xl shadow-green-600/20 active:scale-95">
                <MessageCircle className="w-6 h-6" /> Notificar por WhatsApp
              </button>
           </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
           {[
             { icon: Phone, title: "Confirmación", desc: "Le contactaremos en breve vía telefónica para validar los detalles del stock." },
             { icon: MapPin, title: "Punto de Retiro", desc: "Calle Principal #123, Caracas. Lunes a Viernes de 8:00 AM a 5:00 PM." },
             { icon: Map, title: "Método de Pago", desc: "Pago contra entrega en tienda. Aceptamos Divisas y medios electrónicos." }
           ].map((item, i) => (
             <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-50 flex flex-col gap-6 shadow-sm group hover:border-accent/30 transition-smooth h-full">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-accent/10 transition-smooth">
                   <item.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-black text-primary-950 font-outfit uppercase tracking-tight">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
             </div>
           ))}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center gap-8 mb-16">
           <Link 
            to="/productos" 
            className="flex items-center gap-3 text-accent font-black uppercase text-xs tracking-[0.2em] hover:gap-5 transition-smooth"
           >
             Continuar Comprando <ArrowRight className="w-5 h-5" />
           </Link>
           <Link 
            to="/" 
            className="bg-slate-200 text-slate-600 px-10 py-3 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-slate-300 transition-smooth active:scale-95"
           >
              Regresar al Inicio
           </Link>
        </div>
      </div>
    </div>
  );
}
