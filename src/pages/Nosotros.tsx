import { ShieldCheck, Target, Users, MapPin, Phone, Mail, Send, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/contexts/TranslationContext';

export default function Nosotros() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.error(t('nosotros.contact.error'), {
        style: {
          borderRadius: '1rem',
          background: '#0F172A',
          color: '#fff',
        },
      });
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-24 pt-40 pb-20 dark:bg-slate-950 transition-colors duration-500">
      {/* Hero Nosotros */}
      <section className="container mx-auto px-6">
        <div className="max-w-4xl flex flex-col gap-8">
          <div className="inline-flex items-center gap-3 bg-accent/20 backdrop-blur-xl border border-accent/30 px-5 py-2 rounded-2xl w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span>
            <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em] font-outfit">{t('nosotros.history.tag')}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-primary-950 dark:text-white leading-[0.95] tracking-tighter font-outfit">
             {t('nosotros.history.title').split(' ').map((word, i) => (
               word.toLowerCase() === 'seguridad' || word.toLowerCase() === 'safety' 
                ? <span key={i} className="text-accent">{word} </span> 
                : word + ' '
             ))}
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl font-medium">
            {t('nosotros.history.desc')}
          </p>
        </div>
      </section>

      {/* Stats/Values Grid */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { 
              icon: ShieldCheck, 
              title: t('nosotros.values.quality.title'), 
              desc: t('nosotros.values.quality.desc') 
            },
            { 
              icon: Target, 
              title: t('nosotros.values.tech.title'), 
              desc: t('nosotros.values.tech.desc') 
            },
            { 
              icon: Users, 
              title: t('nosotros.values.team.title'), 
              desc: t('nosotros.values.team.desc') 
            }
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-accent/5 transition-smooth group grow">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-accent/10 transition-smooth">
                <item.icon className="w-8 h-8 text-primary-950 dark:text-accent group-hover:text-accent transition-smooth" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-primary-950 dark:text-white font-outfit">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
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
              <h2 className="text-5xl font-black uppercase tracking-tighter leading-tight font-outfit">
                {t('nosotros.commitment.title').split(' ').map((word, i) => (
                  word.toLowerCase() === 'protección' || word.toLowerCase() === 'protection'
                   ? <span key={i} className="text-accent">{word} </span> 
                   : word + ' '
                ))}
              </h2>
              <div className="flex flex-col gap-6">
                {[
                  t('nosotros.commitment.l1'),
                  t('nosotros.commitment.l2'),
                  t('nosotros.commitment.l3'),
                  t('nosotros.commitment.l4')
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
                { label: t('nosotros.stats.years'), value: "12+" },
                { label: t('nosotros.stats.clients'), value: "2.5k" },
                { label: t('nosotros.stats.products'), value: "2k+" },
                { label: t('nosotros.stats.brands'), value: "50+" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] flex flex-col items-center text-center grow">
                   <span className="text-4xl font-black text-accent tracking-tighter mb-2 font-outfit">{stat.value}</span>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="container mx-auto px-6 mb-20 animate-in fade-in duration-1000">
         <div className="flex flex-col lg:flex-row gap-20">
            {/* Left: Contact Info */}
            <div className="lg:w-2/5 flex flex-col gap-10">
               <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-accent font-black uppercase text-[10px] tracking-[0.4em] font-outfit">
                     <MapPin className="w-4 h-4" /> {t('nosotros.contact.support')}
                  </div>
                  <h2 className="text-5xl font-black font-outfit text-primary-950 dark:text-white uppercase tracking-tighter leading-none">
                     {t('nosotros.contact.title').split(' ').map((word, i) => (
                       word === 'Soporte' || word === 'Support'
                       ? <span key={i} className="text-accent underline decoration-4 decoration-accent/20 underline-offset-8">{word}</span>
                       : word + ' '
                     ))}
                  </h2>
               </div>
               <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {t('nosotros.contact.desc')}
               </p>
               
               <div className="flex flex-col gap-6">
                  {[
                    { icon: MapPin, title: t('nosotros.contact.info.address.title'), val: t('nosotros.contact.info.address.val') },
                    { icon: Phone, title: t('nosotros.contact.info.phone.title'), val: t('nosotros.contact.info.phone.val') },
                    { icon: Mail, title: t('nosotros.contact.info.email.title'), val: t('nosotros.contact.info.email.val') }
                  ].map((inf, i) => (
                    <div key={i} className="flex gap-6 items-center p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-smooth hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-primary-950/5 group/info">
                       <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm group-hover/info:scale-110 transition-smooth">
                          <inf.icon className="w-6 h-6 text-accent" />
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{inf.title}</span>
                          <span className="text-sm font-black text-primary-950 dark:text-white uppercase tracking-tight font-outfit">{inf.val}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Right: Actual Form */}
            <div className="flex-1">
               <form onSubmit={handleContactSubmit} className="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-primary-950/5 flex flex-col gap-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-smooth duration-1000"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('nosotros.form.name')}</label>
                        <input type="text" placeholder={t('nosotros.form.name_placeholder')} required className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-accent transition-smooth dark:text-white" />
                     </div>
                     <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('nosotros.form.email')}</label>
                        <input type="email" placeholder={t('nosotros.form.email_placeholder')} required className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-accent transition-smooth dark:text-white" />
                     </div>
                  </div>

                  <div className="flex flex-col gap-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('nosotros.form.subject')}</label>
                     <input type="text" placeholder={t('nosotros.form.subject_placeholder')} required className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-accent transition-smooth dark:text-white" />
                  </div>

                  <div className="flex flex-col gap-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('nosotros.form.message')}</label>
                     <textarea rows={4} placeholder={t('nosotros.form.message_placeholder')} required className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-accent transition-smooth resize-none dark:text-white"></textarea>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className={`h-16 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 transition-smooth shadow-2xl ${isSubmitting ? 'bg-slate-100 text-slate-400' : 'bg-primary-950 dark:bg-accent text-white hover:bg-accent dark:hover:bg-primary-950 shadow-primary-950/20 active:scale-95'}`}
                  >
                     {isSubmitting ? t('nosotros.form.sending') : <>{t('nosotros.form.submit')} <Send className="w-4 h-4" /></>}
                  </button>

                  <div className="flex items-center justify-center gap-3 text-[9px] font-black text-slate-300 uppercase tracking-widest pt-2">
                     {t('nosotros.form.whatsapp_hint')} <ArrowRight className="w-3 h-3"/> WhatsApp
                  </div>
               </form>
            </div>
         </div>
      </section>
    </div>
  );
}
