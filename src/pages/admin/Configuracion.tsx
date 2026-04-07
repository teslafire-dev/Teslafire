import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  Search,
  Save, 
  RefreshCcw, 
  Smartphone, 
  Mail, 
  MapPin, 
  Type, 
  Palette,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Languages,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ConfigItem {
  id: string;
  clave: string;
  valor: string;
}

export default function Configuracion() {
  const [config, setConfig] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedCats, setExpandedCats] = useState<string[]>(['contacto', 'identidad', 'general']);
  const [searchKey, setSearchKey] = useState("");
  
  const { 
    canManageSettings, 
    loading: authLoading, 
    nombre_completo: dbNombre, 
    telefono: dbTelefono,
    updateProfile 
  } = useAuth();

  const [profileForm, setProfileForm] = useState({
    nombre_completo: "",
    telefono: ""
  });

  useEffect(() => {
    if (dbNombre !== null) setProfileForm(prev => ({ ...prev, nombre_completo: dbNombre || "" }));
    if (dbTelefono !== null) setProfileForm(prev => ({ ...prev, telefono: dbTelefono || "" }));
  }, [dbNombre, dbTelefono]);

  useEffect(() => {
    if (canManageSettings) fetchConfig();
    else setLoading(false);
  }, [canManageSettings]);

  if (authLoading) return null;

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('*')
        .order('clave');
      
      if (error) {
        toast.error("Error al cargar configuración");
      } else {
        setConfig(data || []);
      }
    } catch (err) {
      console.error("Configuracion: Error en fetchConfig:", err);
      toast.error("Error de conexión con el sistema");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (clave: string, valor: string) => {
    setConfig(prev => prev.map(item => 
      item.clave === clave ? { ...item, valor } : item
    ));
  };

  const handleSave = async (clave: string, valor: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('configuracion')
        .update({ valor, updated_at: new Date().toISOString() })
        .eq('clave', clave);

      if (error) {
        toast.error(`Error al guardar ${clave}`);
      } else {
        toast.success(`${clave} actualizado`);
      }
    } catch (err) {
      console.error("Configuracion: Error en handleSave:", err);
      toast.error("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  const getLabel = (clave: string) => {
    if (clave.startsWith('en_')) {
      return clave.replace('en_', '').replace(/_/g, '.').toUpperCase();
    }
    return clave.replace(/_/g, ' ').toUpperCase();
  };

  const toggleCat = (id: string) => {
    setExpandedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
      <RefreshCcw className="w-8 h-8 animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Sistema</span>
    </div>
  );

  const categories = [
    { id: 'contacto', name: 'Canales de Contacto', icon: Search, keys: ['email_contacto', 'telefono_whatsapp', 'direccion'] },
    { id: 'identidad', name: 'Identidad Visual (Paleta)', icon: Palette, keys: ['color_primario', 'color_acento', 'color_header', 'color_footer', 'color_body_bg', 'color_botones_bg'] },
    { id: 'hero', name: 'Contenido del Hero', icon: Type, keys: ['hero_h1', 'hero_p', 'hero_imagen_url'] },
    { id: 'general', name: 'Ajustes Generales', icon: Settings, keys: ['mostrar_resegnas', 'bcv_rate', 'whatsapp_notificaciones'] },
    { id: 'ingles', name: 'Contenido Inglés (Dynamic)', icon: Languages, keys: [
      'en_home_hero_tag',
      'en_home_hero_title',
      'en_home_hero_subtitle',
      'en_home_hero_stats_products',
      'en_home_hero_stats_delivery',
      'en_home_hero_stats_brands',
      'en_home_hero_cta_catalog',
      'en_home_hero_cta_company',
      'en_home_categories_title',
      'en_home_categories_subtitle',
      'en_home_categories_view_all',
      'en_home_featured_title',
      'en_home_featured_subtitle',
      'en_home_featured_cta',
      'en_home_trust_cert_title',
      'en_home_trust_cert_desc',
      'en_home_trust_delivery_title',
      'en_home_trust_delivery_desc',
      'en_home_trust_stock_title',
      'en_home_trust_stock_desc',
      'en_home_trust_support_title',
      'en_home_trust_support_desc',
      'en_footer_tagline',
      'en_footer_categories_title',
      'en_footer_info_title',
      'en_footer_contact_title',
      'en_footer_address',
      'en_footer_copyright',
      'en_footer_iso',
      'en_footer_link_about',
      'en_footer_link_solutions',
      'en_footer_link_contact',
      'en_footer_link_terms',
      'en_footer_link_privacy',
      'en_footer_category_gloves',
      'en_footer_category_helmets',
      'en_footer_category_hearing',
      'en_footer_category_height',
      'en_footer_category_footwear',
      'en_cart_empty_title',
      'en_cart_empty_desc',
      'en_cart_empty_cta',
      'en_cart_title',
      'en_cart_subtitle',
      'en_cart_continue_shopping',
      'en_cart_sku_label',
      'en_cart_price_quote',
      'en_cart_help_title',
      'en_cart_help_desc',
      'en_cart_chat_expert',
      'en_cart_summary_title',
      'en_cart_subtotal',
      'en_cart_total_label',
      'en_cart_quote_disclaimer',
      'en_cart_certification_label',
      'en_cart_finalize_btn',
      'en_nosotros_contact_support',
      'en_nosotros_contact_title',
      'en_nosotros_contact_desc',
      'en_nosotros_contact_info_address_title',
      'en_nosotros_contact_info_address_val',
      'en_nosotros_contact_info_phone_title',
      'en_nosotros_contact_info_phone_val',
      'en_nosotros_contact_info_email_title',
      'en_nosotros_contact_info_email_val',
      'en_nosotros_form_name',
      'en_nosotros_form_name_placeholder',
      'en_nosotros_form_email',
      'en_nosotros_form_email_placeholder',
      'en_nosotros_form_subject',
      'en_nosotros_form_subject_placeholder',
      'en_nosotros_form_message',
      'en_nosotros_form_message_placeholder',
      'en_nosotros_form_submit',
      'en_nosotros_form_whatsapp_hint',
      'en_nosotros_form_sending'
    ]},
    { id: 'social', name: 'Redes Sociales', icon: LinkIcon, keys: ['social_facebook', 'social_instagram'] }
  ];

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile(profileForm);
    if (!error) toast.success("Perfil actualizado");
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-primary-950 uppercase tracking-tighter leading-none">Mi Configuración</h1>
        <p className="text-slate-500 font-medium tracking-wide">Control centralizado de la plataforma industrial.</p>
      </div>

      <div className="flex flex-col gap-16">
        {/* PROFILE */}
        <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
           <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-accent text-white rounded-xl shadow-xl shadow-accent/20">
                <Palette className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-primary-950 uppercase tracking-tighter">Perfil de Usuario</h2>
           </div>
           <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Completo</label>
                 <input type="text" value={profileForm.nombre_completo} onChange={(e) => setProfileForm({...profileForm, nombre_completo: e.target.value})} className="w-full bg-slate-50 border border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div className="flex flex-col gap-2.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Teléfono Directo</label>
                 <input type="text" value={profileForm.telefono} onChange={(e) => setProfileForm({...profileForm, telefono: e.target.value})} className="w-full bg-slate-50 border border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                 <button disabled={saving} className="bg-primary-950 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-accent transition-smooth shadow-xl flex items-center gap-3">
                   {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Actualizar Datos
                 </button>
              </div>
           </form>
        </section>

        {/* DYNAMIC CONFIG */}
        {canManageSettings && (
          <div className="flex flex-col gap-8">
            <div className="relative mb-4">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filtrar claves de configuración (Ej: hero, en_, color...)" 
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold shadow-sm focus:ring-2 focus:ring-accent outline-none"
              />
            </div>

            {categories.map(cat => {
              const filteredKeys = cat.keys.filter(k => k.toLowerCase().includes(searchKey.toLowerCase()));
              if (searchKey && filteredKeys.length === 0) return null;
              
              const isExpanded = expandedCats.includes(cat.id) || searchKey !== "";

              return (
                <div key={cat.id} className="flex flex-col gap-6">
                  <button 
                    onClick={() => toggleCat(cat.id)}
                    className="flex items-center justify-between group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-all ${isExpanded ? 'bg-primary-950 text-accent shadow-xl shadow-primary-950/20' : 'bg-slate-100 text-slate-400'}`}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <h2 className={`text-2xl font-black uppercase tracking-tighter transition-colors ${isExpanded ? 'text-primary-950' : 'text-slate-400 group-hover:text-primary-950'}`}>
                        {cat.name}
                      </h2>
                    </div>
                    {isExpanded ? <ChevronUp className="w-6 h-6 text-slate-300" /> : <ChevronDown className="w-6 h-6 text-slate-300" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 pb-8">
                          {config
                            .filter(item => filteredKeys.includes(item.clave))
                            .map((item) => (
                              <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-5 hover:shadow-xl transition-smooth group">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{getLabel(item.clave)}</span>
                                  <button onClick={() => handleSave(item.clave, item.valor)} disabled={saving} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-primary-950 hover:text-white rounded-xl transition-smooth">
                                    <Save className="w-4 h-4" />
                                  </button>
                                </div>
                                {item.clave.startsWith('color_') ? (
                                  <div className="flex items-center gap-3">
                                    <input type="color" value={item.valor} onChange={(e) => handleChange(item.clave, e.target.value)} className="w-14 h-12 rounded-xl cursor-pointer" />
                                    <input type="text" value={item.valor} onChange={(e) => handleChange(item.clave, e.target.value)} className="flex-1 bg-slate-50 border border-slate-50 rounded-xl px-4 py-2 text-xs font-bold font-mono" />
                                  </div>
                                ) : (
                                  <textarea 
                                    rows={item.valor.length > 50 ? 3 : 1}
                                    value={item.valor} 
                                    onChange={(e) => handleChange(item.clave, e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-50 rounded-xl px-4 py-3 text-xs font-medium focus:ring-1 focus:ring-accent outline-none resize-none" 
                                  />
                                )}
                              </div>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Warning Area */}
      <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <AlertCircle className="w-8 h-8 text-accent" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">Reglas de Propagación</h2>
        </div>
        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-3xl relative z-10">
          Los cambios realizados en los bloques anteriores afectan globalmente la interfaz del usuario. 
          Al modificar la paleta de colores, asegúrese de mantener un alto contraste para cumplir con los estándares de accesibilidad industrial.
        </p>
      </div>
    </div>
  );
}
