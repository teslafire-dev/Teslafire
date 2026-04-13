import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

/**
 * Analytics Component
 * Reads GTM ID, GA4 ID and Meta Pixel ID from the `configuracion` table
 * and injects them as script tags into the document <head> & <body>.
 * También integra Vercel Analytics nativamente.
 */
export default function Analytics() {
  useEffect(() => {
    const injectAnalytics = async () => {
      try {
        const { data } = await supabase
          .from("configuracion")
          .select("clave, valor")
          .in("clave", ["analytics_gtm_id", "analytics_ga4_id", "analytics_pixel_id"]);

        if (!data || data.length === 0) return;

        const cfg: Record<string, string> = {};
        data.forEach((item) => (cfg[item.clave] = item.valor));

        // ───── Google Tag Manager ─────
        if (cfg["analytics_gtm_id"]?.trim()) {
          const gtmId = cfg["analytics_gtm_id"].trim();

          // Head script
          if (!document.getElementById("gtm-head")) {
            const s = document.createElement("script");
            s.id = "gtm-head";
            s.innerHTML = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
            document.head.appendChild(s);
          }

          // NoScript iframe for <body>
          if (!document.getElementById("gtm-body")) {
            const ns = document.createElement("noscript");
            ns.id = "gtm-body";
            ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
            document.body.insertBefore(ns, document.body.firstChild);
          }
        }

        // ───── Google Analytics 4 (standalone, sin GTM) ─────
        if (cfg["analytics_ga4_id"]?.trim() && !cfg["analytics_gtm_id"]?.trim()) {
          const ga4Id = cfg["analytics_ga4_id"].trim();
          if (!document.getElementById("ga4-script")) {
            const s = document.createElement("script");
            s.id = "ga4-script";
            s.async = true;
            s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
            document.head.appendChild(s);

            const s2 = document.createElement("script");
            s2.id = "ga4-config";
            s2.innerHTML = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4Id}');`;
            document.head.appendChild(s2);
          }
        }

        // ───── Meta Pixel (Facebook) ─────
        if (cfg["analytics_pixel_id"]?.trim()) {
          const pixelId = cfg["analytics_pixel_id"].trim();
          if (!document.getElementById("meta-pixel")) {
            const s = document.createElement("script");
            s.id = "meta-pixel";
            s.innerHTML = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;
            document.head.appendChild(s);

            // NoScript fallback
            const ns = document.createElement("noscript");
            ns.id = "meta-pixel-fallback";
            ns.innerHTML = `<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
            document.head.appendChild(ns);
          }
        }
      } catch (err) {
        console.warn("Analytics: Could not load config", err);
      }
    };

    injectAnalytics();
  }, []);

  return <VercelAnalytics />;
}
