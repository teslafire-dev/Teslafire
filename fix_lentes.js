import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data: catRow } = await supabase.from('categorias').select('id').eq('nombre', 'Protección Visual').single();
  const { data: dbBrands } = await supabase.from('marcas').select('id');
  const brandId = dbBrands[0].id;
  
  await supabase.from('productos').upsert({
    nombre: 'Lentes de Seguridad Radians Mirage',
    sku: 'LEN-004',
    marca_id: brandId,
    categoria_id: catRow.id,
    precio: 1.00, // Fijado en 1 para evitar constraint, tipo_precio 'cotizacion' lo anula en pantalla
    tipo_precio: 'cotizacion',
    stock: 50,
    estado: 'activo',
    imagenes_urls: ["https://images.unsplash.com/photo-1563207038-f86eeff0ebd9?w=800&q=80"]
  }, { onConflict: 'sku' });
  console.log('¡Lentes de seguridad añadidos!');
}
run();
