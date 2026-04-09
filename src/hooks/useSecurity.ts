import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { useLocation } from 'react-router-dom';

export function useSecurity() {
  const { user } = useAuth();
  const location = useLocation();
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const trackActivity = async () => {
      try {
        // 1. Obtener IP
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();

        // Evitar duplicados recientes (30 segundos) en la misma página
        const lastLogKey = `sec_log_${ip}_${location.pathname}`;
        const lastLogTime = sessionStorage.getItem(lastLogKey);
        const now = Date.now();
        
        if (lastLogTime && (now - parseInt(lastLogTime)) < 30000) {
          return; // Demasiado pronto para la misma ruta
        }

        // 2. Verificar si está bloqueado
        const { data: blocked } = await supabase
          .from('ips_bloqueadas')
          .select('ip, razon')
          .eq('ip', ip)
          .single();

        if (blocked) {
          setIsBlocked(true);
          return;
        }

        // 3. Capturar Metadata
        const ua = navigator.userAgent;
        let navegador = "Otro";
        if (ua.includes("Chrome") && !ua.includes("Edge")) navegador = "Chrome";
        else if (ua.includes("Firefox")) navegador = "Firefox";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) navegador = "Safari";
        else if (ua.includes("Edge")) navegador = "Edge";

        let os = "Otro";
        if (ua.includes("Win")) os = "Windows";
        else if (ua.includes("Mac")) os = "MacOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iPhone")) os = "iOS";

        // 4. Guardar actividad
        await supabase.from('actividad_usuarios').insert({
          user_id: user?.id || null,
          email: user?.email || 'Visitante Anónimo',
          ip: ip,
          user_agent: ua,
          navegador: navegador,
          sistema_operativo: os,
          dispositivo: /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop',
          pagina_visitada: location.pathname
        });

        // Registrar timestamp para evitar duplicados inmediatos
        sessionStorage.setItem(lastLogKey, now.toString());

      } catch (error) {
        console.error("Security Hook error:", error);
      }
    };

    trackActivity();
  }, [location.pathname, user?.id]);

  return { isBlocked };
}
