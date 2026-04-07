import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, ShieldCheck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-950 text-slate-300 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="text-primary-950 font-black text-xl font-outfit">D</span>
              </div>
              <span className="text-white font-black text-2xl font-outfit tracking-tighter uppercase">DobellService</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Líderes en seguridad industrial y protección personal. Equipamos a los sectores minero, petrolero, construcción y mas.
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Instagram, Linkedin].map((Icon, i) => (
                <Link key={i} to="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-accent hover:text-white transition-smooth">
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Categories Quick Links */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-sm">Categorías</h4>
            <nav className="flex flex-col gap-4 text-sm font-medium">
              <Link to="/productos?categoria=manos" className="hover:text-accent transition-smooth">Guantes Industriales</Link>
              <Link to="/productos?categoria=cabeza" className="hover:text-accent transition-smooth">Cascos de Seguridad</Link>
              <Link to="/productos?categoria=auditiva" className="hover:text-accent transition-smooth">Protección Auditiva</Link>
              <Link to="/productos?categoria=arneses" className="hover:text-accent transition-smooth">Sistemas de Altura</Link>
              <Link to="/productos?categoria=calzado" className="hover:text-accent transition-smooth">Calzado de Seguridad</Link>
            </nav>
          </div>

          {/* Company Links */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-sm">Información</h4>
            <nav className="flex flex-col gap-4 text-sm font-medium">
              <Link to="/nosotros" className="hover:text-accent transition-smooth">Quienes Somos</Link>
              <Link to="/soluciones" className="hover:text-accent transition-smooth">Soluciones Industriales</Link>
              <Link to="/contacto" className="hover:text-accent transition-smooth">Contacto</Link>
              <Link to="/terminos" className="hover:text-accent transition-smooth">Términos y Condiciones</Link>
              <Link to="/privacidad" className="hover:text-accent transition-smooth">Política de Privacidad</Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-sm">Contacto</h4>
            <div className="flex flex-col gap-4 text-sm font-medium">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-accent shrink-0" />
                <span>Calle Principal #123, Complejo Industrial, Caracas, Venezuela.</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span>+58 (414) 123-4567</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span>ventas@dobellservice.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-medium">
            © {currentYear} Dobell Service C.A. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-black tracking-widest">
            <ShieldCheck className="w-4 h-4 text-accent" />
            Empresa Certificada ISO 9001
          </div>
        </div>
      </div>
    </footer>
  );
}
