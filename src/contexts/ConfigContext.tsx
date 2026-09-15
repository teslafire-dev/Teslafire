import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface ConfigContextType {
  config: Record<string, string>;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const hexToHsl = (hex: string): string => {
  hex = hex.replace(/#/g, '');
  if (hex.length === 3) hex = hex.split('').map(s => s + s).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data } = await supabase.from('configuracion').select('*');
        if (data) {
          const configMap = data.reduce((acc: any, item: any) => {
            acc[item.clave] = item.valor;
            return acc;
          }, {});
          
          setConfig(configMap);
          applyConfigStyles(configMap);
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const applyConfigStyles = (cfg: Record<string, string>) => {
    const root = document.documentElement;
    if (cfg['color_primario']) root.style.setProperty('--primary', hexToHsl(cfg['color_primario']));
    if (cfg['color_acento']) root.style.setProperty('--accent', hexToHsl(cfg['color_acento']));
  };

  return (
    <ConfigContext.Provider value={{ config, loading }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
