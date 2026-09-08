import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface CurrencyContextType {
  usdRate: number;
  eurRate: number;
  usdMarkupSelected: number;
  eurMarkupSelected: number;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  usdRate: 0,
  eurRate: 0,
  usdMarkupSelected: 0,
  eurMarkupSelected: 0,
  loading: true,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usdRate, setUsdRate] = useState(0);
  const [eurRate, setEurRate] = useState(0);
  const [usdMarkupSelected, setUsdMarkupSelected] = useState(0);
  const [eurMarkupSelected, setEurMarkupSelected] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);

        // 1. Configuración desde la BD (Markups y Posibles overrides)
        const { data: configData } = await supabase
          .from('configuracion')
          .select('clave, valor')
          .in('clave', ['markup_bcv_usd', 'markup_bcv_eur']);

        let markupUsd = 0;
        let markupEur = 0;

        if (configData) {
          const usdConf = configData.find(c => c.clave === 'markup_bcv_usd');
          const eurConf = configData.find(c => c.clave === 'markup_bcv_eur');
          
          if (usdConf) markupUsd = parseFloat(usdConf.valor) || 0;
          if (eurConf) markupEur = parseFloat(eurConf.valor) || 0;
        }

        setUsdMarkupSelected(markupUsd);
        setEurMarkupSelected(markupEur);

        // 2. Obtener la tasa oficial desde Supabase o API pública libre de CORS
        let rates = { usd: 804.81, eur: 875.20 };
        try {
          const { data: tasaDb } = await supabase
            .from('tasas_cambio')
            .select('tasa')
            .order('created_at', { ascending: false })
            .limit(1);

          if (tasaDb && tasaDb.length > 0 && tasaDb[0].tasa) {
            rates.usd = parseFloat(tasaDb[0].tasa) || 804.81;
          } else {
            const resp = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', { cache: 'no-store' });
            if (resp.ok) {
              const d = await resp.json();
              if (d.promedio) rates.usd = parseFloat(d.promedio);
            }
          }
        } catch {
          rates.usd = 804.81;
        }

        // 3. Aplicar el markup (tipo IVA o suma directa)
        // Ejemplo: si el usuario pone 5 en markup, le sumamos 5 bolívares.
        // Si quieres que sea un porcentaje, descomenta la siguiente línea en vez de la suma.
        // const finalUsd = rates.usd + (rates.usd * (markupUsd / 100));
        
        const finalUsd = rates.usd + markupUsd;
        const finalEur = rates.eur + markupEur;

        setUsdRate(finalUsd);
        setEurRate(finalEur);

      } catch (err) {
        console.error('Error in CurrencyProvider:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
    const interval = setInterval(fetchRates, 3600000); // Actualiza cada hora
    return () => clearInterval(interval);
  }, []);

  return (
    <CurrencyContext.Provider value={{ usdRate, eurRate, usdMarkupSelected, eurMarkupSelected, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};
