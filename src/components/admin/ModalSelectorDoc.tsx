import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Truck, X } from 'lucide-react';

interface ModalSelectorDocProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoc?: (doc: 'factura_fiscal' | 'pedido') => void;
}

export default function ModalSelectorDoc({ isOpen, onClose, onSelectDoc }: ModalSelectorDocProps) {
  const navigate = useNavigate();

  const handleSelect = (doc: 'factura_fiscal' | 'pedido') => {
    onClose();
    if (onSelectDoc) {
      onSelectDoc(doc);
    } else {
      navigate(`/admin/ventas/pos?doc=${doc}`);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') {
        e.preventDefault();
        handleSelect('factura_fiscal');
      } else if (e.key === '2') {
        e.preventDefault();
        handleSelect('pedido');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold font-rajdhani text-gray-900 leading-tight">
                  ¿Qué vas a emitir?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Elige el tipo de documento para abrir la caja
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              {/* Opción 1: Factura Fiscal */}
              <button
                type="button"
                onClick={() => handleSelect('factura_fiscal')}
                className="group flex items-center gap-3.5 w-full p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-electrico-500 hover:bg-electrico-50/50 hover:shadow-md transition-all text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-900 group-hover:bg-brand-950 flex items-center justify-center text-electrico-500 flex-shrink-0 transition-colors shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-rajdhani text-lg font-bold text-gray-900 leading-tight">
                    Factura Fiscal
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5 leading-snug">
                    Con IVA y número de control. Va a los libros de venta.
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-brand-900 border border-gray-200 group-hover:border-electrico-500 rounded-lg px-2.5 py-1 bg-gray-50 group-hover:bg-white flex-shrink-0">
                  1
                </span>
              </button>

              {/* Opción 2: Nota de Entrega */}
              <button
                type="button"
                onClick={() => handleSelect('pedido')}
                className="group flex items-center gap-3.5 w-full p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-electrico-500 hover:bg-electrico-50/50 hover:shadow-md transition-all text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-900 group-hover:bg-brand-950 flex items-center justify-center text-electrico-500 flex-shrink-0 transition-colors shadow-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-rajdhani text-lg font-bold text-gray-900 leading-tight">
                    Nota de Entrega
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5 leading-snug">
                    Sin IVA. Se puede convertir en factura después.
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-brand-900 border border-gray-200 group-hover:border-electrico-500 rounded-lg px-2.5 py-1 bg-gray-50 group-hover:bg-white flex-shrink-0">
                  2
                </span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>Presiona <b>1</b> o <b>2</b> en el teclado</span>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 font-semibold transition-colors"
              >
                Cancelar (Esc)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
