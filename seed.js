import { createClient } from "@supabase/supabase-js";
import 'dotenv/config'; // Requires dotenv, maybe not installed? Instead I'll just hardcode or read from process.env if loaded, or read file.

import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf-8');
const envUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const envKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(envUrl, envKey);

const industrialImages = [
  "https://images.unsplash.com/photo-1588636402422-b676aa610b65?w=800&q=80",
  "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80",
  "https://images.unsplash.com/photo-1533481405265-e9ce0c044abb?w=800&q=80",
  "https://images.unsplash.com/photo-1620002093556-3b6928811d73?w=800&q=80",
  "https://images.unsplash.com/photo-1563207038-f86eeff0ebd9?w=800&q=80",
  "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=800&q=80",
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
  "https://images.unsplash.com/photo-1605335559868-8fc87349ca69?w=800&q=80",
  "https://images.unsplash.com/photo-1541888034509-3dc82b834925?w=800&q=80",
  "https://images.unsplash.com/photo-1596482163351-40bcf00eef0b?w=800&q=80",
  "https://images.unsplash.com/photo-1590240974866-e8d99c4c798d?w=800&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356f12?w=800&q=80",
  "https://images.unsplash.com/photo-1531766061985-06bdce678bfa?w=800&q=80"
];

async function seed() {
  console.log("Fetching categories and brands...");
  const { data: categorias } = await supabase.from('categorias').select('id, nombre');
  const { data: marcas } = await supabase.from('marcas').select('id, nombre');

  if (!categorias || !categorias.length) {
    console.log("No categories found. Creating some...");
    await supabase.from('categorias').insert([
      { nombre: 'Protección Personal', slug: 'proteccion-personal' },
      { nombre: 'Calzado Industrial', slug: 'calzado-industrial' },
      { nombre: 'Herramientas Profesionales', slug: 'herramientas-profesionales' }
    ]);
  }

  if (!marcas || !marcas.length) {
    console.log("No brands found. Creating some...");
    await supabase.from('marcas').insert([
      { nombre: '3M' },
      { nombre: 'Ansell' },
      { nombre: 'Caterpillar' },
      { nombre: 'Radians' }
    ]);
  }

  // Refetch
  const { data: cats } = await supabase.from('categorias').select('id');
  const { data: brands } = await supabase.from('marcas').select('id');

  const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const getRandId = (arr) => arr[Math.floor(Math.random() * arr.length)].id;

  console.log("Deleting old products...");
  await supabase.from('productos').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("Inserting 15 test products...");

  const testProducts = Array.from({ length: 15 }).map((_, i) => ({
    sku: `TST-${1000 + i}`,
    nombre: `Equipamiento Industrial Premium de Prueba Vol ${i + 1}`,
    categoria_id: getRandId(cats),
    marca_id: getRandId(brands),
    tipo_precio: 'fijo',
    precio: Math.floor(Math.random() * 200) + 15.99,
    stock: Math.floor(Math.random() * 50) + 5,
    imagenes_urls: [getRand(industrialImages), getRand(industrialImages)],
    destacado: Math.random() > 0.7,
    estado: 'activo'
  }));

  const { error } = await supabase.from('productos').insert(testProducts);
  
  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Successfully seeded 15 products with unsplash images!");
  }
}

seed();
