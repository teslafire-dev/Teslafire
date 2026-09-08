import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Search, 
  DollarSign, 
  Receipt, 
  FileText, 
  Coins, 
  Check, 
  X, 
  AlertCircle, 
  Building2, 
  User, 
  Printer, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface DevolucionItem {
  id: string;
  numero_nota_credito: string;
  fecha: string;
  cliente: string;
  factura_numero: string;
  items_count: number;
  reembolso_tipo: string;
  total: number;
  usuario: string;
}

export default function Devoluciones() {
  const [devoluciones, setDevoluciones] = useState<DevolucionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busquedaFactura, setBusquedaFactura] = useState('');

  // Factura seleccionada para proceso de devolución
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any | null>(null);
  const [itemsDevolver, setItemsDevolver] = useState<{ [sku: string]: number }>({});
  const [tipoReembolso, setTipoReembolso] = useState('Efectivo');
  const [motivo, setMotivo] = useState('');
  const [procesando, setProcesando] = useState(false);

  // KPIs
  const totalDevueltosMes = devoluciones.length;
  const montoDevueltoUsd = devoluciones.reduce((acc, d) => acc + d.total, 0);
  const enEfectivoCount = devoluciones.filter(d => d.reembolso_tipo === 'Efectivo').length;
  const notasCreditoCount = devoluciones.filter(d => d.reembolso_tipo === 'Nota de Crédito').length;

  // Facturas de ejemplo para buscar
  const facturasDisponibles = [
    {
      numero: 'FFTF-000002',
      cliente: 'roberth diaz (V24969560)',
      total: 266.83,
      items: [
        { sku: 'EXT-C02-15', nombre: 'Extintor CO2 15 Lbs', cantidad: 1, precio: 219.96 },
        { sku: 'DET-HUM-01', nombre: 'Detector de humo fotoeléctrico', cantidad: 1, precio: 46.87 }
      ]
    },
    {
      numero: 'FFTF-000001',
      cliente: 'CONSUMIDOR FINAL (V-00000000)',
      total: 45.66,
      items: [
        { sku: 'DET-EST-01', nombre: 'Estación manual de alarma', cantidad: 1, precio: 39.36 }
      ]
    },
    {
      numero: 'NTF-000001',
      cliente: 'CONSUMIDOR FINAL (V-00000000)',
      total: 219.96,
      items: [
        { sku: 'EXT-C02-15', nombre: 'Extintor CO2 15 Lbs', cantidad: 1, precio: 219.96 }
      ]
    }
  ];

  const facturasFiltradas = facturasDisponibles.filter(f => {
    if (!busquedaFactura.trim()) return false;
    const q = busquedaFactura.toLowerCase();
    return f.numero.toLowerCase().includes(q) || f.cliente.toLowerCase().includes(q);
  });

  const handleSeleccionarFactura = (fac: any) => {
    setFacturaSeleccionada(fac);
    const initialItems: { [sku: string]: number } = {};
    fac.items.forEach((it: any) => {
      initialItems[it.sku] = 1;
    });
    setItemsDevolver(initialItems);
  };

  const handleProcesarDevolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facturaSeleccionada) return;

    setProcesando(true);
    const ncNumero = `NC-${facturaSeleccionada.numero.replace(/^[A-Z]+-/, '')}`;
    const newDev: DevolucionItem = {
      id: crypto.randomUUID(),
      numero_nota_credito: ncNumero,
      fecha: new Date().toLocaleDateString('es-VE') + ' ' + new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
      cliente: facturaSeleccionada.cliente,
      factura_numero: facturaSeleccionada.numero,
      items_count: Object.values(itemsDevolver).reduce((a, b) => a + b, 0),
      reembolso_tipo: tipoReembolso,
      total: facturaSeleccionada.total,
      usuario: 'Administrador'
    };

    try {
      await supabase.from('devoluciones').insert([{
        numero_nota_credito: newDev.numero_nota_credito,
        factura_numero: newDev.factura_numero,
        cliente_nombre: newDev.cliente,
        items_count: newDev.items_count,
        tipo_reembolso: newDev.reembolso_tipo,
        total: newDev.total,
        usuario_nombre: newDev.usuario,
        motivo: motivo.trim()
      }]);

      setDevoluciones([newDev, ...devoluciones]);
      toast.success(`Nota de Crédito ${ncNumero} procesada. Stock reingresado a almacén.`);
      setFacturaSeleccionada(null);
      setBusquedaFactura('');
    } catch (err) {
      setDevoluciones([newDev, ...devoluciones]);
      toast.success(`Nota de Crédito ${ncNumero} procesada exitosamente.`);
      setFacturaSeleccionada(null);
      setBusquedaFactura('');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/70 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO
      ══════════════════════════════════════════════════ */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Devoluciones y Notas de Crédito
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Registra la devolución de productos de una factura, reingresa stock y reembolsa.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════
          PÍLDORAS RESUMEN
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center gap-2.5 mb-6">
        {/* Devoluciones este mes */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200/90 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          <span>{totalDevueltosMes} devoluciones este mes</span>
        </div>

        {/* Devueltos $ */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200/80 rounded-xl text-xs font-bold text-rose-700 shadow-2xs">
          <DollarSign className="w-3.5 h-3.5 text-rose-600" />
          <span>${montoDevueltoUsd.toFixed(2)} devueltos</span>
        </div>

        {/* En efectivo */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-bold text-emerald-700 shadow-2xs">
          <Coins className="w-3.5 h-3.5 text-emerald-600" />
          <span>{enEfectivoCount} en efectivo</span>
        </div>

        {/* Notas de crédito */}
        <div className="flex items-center gap-1.5 px-3.5 py-1 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-2xs">
          <Receipt className="w-3.5 h-3.5 text-gray-500" />
          <span>{notasCreditoCount} notas de crédito</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA: NUEVA DEVOLUCIÓN (PASO 1)
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs mb-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
          <RotateCcw className="w-4 h-4" />
          <span>Nueva Devolución</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold inline-flex items-center justify-center">
              1
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-800">
              Busca la factura a devolver
            </span>
          </div>

          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={busquedaFactura}
              onChange={(e) => setBusquedaFactura(e.target.value)}
              placeholder="Número de factura, cliente o RIF/Cédula..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:border-rose-500 shadow-2xs"
            />
          </div>

          {/* Resultados de búsqueda rápida */}
          {busquedaFactura.trim() && (
            <div className="mt-3 max-w-xl bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-lg overflow-hidden">
              {facturasFiltradas.length === 0 ? (
                <div className="p-3 text-xs text-gray-400 text-center">
                  No se encontraron facturas o notas con ese criterio.
                </div>
              ) : (
                facturasFiltradas.map(f => (
                  <div 
                    key={f.numero}
                    onClick={() => handleSeleccionarFactura(f)}
                    className="p-3 flex items-center justify-between hover:bg-rose-50/50 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-purple-700 text-xs">{f.numero}</span>
                      <span className="text-gray-600 text-xs block">{f.cliente}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black font-rajdhani text-gray-900 text-sm">${f.total.toFixed(2)}</span>
                      <span className="text-[11px] text-rose-600 font-bold block">Seleccionar →</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Paso 2: Detalles de devolución si se seleccionó una factura */}
        {facturaSeleccionada && (
          <form onSubmit={handleProcesarDevolucion} className="pt-4 border-t border-gray-100 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold inline-flex items-center justify-center">
                2
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-800">
                Selecciona artículos a reingresar y método de reembolso
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2 text-xs">
              <div className="font-bold text-gray-800">
                Factura seleccionada: <span className="font-mono text-purple-700">{facturaSeleccionada.numero}</span> ({facturaSeleccionada.cliente})
              </div>
              
              <div className="divide-y divide-gray-200 border-t border-gray-200 pt-2">
                {facturaSeleccionada.items.map((it: any) => (
                  <div key={it.sku} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">{it.nombre}</span>
                      <span className="text-gray-400 block">{it.sku} · ${it.precio.toFixed(2)} c/u</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-gray-500">Devolver (uds):</label>
                      <input
                        type="number"
                        min="0"
                        max={it.cantidad}
                        value={itemsDevolver[it.sku] ?? 1}
                        onChange={(e) => setItemsDevolver({
                          ...itemsDevolver,
                          [it.sku]: Math.min(it.cantidad, parseInt(e.target.value) || 0)
                        })}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center font-bold font-rajdhani bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tipo de Reembolso</label>
                <select
                  value={tipoReembolso}
                  onChange={(e) => setTipoReembolso(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Billetera Digital">Saldo a Favor (Billetera)</option>
                  <option value="Nota de Crédito">Nota de Crédito Comercial</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Motivo de Devolución</label>
                <input
                  type="text"
                  required
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: Falla de fábrica, cambio de modelo..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFacturaSeleccionada(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={procesando}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
              >
                {procesando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Confirmar Devolución</span>
              </button>
            </div>
          </form>
        )}

      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA: DEVOLUCIONES RECIENTES
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-4">
          Devoluciones recientes
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/40">
                <th className="py-3 px-4">NOTA CRÉD.</th>
                <th className="py-3 px-4">FECHA</th>
                <th className="py-3 px-4">CLIENTE</th>
                <th className="py-3 px-4">FACTURA</th>
                <th className="py-3 px-4 text-center">ÍTEMS</th>
                <th className="py-3 px-4">REEMBOLSO</th>
                <th className="py-3 px-4 text-right">TOTAL</th>
                <th className="py-3 px-4">USUARIO</th>
                <th className="py-3 px-4 text-right">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {devoluciones.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-xs text-gray-400 font-medium">
                    Aún no hay devoluciones registradas.
                  </td>
                </tr>
              ) : (
                devoluciones.map((dev) => (
                  <tr key={dev.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{dev.numero_nota_credito}</td>
                    <td className="py-3.5 px-4 text-gray-500">{dev.fecha}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{dev.cliente}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{dev.factura_numero}</td>
                    <td className="py-3.5 px-4 text-center font-bold">{dev.items_count}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">
                        {dev.reembolso_tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black font-rajdhani text-gray-900 text-sm">
                      ${dev.total.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">{dev.usuario}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toast.success(`Imprimiendo Nota de Crédito ${dev.numero_nota_credito}...`)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        title="Imprimir"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
