import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const newCategories = [
  { nombre: "Protección de Manos", slug: "proteccion-manos", img: "https://images.unsplash.com/photo-1588636402422-b676aa610b65?w=800&q=80" },
  { nombre: "Protección de Cabeza", slug: "proteccion-cabeza", img: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80" },
  { nombre: "Protección Auditiva", slug: "proteccion-auditiva", img: "https://images.unsplash.com/photo-1599256629241-10c0e357989d?auto=format&fit=crop&q=80&w=800" },
  { nombre: "Sistemas de Altura", slug: "arneses", img: "https://images.unsplash.com/photo-1518384401463-d3876163c195?auto=format&fit=crop&q=80&w=800" },
  { nombre: "Calzado de Seguridad", slug: "calzado", img: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80" },
  { nombre: "Ropa de Trabajo", slug: "ropa-trabajo", img: "https://images.unsplash.com/photo-1504386106331-3e4e71714bca?auto=format&fit=crop&q=80&w=800" }
];

async function run() {
  console.log('Comprobando si la columna "imagen_url" existe en "categorias"...');
  
  // Try inserting/upserting to see if we hit an error about the column
  try {
    const { error: patchError } = await supabase.from('categorias').update({ imagen_url: '' }).eq('id', '00000000-0000-0000-0000-000000000000');
    if(patchError && patchError.code === 'PGRST204') {
       console.log('Se requiere añadir la columna en tu panel de Supabase: ALTER TABLE categorias ADD COLUMN imagen_url TEXT;');
       return;
    }
  } catch (e) {}

  for(const cat of newCategories) {
    const { data: catRow } = await supabase.from('categorias').select('id').eq('slug', cat.slug).single();
    if (catRow) {
       await supabase.from('categorias').update({ nombre: cat.nombre, imagen_url: cat.img }).eq('id', catRow.id);
    } else {
       await supabase.from('categorias').insert({ nombre: cat.nombre, slug: cat.slug, imagen_url: cat.img });
    }
  }
  console.log('¡Categorías añadidas con imágenes en DB!');
}

run();
