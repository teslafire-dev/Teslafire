const { Client } = require('pg');
const connectionString = "postgresql://postgres.vsltjensbdcvfnynfhrb:h4GrHIoKV4bdY5c4@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    console.log("🚀 Conectando a la base de datos para agregar columnas...");
    await client.connect();

    // Agregar columna is_new
    console.log("Añadiendo columna is_new...");
    await client.query('ALTER TABLE productos ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE;');

    // Agregar columna is_offer
    console.log("Añadiendo columna is_offer...");
    await client.query('ALTER TABLE productos ADD COLUMN IF NOT EXISTS is_offer BOOLEAN DEFAULT FALSE;');

    console.log("✅ Columnas añadidas con éxito.");
  } catch (err) {
    console.error("❌ Error ejecutando migración:", err);
  } finally {
    await client.end();
  }
}

run();
