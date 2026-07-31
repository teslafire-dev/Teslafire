const { Client } = require('pg');
const connectionString = "postgresql://postgres.vsltjensbdcvfnynfhrb:h4GrHIoKV4bdY5c4@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    console.log("🚀 Conectando a la base de datos para actualizar la configuración de marca...");
    await client.connect();

    const configs = [
      { clave: 'site_logo', valor: '/images/logo_venemax.png' },
      { clave: 'site_logo_dark', valor: '/images/logo_venemax.png' },
      { clave: 'hero_h1', valor: 'Venemax' },
      { clave: 'hero_p', valor: 'Una marca sustentable inspirada en la tecnología.' },
      { clave: 'telefono_whatsapp', valor: '+584123419669' },
      { clave: 'email_contacto', valor: 'venemax1@hotmail.com' },
      { clave: 'direccion', valor: 'Av. Andrés Eloy Blanco. C. C. La Asuncion. Sector Santa Cecilia. Valencia, Venezuela' },
      { clave: 'social_instagram', valor: 'https://www.instagram.com/venemaxstore/' },
      { clave: 'social_facebook', valor: 'https://www.instagram.com/venemaxstore/' },
      // Cambiar los markups a 0 por defecto
      { clave: 'markup_bcv_usd', valor: '0' },
      { clave: 'markup_bcv_eur', valor: '0' }
    ];

    for (const config of configs) {
      console.log(`Actualizando/Insertando configuración: ${config.clave}...`);
      await client.query(
        `INSERT INTO configuracion (clave, valor) 
         VALUES ($1, $2) 
         ON CONFLICT (clave) 
         DO UPDATE SET valor = EXCLUDED.valor, updated_at = NOW();`,
        [config.clave, config.valor]
      );
    }

    console.log("✅ ¡Configuración de Venemax actualizada en DB con éxito!");
  } catch (err) {
    console.error("❌ Error actualizando configuración:", err);
  } finally {
    await client.end();
  }
}

run();
