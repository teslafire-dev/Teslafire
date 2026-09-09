import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemModals } from '@/contexts/SystemModalsContext';
import { Package, DollarSign, AlertCircle, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ItemModal() {
  const { itemConfig, closeItemModal } = useSystemModals();

  const [inCant, setInCant] = useState('');
  const [inUsd, setInUsd] = useState('');
  const [inBs, setInBs] = useState('');
  const [bajoMinimo, setBajoMinimo] = useState(false);

  const cantInputRef = useRef<HTMLInputElement>(null);
  const usdInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (itemConfig) {
      if (itemConfig.modo === 'cantidad') {
        setInCant((itemConfig.valor ?? 1).toString());
        setTimeout(() => {
          cantInputRef.current?.focus();
          cantInputRef.current?.select();
        }, 50);
      } else {
        const usdVal = itemConfig.usd ?? 0;
        const tasaVal = itemConfig.tasa ?? 0;
        setInUsd(usdVal.toFixed(2));
        setInBs((usdVal * tasaVal).toFixed(2));
        verificarMinimo(usdVal);
        
        setTimeout(() => {
          usdInputRef.current?.focus();
          usdInputRef.current?.select();
        }, 50);
      }
    } else {
      setInCant('');
      setInUsd('');
      setInBs('');
      setBajoMinimo(false);
    }
  }, [itemConfig]);

  const num = (v: string | number) => {
    const n = parseFloat(v as string);
    return isNaN(n) ? 0 : n;
  };
  const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

  const verificarMinimo = (usdVal: number) => {
    if (!itemConfig || itemConfig.modo !== 'precio' || !itemConfig.minSuave || !itemConfig.min) {
      setBajoMinimo(false);
      return;
    }
    const bajo = itemConfig.min > 0 && round2(usdVal) < round2(itemConfig.min);
    setBajoMinimo(bajo);
  };

  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInUsd(val);
    if (itemConfig && itemConfig.tasa && itemConfig.tasa > 0) {
      const bsv = (num(val) * itemConfig.tasa).toFixed(2);
      setInBs(bsv);
    }
    verificarMinimo(num(val));
  };

  const handleBsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInBs(val);
    if (itemConfig && itemConfig.tasa && itemConfig.tasa > 0) {
      const usdv = (num(val) / itemConfig.tasa).toFixed(2);
      setInUsd(usdv);
      verificarMinimo(num(usdv));
    }
  };

  const handleConfirmar = () => {
    if (!itemConfig) return;

    if (itemConfig.modo === 'cantidad') {
      let c = parseInt(inCant, 10) || 0;
      if (c <= 0) {
        toast.error('Cantidad inválida');
        return;
      }
      if (itemConfig.max != null && c > itemConfig.max) {
        c = itemConfig.max;
      }
      closeItemModal();
      itemConfig.onConfirm?.(c);
    } else {
      const u = num(inUsd);
      if (u <= 0) {
        toast.error('Precio inválido');
        return;
      }
      
      if (!itemConfig.minSuave && itemConfig.min && itemConfig.min > 0 && round2(u) < round2(itemConfig.min)) {
        toast.error(`El precio no puede ser menor a $${itemConfig.min.toFixed(2)}`);
        usdInputRef.current?.focus();
        usdInputRef.current?.select();
        return;
      }
      closeItemModal();
      itemConfig.onConfirm?.(round2(u));
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmar();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeItemModal();
    }
  };

  const handleExtraClick = () => {
    if (itemConfig?.extraBtn?.onClick) {
      closeItemModal();
      itemConfig.extraBtn.onClick();
    }
  };

  return (
    <AnimatePresence>
      {itemConfig && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            // Evitamos cerrar el modal al hacer clic fuera (igual que en JS original)
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                  {itemConfig.modo === 'cantidad' ? <Package size={16} /> : <DollarSign size={16} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    {itemConfig.titulo || (itemConfig.modo === 'cantidad' ? 'Cantidad' : 'Cambiar precio')}
                  </h3>
                  {itemConfig.subtitulo && (
                    <p className="text-xs text-gray-500">{itemConfig.subtitulo}</p>
                  )}
                  {itemConfig.max != null && itemConfig.modo === 'cantidad' && (
                    <p className="text-xs text-gray-500">Stock disponible: {itemConfig.max}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closeItemModal}
                className="text-gray-400 hover:bg-gray-100 hover:text-gray-700 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {itemConfig.modo === 'cantidad' ? (
                <div>
                  <input
                    ref={cantInputRef}
                    type="number"
                    min="1"
                    max={itemConfig.max}
                    value={inCant}
                    onChange={(e) => setInCant(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="w-full text-center text-4xl font-black text-brand-700 py-4 border-2 border-brand-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <input
                      ref={usdInputRef}
                      type="number"
                      min="0"
                      step="0.01"
                      value={inUsd}
                      onChange={handleUsdChange}
                      onKeyDown={onKeyDown}
                      className={`w-full text-right text-2xl font-black py-3 px-4 border-2 rounded-xl focus:outline-none focus:ring-4 ${
                        bajoMinimo 
                          ? 'border-rose-400 text-rose-600 focus:border-rose-500 focus:ring-rose-500/20' 
                          : 'border-brand-300 text-brand-700 focus:border-brand-500 focus:ring-brand-500/20'
                      }`}
                    />
                  </div>
                  
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Bs</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={inBs}
                      onChange={handleBsChange}
                      onKeyDown={onKeyDown}
                      className="w-full text-right text-xl font-bold py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl focus:outline-none focus:border-gray-400"
                    />
                  </div>

                  {(itemConfig.tasa ?? 0) > 0 && (
                    <p className="text-center text-[11px] text-gray-500 font-medium">
                      Tasa {(itemConfig.tasa ?? 0).toFixed(2).replace('.', ',')} — escribe en $ o Bs, el otro se calcula
                    </p>
                  )}

                  {bajoMinimo && (
                    <div className="flex items-start gap-2 p-3 bg-rose-50 rounded-lg text-rose-600">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span className="text-[11px] font-medium">
                        {itemConfig.minTexto || `Por debajo de $${itemConfig.min?.toFixed(2)}: requerirá autorización.`}
                      </span>
                    </div>
                  )}

                  {itemConfig.extraBtn && (
                    <button
                      type="button"
                      onClick={handleExtraClick}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-colors"
                    >
                      <span>{itemConfig.extraBtn.label}</span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeItemModal}
                className="py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmar}
                className="py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-colors cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
