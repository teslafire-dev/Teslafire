import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, Wallet, Banknote, X, CheckCircle2 } from 'lucide-react';
import { useSystemModals } from '@/contexts/SystemModalsContext';
import toast from 'react-hot-toast';

interface PaymentLine {
  id: string;
  metodo: string;
  montoUsd: number;
  montoBs: number;
}

const METODOS = [
  { id: 'EFECTIVO_USD', nombre: 'Efectivo USD', icono: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'PAGO_MOVIL', nombre: 'Pago Móvil', icono: Banknote, color: 'text-brand-500', bg: 'bg-brand-50' },
  { id: 'PUNTO_VENTA', nombre: 'Punto de Venta', icono: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'ZELLE', nombre: 'Zelle', icono: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'TRANSFERENCIA_BS', nombre: 'Transf. Bs', icono: Banknote, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'BILLETERA', nombre: 'Billetera Favor', icono: Wallet, color: 'text-amber-500', bg: 'bg-amber-50' },
];

export default function PaymentModal() {
  const { isPaymentModalOpen, paymentConfig, closePaymentModal } = useSystemModals();
  const [pagos, setPagos] = useState<PaymentLine[]>([]);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null);
  const [montoIngresado, setMontoIngresado] = useState('');
  const [vueltoMetodo, setVueltoMetodo] = useState<'EFECTIVO_USD' | 'PAGO_MOVIL' | 'BILLETERA'>('EFECTIVO_USD');
  const inputRef = useRef<HTMLInputElement>(null);

  const totalUsd = paymentConfig?.totalUsd || 0;
  const totalBs = paymentConfig?.totalBs || 0;
  const tasa = paymentConfig?.tasa || 1;

  const totalPagadoUsd = pagos.reduce((acc, p) => acc + p.montoUsd, 0);
  const restanteUsd = Math.max(0, totalUsd - totalPagadoUsd);
  const restanteBs = restanteUsd * tasa;
  const vueltoUsd = Math.max(0, totalPagadoUsd - totalUsd);

  useEffect(() => {
    if (isPaymentModalOpen) {
      setPagos([]);
      setMetodoSeleccionado(null);
      setMontoIngresado('');
      setVueltoMetodo('EFECTIVO_USD');
    }
  }, [isPaymentModalOpen]);

  useEffect(() => {
    if (metodoSeleccionado && inputRef.current) {
      inputRef.current.focus();
    }
  }, [metodoSeleccionado]);

  const handleMetodoClick = (id: string) => {
    setMetodoSeleccionado(id);
    // Sugerir el restante por defecto
    const isBs = id.includes('BS') || id === 'PAGO_MOVIL' || id === 'PUNTO_VENTA';
    setMontoIngresado(isBs ? restanteBs.toFixed(2) : restanteUsd.toFixed(2));
  };

  const agregarPago = () => {
    if (!metodoSeleccionado || !montoIngresado) return;
    
    const monto = parseFloat(montoIngresado.replace(',', '.'));
    if (isNaN(monto) || monto <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }

    const isBs = metodoSeleccionado.includes('BS') || metodoSeleccionado === 'PAGO_MOVIL' || metodoSeleccionado === 'PUNTO_VENTA';
    
    const montoUsd = isBs ? monto / tasa : monto;
    const montoBs = isBs ? monto : monto * tasa;

    setPagos(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      metodo: metodoSeleccionado,
      montoUsd,
      montoBs
    }]);

    setMetodoSeleccionado(null);
    setMontoIngresado('');
  };

  const eliminarPago = (id: string) => {
    setPagos(prev => prev.filter(p => p.id !== id));
  };

  const confirmarCobro = () => {
    if (totalPagadoUsd < totalUsd - 0.01) { // Margen de error por redondeo
      toast.error('Aún falta saldo por cubrir');
      return;
    }

    if (paymentConfig?.onConfirm) {
      paymentConfig.onConfirm(pagos, vueltoUsd > 0 ? { metodo: vueltoMetodo, montoUsd: vueltoUsd } : null);
    }
    closePaymentModal();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (metodoSeleccionado) {
        setMetodoSeleccionado(null);
      } else {
        closePaymentModal();
      }
    } else if (e.key === 'Enter') {
      if (metodoSeleccionado) {
        agregarPago();
      } else if (totalPagadoUsd >= totalUsd - 0.01) {
        confirmarCobro();
      }
    }
  };

  return (
    <AnimatePresence>
      {isPaymentModalOpen && (
        <div 
          className="fixed inset-0 z-[9998] flex items-start justify-center px-4 pt-[4vh] pb-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="px-5 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight">Procesar Pago</h3>
                  {paymentConfig?.clientName && (
                    <p className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-xs">{paymentConfig.clientName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right leading-tight">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Tasa BCV</div>
                  <div className="text-sm font-bold text-gray-700 font-rajdhani">Bs {tasa.toFixed(2).replace('.', ',')}</div>
                </div>
                <button onClick={closePaymentModal} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Totales */}
            <div className="px-5 md:px-6 py-4 bg-gray-900 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide">Total a cobrar</div>
                  <div className="text-3xl md:text-4xl font-black leading-tight">${totalUsd.toFixed(2)}</div>
                  <div className="text-sm md:text-base font-bold text-emerald-400 leading-tight">Bs {totalBs.toFixed(2).replace('.', ',')}</div>
                </div>
                <div className="text-right rounded-xl px-4 py-3 bg-white/10 text-red-300 min-w-[140px]">
                  <div className="text-[11px] uppercase font-semibold tracking-wide">Restante</div>
                  <div className="text-2xl font-black leading-tight">${restanteUsd.toFixed(2)}</div>
                  <div className="text-xs font-bold leading-tight opacity-90">Bs {restanteBs.toFixed(2).replace('.', ',')}</div>
                </div>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="p-4 md:p-6 grid md:grid-cols-2 gap-6 bg-white">
              
              {/* Columna Izquierda: Métodos */}
              <div>
                {!metodoSeleccionado ? (
                  <>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Seleccione método</div>
                    <div className="grid grid-cols-2 gap-2">
                      {METODOS.map((m) => {
                        const Icon = m.icono;
                        return (
                          <button
                            key={m.id}
                            onClick={() => handleMetodoClick(m.id)}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-gray-100 hover:border-brand-500 hover:bg-brand-50/50 transition-colors gap-2"
                          >
                            <div className={`w-8 h-8 rounded-full ${m.bg} ${m.color} flex items-center justify-center`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-gray-700 text-center leading-tight">{m.nombre}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="bg-brand-50 rounded-xl p-4 border border-brand-100 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-brand-900 flex items-center gap-2">
                        {METODOS.find(m => m.id === metodoSeleccionado)?.nombre}
                      </span>
                      <button onClick={() => setMetodoSeleccionado(null)} className="text-xs text-brand-600 hover:underline">Cambiar</button>
                    </div>
                    <label className="block text-xs font-semibold text-brand-700 uppercase mb-1">Monto a registrar</label>
                    <div className="relative mb-3">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                        {metodoSeleccionado.includes('BS') || metodoSeleccionado === 'PAGO_MOVIL' || metodoSeleccionado === 'PUNTO_VENTA' ? 'Bs' : '$'}
                      </span>
                      <input
                        ref={inputRef}
                        type="number"
                        step="0.01"
                        value={montoIngresado}
                        onChange={(e) => setMontoIngresado(e.target.value)}
                        className="w-full text-lg font-black border-2 border-brand-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-brand-500 bg-white"
                      />
                    </div>
                    <button onClick={agregarPago} className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition-colors">
                      Agregar Pago (Enter)
                    </button>
                  </div>
                )}
              </div>

              {/* Columna Derecha: Pagos registrados */}
              <div className="flex flex-col bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center justify-between">
                  <span>Pagos Registrados</span>
                  <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">${totalPagadoUsd.toFixed(2)}</span>
                </div>
                
                {pagos.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-6 border-2 border-dashed border-gray-200 rounded-xl">
                    <DollarSign className="w-8 h-8 mb-2 opacity-30" />
                    <span className="text-xs font-medium">Aún no hay pagos</span>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                    {pagos.map((p) => {
                      const meta = METODOS.find(m => m.id === p.metodo);
                      return (
                        <div key={p.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 group">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-md ${meta?.bg} ${meta?.color} flex items-center justify-center`}>
                              {meta && <meta.icono className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-xs font-bold text-gray-700">{meta?.nombre}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right leading-none">
                              <span className="text-sm font-black text-emerald-600">${p.montoUsd.toFixed(2)}</span>
                            </div>
                            <button onClick={() => eliminarPago(p.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer / Vuelto y Confirmar */}
            <div className="px-5 md:px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-4">
              
              {vueltoUsd > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-orange-700 uppercase tracking-wide">Vuelto a entregar:</span>
                    <span className="text-lg font-black text-orange-700">${vueltoUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setVueltoMetodo('EFECTIVO_USD')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border ${vueltoMetodo === 'EFECTIVO_USD' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-100'}`}
                    >
                      Efectivo
                    </button>
                    <button 
                      onClick={() => setVueltoMetodo('PAGO_MOVIL')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border ${vueltoMetodo === 'PAGO_MOVIL' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-100'}`}
                    >
                      Pago Móvil Bs
                    </button>
                    <button 
                      onClick={() => setVueltoMetodo('BILLETERA')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border ${vueltoMetodo === 'BILLETERA' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-100'}`}
                    >
                      A Billetera
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button onClick={closePaymentModal} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={confirmarCobro}
                  disabled={totalPagadoUsd < totalUsd - 0.01}
                  className="px-6 py-2.5 rounded-xl font-black text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmar Cobro</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
