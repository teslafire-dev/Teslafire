const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Client } = require('pg');
const ExcelJS = require('exceljs');

const connectionString = "postgresql://postgres.vsltjensbdcvfnynfhrb:h4GrHIoKV4bdY5c4@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    backgroundColor: '#0F172A'
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Evento para Exportar Excel
ipcMain.handle('export-excel', async () => {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('CONTROL DE INVENTARIO');

  try {
    await client.connect();
    sheet.columns = [
      { header: 'ID INTERNO', key: 'id', width: 15 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'NOMBRE DEL PRODUCTO', key: 'nombre', width: 45 },
      { header: 'PRECIO BASE', key: 'precio', width: 15 },
      { header: 'CONFIG MONEDA', key: 'moneda', width: 25 },
      { header: 'STOCK ACTUAL', key: 'stock', width: 15 }
    ];
    
    // Styling header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };

    const res = await client.query('SELECT id, sku, nombre, precio, moneda, stock FROM productos ORDER BY updated_at DESC');
    res.rows.forEach(prod => sheet.addRow(prod));
    
    const filePath = path.join(app.getPath('desktop'), 'DASHBOARD_INDUSTRIAL_DOBELL.xlsx');
    await workbook.xlsx.writeFile(filePath);
    await client.end();
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Evento para Importar Excel
ipcMain.handle('import-excel', async () => {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(app.getPath('desktop'), 'DASHBOARD_INDUSTRIAL_DOBELL.xlsx');

  try {
    await client.connect();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet('CONTROL DE INVENTARIO');
    let count = 0;

    for (let i = 2; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);
        const id = row.getCell(1).value, sku = row.getCell(2).value, nombre = row.getCell(3).value;
        const precio = parseFloat(row.getCell(4).value) || 0, moneda = row.getCell(5).value || 'USD', stock = parseInt(row.getCell(6).value) || 0;
        if (!sku || !nombre) continue;
        if (id) {
            await client.query('UPDATE productos SET nombre=$1, precio=$2, moneda=$3, stock=$4, sku=$5 WHERE id=$6', [nombre, precio, moneda, stock, sku, id]);
            count++;
        } else {
            const check = await client.query('SELECT id FROM productos WHERE sku = $1', [sku]);
            if (check.rows.length === 0) {
                await client.query('INSERT INTO productos (sku, nombre, precio, moneda, stock) VALUES ($1, $2, $3, $4, $5)', [sku, nombre, precio, moneda, stock]);
                count++;
            }
        }
    }
    await client.end();
    return { success: true, count };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
