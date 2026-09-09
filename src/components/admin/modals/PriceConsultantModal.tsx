import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemModals } from '@/contexts/SystemModalsContext';
import { supabase } from '@/lib/supabase/client';
import { Search, X, Package } from 'lucide-react';

// Tipos base según schema.sql
interface ProductoCP {
  id: string;
  nombre: string;
  codigo_barra?: string;
  sku?: string;
  precio: number; // precio base
  precio_mayor?: number;
  stock?: number;
}

interface FilaPrecio {
  l: string;
  v: number;
  k: 'bcv' | 'par';
  main?: boolean;
}

export default function PriceConsultantModal() {
  const { priceConsultantOpen, closePriceConsultant } = useSystemModals();

  const [busqueda, setBusqueda] = useState('');
  const [lista, setLista] = useState<ProductoCP[]>([]);
  const [cargando, setCargando] = useState(false);
  const [idx, setIdx] = useState(-1);
  const [seleccionado, setSeleccionado] = useState<ProductoCP | null>(null);

  // Tasas
  const [tasaBCV, setTasaBCV] = useState(804.81); // Fake fallback
  const [tasaPAR, setTasaPAR] = useState(990);    // Fake fallback

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Constants equivalents
  const CANAL = 'todos'; // Default for admin consultor
  const TIENDA_LBL: Record<string, string> = {
    detal: 'Tienda Detal',
    mayor: 'Tienda Mayor',
    corporativo: 'Tienda Corporativo',
    todos: 'Todos los precios'
  };

  useEffect(() => {
    if (priceConsultantOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      cargarTasas();
    } else {
      setBusqueda('');
      setLista([]);
      setIdx(-1);
      setSeleccionado(null);
    }
  }, [priceConsultantOpen]);

  const cargarTasas = async () => {
    // Buscar tasa BCV
    const { data } = await supabase
      .from('tasas_cambio')
      .select('tasa')
      .eq('moneda_codigo', 'USD')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data?.tasa) {
      setTasaBCV(data.tasa);
    }
    // TODO: Cargar Tasa Paralela si está en config
  };

  // Debounced Search
  useEffect(() => {
    const q = busqueda.trim();
    if (!q) {
      setLista([]);
      setIdx(-1);
      setSeleccionado(null);
      return;
    }

    const fetchResultados = async () => {
      setCargando(true);
      const { data, error } = await supabase
        .from('productos')
        .select(`
          id, nombre, sku, codigo_barra, precio, precio_mayor,
          producto_stock(stock_actual)
        `)
        .or(`nombre.ilike.%${q}%,sku.ilike.%${q}%,codigo_barra.ilike.%${q}%`)
        .eq('activo', true)
        .limit(20);
      
      if (!error && data) {
        // Mapear para facilitar acceso a stock
        const parsed = data.map((d: any) => ({
          ...d,
          stock: d.producto_stock && d.producto_stock.length > 0 
                 ? d.producto_stock.reduce((acc: number, cur: any) => acc + (cur.stock_actual || 0), 0)
                 : 0
        }));
        setLista(parsed);
        if (parsed.length > 0) {
          setIdx(0);
          setSeleccionado(parsed[0]);
        } else {
          setIdx(-1);
          setSeleccionado(null);
        }
      }
      setCargando(false);
    };

    const timer = setTimeout(fetchResultados, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const fmtUsd = (n: number) => `$${(n || 0).toFixed(2).replace(/\\d(?=(\\d{3})+\\.)/g, '$&,')}`;
  const fmtBs = (n: number, kind: 'bcv' | 'par') => {
    const rate = kind === 'bcv' ? tasaBCV : tasaPAR;
    return `Bs ${((n || 0) * rate).toFixed(2).replace(/\\d(?=(\\d{3})+\\.)/g, '$&,')}`;
  };

  const filasPrecio = (p: ProductoCP): FilaPrecio[] => {
    // Lógica para admin (todos)
    return [
      { l: 'Mayor', v: p.precio_mayor || 0, k: 'par', main: true },
      { l: 'Detal $', v: p.precio, k: 'par' },
      { l: 'Detal BCV', v: p.precio, k: 'bcv' }
      // Corporativo e Instalador se omiten si no están en schema.sql, se puede agregar.
    ];
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closePriceConsultant();
      return;
    }

    if (!lista.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(idx + 1, lista.length - 1);
      setIdx(next);
      setSeleccionado(lista[next]);
      scrollToIdx(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(idx - 1, 0);
      setIdx(prev);
      setSeleccionado(lista[prev]);
      scrollToIdx(prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (idx >= 0 && lista[idx]) {
        setSeleccionado(lista[idx]);
      }
    }
  };

  const scrollToIdx = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-i]');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  const seleccionar = (index: number) => {
    setIdx(index);
    setSeleccionado(lista[index]);
  };

  return (
    <AnimatePresence>
      {priceConsultantOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closePriceConsultant}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado Consultor */}
            <div className="p-4 md:p-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Search size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-tight">Consultor de Precios</h2>
                  <p className="text-emerald-100 text-[11px] font-medium">{TIENDA_LBL[CANAL]}</p>
                </div>
              </div>
              <button
                onClick={closePriceConsultant}
                className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Input Buscar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escanear código de barra o buscar nombre..."
                  className="w-full bg-white border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl pl-11 pr-4 py-3.5 text-gray-800 font-medium transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row flex-1 min-h-0">
              {/* Lista Izquierda */}
              <div 
                ref={listRef}
                className="w-full md:w-1/2 border-r border-gray-100 overflow-y-auto p-2 space-y-1 h-60 md:h-auto"
              >
                {!busqueda.trim() ? (
                  <div className="text-center text-sm text-gray-400 py-10">
                    <Package size={32} className="mx-auto mb-3 opacity-30" />
                    Ingresa un producto a consultar
                  </div>
                ) : cargando ? (
                  <div className="text-center text-sm text-gray-400 py-10">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3"></div>
                    Buscando...
                  </div>
                ) : !lista.length ? (
                  <div className="text-center text-sm text-gray-400 py-10">
                    Sin resultados.
                  </div>
                ) : (
                  lista.map((p, i) => {
                    const f = filasPrecio(p)[0] || { v: p.precio, k: 'bcv' };
                    const stock = p.stock || 0;
                    const isSelected = i === idx;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        data-i={i}
                        onClick={() => seleccionar(i)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-50 ring-1 ring-emerald-300' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-gray-800 text-sm truncate">{p.nombre}</div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            {p.codigo_barra || p.sku || '—'} · Stock {stock}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-black text-emerald-600 text-sm">{fmtUsd(f.v)}</div>
                          <div className="text-[10px] text-gray-500">{fmtBs(f.v, f.k)}</div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Detalle Derecha */}
              <div className="w-full md:w-1/2 bg-gray-50/30 p-4 md:p-6 overflow-y-auto">
                {seleccionado ? (
                  <div className="border-2 border-emerald-200 rounded-xl p-4 bg-emerald-50/40 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-gray-800 text-base">{seleccionado.nombre}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                          {seleccionado.codigo_barra || seleccionado.sku || 'Sin código'}
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ${
                        (seleccionado.stock || 0) > 0 ? 'text-emerald-700 bg-emerald-100' : 'text-red-600 bg-red-100'
                      }`}>
                        Stock: {seleccionado.stock || 0}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-emerald-200 space-y-2">
                      {filasPrecio(seleccionado).filter(r => r.v > 0 || r.main).map((r, i) => (
                        <div key={i} className={`flex items-center justify-between py-1.5 ${!r.main && i > 0 ? 'border-t border-emerald-100' : ''}`}>
                          <span className={`text-xs ${r.main ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                            {r.l}
                          </span>
                          <span className="text-right">
                            <span className={`font-mono font-bold ${r.main ? 'text-emerald-700 text-lg' : 'text-gray-700 text-sm'}`}>
                              {fmtUsd(r.v)}
                            </span>
                            <span className="text-[11px] text-gray-500 ml-2">
                              {fmtBs(r.v, r.k)}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-[10px] text-emerald-600/70 text-right font-medium">
                      Tasas — BCV: {tasaBCV.toFixed(2)} · Paralela: {tasaPAR.toFixed(2)} Bs/$
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">
                    Selecciona un producto para ver el detalle
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
