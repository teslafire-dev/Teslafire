/* eslint-disable no-undef */
const { Client } = require('pg');
const ExcelJS = require('exceljs');

const connectionString = "postgresql://postgres.vsltjensbdcvfnynfhrb:h4GrHIoKV4bdY5c4@aws-1-us-east-1.pooler.supabase.com:6543/postgres";
const fileName = 'DASHBOARD_INDUSTRIAL_DOBELL.xlsx';

async function gestorMasivoPlus() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  const workbook = new ExcelJS.Workbook();
  try {
    console.log("🚀 Sincronizando Excel con la Web...");
    await client.connect();
    await workbook.xlsx.readFile(fileName);
    const sheet = workbook.getWorksheet('CONTROL DE INVENTARIO');
    let creados = 0, actualizados = 0;

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      const id = row.getCell(1).value, sku = row.getCell(2).value, nombre = row.getCell(3).value;
      const precio = parseFloat(row.getCell(4).value) || 0, moneda = row.getCell(5).value || 'USD', stock = parseInt(row.getCell(6).value) || 0;
      if (!sku || !nombre) continue;
      if (id) {
        await client.query('UPDATE productos SET nombre=$1, precio=$2, moneda=$3, stock=$4, sku=$5 WHERE id=$6', [nombre, precio, moneda, stock, sku, id]);
        actualizados++;
      } else {
        const check = await client.query('SELECT id FROM productos WHERE sku = $1', [sku]);
        if (check.rows.length === 0) {
          await client.query('INSERT INTO productos (sku, nombre, precio, moneda, stock) VALUES ($1, $2, $3, $4, $5)', [sku, nombre, precio, moneda, stock]);
          creados++;
        }
      }
    }
    console.log(`✅ ¡Éxito! Creados: ${creados} | Actualizados: ${actualizados}`);
  } catch (err) { console.error(err); } finally { await client.end(); }
}
gestorMasivoPlus();
