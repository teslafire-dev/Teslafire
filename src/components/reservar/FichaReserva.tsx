import { CheckCircle2, FileText, Info } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface FichaReservaProps {
  order: any;
}

export default function FichaReserva({ order }: FichaReservaProps) {
  if (!order) return null;

  const date = order.created_at ? new Date(order.created_at) : new Date();
  const productos = order.productos || [];
  
  // Agrupar productos por páginas (e.g., 10 por página para asegurar que quepa el footer)
  const ITEMS_PER_PAGE = 8;
  const pages = [];
  for (let i = 0; i < productos.length; i += ITEMS_PER_PAGE) {
    pages.push(productos.slice(i, i + ITEMS_PER_PAGE));
  }

  return (
    <div id="ficha-impresion" className="hidden print:block bg-white text-slate-900 font-outfit">
      {pages.map((pageItems, pageIdx) => (
        <div 
          key={pageIdx} 
          className="page-container relative bg-white p-12 mx-auto border-[10px] border-primary-950 flex flex-col pt-8"
          style={{ 
            height: '297mm', 
            width: '210mm', 
            pageBreakAfter: 'always',
            marginBottom: '0',
            boxSizing: 'border-box'
          }}
        >
          {/* Header Facture */}
          <div className="flex justify-between items-start border-b-4 border-primary-950 pb-6 mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary-950 rounded-xl flex items-center justify-center">
                    <FileText className="w-7 h-7 text-white" />
                 </div>
                 <h1 className="text-3xl font-black uppercase tracking-tighter text-primary-950">Dobell Industrial</h1>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Suministros de Seguridad Industrial & Salud Ocupacional</p>
            </div>
            <div className="flex flex-col items-end gap-1 pt-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Ficha de Reserva Técnica</span>
              <div className="text-3xl font-black text-primary-950 tracking-tighter leading-none my-1">{order.localizador}</div>
              <div className="text-[11px] font-black text-slate-500 uppercase">{format(date, "PPPP", { locale: es })}</div>
              <span className="text-[10px] font-black text-accent mt-1">Página {pageIdx + 1} de {pages.length}</span>
            </div>
          </div>

          {/* Grid: Client & Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
             <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col gap-5">
                <h3 className="text-[12px] font-black text-primary-950 uppercase tracking-[0.4em] mb-1">Información del Cliente</h3>
                <div className="flex flex-col gap-1">
                   <div className="text-[11px] text-slate-400 uppercase font-black tracking-widest leading-none">Nombre Completo:</div>
                   <div className="text-base font-black uppercase leading-tight">{order.cliente_nombre}</div>
                </div>
                <div className="flex flex-col gap-1">
                   <div className="text-[11px] text-slate-400 uppercase font-black tracking-widest leading-none">Identificación / RIF:</div>
                   <div className="text-base font-black uppercase leading-tight">{order.cliente_cedula}</div>
                </div>
                <div className="flex flex-col gap-1">
                   <div className="text-[11px] text-slate-400 uppercase font-black tracking-widest leading-none">Teléfono:</div>
                   <div className="text-base font-black leading-tight">{order.cliente_telefono}</div>
                </div>
             </div>

             <div className="flex flex-col gap-8 pt-6">
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                      <Info className="w-5 h-5 text-orange-600" />
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-xs font-black uppercase text-primary-950">Estado de Reserva</span>
                      <p className="text-xs text-slate-500 leading-tight font-medium">Esta cotización tiene una validez de 48 horas continuas.</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-xs font-black uppercase text-primary-950">Verificación Digital</span>
                      <p className="text-xs text-slate-500 leading-tight font-medium">Documento generado oficialmente por el Portal Dobell.</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Table: Products */}
          <div className="flex-grow">
            <h3 className="text-[12px] font-black text-primary-950 uppercase tracking-[0.4em] mb-6 px-1 flex justify-between items-center">
              <span>Detalle de Equipos Reservados</span>
              <span className="text-slate-300 font-bold tracking-normal italic text-[10px]">Corte de página {pageIdx + 1}</span>
            </h3>
            <table className="w-full border-collapse">
               <thead>
                  <tr className="border-b-4 border-primary-950 text-left">
                     <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest">SKU</th>
                     <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest">Descripción del Equipamiento</th>
                     <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest text-center">Cant.</th>
                     <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest text-right">Unitario</th>
                     <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest text-right">Subtotal</th>
                  </tr>
               </thead>
               <tbody>
                  {pageItems.map((p: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                       <td className="py-5 px-4 text-[11px] font-black text-slate-400">{p.sku}</td>
                       <td className="py-5 px-4 text-[12px] font-black uppercase text-primary-950 leading-tight">{p.nombre}</td>
                       <td className="py-5 px-4 text-[12px] font-black text-center">{p.cantidad}</td>
                       <td className="py-5 px-4 text-[12px] font-black text-right">${p.precio?.toFixed(2)}</td>
                       <td className="py-5 px-4 text-[14px] font-black text-right text-primary-950">${(p.precio * p.cantidad).toFixed(2)}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>

          {/* Footer Info (Only on the last page show the total, or everywhere?) */}
          {/* Usually total goes on the last page, but user said "paginas iguales". Let's put total on all but mark as "Total Final" */}
          <div className="mt-8 border-t-4 border-primary-950 pt-8">
            {pageIdx === pages.length - 1 && (
               <div className="bg-primary-950 text-white flex justify-between items-center px-10 py-8 rounded-[2rem] mb-10 shadow-xl">
                  <div className="flex flex-col gap-1">
                     <span className="text-[12px] font-black uppercase tracking-[0.4em]">Total Operación</span>
                     <span className="text-[10px] text-slate-400 font-bold uppercase">Incluye impuestos y validación técnica</span>
                  </div>
                  <span className="text-5xl font-black tracking-tighter font-outfit">${order.total}</span>
               </div>
            )}

            <div className="grid grid-cols-3 gap-10">
               <div className="col-span-2 flex flex-col gap-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-accent underline underline-offset-4">Términos del Suministro Industrial:</h4>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                     {[
                       "Vencimiento: 48 Horas.",
                       "Pago: Divisas / BS / Pago Móvil.",
                       "Entrega: Inmediata (Sujeto a Stock).",
                       "Lugar: Tienda Física Principal."
                     ].map((t, i) => (
                       <div key={i} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary-950 shrink-0"></div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight leading-none">{t}</span>
                       </div>
                     ))}
                  </div>
                  <div className="mt-6 flex items-center justify-center p-6 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">Dobell Industrial • Sello Digital de Autenticidad</span>
                  </div>
               </div>
               <div className="flex flex-col items-center justify-center gap-5 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <div className="w-28 h-28 border-4 border-primary-950 p-2 bg-white flex items-center justify-center">
                     <div className="grid grid-cols-5 gap-1.5 w-full h-full">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div key={i} className={`w-full h-full ${Math.random() > 0.5 ? 'bg-primary-950' : 'bg-transparent'}`}></div>
                        ))}
                     </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Validación Taquilla</span>
                    <span className="text-[9px] font-bold text-slate-300">ID: {order.localizador}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @media screen {
          #ficha-impresion { display: none; }
        }
        @media print {
          body { 
            margin: 0 !important; 
            padding: 0 !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
          }
          #ficha-impresion { 
            display: block !important; 
            width: 210mm !important;
            margin: 0 auto !important;
          }
          .page-container {
            break-after: page;
            page-break-after: always;
          }
          header, footer, nav, button, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
