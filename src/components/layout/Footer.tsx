import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Youtube, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Editable } from "../admin/Editable";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-primary-950 text-white pt-16 pb-8 md:pt-32 md:pb-20 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-12 md:mb-24">
          {/* Company Info */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-smooth shadow-xl shadow-white/5">
                <span className="text-primary-950 font-black text-2xl font-outfit">V</span>
              </div>
              <span className="text-white font-black text-2xl font-outfit tracking-tighter uppercase">Venemax<span className="text-accent">Store</span></span>
            </Link>
            <div className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
              <Editable keyName="footer_tagline">
                Especialistas en computación, accesorios para tu PC y laptop, y distribución de equipos tecnológicos.
              </Editable>
            </div>
            <div className="flex items-center gap-4">
              {[
                { icon: Instagram, url: "https://www.instagram.com/venemaxstore/" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center hover:bg-accent hover:border-accent hover:text-white transition-smooth active:scale-90"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
              <Editable keyName="footer_categories_title">Categorías</Editable>
            </h4>
            <nav className="flex flex-col gap-4">
              {[
                { key: 'footer_category_laptops', label: 'Laptops', slug: 'laptops' },
                { key: 'footer_category_desktops', label: 'Desktops', slug: 'desktops' },
                { key: 'footer_category_redes', label: 'Redes / Routers', slug: 'redes' },
                { key: 'footer_category_accessories', label: 'Accesorios', slug: 'accesorios' },
                { key: 'footer_category_printers', label: 'Impresoras', slug: 'impresoras' }
              ].map((item) => (
                <Link 
                  key={item.slug} 
                  to={`/productos?categoria=${item.slug}`} 
                  className="text-sm font-medium text-slate-400 hover:text-accent transition-smooth flex items-center gap-3 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-800 group-hover:bg-accent transition-smooth"></span>
                  <Editable keyName={item.key}>{item.label}</Editable>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
              <Editable keyName="footer_info_title">Información corporativa</Editable>
            </h4>
            <nav className="flex flex-col gap-4">
              {[
                { key: 'footer_link_about', label: 'Nosotros', to: '/nosotros' },
                { key: 'footer_link_services', label: 'Servicios', to: '/servicios' },
                { key: 'footer_link_contact', label: 'Contacto', to: '/#contacto' },
                { key: 'footer_link_terms', label: 'Términos y condiciones', to: '#' },
                { key: 'footer_link_privacy', label: 'Políticas de privacidad', to: '#' }
              ].map((item) => (
                <Link 
                  key={item.key} 
                  to={item.to} 
                  className="text-sm font-medium text-slate-400 hover:text-accent transition-smooth flex items-center gap-3 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-800 group-hover:bg-accent transition-smooth"></span>
                  <Editable keyName={item.key}>{item.label}</Editable>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
              <Editable keyName="footer_contact_title">Contacto Directo</Editable>
            </h4>
            <div className="flex flex-col gap-4 font-medium">
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-smooth">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div className="text-sm text-slate-400 leading-relaxed group-hover:text-white transition-smooth cursor-default">
                  <Editable keyName="footer_address">Av. Andrés Eloy Blanco. C. C. La Asuncion. Sector Santa Cecilia. Valencia, Venezuela</Editable>
                </div>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.open(`tel:+582418223844`, '_self')}>
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent transition-smooth">
                  <Phone className="w-5 h-5 text-accent group-hover:text-white" />
                </div>
                <span className="text-sm text-slate-400 group-hover:text-white transition-smooth">
                  <Editable keyName="footer_phone">+58 (241) 822.38.44</Editable>
                </span>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.open(`mailto:venemax1@hotmail.com`, '_self')}>
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent transition-smooth">
                  <Mail className="w-5 h-5 text-accent group-hover:text-white" />
                </div>
                <span className="text-sm text-slate-400 group-hover:text-white transition-smooth">
                  <Editable keyName="footer_email">venemax1@hotmail.com</Editable>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-medium tracking-wide">
            © {currentYear} <Editable keyName="footer_copyright">La Gran Tienda del Computador, C. A. - VENEMAX. Todos los derechos reservados.</Editable>
          </p>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl shadow-inner">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
               <Editable keyName="footer_iso">Tienda Física y Envíos Nacionales</Editable>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
