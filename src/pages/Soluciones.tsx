import { Building2, ShieldCheck, Zap, Factory } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

export default function Soluciones() {
  const { t } = useTranslation();

  const solutions = [
    {
      icon: <Factory className="w-12 h-12" />,
      title: t('solutions.mineria.title'),
      desc: t('solutions.mineria.desc'),
      id: "mineria"
    },
    {
      icon: <Building2 className="w-12 h-12" />,
      title: t('solutions.construccion.title'),
      desc: t('solutions.construccion.desc'),
      id: "construccion"
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: t('solutions.quimica.title'),
      desc: t('solutions.quimica.desc'),
      id: "quimica"
    },
    {
      icon: <ShieldCheck className="w-12 h-12" />,
      title: t('solutions.seguridad.title'),
      desc: t('solutions.seguridad.desc'),
      id: "seguridad"
    }
  ];

  return (
    <div className="min-h-screen pt-40 pb-40">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <span className="text-accent font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
            {t('solutions.tagline')}
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-outfit text-slate-950 dark:text-white uppercase tracking-tighter leading-none mb-6">
             {t('solutions.title').split(' ').map((word, i) => (
                word.toLowerCase().includes('sectores') || word.toLowerCase().includes('sector') || word.toLowerCase().includes('industry')
                ? <span key={i} className="text-accent underline decoration-4 decoration-accent/20 underline-offset-8">{word} </span>
                : word + ' '
             ))}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg lg:px-20 leading-relaxed">
             {t('solutions.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((sol, index) => (
            <div 
              key={sol.id} 
              className="group bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-primary-950/20 dark:hover:shadow-black/40 transition-smooth relative overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700"
              style={{ animationDelay: `${index * 150}ms` }}
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-bl-[10rem] transition-smooth group-hover:bg-accent/5"></div>
               <div className="relative z-10">
                  <div className="text-accent mb-8 bg-accent/10 w-20 h-20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-smooth">
                    {sol.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tighter mb-4">{sol.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 font-medium">
                    {sol.desc}
                  </p>
                  <button className="text-[10px] font-black text-slate-950 dark:text-white uppercase tracking-widest border-b-2 border-accent transition-smooth hover:border-accent/40 pb-1">
                    {t('solutions.cta')}
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
