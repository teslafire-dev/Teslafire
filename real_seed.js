import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const data = [
  { n: 'Arnés Pro Expert Full Body', sku: 'ARN-001', cat: 'Sistemas de Altura', base: 'Protección Personal', p: 125.50, o: false, nu: false },
  { n: 'Guantes de Nitrilo Industrial G50', sku: 'GUA-002', cat: 'Protección de Manos', base: 'Protección Personal', p: 12.99, o: true, nu: false },
  { n: 'Casco de Seguridad V-Gard White', sku: 'CAS-003', cat: 'Protección de Cabeza', base: 'Protección Personal', p: 45.00, o: false, nu: false },
  { n: 'Lentes de Seguridad Radians Mirage', sku: 'LEN-004', cat: 'Protección Visual', base: 'Protección Personal', p: 0, o: false, nu: true, tp: 'cotizacion' },
  { n: 'Mascarilla Respirador 3M 6200', sku: 'RES-005', cat: 'Protección Respiratoria', base: 'Protección Personal', p: 85.00, o: true, nu: false },
  { n: 'Bota de Seguridad Dielectrica S1P', sku: 'CAL-006', cat: 'Calzado', base: 'Calzado Industrial', p: 65.00, o: false, nu: false },
  { n: 'Chaleco Reflectante Alta Visibilidad', sku: 'ROP-007', cat: 'Ropa de Trabajo', base: 'Protección Personal', p: 15.00, o: false, nu: true },
  { n: 'Orejeras de Protección Peltor X5A', sku: 'AUD-008', cat: 'Protección Auditiva', base: 'Protección Personal', p: 55.00, o: false, nu: false }
];

const industrialImages = [
  "https://images.unsplash.com/photo-1588636402422-b676aa610b65?w=800&q=80",
  "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80",
  "https://images.unsplash.com/photo-1533481405265-e9ce0c044abb?w=800&q=80",
  "https://images.unsplash.com/photo-1674558346964-e7196a409880?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1563207038-f86eeff0ebd9?w=800&q=80",
  "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=800&q=80",
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
  "https://images.unsplash.com/photo-1605335559868-8fc87349ca69?w=800&q=80",
  "https://images.unsplash.com/photo-1541888034509-3dc82b834925?w=800&q=80"
];

async function run() {
  const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const { data: dbBrands } = await supabase.from('marcas').select('id');
  const brandId = dbBrands && dbBrands.length > 0 ? dbBrands[0].id : null;
  
  if (!brandId) {
    console.log("Creando marca por defecto 3M...");
    const { data: b } = await supabase.from('marcas').insert({ nombre: '3M' }).select('id').single();
    brandId = b.id;
  }
  
  for(const item of data) {
    let { data: catRow } = await supabase.from('categorias').select('id').eq('nombre', item.cat).single();
    if(!catRow) {
       console.log(`Creando categoria ${item.cat}...`);
       const res = await supabase.from('categorias').insert({ nombre: item.cat, slug: item.cat.toLowerCase().replace(/ /g, '-') }).select('id').single();
       catRow = res.data;
    }
    
    const { error } = await supabase.from('productos').upsert({
      nombre: item.n,
      sku: item.sku,
      marca_id: brandId,
      categoria_id: catRow.id,
      precio: item.p,
      tipo_precio: item.tp || 'fijo',
      stock: 50,
      estado: 'activo',
      imagenes_urls: [getRand(industrialImages)]
    }, { onConflict: 'sku' });
    
    if(error){
      console.error('Error insertando', item.n, error);
    } else {
      console.log('Insertado', item.n);
    }
  }
  console.log('¡Productos verdaderos añadidos con éxito!');
}
run();
