import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product";
  product?: {
    name: string;
    description: string;
    image: string;
    sku: string;
    price?: number;
    currency?: string;
    brand?: string;
    slug: string;
  };
  breadcrumbs?: { name: string; url: string }[];
  siteName?: string;
  siteUrl?: string;
  orgName?: string;
  orgLogo?: string;
  socialFacebook?: string;
  socialInstagram?: string;
}

export default function SEOHead({
  title = "Dobell - Equipos de Seguridad Industrial",
  description = "Catálogo de equipos de protección personal e industrial. Cascos, guantes, botas, arneses y más.",
  image = "",
  url = "",
  type = "website",
  product,
  breadcrumbs = [],
  siteName = "Dobell",
  siteUrl = typeof window !== "undefined" ? window.location.origin : "",
  orgName = "Dobell",
  orgLogo = "",
  socialFacebook = "",
  socialInstagram = "",
}: SEOHeadProps) {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const canonicalUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  // Schema: Organización
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: orgName,
    url: siteUrl,
    logo: orgLogo,
    sameAs: [socialFacebook, socialInstagram].filter(Boolean),
  };

  // Schema: Producto
  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.image,
        sku: product.sku,
        brand: product.brand
          ? { "@type": "Brand", name: product.brand }
          : undefined,
        offers: {
          "@type": "Offer",
          priceCurrency: product.currency || "USD",
          price: product.price || 0,
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/productos/${product.slug}`,
        },
      }
    : null;

  // Schema: Breadcrumbs
  const breadcrumbSchema =
    breadcrumbs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbs.map((bc, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: bc.name,
            item: bc.url,
          })),
        }
      : null;

  // Schema: WebSite con SearchAction (para Sitelinks)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/productos?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD Schemas */}
      <script type="application/ld+json">
        {JSON.stringify(orgSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}
