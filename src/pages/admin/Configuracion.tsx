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
  Link as LinkIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface ConfigItem {
  id: string;
  clave: string;
  valor: string;
}

export default function Configuracion() {
  const [config, setConfig] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { canManageSettings, loading: authLoading } = useAuth();

  useEffect(() => {
    if (canManageSettings) fetchConfig();
  }, [canManageSettings]);

  if (authLoading) return null;

  if (!canManageSettings) return (
    <div className="p-24 text-center flex flex-col items-center gap-8 animate-in fade-in duration-1000">
      <div className="w-24 h-24 bg-red-100 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-2xl">
        <Palette className="w-12 h-12 text-red-600" />
      </div>
      <h2 className="text-4xl font-black text-primary-950 uppercase tracking-tighter">Acceso Restringido</h2>
      <p className="text-slate-500 font-medium max-w-md uppercase tracking-widest text-[10px]">Solo los Administradores de Nivel 1 pueden gestionar la configuración global y visual.</p>
    </div>
  );

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

  const getIcon = (clave: string) => {
    if (clave.includes('whatsapp')) return <Smartphone className="w-4 h-4" />;
    if (clave.includes('email')) return <Mail className="w-4 h-4" />;
    if (clave.includes('direccion')) return <MapPin className="w-4 h-4" />;
    if (clave.includes('hero')) return <Type className="w-4 h-4" />;
    if (clave.includes('color')) return <Palette className="w-4 h-4" />;
    if (clave.includes('social')) return <LinkIcon className="w-4 h-4" />;
    return <RefreshCcw className="w-4 h-4" />;
  };

  const getLabel = (clave: string) => {
    return clave.replace(/_/g, ' ').toUpperCase();
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
    { id: 'social', name: 'Redes Sociales', icon: LinkIcon, keys: ['social_facebook', 'social_instagram'] }
  ];

  const isColorKey = (clave: string) => clave.startsWith('color_');

  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-primary-950 uppercase tracking-tighter">Personalización Dobell</h1>
          <p className="text-slate-500 font-medium tracking-wide">Gestione la identidad visual y los canales operativos de la empresa.</p>
        </div>
      </div>

      <div className="flex flex-col gap-16">
        {categories.map(cat => (
          <div key={cat.id} className="flex flex-col gap-8">
            <div className="flex items-center gap-4 relative">
              <div className="p-3 bg-primary-950 text-accent rounded-xl shadow-xl">
                <cat.icon className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-primary-950 uppercase tracking-tighter">{cat.name}</h2>
              <div className="flex-1 h-[1px] bg-slate-100 ml-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config
                .filter(item => cat.keys.includes(item.clave))
                .map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-5 hover:shadow-xl transition-smooth group">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{getLabel(item.clave)}</span>
                        <span className="text-[10px] font-bold text-primary-950 uppercase tracking-tight">Activo</span>
                      </div>
                      <button 
                        onClick={() => handleSave(item.clave, item.valor)}
                        disabled={saving}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:bg-primary-950 hover:text-white rounded-xl transition-smooth disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {isColorKey(item.clave) ? (
                        <div className="flex items-center gap-4">
                          <input 
                            type="color" 
                            value={item.valor}
                            onChange={(e) => handleChange(item.clave, e.target.value)}
                            className="w-16 h-12 rounded-xl cursor-pointer border-0 bg-transparent ring-1 ring-slate-100 overflow-hidden"
                          />
                          <input 
                            type="text" 
                            value={item.valor}
                            onChange={(e) => handleChange(item.clave, e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-50 rounded-xl px-4 py-2 text-xs font-bold font-mono outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          value={item.valor}
                          onChange={(e) => handleChange(item.clave, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-50 rounded-xl px-4 py-3 text-xs font-medium focus:ring-1 focus:ring-accent outline-none transition-smooth"
                        />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
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
