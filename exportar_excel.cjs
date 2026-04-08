const { Client } = require('pg');
const ExcelJS = require('exceljs');

const connectionString = "postgresql://postgres.vsltjensbdcvfnynfhrb:h4GrHIoKV4bdY5c4@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

async function crearDashboard() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('CONTROL DE INVENTARIO');

  try {
    console.log("🚀 Generando Dashboard...");
    await client.connect();
    sheet.columns = [
      { header: 'ID INTERNO', key: 'id', width: 15 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'NOMBRE DEL PRODUCTO', key: 'nombre', width: 45 },
      { header: 'PRECIO BASE', key: 'precio', width: 15, style: { numFmt: '"$"#,##0.00' } },
      { header: 'CONFIG MONEDA', key: 'moneda', width: 25 },
      { header: 'STOCK ACTUAL', key: 'stock', width: 15 },
      { header: 'FECHA ACT.', key: 'updated_at', width: 20 }
    ];
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };

    const res = await client.query('SELECT id, sku, nombre, precio, moneda, stock, updated_at FROM productos ORDER BY updated_at DESC');
    res.rows.forEach(prod => sheet.addRow(prod));
    sheet.autoFilter = 'A1:G1';
    await workbook.xlsx.writeFile('DASHBOARD_INDUSTRIAL_DOBELL.xlsx');
    console.log("✅ Dashboard generado: DASHBOARD_INDUSTRIAL_DOBELL.xlsx");
  } catch (err) { console.error(err); } finally { await client.end(); }
}
crearDashboard();
