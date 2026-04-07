import { createClient } from "@supabase/supabase-js";

import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf-8');
const envUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const envKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(envUrl, envKey);

const industrialImages = [
  "https://images.unsplash.com/photo-1588636402422-b676aa610b65?w=800&q=80",
  "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80",
  "https://images.unsplash.com/photo-1533481405265-e9ce0c044abb?w=800&q=80",
  "https://images.unsplash.com/photo-1674558346964-e7196a409880?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1563207038-f86eeff0ebd9?w=800&q=80",
  "https://images.unsplash.com/photo-1674558346964-e7196a409880?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1674558346964-e7196a409880?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1674558346964-e7196a409880?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1541888034509-3dc82b834925?w=800&q=80",
  "https://images.unsplash.com/photo-1596482163351-40bcf00eef0b?w=800&q=80",
  "https://images.unsplash.com/photo-1590240974866-e8d99c4c798d?w=800&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356f12?w=800&q=80",
  "https://images.unsplash.com/photo-1531766061985-06bdce678bfa?w=800&q=80"
];

async function seed() {
  console.log("Fetching existing products...");
  const { data: productos, error } = await supabase.from('productos').select('id, imagenes_urls');

  if (error || !productos?.length) {
    console.log("No products found to update.");
    return;
  }

  const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  console.log(`Updating ${productos.length} existing products...`);

  let successCount = 0;
  for (const prod of productos) {
    const freshImages = [getRand(industrialImages), getRand(industrialImages)];
    const { error: patchError } = await supabase
      .from('productos')
      .update({ imagenes_urls: freshImages })
      .eq('id', prod.id);

    if (patchError) {
      console.error(`Error updating product ${prod.id}:`, patchError);
    } else {
      successCount++;
    }
  }

  console.log(`Successfully updated images for ${successCount} products!`);
}

seed();
