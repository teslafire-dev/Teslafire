import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
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

  useEffect(() => {
    fetchConfig();
  }, []);

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

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-primary-950 uppercase tracking-tighter">Configuración Global</h1>
        <p className="text-slate-500 font-medium tracking-wide">Gestione los parámetros de contacto, identidad y notificaciones de la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {config.map((item) => (
          <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-smooth">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-accent group-hover:text-white transition-smooth">
                  {getIcon(item.clave)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{getLabel(item.clave)}</span>
                  <span className="text-xs font-bold text-primary-950 uppercase tracking-tight">Parámetro del Sistema</span>
                </div>
              </div>
              <button 
                onClick={() => handleSave(item.clave, item.valor)}
                disabled={saving}
                className="p-3 bg-slate-50 text-slate-400 hover:bg-primary-950 hover:text-white rounded-xl transition-smooth disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                value={item.valor}
                onChange={(e) => handleChange(item.clave, e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-accent outline-none transition-smooth"
                placeholder={`Ingrese ${getLabel(item.clave)}...`}
              />
              {item.clave === 'telefono_whatsapp' && (
                <div className="flex items-center gap-2 px-1 text-[9px] font-black text-accent uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Este número recibirá las notificaciones de nuevos pedidos vía WhatsApp.
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Info Card */}
        <div className="bg-primary-950 p-10 rounded-[3rem] text-white flex flex-col gap-6 relative overflow-hidden group lg:col-span-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-smooth duration-700"></div>
          <div className="flex items-center gap-4 relative z-10">
            <AlertCircle className="w-8 h-8 text-accent" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Protocolo de Notificaciones</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl relative z-10">
            Los cambios en esta sección impactan en tiempo real la forma en que los clientes se comunican con el equipo de ventas. 
            Asegúrese de que el número de WhatsApp incluya el código de país (Ej: +584141234567) para evitar errores de conexión.
          </p>
        </div>
      </div>
    </div>
  );
}
