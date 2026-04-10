import { supabase } from "@/lib/supabase/client";

/**
 * Log a user action to the activity history
 */
export async function logAction(action: string, user: any) {
  try {
    // Basic browser info
    const ua = navigator.userAgent;
    let browser = "Desconocido";
    let os = "Desconocido";
    
    if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";
    else if (ua.indexOf("Edge") > -1) browser = "Edge";

    if (ua.indexOf("Win") > -1) os = "Windows";
    else if (ua.indexOf("Mac") > -1) os = "MacOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("like Mac") > -1) os = "iOS";

    // Attempt to get IP (Simple)
    let ip = "0.0.0.0";
    try {
      const resp = await fetch('https://api.ipify.org?format=json');
      const data = await resp.json();
      ip = data.ip;
    } catch {
      // Fallback
    }

    await supabase.from('actividad_usuarios').insert([{
      user_id: user?.id,
      email: user?.email,
      ip: ip,
      user_agent: ua,
      navegador: browser,
      sistema_operativo: os,
      pagina_visitada: action // Using this field for the action name
    }]);
  } catch (err) {
    console.error("Logger Error:", err);
  }
}
