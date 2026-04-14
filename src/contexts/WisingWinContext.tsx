import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface WisingWinContextType {
  isActive: boolean;
  toggleActive: () => void;
  updateValue: (key: string, value: string) => Promise<void>;
  updateStyle: (key: string, property: string, value: string, lang: string) => Promise<void>;
  getStyle: (key: string, property: string, lang: string) => string | undefined;
  dbConfig: Record<string, any>;
  refreshConfig: () => Promise<void>;
  loading: boolean;
}

const WisingWinContext = createContext<WisingWinContextType | undefined>(undefined);

export function WisingWinProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [dbConfig, setDbConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin');

  const refreshConfig = async () => {
    try {
      const { data, error } = await supabase.from('configuracion').select('clave, valor');
      if (!error && data) {
        const config: Record<string, any> = {};
        data.forEach(item => {
          try {
            // Intentar parsear si es JSON (para objetos complejos como colores/estilos)
            config[item.clave] = item.valor.startsWith('{') || item.valor.startsWith('[') 
              ? JSON.parse(item.valor) 
              : item.valor;
          } catch {
            config[item.clave] = item.valor;
          }
        });
        setDbConfig(config);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const toggleActive = () => {
    if (!isAdmin) {
      toast.error('Acceso denegado');
      return;
    }
    setIsActive(!isActive);
  };

  const updateValue = async (key: string, value: string) => {
    const { error } = await supabase
      .from('configuracion')
      .upsert({ clave: key, valor: value }, { onConflict: 'clave' });

    if (error) throw error;
    setDbConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateStyle = async (key: string, property: string, value: string, lang: string) => {
    const langPrefix = lang.toLowerCase();
    const styleKey = `${langPrefix}_style_${key}_${property}`;
    await updateValue(styleKey, value);
  };

  const getStyle = (key: string, property: string, lang: string) => {
    const langPrefix = lang.toLowerCase();
    return dbConfig[`${langPrefix}_style_${key}_${property}`];
  };

  return (
    <WisingWinContext.Provider value={{ 
      isActive, 
      toggleActive, 
      updateValue, 
      updateStyle, 
      getStyle,
      dbConfig,
      refreshConfig,
      loading
    }}>
      {children}
    </WisingWinContext.Provider>
  );
}

export function useWisingWin() {
  const context = useContext(WisingWinContext);
  if (!context) throw new Error('useWisingWin must be used within a WisingWinProvider');
  return context;
}
