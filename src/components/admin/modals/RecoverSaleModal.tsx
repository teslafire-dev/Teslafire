import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemModals } from '@/contexts/SystemModalsContext';
import { supabase } from '@/lib/supabase/client';
import { Trash2, ShoppingCart, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface VentaBorrador {
  id: string;
  numero_factura: string;
  cliente_id: string;
  total_usd: number;
  created_at: string;
  clientes?: {
    nombre: string;
  };
  usuario_id?: string;
  tienda_id?: string;
  // Extracted dynamically if needed
  items_count?: number;
}

export default function RecoverSaleModal() {
  const { recoverSaleConfig, closeRecoverSale } = useSystemModals();

  const [busqueda, setBusqueda] = useState('');
  const [dataOriginal, setDataOriginal] = useState<VentaBorrador[]>([]);
  const [rows, setRows] = useState<VentaBorrador[]>([]);
  const [cargando, setCargando] = useState(false);
  const [idx, setIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recoverSaleConfig) {
      setTimeout(() => inputRef.current?.focus(), 50);
      cargarBorradores();
    } else {
      setBusqueda('');
      setDataOriginal([]);
      setRows([]);
      setIdx(-1);
    }
  }, [recoverSaleConfig]);

  const cargarBorradores = async () => {
    setCargando(true);
    // Buscamos las ventas con estado PENDIENTE_PAGO
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        id, numero_factura, cliente_id, total_usd, created_at, usuario_id, tienda_id,
        clientes(nombre)
      `)
      .eq('estado', 'PENDIENTE_PAGO')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const parsedData = data as any as VentaBorrador[];
      setDataOriginal(parsedData);
      setRows(parsedData);
      if (parsedData.length > 0) setIdx(0);
    }
    setCargando(false);
  };

  useEffect(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) {
      setRows(dataOriginal);
      setIdx(dataOriginal.length > 0 ? 0 : -1);
      return;
    }
    const filtrados = dataOriginal.filter(b => {
      const cliNom = b.clientes?.nombre?.toLowerCase() || '';
      const numFac = b.numero_factura?.toLowerCase() || '';
      return cliNom.includes(q) || numFac.includes(q);
    });
    setRows(filtrados);
    setIdx(filtrados.length > 0 ? 0 : -1);
  }, [busqueda, dataOriginal]);

  const fmt = (n: number) => `$${(n || 0).toFixed(2).replace(/\\d(?=(\\d{3})+\\.)/g, '$&,')}`;
  const fechaCorta = (s: string) => {
    if (!s) return '';
    return new Date(s).toLocaleString('es-VE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeRecoverSale();
      return;
    }
    if (!rows.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = idx < rows.length - 1 ? idx + 1 : 0;
      setIdx(next);
      scrollToIdx(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = idx > 0 ? idx - 1 : rows.length - 1;
      setIdx(prev);
      scrollToIdx(prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (idx >= 0 && rows[idx]) {
        pickActivo(rows[idx].id);
      }
    }
  };

  const scrollToIdx = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.recuperar-row');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  const pickActivo = (id: string) => {
    if (recoverSaleConfig?.onSelect) {
      recoverSaleConfig.onSelect(id);
    }
    closeRecoverSale();
  };

  const eliminar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar esta venta guardada? No se puede deshacer.')) {
      const { error } = await supabase.from('ventas').delete().eq('id', id);
      if (error) {
        toast.error('No se pudo eliminar: ' + error.message);
      } else {
        toast.success('Borrador eliminado');
        const newData = dataOriginal.filter(b => b.id !== id);
        setDataOriginal(newData);
        if (idx >= newData.length) setIdx(Math.max(0, newData.length - 1));
      }
    }
  };

  return (
    <AnimatePresence>
      {recoverSaleConfig && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeRecoverSale}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 md:p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <ShoppingCart size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-tight">Recuperar Venta</h2>
                  <p id="tplk-recuperar-contador" className="text-amber-100 text-[11px] font-medium">
                    {rows.length} guardada{rows.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeRecoverSale}
                className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Buscador */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar por cliente o número..."
                  className="w-full bg-white border-2 border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-2xl pl-11 pr-4 py-3.5 text-gray-800 font-medium transition-all outline-none"
                />
              </div>
            </div>

            {/* Lista */}
            <div ref={listRef} className="flex-1 overflow-y-auto">
              {cargando ? (
                <div className="px-6 py-12 flex flex-col items-center gap-3 text-gray-400">
                  <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                  <span className="text-sm">Cargando...</span>
                </div>
              ) : rows.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-400">
                  No hay ventas guardadas o en borrador.
                </div>
              ) : (
                rows.map((b, i) => {
                  const isSelected = i === idx;
                  return (
                    <div
                      key={b.id}
                      className={`recuperar-row flex items-center gap-3 px-5 py-3.5 transition-colors cursor-pointer border-b border-gray-50 ${
                        isSelected ? 'bg-amber-100 ring-1 ring-amber-300' : 'hover:bg-amber-50/50'
                      }`}
                      onClick={() => pickActivo(b.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm md:text-base font-semibold text-gray-800 truncate">
                          Venta Pendiente {b.numero_factura ? `#${b.numero_factura}` : ''}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">
                          👤 {b.clientes?.nombre || 'Cliente Final'} · {fechaCorta(b.created_at)}
                        </div>
                      </div>
                      <span className="text-base font-black text-gray-800 flex-shrink-0">
                        {fmt(b.total_usd)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => eliminar(b.id, e)}
                        title="Eliminar"
                        className="flex-shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg p-2 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-gray-50 text-[10px] text-gray-400 text-center border-t border-gray-100 font-medium">
              Usa ↑ ↓ para navegar y Enter para recuperar
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
