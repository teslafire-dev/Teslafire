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

        // 2. Obtener la tasa oficial del endpoint 
        // Nota: En producción, esto debería apuntar al endpoint real.
        // Aquí usamos el de Kreatickets como fallback (dado en el script del prompt)
        const cacheTime = 3600000; // 1 hora
        const cachedR = localStorage.getItem('bcv_rates');
        let rates = { usd: 0, eur: 0 };

        if (cachedR) {
          const parsed = JSON.parse(cachedR);
          if (Date.now() - parsed.timestamp < cacheTime) {
            rates = parsed.value;
          }
        }

        if (rates.usd === 0) {
          try {
            const resp = await fetch('https://kreatickets.com/pagomovil/obtener_bcv.php', { cache: 'no-store' });
            if (resp.ok) {
              const data = await resp.json();
              rates.usd = parseFloat(data.usd) || 0;
              rates.eur = parseFloat(data.eur) || 0;
              localStorage.setItem('bcv_rates', JSON.stringify({ value: rates, timestamp: Date.now() }));
            }
          } catch (e) {
            console.error('Error fetching BCV API directly', e);
            // Fallback rates en caso de fallo crítico API
            rates.usd = 36.50; 
            rates.eur = 39.40;
          }
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
