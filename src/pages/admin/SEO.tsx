import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Search,
  Save,
  RefreshCcw,
  Globe,
  FileText,
  Share2,
  Code2,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Map,
  Bot,
  BarChart2,
  Tag,
  ImagePlus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface SeoConfig {
  [key: string]: string;
}

const SEO_KEYS = [
  { key: "seo_site_title", label: "Título del Sitio (Tag Title)", placeholder: "Dobell - Equipos de Seguridad Industrial", hint: "Aprox. 60 caracteres. Aparece en la pestaña del navegador y en Google." },
  { key: "seo_site_description", label: "Descripción del Sitio (Meta Description)", placeholder: "Catálogo profesional de EPP e industrial. Cascos, guantes, botas y más.", hint: "Aprox. 155 caracteres. El texto que muestra Google debajo del título." },
  { key: "seo_og_image", label: "Imagen Compartir (OG Image)", placeholder: "https://......jpg", hint: "La imagen que sale cuando compartes el enlace en WhatsApp, Facebook, etc. Tamaño ideal: 1200x630px." },
  { key: "seo_site_url", label: "URL Canónica del Sitio (Dominio Principal)", placeholder: "https://jonasweb.vercel.app", hint: "Tu URL definitiva. Muy importpante para evitar contenido duplicado." },
  { key: "seo_org_name", label: "Nombre Legal de la Empresa", placeholder: "Dobell C.A.", hint: "Nombre oficial de la empresa para Schema.org (Google Bot)." },
  { key: "seo_google_verification", label: "Google Search Console (Meta Verificación)", placeholder: "google-site-verification: googleXXXXXXXX.html", hint: "Lo recibes de Google Search Console. Pegar el contenido del meta tag." },
  { key: "seo_keywords", label: "Palabras Clave Globales", placeholder: "seguridad industrial, EPP, cascos, guantes de protección", hint: "Separadas por comas. Define el vocabulario principal del sitio." },
  { key: "seo_robots", label: "Directiva Robots", placeholder: "index, follow", hint: "Valores: 'index, follow' (permitir todo), 'noindex, nofollow' (bloquear rastreadores)." },
];

const ANALYTICS_KEYS = [
  { key: "analytics_gtm_id", label: "Google Tag Manager ID", placeholder: "GTM-XXXXXXX", hint: "Recomendado. Si configuras GTM, éste gestiona GA4 y Pixel desde su panel sin tocar código." },
  { key: "analytics_ga4_id", label: "Google Analytics 4 (GA4) ID", placeholder: "G-XXXXXXXXXX", hint: "Solo necesario si NO usas GTM. Permite ver tráfico, ciudades, comportamiento de usuarios." },
  { key: "analytics_pixel_id", label: "Meta Pixel ID (Facebook/Instagram)", placeholder: "1234567890123", hint: "El ID de tu Pixel de Meta. Activa el retargeting: muestras anuncios a quienes visitaron tu web." },
];

export default function SEO() {
  const [config, setConfig] = useState<SeoConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showSitemap, setShowSitemap] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchSeoConfig();
  }, []);

  const fetchSeoConfig = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("configuracion")
      .select("clave, valor")
      .in("clave", [...SEO_KEYS.map((k) => k.key), ...ANALYTICS_KEYS.map((k) => k.key)]);

    if (data) {
      const map: SeoConfig = {};
      data.forEach((item) => (map[item.clave] = item.valor));
      setConfig(map);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading("Subiendo imagen OG...");

    try {
      // 1. Optimizar imagen
      const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const CTX = canvas.getContext('2d');
            
            // Tamaño standard OG: 1200x630
            canvas.width = 1200;
            canvas.height = 630;

            if (CTX) {
              // Dibujar con cover
              const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
              const x = (canvas.width / 2) - (img.width / 2) * scale;
              const y = (canvas.height / 2) - (img.height / 2) * scale;
              CTX.fillStyle = '#FFFFFF';
              CTX.fillRect(0, 0, canvas.width, canvas.height);
              CTX.drawImage(img, x, y, img.width * scale, img.height * scale);
              
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Error al convertir"));
              }, 'image/webp', 0.85);
            }
          };
        };
      });

      // 2. Subir a Supabase Storage
      const fileName = `seo_og_${Date.now()}.webp`;
      const filePath = `seo/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, optimizedBlob, { contentType: 'image/webp' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      // 3. Guardar URL en config
      await handleSave("seo_og_image", publicUrl);
      setConfig(prev => ({ ...prev, seo_og_image: publicUrl }));
      toast.success("Imagen OG actualizada ✓", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Error al subir imagen", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (key: string) => {
    setSaving(key);
    const { error } = await supabase.from("configuracion").upsert(
      { clave: key, valor: config[key] || "", updated_at: new Date().toISOString() },
      { onConflict: "clave" }
    );
    if (error) toast.error(`Error al guardar: ${key}`);
    else toast.success("Configuración guardada ✓");
    setSaving(null);
  };

  const handleSaveAll = async () => {
    setSaving("all");
    const upserts = [...SEO_KEYS, ...ANALYTICS_KEYS].map(({ key }) => ({
      clave: key,
      valor: config[key] || "",
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from("configuracion")
      .upsert(upserts, { onConflict: "clave" });
    if (error) toast.error("Error al guardar configuración");
    else toast.success("Todo guardado ✓");
    setSaving(null);
  };

  const generateSitemap = async () => {
    setSitemapLoading(true);
    try {
      const siteUrl = config["seo_site_url"] || window.location.origin;

      // Fetch all public pages
      const [{ data: productos }, { data: categorias }] = await Promise.all([
        supabase.from("productos").select("slug, updated_at").eq("estado", "activo"),
        supabase.from("categorias").select("slug, updated_at"),
      ]);

      const staticPages: { url: string; priority: string; changefreq: string; lastmod?: string }[] = [
        { url: "/", priority: "1.0", changefreq: "weekly" },
        { url: "/productos", priority: "0.9", changefreq: "daily" },
        { url: "/nosotros", priority: "0.7", changefreq: "monthly" },
        { url: "/soluciones", priority: "0.7", changefreq: "monthly" },
      ];

      const productPages = (productos || []).map((p) => ({
        url: `/productos/${p.slug}`,
        priority: "0.8",
        changefreq: "weekly",
        lastmod: p.updated_at?.split("T")[0] || new Date().toISOString().split("T")[0],
      }));

      const allPages = [...staticPages, ...productPages];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

      setSitemapXml(xml);
      setShowSitemap(true);
      toast.success(`Sitemap generado: ${allPages.length} URLs`);
    } catch (err) {
      toast.error("Error al generar sitemap");
    } finally {
      setSitemapLoading(false);
    }
  };

  const downloadSitemap = () => {
    if (!sitemapXml) return;
    const blob = new Blob([sitemapXml], { type: "application/xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sitemap.xml";
    a.click();
  };

  const charCount = (key: string, max: number) => {
    const len = (config[key] || "").length;
    const pct = Math.min((len / max) * 100, 100);
    const color = len > max ? "bg-red-500" : len > max * 0.8 ? "bg-yellow-400" : "bg-green-500";
    return { len, pct, color };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
      <RefreshCcw className="w-8 h-8 animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cargando configuración SEO</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-primary-950 uppercase tracking-tighter leading-none">
          SEO / Motores de Búsqueda
        </h1>
        <p className="text-slate-500 font-medium tracking-wide">
          Controla cómo aparece tu web en Google, WhatsApp y redes sociales.
        </p>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Title Tag", key: "seo_site_title", max: 60, icon: FileText },
          { label: "Meta Description", key: "seo_site_description", max: 155, icon: Search },
          { label: "OG Image", key: "seo_og_image", max: 200, icon: Share2 },
          { label: "URL Canónica", key: "seo_site_url", max: 100, icon: Globe },
        ].map(({ label, key, max, icon: Icon }) => {
          const filled = !!(config[key]);
          return (
            <div key={key} className={`p-5 rounded-[2rem] border flex flex-col gap-3 ${filled ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"}`}>
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${filled ? "text-green-600" : "text-amber-500"}`} />
                {filled
                  ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                  : <AlertCircle className="w-4 h-4 text-amber-500" />}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
              <span className={`text-[10px] font-black ${filled ? "text-green-700" : "text-amber-600"}`}>
                {filled ? "Configurado" : "Pendiente"}
              </span>
            </div>
          );
        })}
      </div>

      {/* SEO Fields */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-950 text-accent rounded-xl shadow-xl">
              <Bot className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-primary-950 uppercase tracking-tighter">
              Configuración Google Bot
            </h2>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={saving === "all"}
            className="bg-accent text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-smooth shadow-xl flex items-center gap-2"
          >
            {saving === "all" ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Todo
          </button>
        </div>

        {SEO_KEYS.map(({ key, label, placeholder, hint }) => {
          // Renderizado especial para OG Image
          if (key === "seo_og_image") {
            const ogUrl = config[key];
            return (
              <div key={key} className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  {label}
                </label>
                
                <div className="flex flex-col md:flex-row gap-6 items-start lg:items-center bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  {/* Previsualizador */}
                  <div className="relative w-full md:w-56 aspect-[1200/630] bg-slate-200 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-inner group">
                    {ogUrl ? (
                      <>
                        <img src={ogUrl} className="w-full h-full object-cover" alt="OG Preview" />
                        <button 
                          onClick={() => { handleSave(key, ""); setConfig(p => ({ ...p, [key]: "" })); }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-smooth"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Share2 className="w-8 h-8 opacity-20" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 flex-1">
                    <div className="flex flex-col gap-1">
                       <p className="text-xs font-bold text-primary-950 uppercase tracking-tight">Imagen para Redes Sociales</p>
                       <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{hint}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label 
                        className={`cursor-pointer px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-smooth shadow-sm ${
                          uploadingImage ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary-950 text-white hover:bg-accent'
                        }`}
                      >
                        <ImagePlus className="w-4 h-4" />
                        {uploadingImage ? "Subiendo..." : "Cambiar Imagen"}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                      </label>
                      <button 
                        onClick={() => handleSave(key)}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent transition-smooth"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={config[key] || ""}
                      onChange={(e) => setConfig((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-mono text-slate-500 focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          }

          const isDescription = key === "seo_site_description";
          const isTitle = key === "seo_site_title";
          const maxLen = isTitle ? 60 : isDescription ? 155 : 0;
          const { len, pct, color } = maxLen > 0 ? charCount(key, maxLen) : { len: 0, pct: 0, color: "" };

          return (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {label}
                </label>
                <div className="flex items-center gap-3">
                  {maxLen > 0 && (
                    <span className={`text-[9px] font-black tabular-nums ${len > maxLen ? "text-red-500" : "text-slate-400"}`}>
                      {len}/{maxLen}
                    </span>
                  )}
                  <button
                    onClick={() => handleSave(key)}
                    disabled={saving === key}
                    className="p-2 bg-slate-50 text-slate-400 hover:bg-primary-950 hover:text-white rounded-xl transition-smooth"
                  >
                    {saving === key ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {key === "seo_site_description" || key === "seo_keywords" ? (
                <textarea
                  rows={3}
                  value={config[key] || ""}
                  onChange={(e) => setConfig((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-accent outline-none resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={config[key] || ""}
                  onChange={(e) => setConfig((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                />
              )}

              {maxLen > 0 && (
                <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}

              <p className="text-[10px] text-slate-400 font-medium px-1">{hint}</p>
            </div>
          );
        })}
      </div>

      {/* Sitemap Generator */}
      <div className="bg-primary-950 p-10 rounded-[3rem] text-white flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full -mr-24 -mt-24 blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-accent/20 text-accent rounded-xl">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Generador de Sitemap.xml</h2>
            <p className="text-slate-400 text-xs font-medium mt-1">
              Mapa del sitio para Google Search Console. Incluye todos los productos activos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 relative z-10">
          <button
            onClick={generateSitemap}
            disabled={sitemapLoading}
            className="bg-accent text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-smooth shadow-xl flex items-center gap-3"
          >
            {sitemapLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Code2 className="w-4 h-4" />}
            Generar Sitemap
          </button>
          {sitemapXml && (
            <>
              <button
                onClick={() => setShowSitemap(!showSitemap)}
                className="bg-slate-800 text-slate-300 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-smooth flex items-center gap-3"
              >
                <Eye className="w-4 h-4" /> {showSitemap ? "Ocultar" : "Ver XML"}
              </button>
              <button
                onClick={downloadSitemap}
                className="bg-slate-800 text-slate-300 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-smooth flex items-center gap-3"
              >
                <Save className="w-4 h-4" /> Descargar
              </button>
            </>
          )}
        </div>

        <AnimatePresence>
          {showSitemap && sitemapXml && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative z-10 overflow-hidden"
            >
              <pre className="bg-slate-950 text-green-400 text-[10px] font-mono p-6 rounded-2xl overflow-x-auto max-h-64 overflow-y-auto leading-relaxed">
                {sitemapXml}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-slate-900/60 rounded-2xl p-6 relative z-10">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">📋 Próximos pasos para Google</p>
          <ol className="text-[11px] text-slate-400 font-medium space-y-1 leading-relaxed list-decimal list-inside">
            <li>Genera el sitemap y descárgalo como <code className="text-accent">sitemap.xml</code></li>
            <li>Súbelo a la raíz de tu hosting en GoDaddy (junto al <code className="text-accent">index.html</code>)</li>
            <li>Entra a <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-white">Google Search Console</a> y envíalo</li>
            <li>Verifica tu dominio con el meta-tag de verificación (campo de arriba)</li>
          </ol>
        </div>
      </div>

      {/* robots.txt Preview */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary-950 uppercase tracking-tighter">robots.txt Recomendado</h2>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Copia este contenido y crea un archivo <code className="text-accent font-black">robots.txt</code> en la raíz de tu hosting.
            </p>
          </div>
        </div>
        <div className="relative">
          <pre className="bg-slate-950 text-green-400 text-[11px] font-mono p-6 rounded-2xl leading-relaxed">
{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/*

Sitemap: ${config["seo_site_url"] || "https://tudominio.com"}/sitemap.xml`}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /admin/*\n\nSitemap: ${config["seo_site_url"] || "https://tudominio.com"}/sitemap.xml`);
              toast.success("robots.txt copiado al portapapeles");
            }}
            className="absolute top-4 right-4 bg-slate-800 text-slate-300 text-[10px] font-black uppercase px-4 py-2 rounded-xl hover:bg-accent hover:text-white transition-smooth"
          >
            Copiar
          </button>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">
          ⚠️ Esto le indica a Google que puede indexar toda la web pública, pero <strong>bloquea el panel de administración</strong> para que no aparezca en búsquedas.
        </p>
      </div>

      {/* Analytics Block */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xl">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary-950 uppercase tracking-tighter">
                Analytics y Retargeting
              </h2>
              <p className="text-slate-400 text-xs font-medium mt-1">
                Estos IDs se inyectan automáticamente en todas las páginas públicas del sitio.
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={saving === "all"}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-smooth shadow-xl flex items-center gap-2"
          >
            {saving === "all" ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Tag className="w-3 h-3" /> Recomendación de uso
          </p>
          <p className="text-[11px] text-blue-600 font-medium leading-relaxed">
            Usa <strong>Google Tag Manager (GTM)</strong> como único punto de entrada. Desde GTM puedes activar 
            GA4 y Meta Pixel sin tocar más código. Si solo tienes GA4, puedes usarlo directamente sin GTM.
          </p>
        </div>

        {ANALYTICS_KEYS.map(({ key, label, placeholder, hint }) => (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {label}
              </label>
              <button
                onClick={() => handleSave(key)}
                disabled={saving === key}
                className="p-2 bg-slate-50 text-slate-400 hover:bg-primary-950 hover:text-white rounded-xl transition-smooth"
              >
                {saving === key ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              </button>
            </div>
            <input
              type="text"
              value={config[key] || ""}
              onChange={(e) => setConfig((p) => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              className={`w-full bg-slate-50 border rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 outline-none ${
                config[key] ? "border-green-200 focus:ring-green-400" : "border-slate-100 focus:ring-accent"
              }`}
            />
            {config[key] && (
              <div className="flex items-center gap-2 px-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Activo - se inyecta en el sitio</span>
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-medium px-1">{hint}</p>
          </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {[
            { label: "Google Tag Manager", url: "https://tagmanager.google.com", desc: "Gestor centralizado de scripts" },
            { label: "Meta Events Manager", url: "https://business.facebook.com/events_manager", desc: "Verifica que el Pixel dispara correctamente" },
          ].map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-[2rem] hover:border-accent hover:shadow-xl transition-smooth group"
            >
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-accent transition-smooth shrink-0" />
              <div>
                <p className="text-sm font-black text-primary-950 group-hover:text-accent transition-smooth">{link.label}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{link.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Links útiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Google Search Console", url: "https://search.google.com/search-console", desc: "Enviar sitemap y verificar indexación" },
          { label: "Schema.org Validator", url: "https://validator.schema.org", desc: "Validar el código JSON-LD del sitio" },
          { label: "PageSpeed Insights", url: "https://pagespeed.web.dev", desc: "Analizar velocidad y Core Web Vitals" },
          { label: "Open Graph Debugger", url: "https://developers.facebook.com/tools/debug", desc: "Ver cómo se ve el link en Facebook/WhatsApp" },
        ].map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-accent hover:shadow-xl transition-smooth group"
          >
            <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-accent transition-smooth shrink-0" />
            <div>
              <p className="text-sm font-black text-primary-950 group-hover:text-accent transition-smooth">{link.label}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{link.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
