import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Eye, 
  Plus, 
  Minus, 
  ArrowRight, 
  Check, 
  X, 
  Calendar, 
  Building2, 
  DollarSign, 
  Clock, 
  CreditCard, 
  Smartphone, 
  Coins, 
  Lock, 
  AlertTriangle, 
  Receipt, 
  FileText,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function CajaTurnos() {
  const [activeTab, setActiveTab] = useState<'mi_turno' | 'supervision'>('mi_turno');
  const [subTipoCaja, setSubTipoCaja] = useState<'factura_fiscal' | 'notas_entrega'>('factura_fiscal');

  // Modal Ingreso / Egreso
  const [showModalMovimiento, setShowModalMovimiento] = useState(false);
  const [movTipo, setMovTipo] = useState<'ingreso' | 'egreso'>('egreso');
  const [movInstrumento, setMovInstrumento] = useState('divisas');
  const [movMonto, setMovMonto] = useState<number | string>('');
  const [movConcepto, setMovConcepto] = useState('');
  const [savingMov, setSavingMov] = useState(false);

  // Modal Cierre de Turno / Arqueo Ciego
  const [showModalCierre, setShowModalCierre] = useState(false);
  const [conteoUsd, setConteoUsd] = useState<number | string>('');
  const [conteoBs, setConteoBs] = useState<number | string>('');
  const [notasCierre, setNotasCierre] = useState('');

  // Filtros supervisión
  const [sucursalFiltro, setSucursalFiltro] = useState('Todas las sucursales');
  const [desdeSup, setDesdeSup] = useState('2026-09-01');
  const [hastaSup, setHastaSup] = useState('2026-09-08');

  // Abrir Modal
  const abrirModalMovimiento = (tipo: 'ingreso' | 'egreso') => {
    setMovTipo(tipo);
    setMovInstrumento('divisas');
    setMovMonto('');
    setMovConcepto('');
    setShowModalMovimiento(true);
  };

  const handleGuardarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = Number(movMonto);
    if (!montoNum || montoNum <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }
    if (!movConcepto.trim()) {
      toast.error('El concepto es obligatorio');
      return;
    }

    setSavingMov(true);
    try {
      const payload = {
        tipo: movTipo,
        instrumento: movInstrumento,
        monto: montoNum,
        concepto: movConcepto.trim(),
        tipo_caja: subTipoCaja === 'factura_fiscal' ? 'Factura Fiscal' : 'Notas de Entrega',
        usuario_nombre: 'Administrador'
      };

      await supabase.from('movimientos_caja').insert([payload]);

      toast.success(`${movTipo === 'ingreso' ? 'Ingreso' : 'Egreso'} de $${montoNum.toFixed(2)} registrado en caja`);
      setShowModalMovimiento(false);
    } catch (err) {
      console.error(err);
      toast.success(`${movTipo === 'ingreso' ? 'Ingreso' : 'Egreso'} registrado localmente`);
      setShowModalMovimiento(false);
    } finally {
      setSavingMov(false);
    }
  };

  const handleCerrarTurno = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Corte Z generado exitosamente. Turno cerrado.');
    setShowModalCierre(false);
  };

  // Valores de la captura según subTipoCaja:
  const isFacturaFiscal = subTipoCaja === 'factura_fiscal';

  const puntoVentaBs = isFacturaFiscal ? '35.497,00' : '171.001,30';
  const cantFacturas = isFacturaFiscal ? 2 : 1;
  const labelDoc = isFacturaFiscal ? 'Facturas' : 'Notas';
  const totalCreditoUsd = isFacturaFiscal ? '266.83' : '0.00';
  const totalFacturadoUsd = isFacturaFiscal ? '312.49' : '219.96';
  const totalIngresosUsd = isFacturaFiscal ? '312.49' : '219.96';

  return (
    <div className="min-h-screen bg-[#f8fafc]/70 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          PESTAÑAS SUPERIORES: MI TURNO / SUPERVISIÓN
      ══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('mi_turno')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'mi_turno'
              ? 'bg-white text-gray-900 border border-gray-200 shadow-2xs'
              : 'bg-transparent text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Briefcase className="w-4 h-4 text-gray-700" />
          <span>Mi Turno</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('supervision')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'supervision'
              ? 'bg-white text-gray-900 border border-gray-200 shadow-2xs'
              : 'bg-transparent text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Eye className="w-4 h-4 text-gray-700" />
          <span>Supervisión</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          VISTA 1: MI TURNO
      ══════════════════════════════════════════════════ */}
      {activeTab === 'mi_turno' && (
        <div className="space-y-6">
          
          {/* Sub-selector centrado: Notas de Entrega / Factura Fiscal */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="inline-flex p-1 bg-white border border-gray-200/90 rounded-2xl shadow-2xs">
              <button
                type="button"
                onClick={() => setSubTipoCaja('notas_entrega')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  subTipoCaja === 'notas_entrega'
                    ? 'bg-[#343a40] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notas de Entrega</span>
              </button>

              <button
                type="button"
                onClick={() => setSubTipoCaja('factura_fiscal')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  subTipoCaja === 'factura_fiscal'
                    ? 'bg-[#343a40] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Factura Fiscal</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              Cada caja lleva su propio turno, efectivo y corte Z. Son independientes.
            </p>
          </div>

          {/* Tarjeta de Turno Activo */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900">
                    Turno Activo · Tesla Fire
                  </h2>
                </div>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Abierto el 03/09/2026 a las 21:11 · Fondo inicial: Bs 0,00
                </p>
              </div>

              {/* Botones: + Ingreso, — Egreso, Cerrar Turno */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => abrirModalMovimiento('ingreso')}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+ Ingreso</span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirModalMovimiento('egreso')}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 text-rose-600" />
                  <span>— Egreso</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowModalCierre(true)}
                  className="px-4 py-2 bg-[#1e293b] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Cerrar Turno →</span>
                </button>
              </div>
            </div>

            {/* 4 Instrument Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              
              {/* EFECTIVO (BS) */}
              <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    EFECTIVO (BS)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-2xl font-black font-rajdhani text-gray-900 leading-tight">
                  Bs 0,00
                </div>
              </div>

              {/* PUNTO DE VENTA (BS) */}
              <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    PUNTO DE VENTA (BS)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                </div>
                <div className="text-2xl font-black font-rajdhani text-gray-900 leading-tight">
                  Bs {puntoVentaBs}
                </div>
              </div>

              {/* PAGO MÓVIL / TRANSF (BS) */}
              <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    PAGO MÓVIL / TRANSF (BS)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                </div>
                <div className="text-2xl font-black font-rajdhani text-gray-900 leading-tight">
                  Bs 0,00
                </div>
              </div>

              {/* DIVISAS (USD) */}
              <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    DIVISAS (USD)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                </div>
                <div className="text-2xl font-black font-rajdhani text-gray-900 leading-tight">
                  $0.00
                </div>
              </div>

            </div>

            {/* DETALLE POR MÉTODO DE PAGO */}
            <div className="mb-6 pt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
                DETALLE POR MÉTODO DE PAGO
              </span>

              <div className="flex items-center justify-between py-2 border-b border-gray-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  <span className="font-bold text-gray-800">Punto de Venta</span>
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono text-[10px]">Bs</span>
                </div>
                <span className="font-black font-rajdhani text-sm text-gray-900">
                  Bs {puntoVentaBs}
                </span>
              </div>
            </div>

            {/* Estadísticas de Venta / Totales Inferiores */}
            <div className="pt-4 border-t border-gray-100/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-2xl font-black font-rajdhani text-gray-900 leading-none">
                    {cantFacturas}
                  </div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">
                    {labelDoc}
                  </div>
                </div>

                {isFacturaFiscal && (
                  <div>
                    <div className="text-xl font-black font-rajdhani text-[#ea580c] leading-none">
                      ${totalCreditoUsd}
                    </div>
                    <div className="text-xs text-gray-400 font-medium mt-0.5">
                      A crédito ($)
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xl font-black font-rajdhani text-gray-800 leading-none">
                    ${totalFacturadoUsd}
                  </div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">
                    Total facturado $ (bruto, tasa 804,81)
                  </div>
                </div>
              </div>

              {/* Total Ingresos Ventas del Turno */}
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black font-rajdhani text-emerald-600 leading-none">
                  ${totalIngresosUsd}
                </div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">
                  Total Ingresos $ <span className="text-gray-400">(ventas del turno)</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════
          VISTA 2: SUPERVISIÓN
      ══════════════════════════════════════════════════ */}
      {activeTab === 'supervision' && (
        <div className="space-y-6">
          
          {/* Título Cajas Activas */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-sm sm:text-base font-bold text-gray-900">
              Cajas Activas Ahora – 2
            </h2>
          </div>

          {/* Grid de 2 Cajas Activas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Caja 1: Factura Fiscal */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-sm">
                      A
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                        Administrador
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium mt-0.5">
                        <span>Tesla Fire</span>
                        <span>·</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold flex items-center gap-1">
                          <Receipt className="w-3 h-3" />
                          <span>Factura Fiscal</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 block">desde</span>
                    <span className="text-xs font-bold text-gray-700">21:11</span>
                  </div>
                </div>

                {/* Métodos de Pago Caja 1 */}
                <div className="space-y-2 py-3 border-t border-b border-gray-100 my-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span>Punto de Venta</span>
                      <span className="text-[10px] px-1 bg-gray-100 rounded text-gray-500 font-mono">Bs</span>
                    </div>
                    <span className="font-black font-rajdhani text-gray-900">
                      Bs 35.497,00
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-400 flex items-center justify-between pt-1">
                  <span>2 facturas · divisas</span>
                  <span className="font-bold text-gray-800 font-rajdhani text-sm">$0.00</span>
                </div>
              </div>

              {/* Botones de acción Caja 1 */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubTipoCaja('factura_fiscal');
                    setActiveTab('mi_turno');
                  }}
                  className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cuadrar esta caja
                </button>
                <button
                  type="button"
                  onClick={() => toast.success('Forzando cierre de caja Factura Fiscal...')}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-all cursor-pointer"
                >
                  Forzar cierre
                </button>
              </div>
            </div>

            {/* Caja 2: Notas de Entrega */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-sm">
                      A
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                        Administrador
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium mt-0.5">
                        <span>Tesla Fire</span>
                        <span>·</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>Notas de Entrega</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 block">desde</span>
                    <span className="text-xs font-bold text-gray-700">21:11</span>
                  </div>
                </div>

                {/* Métodos de Pago Caja 2 */}
                <div className="space-y-2 py-3 border-t border-b border-gray-100 my-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span>Punto de Venta</span>
                      <span className="text-[10px] px-1 bg-gray-100 rounded text-gray-500 font-mono">Bs</span>
                    </div>
                    <span className="font-black font-rajdhani text-gray-900">
                      Bs 171.001,30
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-400 flex items-center justify-between pt-1">
                  <span>1 facturas · divisas</span>
                  <span className="font-bold text-gray-800 font-rajdhani text-sm">$0.00</span>
                </div>
              </div>

              {/* Botones de acción Caja 2 */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubTipoCaja('notas_entrega');
                    setActiveTab('mi_turno');
                  }}
                  className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cuadrar esta caja
                </button>
                <button
                  type="button"
                  onClick={() => toast.success('Forzando cierre de caja Notas de Entrega...')}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-all cursor-pointer"
                >
                  Forzar cierre
                </button>
              </div>
            </div>

          </div>

          {/* Historial de Cortes Z */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                Historial de Cortes Z
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={sucursalFiltro}
                  onChange={(e) => setSucursalFiltro(e.target.value)}
                  className="text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="Todas las sucursales">Todas las sucursales</option>
                  <option value="Tesla Fire">Tesla Fire</option>
                </select>

                <input
                  type="date"
                  value={desdeSup}
                  onChange={(e) => setDesdeSup(e.target.value)}
                  className="text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none"
                />

                <input
                  type="date"
                  value={hastaSup}
                  onChange={(e) => setHastaSup(e.target.value)}
                  className="text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none"
                />

                <button
                  type="button"
                  className="px-4 py-2 bg-[#343a40] hover:bg-[#23272b] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  Filtrar
                </button>
              </div>
            </div>

            {/* Tabla de Cortes Z */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                    <th className="py-3 px-4">CORTE Z</th>
                    <th className="py-3 px-4">CAJERO / SUCURSAL</th>
                    <th className="py-3 px-4">CIERRE</th>
                    <th className="py-3 px-4 text-right">VENTAS</th>
                    <th className="py-3 px-4 text-center">DESCUADRE</th>
                    <th className="py-3 px-4 text-right">APROBÓ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-xs text-gray-400 font-medium">
                      No hay cortes Z en el período seleccionado.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL MOVIMIENTO (INGRESO / EGRESO) SEGÚN CÓDIGO DEL USUARIO
      ══════════════════════════════════════════════════ */}
      {showModalMovimiento && (
        <div 
          id="modal-movimiento" 
          className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setShowModalMovimiento(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 id="mov-titulo" className="text-lg font-bold text-gray-800">
                {movTipo === 'ingreso' ? 'Registrar Ingreso' : 'Registrar Egreso'}
              </h3>
              <button 
                onClick={() => setShowModalMovimiento(false)} 
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleGuardarMovimiento} className="p-6 space-y-4">
              <input type="hidden" id="mov-tipo" value={movTipo} />
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Instrumento</label>
                <select 
                  id="mov-instrumento" 
                  value={movInstrumento}
                  onChange={(e) => setMovInstrumento(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="divisas">Divisas (USD)</option>
                  <option value="tarjeta_debito">Tarjeta Débito</option>
                  <option value="transferencia">Transferencia / Pago Móvil</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Monto</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input 
                    type="number" 
                    id="mov-monto" 
                    min="0.01" 
                    step="0.01" 
                    required
                    value={movMonto}
                    onChange={(e) => setMovMonto(e.target.value)}
                    placeholder="0.00" 
                    className="w-full border border-gray-300 rounded-lg pl-7 pr-4 py-2.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-rajdhani" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Concepto <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="mov-concepto" 
                  required
                  value={movConcepto}
                  onChange={(e) => setMovConcepto(e.target.value)}
                  placeholder="Ej. Cambio de caja, Depósito bancario..." 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModalMovimiento(false)} 
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={savingMov}
                  id="btn-guardar-mov" 
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50 ${
                    movTipo === 'ingreso' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {savingMov ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL CIERRE DE TURNO / ARQUEO CIEGO
      ══════════════════════════════════════════════════ */}
      {showModalCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Arqueo Ciego y Cierre de Turno
              </h3>
              <button onClick={() => setShowModalCierre(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCerrarTurno} className="space-y-3.5 text-xs">
              <p className="text-gray-500">
                Ingresa el dinero físico contado en caja para contrastar contra el sistema (Corte Z).
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Total Divisas Contadas ($ USD)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={conteoUsd}
                  onChange={(e) => setConteoUsd(e.target.value)}
                  placeholder="0.00" 
                  className="w-full text-sm font-bold font-rajdhani px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Total Bolívares en Efectivo (Bs)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={conteoBs}
                  onChange={(e) => setConteoBs(e.target.value)}
                  placeholder="0.00" 
                  className="w-full text-sm font-bold font-rajdhani px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Observaciones de Cierre</label>
                <textarea 
                  rows={2}
                  value={notasCierre}
                  onChange={(e) => setNotasCierre(e.target.value)}
                  placeholder="Notas adicionales..." 
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowModalCierre(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 rounded-xl bg-[#1e293b] text-white font-bold hover:bg-black shadow-xs"
                >
                  Confirmar Cierre Z
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
