import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, ShieldCheck, ArrowRight } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { motion } from "framer-motion";

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
                <span className="text-primary-950 font-black text-2xl font-outfit">D</span>
              </div>
              <span className="text-white font-black text-2xl font-outfit tracking-tighter uppercase">Dobell<span className="text-accent">Service</span></span>
            </Link>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Instagram, Linkedin].map((Icon, i) => (
                <Link key={i} to="#" className="w-11 h-11 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center hover:bg-accent hover:border-accent hover:text-white transition-smooth active:scale-90">
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Categories Quick Links */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{t('footer.categories.title')}</h4>
            <nav className="flex flex-col gap-4">
              {[
                { key: 'footer.category.gloves', slug: 'manos' },
                { key: 'footer.category.helmets', slug: 'cabeza' },
                { key: 'footer.category.hearing', slug: 'auditiva' },
                { key: 'footer.category.height', slug: 'arneses' },
                { key: 'footer.category.footwear', slug: 'calzado' }
              ].map((item) => (
                <Link 
                  key={item.slug} 
                  to={`/productos?categoria=${item.slug}`} 
                  className="text-sm font-medium text-slate-400 hover:text-accent transition-smooth flex items-center gap-3 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-800 group-hover:bg-accent transition-smooth"></span>
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company Links */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{t('footer.info.title')}</h4>
            <nav className="flex flex-col gap-4">
              {[
                { key: 'footer.link.about', to: '/nosotros' },
                { key: 'footer.link.services', to: '/servicios' },
                { key: 'footer.link.contact', to: '/nosotros#contacto' },
                { key: 'footer.link.terms', to: '#' },
                { key: 'footer.link.privacy', to: '#' }
              ].map((item) => (
                <Link 
                  key={item.key} 
                  to={item.to} 
                  className="text-sm font-medium text-slate-400 hover:text-accent transition-smooth flex items-center gap-3 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-800 group-hover:bg-accent transition-smooth"></span>
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{t('footer.contact.title')}</h4>
            <div className="flex flex-col gap-4 font-medium">
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-smooth">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm text-slate-400 leading-relaxed group-hover:text-white transition-smooth cursor-default">{t('footer.address')}</span>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.open(`tel:${t('footer.phone').replace(/\s/g, '')}`, '_self')}>
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent transition-smooth">
                  <Phone className="w-5 h-5 text-accent group-hover:text-white" />
                </div>
                <span className="text-sm text-slate-400 group-hover:text-white transition-smooth">{t('footer.phone')}</span>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.open(`mailto:${t('footer.email')}`, '_self')}>
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent transition-smooth">
                  <Mail className="w-5 h-5 text-accent group-hover:text-white" />
                </div>
                <span className="text-sm text-slate-400 group-hover:text-white transition-smooth">{t('footer.email')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-medium tracking-wide">
            © {currentYear} {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl shadow-inner">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
               {t('footer.iso')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
