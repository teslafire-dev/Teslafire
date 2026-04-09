import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // 1. Obtener campaña activa (enviando)
    const { data: campaign, error: campError } = await supabase
      .from('campanas')
      .select('*')
      .eq('estado', 'enviando')
      .limit(1)
      .single();

    if (campError || !campaign) {
      return new Response(JSON.stringify({ message: "No active campaigns to process" }), { 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // 2. Obtener configuración SMTP (Resend por defecto)
    const { data: configData } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['smtp_api_key', 'smtp_from_email', 'smtp_from_name']);

    const config = Object.fromEntries(configData?.map(c => [c.clave, c.valor]) || []);
    if (!config.smtp_api_key) throw new Error("SMTP API Key not configured");

    // 3. Obtener destinatarios pendientes del lote
    const { data: recipients, error: recError } = await supabase
      .from('campana_destinatarios')
      .select('*')
      .eq('campana_id', campaign.id)
      .eq('estado', 'pendiente')
      .limit(campaign.lote_tamano || 10);

    if (recError || !recipients || recipients.length === 0) {
      // Marcar campaña como completada si no hay más destinatarios
      await supabase.from('campanas').update({ estado: 'completada' }).eq('id', campaign.id);
      return new Response(JSON.stringify({ message: "Campaign finished" }));
    }

    // 4. Enviar correos por lote
    const results = await Promise.all(recipients.map(async (r) => {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.smtp_api_key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `${config.smtp_from_name || 'Dobell Service'} <${config.smtp_from_email}>`,
            to: r.email,
            subject: campaign.asunto,
            html: campaign.mensaje.replace(/{{NOMBRE}}/g, r.nombre || 'Cliente'),
            tags: [
              { name: 'campaign_id', value: campaign.id },
              { name: 'recipient_id', value: r.id }
            ]
          })
        });

        if (res.ok) {
          const data = await res.json();
          return { id: r.id, success: true, message_id: data.id };
        } else {
          return { id: r.id, success: false };
        }
      } catch (e) {
        return { id: r.id, success: false };
      }
    }));

    // 5. Actualizar estados de destinatarios
    for (const res of results) {
      await supabase
        .from('campana_destinatarios')
        .update({ 
          estado: res.success ? 'enviado' : 'fallido',
          sent_at: new Date().toISOString()
        })
        .eq('id', res.id);
    }

    // 6. Actualizar progreso de la campaña
    const sentCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    await supabase.rpc('increment_campaign_stats', {
      camp_id: campaign.id,
      inc_sent: sentCount,
      inc_failed: failedCount
    });

    return new Response(JSON.stringify({ 
      processed: recipients.length, 
      sent: sentCount,
      failed: failedCount
    }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});
