import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, X, AlertTriangle } from 'lucide-react';
import { useSystemModals } from '@/contexts/SystemModalsContext';

export default function RefundModal() {
  const { isRefundModalOpen, refundConfig, closeRefundModal } = useSystemModals();
  const [reparto, setReparto] = useState<{metodo: string, monto: number}[]>([]);
  
  const totalUsd = refundConfig?.totalUsd || 0;
  const repartido = reparto.reduce((acc, curr) => acc + curr.monto, 0);
  const restante = Math.max(0, totalUsd - repartido);

  useEffect(() => {
    if (isRefundModalOpen) {
      // Por defecto sugerimos que todo el dinero vaya a billetera
      setReparto([{ metodo: 'BILLETERA', monto: totalUsd }]);
    }
  }, [isRefundModalOpen, totalUsd]);

  const updateReparto = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newReparto = [...reparto];
    newReparto[index].monto = num;
    setReparto(newReparto);
  };

  const confirmarReembolso = () => {
    if (refundConfig?.onConfirm) {
      refundConfig.onConfirm(reparto);
    }
    closeRefundModal();
  };

  return (
    <AnimatePresence>
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-start justify-center px-4 pt-[10vh] pb-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <RefreshCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight">Reparto del reintegro</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Se propone asignar el reembolso a la billetera del cliente.
                    {refundConfig?.clientName && <span className="font-bold text-gray-700 ml-1">({refundConfig.clientName})</span>}
                  </p>
                </div>
              </div>
              <button onClick={closeRefundModal} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="p-5 space-y-4">
              {reparto.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-xl bg-white">
                  <div className="font-bold text-sm text-gray-700">{item.metodo === 'BILLETERA' ? 'Abono a Billetera' : item.metodo}</div>
                  <div className="relative w-1/3">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">$</span>
                    <input
                      type="number"
                      value={item.monto}
                      onChange={(e) => updateReparto(index, e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-right font-black text-emerald-600 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-bold">A reintegrar</span>
                <span className="font-black text-gray-800">${totalUsd.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-bold">Repartido</span>
                <span className="font-black text-emerald-600">${repartido.toFixed(2)}</span>
              </div>
              
              <div className={`flex items-center justify-between text-sm p-3 rounded-lg border ${restante > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-100 border-transparent text-gray-500'}`}>
                <span className="font-bold flex items-center gap-2">
                  {restante > 0 && <AlertTriangle className="w-4 h-4" />}
                  Falta por repartir
                </span>
                <span className="font-black">${restante.toFixed(2)}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={closeRefundModal} 
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmarReembolso}
                  disabled={restante > 0.01}
                  className="flex-[2] px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold disabled:opacity-50 transition-colors"
                >
                  Confirmar Reintegro
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
