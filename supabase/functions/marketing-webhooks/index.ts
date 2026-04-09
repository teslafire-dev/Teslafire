import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const payload = await req.json();
    const { type, data } = payload;
    
    // Resend usa 'tags' para identificar recipient y campaign
    const tags = data.tags || {};
    const campaignId = tags.campaign_id;
    const recipientId = tags.recipient_id;

    if (!campaignId || !recipientId) {
      return new Response("Missing metadata", { status: 400 });
    }

    if (type === 'email.opened') {
      await supabase.from('campana_destinatarios').update({ opened_at: new Date().toISOString() }).eq('id', recipientId).is('opened_at', null);
      await supabase.rpc('increment_campaign_opens', { camp_id: campaignId });
    }

    if (type === 'email.clicked') {
      await supabase.from('campana_destinatarios').update({ clicked_at: new Date().toISOString() }).eq('id', recipientId).is('clicked_at', null);
      await supabase.rpc('increment_campaign_clicks', { camp_id: campaignId });
    }

    return new Response("OK");
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
});
