import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useSystemModals } from '@/contexts/SystemModalsContext';

export default function ProductSearchModal() {
  const { isProductSearchOpen, productSearchConfig, closeProductSearch } = useSystemModals();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isProductSearchOpen) {
      setSearchTerm('');
      setResults([]);
      setSelectedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isProductSearchOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .or(`nombre.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,codigo_barra.ilike.%${searchTerm}%`)
        .eq('activo', true)
        .limit(10);
      
      if (!error && data) {
        setResults(data);
        setSelectedIndex(data.length > 0 ? 0 : -1);
      }
      setIsLoading(false);
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelect = (product: any) => {
    if (productSearchConfig?.onSelect) {
      productSearchConfig.onSelect(product);
    }
    closeProductSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeProductSearch();
    }
  };

  return (
    <AnimatePresence>
      {isProductSearchOpen && (
        <div className="fixed inset-0 z-[9998] flex items-start justify-center px-4 pt-[5vh] pb-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh]"
          >
            {/* Header */}
            <div className="p-5 md:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Search className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
                      {productSearchConfig?.title || 'Buscar Producto'}
                    </h3>
                    {productSearchConfig?.subtitle && (
                      <p className="text-xs text-brand-600 font-medium mt-0.5">{productSearchConfig.subtitle}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeProductSearch}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="block w-full pl-11 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-brand-500 focus:bg-white transition-colors"
                  placeholder="Escribe el nombre, código de barras o referencia..."
                  autoComplete="off"
                />
              </div>

              <div className="flex items-center gap-4 mt-3">
                <p className="text-[11px] text-gray-400 hidden md:flex items-center gap-3">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-semibold text-gray-600">↑ ↓</kbd> navegar</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-semibold text-gray-600">Enter</kbd> seleccionar</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-semibold text-gray-600">Esc</kbd> cerrar</span>
                </p>
              </div>
            </div>

            {/* Resultados */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
              {isLoading && (
                <div className="p-8 text-center text-gray-400">
                  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm">Buscando productos...</p>
                </div>
              )}

              {!isLoading && searchTerm.trim() && results.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-base font-medium text-gray-600">No se encontraron resultados</p>
                  <p className="text-sm mt-1">Intenta con otros términos de búsqueda.</p>
                </div>
              )}

              {!isLoading && results.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                    selectedIndex === index ? 'bg-brand-50/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package className={`w-6 h-6 ${selectedIndex === index ? 'text-brand-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{product.nombre}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{product.sku}</span>
                      <span className="truncate">{product.descripcion}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-black text-emerald-600">${Number(product.precio).toFixed(2)}</div>
                    {product.aplica_iva && <div className="text-[10px] font-bold text-gray-400">+IVA</div>}
                  </div>
                  <div className="hidden sm:flex items-center text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              ))}

              {!isLoading && !searchTerm.trim() && (
                <div className="p-10 md:p-16 text-center text-gray-400">
                  <div className="text-5xl mb-3">🔍</div>
                  <p className="text-sm md:text-base font-medium text-gray-500">Escribe para buscar un producto</p>
                  <p className="text-xs md:text-sm mt-1">Por nombre, código de barras o referencia.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
              <span className="font-medium">{results.length} resultados</span>
              <span className="text-gray-400 font-semibold">Tesla Fire</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
