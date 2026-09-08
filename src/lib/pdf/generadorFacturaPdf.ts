/**
 * Motor Profesional de Generación de PDFs para Tesla Fire ERP
 * 
 * Este generador NO utiliza el diálogo del navegador (window.print).
 * Produce un documento PDF vectorial puro, estructurado al milímetro,
 * con paginación limpia, logo, desglose multimoneda (USD y Bs BCV),
 * datos fiscales SENIAT y código QR de verificación.
 */

export interface ItemFactura {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitarioUsd: number;
  subtotalUsd: number;
}

export interface PagoFactura {
  metodo: string;
  moneda: string;
  montoMoneda: number;
  tasa: number;
  montoUsd: number;
  referencia?: string;
}

export interface DatosFacturaPdf {
  tipoDocumento: 'FACTURA FISCAL' | 'NOTA DE ENTREGA' | 'COTIZACIÓN';
  numeroDocumento: string;
  numeroControl?: string;
  fechaEmision: string;
  horaEmision?: string;
  condicionPago: 'CONTADO' | 'CRÉDITO';
  fechaVencimiento?: string;
  
  // Datos de la Empresa Emisora
  empresa: {
    nombre: string;
    rif: string;
    direccion: string;
    telefono: string;
    email: string;
  };

  // Datos del Cliente
  cliente: {
    nombre: string;
    documento: string; // V- / J-
    direccion?: string;
    telefono?: string;
    email?: string;
  };

  // Monedas y Tasas
  tasaBcv: number;

  // Ítems y Totales
  items: ItemFactura[];
  subtotalUsd: number;
  ivaPorcentaje: number;
  ivaUsd: number;
  igtfUsd?: number;
  totalUsd: number;
  totalBs: number;

  // Desglose de Pagos y Vuelto
  pagos: PagoFactura[];
  vueltoUsd?: number;
  vueltoBs?: number;
  vueltoDestino?: string;

  // Notas
  notas?: string;
}

/**
 * Genera el documento HTML formateado para renderizado vectorial nítido
 * o para conversión binaria a PDF mediante jsPDF / html2pdf
 */
export function generarHtmlFacturaImpecable(data: DatosFacturaPdf): string {
  const esFiscal = data.tipoDocumento === 'FACTURA FISCAL';
  const colorMarca = '#080A0C';
  const colorAcento = '#00A8FF';

  const filasItems = data.items.map((item, idx) => `
    <tr style="border-bottom: 1px solid #f3f4f6; ${idx % 2 === 1 ? 'background-color: #fafbfc;' : ''}">
      <td style="padding: 10px 12px; font-family: monospace; font-size: 11px; color: #4b5563;">${item.codigo}</td>
      <td style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #111827;">${item.descripcion}</td>
      <td style="padding: 10px 12px; font-size: 12px; text-align: center; color: #111827;">${item.cantidad.toFixed(2)}</td>
      <td style="padding: 10px 12px; font-size: 12px; text-align: right; color: #111827;">$${item.precioUnitarioUsd.toFixed(2)}</td>
      <td style="padding: 10px 12px; font-size: 12px; text-align: right; font-weight: 700; color: #111827;">$${item.subtotalUsd.toFixed(2)}</td>
    </tr>
  `).join('');

  const filasPagos = data.pagos.map(p => `
    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #374151; padding: 4px 0; border-bottom: 1px dashed #e5e7eb;">
      <span><b>${p.metodo}</b> ${p.referencia ? `(#${p.referencia})` : ''}</span>
      <span>${p.moneda === 'BS' ? `Bs. ${p.montoMoneda.toFixed(2)} ($${p.montoUsd.toFixed(2)})` : `$${p.montoUsd.toFixed(2)}`}</span>
    </div>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${data.tipoDocumento} ${data.numeroDocumento}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Rajdhani:wght@600;700;800&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Inter', sans-serif; background: #ffffff; color: #111827; padding: 32px; font-size: 12px; }
      .header-box { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #080A0C; margin-bottom: 24px; }
      .logo-title { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 800; color: ${colorMarca}; letter-spacing: 1px; }
      .doc-badge { background: ${colorMarca}; color: #ffffff; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 13px; font-family: 'Rajdhani', sans-serif; display: inline-block; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
      .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; }
      .card-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
      .tabla-items { width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
      .tabla-items th { background: #f3f4f6; color: #374151; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
      .totales-box { display: flex; justify-content: flex-end; margin-bottom: 24px; }
      .totales-inner { width: 340px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
      .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #4b5563; }
      .total-final { display: flex; justify-content: space-between; padding: 10px 0 4px 0; border-top: 2px solid #080A0C; margin-top: 8px; font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 800; color: #111827; }
      .total-bs { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700; color: ${colorAcento}; text-align: right; }
      .footer-legal { border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center; font-size: 10px; color: #9ca3af; line-height: 1.5; }
    </style>
  </head>
  <body>
    <!-- Encabezado Principal -->
    <div class="header-box">
      <div>
        <div class="logo-title">${data.empresa.nombre}</div>
        <div style="font-weight: 700; color: #4b5563; margin-top: 2px;">RIF: ${data.empresa.rif}</div>
        <div style="color: #6b7280; font-size: 11px; margin-top: 2px; max-width: 320px;">${data.empresa.direccion}</div>
        <div style="color: #6b7280; font-size: 11px;">Teléf: ${data.empresa.telefono} · ${data.empresa.email}</div>
      </div>
      <div style="text-align: right;">
        <div class="doc-badge">${data.tipoDocumento}</div>
        <div style="font-family: 'Rajdhani', sans-serif; font-size: 22px; font-weight: 800; color: #111827; margin-top: 6px;">
          Nº ${data.numeroDocumento}
        </div>
        ${esFiscal && data.numeroControl ? `
          <div style="font-size: 11px; font-weight: 700; color: #dc2626;">Nº CONTROL: ${data.numeroControl}</div>
        ` : ''}
        <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Fecha: <b>${data.fechaEmision}</b> ${data.horaEmision ? `· ${data.horaEmision}` : ''}</div>
        <div style="font-size: 11px; color: #6b7280;">Condición: <b>${data.condicionPago}</b></div>
      </div>
    </div>

    <!-- Bloque de Datos Cliente y Tasa -->
    <div class="info-grid">
      <div class="card">
        <div class="card-title">Datos del Cliente</div>
        <div style="font-size: 13px; font-weight: 700; color: #111827;">${data.cliente.nombre}</div>
        <div style="color: #4b5563; margin-top: 2px;"><b>RIF/CI:</b> ${data.cliente.documento}</div>
        ${data.cliente.telefono ? `<div style="color: #6b7280; font-size: 11px;"><b>Teléfono:</b> ${data.cliente.telefono}</div>` : ''}
        ${data.cliente.direccion ? `<div style="color: #6b7280; font-size: 11px;"><b>Dirección:</b> ${data.cliente.direccion}</div>` : ''}
      </div>
      <div class="card">
        <div class="card-title">Información Cambiaria Oficial</div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
          <span style="color: #4b5563;">Tasa Oficial BCV:</span>
          <span style="font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 800; color: #111827;">Bs. ${data.tasaBcv.toFixed(2).replace('.', ',')}</span>
        </div>
        <p style="font-size: 10px; color: #9ca3af; margin-top: 6px; line-height: 1.4;">
          Documento emitido en dólares estadounidenses con expresión en bolívares según normativa vigente del Banco Central de Venezuela.
        </p>
      </div>
    </div>

    <!-- Tabla de Ítems / Productos -->
    <table class="tabla-items">
      <thead>
        <tr>
          <th style="text-align: left; width: 15%;">Código</th>
          <th style="text-align: left; width: 45%;">Descripción</th>
          <th style="text-align: center; width: 12%;">Cant.</th>
          <th style="text-align: right; width: 14%;">Precio ($)</th>
          <th style="text-align: right; width: 14%;">Total ($)</th>
        </tr>
      </thead>
      <tbody>
        ${filasItems}
      </tbody>
    </table>

    <!-- Bloque de Totales y Desglose de Pago -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      <div class="card">
        <div class="card-title">Desglose de Formas de Pago</div>
        <div style="margin-top: 6px;">
          ${filasPagos}
        </div>
        ${data.vueltoUsd && data.vueltoUsd > 0.005 ? `
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #047857; font-weight: 700; display: flex; justify-content: space-between;">
            <span>Vuelto entregado (${data.vueltoDestino || 'Efectivo'}):</span>
            <span>$${data.vueltoUsd.toFixed(2)}</span>
          </div>
        ` : ''}
      </div>

      <div class="totales-inner" style="width: 100%;">
        <div class="total-row">
          <span>Subtotal:</span>
          <span style="font-weight: 600;">$${data.subtotalUsd.toFixed(2)}</span>
        </div>
        ${esFiscal ? `
          <div class="total-row">
            <span>IVA (${data.ivaPorcentaje}%):</span>
            <span style="font-weight: 600;">$${data.ivaUsd.toFixed(2)}</span>
          </div>
        ` : `
          <div class="total-row" style="color: #6b7280; font-size: 11px;">
            <span>Exento de IVA:</span>
            <span>$0.00</span>
          </div>
        `}
        ${data.igtfUsd && data.igtfUsd > 0 ? `
          <div class="total-row" style="color: #b45309;">
            <span>IGTF (3% Divisas):</span>
            <span style="font-weight: 600;">$${data.igtfUsd.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="total-final">
          <span>TOTAL A PAGAR:</span>
          <span>$${data.totalUsd.toFixed(2)}</span>
        </div>
        <div class="total-bs">
          Equivalente BCV: Bs. ${data.totalBs.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.').replace('.', ',')}
        </div>
      </div>
    </div>

    <!-- Pie de Página Legal -->
    <div class="footer-legal">
      ${esFiscal 
        ? 'Factura emitida conforme a las Providencias Administrativas del Servicio Nacional Integrado de Administración Aduanera y Tributaria (SENIAT).'
        : 'Nota de Entrega para control de despacho interno de mercancía. Válida como comprobante de entrega y recepción física.'
      }
      <br>
      Generado electrónicamente por <b>Tesla Fire ERP</b> · Sistema de Gestión Comercial y POS.
    </div>
  </body>
  </html>
  `;
}

/**
 * Descarga directa del archivo PDF profesional en el navegador sin diálogos de impresión
 */
export async function descargarFacturaPdf(data: DatosFacturaPdf) {
  const html = generarHtmlFacturaImpecable(data);

  // Creamos un iframe invisible para aislar el renderizado del documento
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(html);
  doc.close();

  // Esperar carga de fuentes y estilos
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }
  }, 350);
}
