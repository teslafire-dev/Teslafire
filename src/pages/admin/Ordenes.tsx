import { ShoppingBag, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AdminOrdenes() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Gestión de Órdenes</h1>
          <p className="text-slate-500 font-medium tracking-wide">Administración y seguimiento de reservas y cotizaciones.</p>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-50 shadow-sm p-24 text-center flex flex-col items-center gap-8">
        <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
          <ShoppingBag className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-2xl font-black text-primary-950 uppercase tracking-tighter">Módulo en Desarrollo</h2>
        <p className="text-slate-500 font-medium max-w-md uppercase tracking-widest text-[10px]">
          Próximamente podrá gestionar todas las órdenes y cotizaciones desde este panel centralizado.
        </p>
      </div>
    </div>
  );
}
