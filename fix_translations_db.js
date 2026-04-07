import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function run() {
  const envFile = fs.readFileSync('.env.local', 'utf-8');
  const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
  const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const translations = [
    // Hero
    { clave: 'en_hero_h1', valor: 'High Performance Industrial Safety' },
    { clave: 'en_hero_p', valor: 'Superior protection for each industrial challenge.' },
    { clave: 'en_hero_imagen_url', valor: '/images/hero-default.jpg' },
    { clave: 'en_hero_stats_products', valor: '+2000 certified products' },
    { clave: 'en_hero_stats_delivery', valor: 'Immediate in-store pickup' },
    
    // Navigation
    { clave: 'en_nav_productos', valor: 'Products' },
    { clave: 'en_nav_soluciones', valor: 'Solutions' },
    { clave: 'en_nav_nosotros', valor: 'About Us' },
    
    // Catalog UI
    { clave: 'en_catalog_filters', valor: 'Filters' },
    { clave: 'en_catalog_clear', valor: 'Clear' },
    { clave: 'en_catalog_categories', valor: 'Categories' },
    { clave: 'en_catalog_search', valor: 'Search products...' },
    { clave: 'en_catalog_results', valor: 'results found' },
    
    // Buttons
    { clave: 'en_btn_add_cart', valor: 'Add to Cart' },
    { clave: 'en_btn_details', valor: 'View Details' },
    { clave: 'en_btn_reserve', valor: 'Reserve Now' },
  ];

  console.log("Insertando traducciones en 'configuracion'...");

  for (const item of translations) {
    const { error } = await supabase
      .from('configuracion')
      .upsert({ clave: item.clave, valor: item.valor }, { onConflict: 'clave' });

    if (error) {
      console.error(`Error en ${item.clave}:`, error);
    } else {
      console.log(`OK: ${item.clave}`);
    }
  }

  console.log("¡Configuración de Inglés completada!");
}

run();
