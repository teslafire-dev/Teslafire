import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const industrialImages = [
  "https://images.unsplash.com/photo-1588636402422-b676aa610b65?w=800&q=80",
  "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80",
  "https://images.unsplash.com/photo-1533481405265-e9ce0c044abb?w=800&q=80",
  "https://images.unsplash.com/photo-1674558346964-e7196a409880?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1563207038-f86eeff0ebd9?w=800&q=80",
  "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=800&q=80",
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
  "https://images.unsplash.com/photo-1605335559868-8fc87349ca69?w=800&q=80",
  "https://images.unsplash.com/photo-1541888034509-3dc82b834925?w=800&q=80",
  "https://images.unsplash.com/photo-1596482163351-40bcf00eef0b?w=800&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
];

async function run() {
  const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Update categories that have no image (optional fallback)
  // ... but since we just had fix_categorias.js they will run that.

  console.log("Checking for products without images...");
  const { data: productos, error } = await supabase.from('productos').select('id, imagenes_urls');
  
  if (error || !productos) return;

  let count = 0;
  for (const prod of productos) {
    if (!prod.imagenes_urls || prod.imagenes_urls.length === 0 || !prod.imagenes_urls[0] || prod.imagenes_urls[0] === null || String(prod.imagenes_urls[0]).includes('placeholder')) {
      await supabase.from('productos').update({ 
         imagenes_urls: [getRand(industrialImages), getRand(industrialImages)] 
      }).eq('id', prod.id);
      count++;
    }
  }
  
  console.log(`Updated images for ${count} products missing them!`);
}
run();
