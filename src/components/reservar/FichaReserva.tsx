import { CheckCircle2, FileText, Info } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface FichaReservaProps {
  order: any;
}

export default function FichaReserva({ order }: FichaReservaProps) {
  if (!order) return null;

  const date = order.created_at ? new Date(order.created_at) : new Date();

  return (
    <div id="ficha-impresion" className="bg-white p-6 pt-2 text-slate-900 font-outfit max-w-[800px] mx-auto border-[4px] border-primary-950 hidden print:block overflow-visible min-h-[1000px]">
      {/* Header Facture */}
      <div className="flex justify-between items-start border-b-2 border-primary-950 pb-4 mb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary-950 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-2xl font-black uppercase tracking-tighter text-primary-950">Dobell Industrial</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suministros de Seguridad Industrial & Salud Ocupacional</p>
        </div>
        <div className="flex flex-col items-end gap-0.5 pt-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ficha de Reserva Técnica</span>
          <div className="text-2xl font-black text-primary-950 tracking-tighter leading-none my-1">{order.localizador}</div>
          <div className="text-[10px] font-black text-slate-500 uppercase">{format(date, "PPPP", { locale: es })}</div>
        </div>
      </div>

      {/* Grid: Client & Info */}
      <div className="grid grid-cols-2 gap-6 mb-5">
         <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
            <h3 className="text-[11px] font-black text-primary-950 uppercase tracking-[0.4em] mb-1">Información del Cliente</h3>
            <div className="flex flex-col gap-1">
               <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Nombre Completo:</div>
               <div className="text-sm font-black uppercase">{order.cliente_nombre}</div>
            </div>
            <div className="flex flex-col gap-1">
               <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Identificación / RIF:</div>
               <div className="text-sm font-black uppercase">{order.cliente_cedula}</div>
            </div>
            <div className="flex flex-col gap-1">
               <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Teléfono:</div>
               <div className="text-sm font-black">{order.cliente_telefono}</div>
            </div>
         </div>

         <div className="flex flex-col gap-6 pt-4">
            <div className="flex items-start gap-4">
               <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-orange-600" />
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-black uppercase text-primary-950">Estado de Reserva</span>
                  <p className="text-[11px] text-slate-500 leading-tight font-medium">Su reserva tiene una validez de 48 horas continuas.</p>
               </div>
            </div>
            <div className="flex items-start gap-4">
               <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-black uppercase text-primary-950">Verificado por Portal</span>
                  <p className="text-[11px] text-slate-500 leading-tight font-medium">Comprobante técnico-industrial verificado.</p>
               </div>
            </div>
         </div>
      </div>

      {/* Table: Products */}
      <div className="mb-6">
        <h3 className="text-[11px] font-black text-primary-950 uppercase tracking-[0.4em] mb-4 px-1">Detalle de Equipos Reservados</h3>
        <table className="w-full">
           <thead>
              <tr className="border-b-2 border-primary-950 text-left">
                 <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest">SKU</th>
                 <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest">Descripción</th>
                 <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest text-center">Cant.</th>
                 <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest text-right">Unitario</th>
                 <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest text-right">Total</th>
              </tr>
           </thead>
           <tbody>
              {order.productos?.map((p: any, i: number) => (
                <tr key={i} className="border-b border-slate-100">
                   <td className="py-3.5 px-3 text-[11px] font-black text-slate-400">{p.sku}</td>
                   <td className="py-3.5 px-3 text-[11px] font-black uppercase text-primary-950">{p.nombre}</td>
                   <td className="py-3.5 px-3 text-[11px] font-black text-center">{p.cantidad}</td>
                   <td className="py-3.5 px-3 text-[11px] font-black text-right">${p.precio?.toFixed(2)}</td>
                   <td className="py-3.5 px-3 text-[12px] font-black text-right text-primary-950">${(p.precio * p.cantidad).toFixed(2)}</td>
                </tr>
              ))}
           </tbody>
           <tfoot>
              <tr className="bg-primary-950 text-white">
                 <td colSpan={3} className="py-5 px-5 text-[11px] font-black uppercase tracking-widest">Total Operación (USD)</td>
                 <td colSpan={2} className="py-5 px-5 text-2xl font-black text-right tracking-tighter">${order.total}</td>
              </tr>
           </tfoot>
        </table>
      </div>

      {/* Footer Info */}
      <div className="grid grid-cols-3 gap-8 mt-auto pt-8 border-t border-slate-100">
         <div className="col-span-2 flex flex-col gap-5">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-accent underline">Términos del Suministro:</h4>
            <div className="grid grid-cols-2 gap-x-10 gap-y-3">
               {[
                 "Vencimiento: 48 Horas.",
                 "Pago: Divisas / BS / Pago Móvil.",
                 "Lugar: Tienda Física.",
                 "Stock sujeto a validación."
               ].map((t, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-950 shrink-0"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{t}</span>
                 </div>
               ))}
            </div>
            <div className="mt-5 flex items-center justify-center p-5 border-2 border-dashed border-slate-200 rounded-2xl opacity-50">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">Dobell Industrial • Sello de Verificación Digital</span>
            </div>
         </div>
         <div className="flex flex-col items-center justify-center gap-4 bg-slate-50 p-6 rounded-2xl">
            <div className="w-24 h-24 border-2 border-primary-950 p-1 flex items-center justify-center">
               <div className="grid grid-cols-4 gap-1 w-full h-full">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`w-full h-full ${Math.random() > 0.5 ? 'bg-primary-950' : 'bg-transparent'}`}></div>
                  ))}
               </div>
            </div>
            <span className="text-[10px] font-black uppercase text-center text-slate-400 leading-tight">Escaneo Taquilla</span>
         </div>
      </div>
    </div>
  );
}
