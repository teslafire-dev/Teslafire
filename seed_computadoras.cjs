const { Client } = require('pg');
const connectionString = "postgresql://postgres.vsltjensbdcvfnynfhrb:h4GrHIoKV4bdY5c4@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    console.log("🚀 Conectando a la base de datos para sembrar productos de computación...");
    await client.connect();

    // 1. Limpiar base de datos (Opcional, pero recomendado para que la principal tenga sentido)
    console.log("Limpiando tablas de productos anteriores...");
    await client.query('DELETE FROM producto_categorias;');
    await client.query('DELETE FROM productos;');
    await client.query('DELETE FROM categorias;');
    await client.query('DELETE FROM marcas;');

    // 2. Insertar Marcas
    console.log("Insertando marcas...");
    const brands = ['Lenovo', 'Xiaomi', 'Mercusys', 'Dell', 'HP', 'Banda', 'Generica', 'Venemax'];
    const brandMap = {};
    for (const brand of brands) {
      const res = await client.query('INSERT INTO marcas (nombre) VALUES ($1) RETURNING id;', [brand]);
      brandMap[brand] = res.rows[0].id;
    }

    // 3. Insertar Categorías
    console.log("Insertando categorías...");
    const categories = [
      { nombre: 'Laptops', slug: 'laptops', orden: 1, img: 'images/laptop.png' },
      { nombre: 'Desktops', slug: 'desktops', orden: 2, img: 'images/desktop.png' },
      { nombre: 'Redes', slug: 'redes', orden: 3, img: 'images/2.png' },
      { nombre: 'Accesorios', slug: 'accesorios', orden: 4, img: 'images/4.png' },
      { nombre: 'Impresoras', slug: 'impresoras', orden: 5, img: 'images/impresora.png' },
      { nombre: 'Servidores', slug: 'servidores', orden: 6, img: 'images/server.png' }
    ];
    const catMap = {};
    for (const cat of categories) {
      const res = await client.query(
        'INSERT INTO categorias (nombre, slug, orden, imagen_url) VALUES ($1, $2, $3, $4) RETURNING id;',
        [cat.nombre, cat.slug, cat.orden, cat.img]
      );
      catMap[cat.nombre] = res.rows[0].id;
    }

    // 4. Insertar Productos
    console.log("Insertando productos...");
    const products = [
      // Ofertas (del grid de la pagina antigua)
      {
        sku: 'LAP-LEN-E2',
        nombre: 'Laptop Lenovo AMD E2-1800',
        precio: 269.99,
        moneda: 'USD',
        stock: 15,
        brand: 'Lenovo',
        category: 'Laptops',
        imagen: 'images/1.png',
        is_offer: true,
        is_new: false,
        slug: 'laptop-lenovo-amd-e2'
      },
      {
        sku: 'ROU-XIA-4C',
        nombre: 'Router Xiaomi 4C',
        precio: 24.99,
        moneda: 'USD',
        stock: 30,
        brand: 'Xiaomi',
        category: 'Redes',
        imagen: 'images/2.png',
        is_offer: true,
        is_new: false,
        slug: 'router-xiaomi-4c'
      },
      {
        sku: 'ROU-MER-3A',
        nombre: 'Router Mercurys 3 antenas',
        precio: 19.99,
        moneda: 'USD',
        stock: 25,
        brand: 'Mercusys',
        category: 'Redes',
        imagen: 'images/3.png',
        is_offer: true,
        is_new: false,
        slug: 'router-mercurys-3-antenas'
      },
      {
        sku: 'TEC-MOU-BAN',
        nombre: 'Teclado + Mouse Banda Alámbrico',
        precio: 9.99,
        moneda: 'USD',
        stock: 50,
        brand: 'Banda',
        category: 'Accesorios',
        imagen: 'images/4.png',
        is_offer: true,
        is_new: false,
        slug: 'teclado-mouse-banda-alambrico'
      },
      {
        sku: 'DES-DEL-I5',
        nombre: 'Computador Dell Core I5 4ta Gen',
        precio: 279.00,
        moneda: 'USD',
        stock: 8,
        brand: 'Dell',
        category: 'Desktops',
        imagen: 'images/5.png',
        is_offer: true,
        is_new: false,
        slug: 'computador-dell-core-i5-4ta-gen'
      },
      {
        sku: 'DES-HP-I5',
        nombre: 'Computador HP Core I5 2da Gen',
        precio: 239.00,
        moneda: 'USD',
        stock: 12,
        brand: 'HP',
        category: 'Desktops',
        imagen: 'images/6.png',
        is_offer: true,
        is_new: false,
        slug: 'computador-hp-core-i5-2da-gen'
      },
      // Carrusel / Destacados
      {
        sku: 'IMP-HP-EPS',
        nombre: 'Impresora Multifuncional HP/Epson',
        precio: 199.99,
        moneda: 'USD',
        stock: 10,
        brand: 'HP',
        category: 'Impresoras',
        imagen: 'images/impresora.png',
        is_offer: false,
        is_new: true,
        slug: 'impresora-multifuncional-hp-epson'
      },
      {
        sku: 'DES-GEN-COMP',
        nombre: 'Computador de Escritorio Desktop',
        precio: 349.99,
        moneda: 'USD',
        stock: 14,
        brand: 'Generica',
        category: 'Desktops',
        imagen: 'images/desktop.png',
        is_offer: false,
        is_new: true,
        slug: 'computador-de-escritorio-desktop'
      },
      {
        sku: 'LAP-PORT-GEN',
        nombre: 'Laptop Personal Portátil',
        precio: 499.99,
        moneda: 'USD',
        stock: 10,
        brand: 'Generica',
        category: 'Laptops',
        imagen: 'images/laptop.png',
        is_offer: false,
        is_new: true,
        slug: 'laptop-personal-portatil'
      },
      {
        sku: 'SRV-DEL-CORP',
        nombre: 'Servidor Corporativo Dell PowerEdge',
        precio: 899.99,
        moneda: 'USD',
        stock: 5,
        brand: 'Dell',
        category: 'Servidores',
        imagen: 'images/server.png',
        is_offer: false,
        is_new: true,
        slug: 'servidor-corporativo-dell-poweredge'
      }
    ];

    for (const prod of products) {
      // Insertar producto
      const res = await client.query(
        `INSERT INTO productos 
          (sku, nombre, precio, moneda, stock, imagen_url, imagenes_urls, is_offer, is_new, slug, tipo_precio, estado, marca_id, categoria_id) 
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'fijo', 'activo', $11, $12)
         RETURNING id;`,
        [
          prod.sku,
          prod.nombre,
          prod.precio,
          prod.moneda,
          prod.stock,
          prod.imagen,
          [prod.imagen],
          prod.is_offer,
          prod.is_new,
          prod.slug,
          brandMap[prod.brand],
          catMap[prod.category]
        ]
      );

      const productId = res.rows[0].id;
      const categoryId = catMap[prod.category];

      // Vincular en producto_categorias
      await client.query(
        'INSERT INTO producto_categorias (producto_id, categoria_id) VALUES ($1, $2);',
        [productId, categoryId]
      );
    }

    console.log("✅ Base de datos sembrada con productos de Venemax con éxito.");
  } catch (err) {
    console.error("❌ Error sembrando base de datos:", err);
  } finally {
    await client.end();
  }
}

run();
