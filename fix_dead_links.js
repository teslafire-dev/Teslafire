import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEAD_URL = "https://images.unsplash.com/photo-1620002093556-3b6928811d73?w=800&q=80";
const NEW_URL = "https://images.unsplash.com/photo-1504307651254-35680f356f12?w=800&q=80";

async function run() {
  console.log("Searching for products with dead links...");
  const { data: products, error } = await supabase
    .from('productos')
    .select('id, imagenes_urls');

  if (error || !products) {
    console.error("Error fetching products:", error);
    return;
  }

  let count = 0;
  for (const prod of products) {
    if (prod.imagenes_urls && prod.imagenes_urls.includes(DEAD_URL)) {
      const fixedUrls = prod.imagenes_urls.map(url => url === DEAD_URL ? NEW_URL : url);
      await supabase.from('productos').update({ imagenes_urls: fixedUrls }).eq('id', prod.id);
      count++;
    }
  }

  console.log(`Successfully replaced dead links for ${count} products.`);
}

run();
