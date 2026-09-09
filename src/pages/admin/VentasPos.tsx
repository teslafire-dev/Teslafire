import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useSystemModals } from '@/contexts/SystemModalsContext';
import {
  Search, X, ShoppingCart, User, Tag, Key, CreditCard,
  FileText, Clock, Trash2, Maximize2, Minimize2, Check,
  ChevronDown, HelpCircle, PackageOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductoPOS {
  id: string;
  nombre: string;
  codigo_barra?: string;
  sku?: string;
  precio: number;
  imagen_url?: string;
  aplica_iva: boolean;
  stock: number;
  categoria_id?: string;
}

interface CategoriaPOS {
  id: string;
  nombre: string;
}

interface CartItem extends ProductoPOS {
  cart_id: string; // unique for cart
  cantidad: number;
  precio_final: number; // can be manually overridden
}

interface ClientePOS {
  id: string;
  nombre: string;
  documento: string;
}

export default function VentasPos() {
  const {
    openItemModal, openPriceConsultant, openRecoverSale, openPaymentModal
  } = useSystemModals();

  // --- Estados de Datos ---
  const [productos, setProductos] = useState<ProductoPOS[]>([]);
  const [categorias, setCategorias] = useState<CategoriaPOS[]>([]);
  const [tasaBCV, setTasaBCV] = useState(1);
  const [cargando, setCargando] = useState(true);

  // --- Estados de UI ---
  const [categoriaSel, setCategoriaSel] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [cantInput, setCantInput] = useState('1');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // --- Estados del Ticket (Carrito) ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cliente, setCliente] = useState<ClientePOS | null>(null);
  const [vendedor, setVendedor] = useState('0'); // 0 = Default
  const [condicionPago, setCondicionPago] = useState('CONTADO');
  const [tipoDocumento, setTipoDocumento] = useState('Factura Fiscal');
  const [descuentoGlobalUsd, setDescuentoGlobalUsd] = useState<number>(0);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Inicialización
  useEffect(() => {
    cargarDatosBasicos();
  }, []);

  const cargarDatosBasicos = async () => {
    setCargando(true);
    try {
      // 1. Tasa BCV
      const { data: tasaData } = await supabase
        .from('tasas_cambio')
        .select('tasa')
        .eq('moneda_codigo', 'USD')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (tasaData) setTasaBCV(tasaData.tasa);

      // 2. Categorías
      const { data: catData } = await supabase
        .from('categorias')
        .select('id, nombre')
        .eq('activo', true)
        .order('orden', { ascending: true });
      if (catData) setCategorias(catData);

      // 3. Productos (Top 200 activos)
      const { data: prodData } = await supabase
        .from('productos')
        .select(`
          id, nombre, codigo_barra, sku, precio, imagen_url, aplica_iva, categoria_id,
          producto_stock(stock_actual)
        `)
        .eq('activo', true)
        .limit(200);

      if (prodData) {
        const parsed = prodData.map((p: any) => ({
          ...p,
          stock: p.producto_stock?.reduce((acc: number, curr: any) => acc + (curr.stock_actual || 0), 0) || 0
        }));
        setProductos(parsed);
      }
    } catch (error) {
      console.error("Error cargando POS:", error);
    }
    setCargando(false);
  };

  // --- Atajos de Teclado ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitar atajos si estamos en un input distinto al de búsqueda y no es F keys
      const active = document.activeElement?.tagName;
      const isInput = active === 'INPUT' || active === 'TEXTAREA';

      if (e.key === 'F2') { e.preventDefault(); openRecoverSale(handleRecuperarVenta); }
      if (e.key === 'F4') { e.preventDefault(); openPriceConsultant(); }
      if (e.key === 'F5') {
        e.preventDefault();
        // openClientSearch... asumiendo que ClientSearchModal lee un estado global, o lo mockeamos por ahora
        toast('Buscador de Clientes (F5) en desarrollo');
      }
      if (e.key === 'F9') { e.preventDefault(); emitirFactura(); }
      
      // Focus a búsqueda con "/" o si no estamos en un input
      if (!isInput && e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, cliente, descuentoGlobalUsd]); // Dependencias para que emitirFactura tenga el estado fresco

  // --- Lógica del Carrito ---
  const agregarAlCarrito = (p: ProductoPOS) => {
    let cant = parseFloat(cantInput) || 1;
    if (cant <= 0) cant = 1;

    setCart(prev => {
      // Buscar si ya existe con el mismo precio
      const existeIdx = prev.findIndex(item => item.id === p.id && item.precio_final === p.precio);
      if (existeIdx >= 0) {
        const newCart = [...prev];
        newCart[existeIdx].cantidad += cant;
        return newCart;
      } else {
        return [...prev, {
          ...p,
          cart_id: Math.random().toString(36).substring(7),
          cantidad: cant,
          precio_final: p.precio
        }];
      }
    });
    setCantInput('1'); // Reset
    toast.success(`${p.nombre} agregado`);
  };

  const removerDelCarrito = (cart_id: string) => {
    setCart(prev => prev.filter(item => item.cart_id !== cart_id));
  };

  const vaciarTicket = () => {
    if (window.confirm('¿Deseas vaciar el ticket actual?')) {
      setCart([]);
      setCliente(null);
      setDescuentoGlobalUsd(0);
    }
  };

  // --- Lógica Modales ---
  const handleRecuperarVenta = (id: string | number) => {
    toast(`Borrador ${id} recuperado`);
    // TODO: Fetch venta y sus items de supabase y volcar en cart.
  };

  const modificarItem = (item: CartItem, modo: 'cantidad' | 'precio') => {
    openItemModal({
      modo,
      titulo: item.nombre,
      subtitulo: modo === 'cantidad' ? 'Ajustar cantidad' : 'Ajustar precio final',
      valor: modo === 'cantidad' ? item.cantidad : undefined,
      usd: modo === 'precio' ? item.precio_final : undefined,
      tasa: tasaBCV,
      min: item.precio * 0.9, // 10% dcto max aprox (ejemplo)
      minSuave: true,
      onConfirm: (nuevoVal) => {
        setCart(prev => prev.map(c => {
          if (c.cart_id !== item.cart_id) return c;
          return {
            ...c,
            cantidad: modo === 'cantidad' ? nuevoVal : c.cantidad,
            precio_final: modo === 'precio' ? nuevoVal : c.precio_final
          };
        }));
      }
    });
  };

  // --- Cálculos ---
  const totales = useMemo(() => {
    let sub = 0;
    let iva = 0;
    cart.forEach(item => {
      const lineTotal = item.precio_final * item.cantidad;
      sub += lineTotal;
      if (item.aplica_iva) {
        iva += lineTotal * 0.16; // Asumiendo 16% IVA general
      }
    });
    
    // El descuento aplica sobre el subtotal base. Se simplifica el cálculo del IVA pro-rateado aquí.
    const sub_con_dcto = Math.max(0, sub - descuentoGlobalUsd);
    
    // Proporción del descuento
    const factor = sub > 0 ? sub_con_dcto / sub : 1;
    const iva_real = iva * factor;
    const gran_total_usd = sub_con_dcto + iva_real;

    return {
      subtotal_usd: sub,
      descuento: descuentoGlobalUsd,
      iva_usd: iva_real,
      total_usd: gran_total_usd,
      total_bs: gran_total_usd * tasaBCV
    };
  }, [cart, descuentoGlobalUsd, tasaBCV]);

  // --- Cobro ---
  const emitirFactura = () => {
    if (cart.length === 0) {
      toast.error('El ticket está vacío');
      return;
    }
    openPaymentModal({
      totalUsd: totales.total_usd,
      totalBs: totales.total_bs,
      tasa: tasaBCV,
      clientName: cliente?.nombre || 'Consumidor Final',
      onConfirm: async (pagos, vuelto) => {
        try {
          const ventaId = crypto.randomUUID(); // Generamos el ID aquí para usarlo en hijos

          // 1. Insertar Venta
          const { error: errVenta } = await supabase.from('ventas').insert({
            id: ventaId,
            cliente_id: cliente?.id || null,
            tipo_documento: tipoDocumento,
            numero_factura: `FAC-${Date.now().toString().slice(-6)}`,
            estado: 'EMITIDA',
            condicion_pago: condicionPago,
            subtotal_usd: totales.subtotal_usd,
            iva_monto_usd: totales.iva_usd,
            total_usd: totales.total_usd,
            tasa_bcv: tasaBCV,
            total_bs: totales.total_bs
          });

          if (errVenta) throw errVenta;

          // 2. Insertar Items
          const itemsToInsert = cart.map(item => ({
            venta_id: ventaId,
            producto_id: item.id,
            sku: item.sku || null,
            descripcion: item.nombre,
            cantidad: item.cantidad,
            precio_unitario: item.precio_final,
            subtotal: item.precio_final * item.cantidad
          }));

          const { error: errItems } = await supabase.from('venta_items').insert(itemsToInsert);
          if (errItems) throw errItems;

          // 3. Insertar Pagos
          if (pagos && pagos.length > 0) {
            const pagosToInsert = pagos.map((p: any) => ({
              venta_id: ventaId,
              metodo_pago: p.metodo,
              moneda_codigo: p.moneda,
              monto_moneda: p.montoMoneda,
              tasa_cambio: p.moneda === 'BS' ? tasaBCV : 1,
              monto_usd: p.montoUsd,
              referencia: p.referencia || null
            }));
            await supabase.from('venta_pagos').insert(pagosToInsert);
          }

          // 4. Insertar Vuelto (si hay)
          if (vuelto && vuelto.montoUsd > 0) {
            await supabase.from('venta_vueltos').insert({
              venta_id: ventaId,
              tipo: vuelto.metodo,
              monto_usd: vuelto.montoUsd
            });
          }

          toast.success('¡Factura Emitida Exitosamente!');
          setCart([]);
          setCliente(null);
          
        } catch (error: any) {
          toast.error('Error al emitir factura: ' + error.message);
          console.error(error);
        }
      }
    });
  };

  // --- Filtros ---
  const prodsFiltrados = useMemo(() => {
    let result = productos;
    if (categoriaSel !== 'todos') {
      result = result.filter(p => p.categoria_id === categoriaSel);
    }
    if (busqueda) {
      const q = busqueda.toLowerCase();
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(q) || 
        p.codigo_barra?.toLowerCase().includes(q) || 
        p.sku?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [productos, categoriaSel, busqueda]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  // --------------------------------------------------------
  // RENDER UI
  // --------------------------------------------------------
  return (
    <div className={`flex flex-col bg-gray-50 font-sans ${isFullScreen ? 'h-screen w-screen fixed inset-0 z-50' : 'h-[calc(100vh-4rem)] -m-6'}`}>
      {/* Header Fino */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#080A0C] p-1.5 rounded-lg flex items-center gap-2">
            <span className="text-[#00E5FF] font-black tracking-widest text-xs px-1">T</span>
          </div>
          <span className="font-bold text-gray-800 text-sm tracking-wide">PUNTO DE VENTA</span>
          
          <select 
            className="ml-2 bg-gray-100 text-sm font-bold text-gray-700 py-1.5 px-3 rounded-lg border-none focus:ring-0 cursor-pointer"
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value)}
          >
            <option>Factura Fiscal</option>
            <option>Nota de Entrega</option>
            <option>Presupuesto</option>
          </select>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <button onClick={toggleFullScreen} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100">
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content: Left Ticket, Right Catalog */}
      <div className="flex flex-1 min-h-0">
        
        {/* LADO IZQUIERDO: TICKET (35%) */}
        <div className="w-[35%] flex flex-col bg-white border-r border-gray-200 z-10 relative shadow-[2px_0_15px_-3px_rgba(0,0,0,0.05)]">
          {/* Ticket Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 text-xs font-semibold text-brand-600 bg-brand-50/30">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              {new Date().toLocaleDateString('es-VE')}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">En elaboración:</span>
              <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded italic">nueva</span>
            </div>
          </div>
          
          {/* Table Headers */}
          <div className="grid grid-cols-[1fr_70px_50px_80px] gap-2 px-4 py-2 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
            <div>Producto</div>
            <div className="text-right">Precio</div>
            <div className="text-center">Cant.</div>
            <div className="text-right">Total</div>
          </div>

          {/* Ticket Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                <PackageOpen size={48} strokeWidth={1} />
                <p className="text-sm font-medium">El ticket está vacío</p>
                <p className="text-xs">Escanea el código de barra o toca un producto del catálogo</p>
              </div>
            ) : (
              cart.map((item, i) => (
                <div key={item.cart_id} className="group flex flex-col p-2 hover:bg-emerald-50/50 rounded-xl transition-colors border border-transparent hover:border-emerald-100">
                  <div className="grid grid-cols-[1fr_70px_50px_80px] gap-2 items-center">
                    <div className="text-sm font-semibold text-gray-800 leading-tight truncate pr-2">
                      {item.nombre}
                    </div>
                    <button 
                      onClick={() => modificarItem(item, 'precio')}
                      className="text-right text-sm font-mono font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded px-1 -mx-1 transition-colors"
                    >
                      ${item.precio_final.toFixed(2)}
                    </button>
                    <button 
                      onClick={() => modificarItem(item, 'cantidad')}
                      className="text-center text-sm font-black text-gray-800 hover:text-brand-600 hover:bg-brand-50 rounded px-1 -mx-1 transition-colors"
                    >
                      {item.cantidad}
                    </button>
                    <div className="text-right flex items-center justify-end gap-1">
                      <span className="text-sm font-black text-emerald-700">
                        ${(item.precio_final * item.cantidad).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => removerDelCarrito(item.cart_id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 -mr-2 rounded transition-all"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket Totals */}
          <div className="p-4 bg-gray-50/80 border-t border-gray-200 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>Subtotal</span>
              <span className="font-mono text-gray-700">${totales.subtotal_usd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-500 items-center">
              <span>Descuento global ($)</span>
              <input 
                type="number" 
                value={descuentoGlobalUsd || ''}
                onChange={(e) => setDescuentoGlobalUsd(Number(e.target.value))}
                className="w-16 text-right py-0.5 px-1 border border-gray-300 rounded text-gray-700 font-mono focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>IVA</span>
              <span className="font-mono text-gray-700">${totales.iva_usd.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-gray-300/50 mt-2 pt-2 flex justify-between items-end">
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">TOTAL $ (REF.)</div>
                <div className="text-2xl font-black text-gray-900 leading-none">${totales.total_usd.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">TOTAL Bs</div>
                <div className="text-3xl font-black text-emerald-600 leading-none">Bs {totales.total_bs.toFixed(2)}</div>
                <div className="text-[9px] font-medium text-gray-400 mt-1">Tasa {tasaBCV.toFixed(2)} Bs/$ (BCV)</div>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded hover:bg-brand-100 flex items-center gap-1 transition-colors">
                <Tag size={12}/> Retención / Impuestos
              </button>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: CATÁLOGO (65%) */}
        <div className="w-[65%] flex flex-col bg-gray-100/50 relative">
          
          {/* Top Search Bar */}
          <div className="p-4 flex gap-3 z-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Escanea o busca por nombre/código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-brand-200 focus:border-brand-500 rounded-2xl text-gray-800 font-medium placeholder-gray-400 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-brand-500/20 transition-all outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-white px-3 border-2 border-gray-200 rounded-2xl shadow-sm">
              <span className="text-[10px] font-black text-gray-400">CANT.</span>
              <input 
                type="number" 
                min="1"
                value={cantInput}
                onChange={(e) => setCantInput(e.target.value)}
                className="w-12 text-center font-black text-lg text-gray-800 bg-transparent border-none outline-none focus:ring-0 p-0"
              />
            </div>
          </div>

          {/* Categories Pills */}
          <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setCategoriaSel('todos')}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                categoriaSel === 'todos' 
                  ? 'bg-gray-800 text-white border-gray-800 shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todos ({productos.length})
            </button>
            {categorias.map(cat => {
              const count = productos.filter(p => p.categoria_id === cat.id).length;
              if (count === 0) return null; // hide empty
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaSel(cat.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    categoriaSel === cat.id 
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat.nombre} ({count})
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4 pt-2">
            {cargando ? (
              <div className="flex justify-center items-center h-full text-gray-400">Cargando catálogo...</div>
            ) : prodsFiltrados.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-gray-400">
                <Search size={48} className="opacity-20 mb-4" />
                <p>No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4 pb-20">
                {prodsFiltrados.map(p => (
                  <button
                    key={p.id}
                    onClick={() => agregarAlCarrito(p)}
                    className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-300 transition-all text-left flex flex-col overflow-hidden active:scale-95"
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 relative">
                      {p.imagen_url ? (
                        <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <PackageOpen size={40} className="text-gray-200" strokeWidth={1} />
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1 border-t border-gray-50">
                      <div className="text-[11px] font-bold text-gray-800 leading-tight line-clamp-2 flex-1 mb-2">
                        {p.nombre}
                      </div>
                      <div className="flex items-end justify-between mt-auto">
                        <div className="text-base font-black text-gray-900 leading-none">
                          ${p.precio.toFixed(2)}
                        </div>
                        <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          p.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {p.stock > 0 ? `${p.stock} u.` : 'Sin stock'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER BAR (Acciones Rápidas) */}
      <div className="bg-[#080A0C] border-t border-gray-800 px-4 py-2.5 flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.2)] z-20 flex-shrink-0 text-white">
        
        {/* Atajos Izquierda */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => openRecoverSale(handleRecuperarVenta)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            <span className="text-amber-400 flex items-center gap-1"><FileText size={14}/> Elaboraciones (0)</span>
          </button>
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            <span className="text-white/50">↑</span> Cotización
          </button>
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            <span className="bg-brand-500 text-white px-1.5 py-0.5 rounded text-[10px]">F5</span> Cliente
          </button>
          <button onClick={openPriceConsultant} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-brand-500/20">
            <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">F4</span> Precios 
            <span className="bg-black/20 text-brand-100 px-1.5 py-0.5 rounded text-[9px] ml-1">F3 BCV</span>
          </button>
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            <span className="bg-gray-700 px-1.5 py-0.5 rounded text-[10px]">F5</span> Precio manual
          </button>
          <button onClick={vaciarTicket} className="flex items-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ml-2">
            <Trash2 size={14} /> Vaciar (F7)
          </button>
        </div>

        {/* Acciones Derecha (Cobro) */}
        <div className="flex items-center gap-3">
          
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cliente * — nombre/cédula..." 
              value={cliente?.nombre || ''}
              readOnly
              className="bg-white/10 border border-white/20 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 w-48 cursor-pointer"
            />
          </div>

          <select 
            value={vendedor}
            onChange={(e) => setVendedor(e.target.value)}
            className="bg-white/10 border border-white/20 text-xs text-white rounded-lg py-1.5 px-3 focus:outline-none focus:border-brand-500"
          >
            <option value="0" className="text-black">Vendedor</option>
            <option value="1" className="text-black">Admin</option>
          </select>

          <select 
            value={condicionPago}
            onChange={(e) => setCondicionPago(e.target.value)}
            className="bg-white/10 border border-white/20 text-xs text-white rounded-lg py-1.5 px-3 focus:outline-none focus:border-brand-500"
          >
            <option value="CONTADO" className="text-black">Contado</option>
            <option value="CREDITO" className="text-black">Crédito</option>
          </select>

          <button className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors">
            <Clock size={14} /> Guardar
          </button>

          <button 
            onClick={emitirFactura}
            className="flex items-center gap-2 bg-[#00E5FF] hover:bg-[#00cce6] text-black font-black px-5 py-2 rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] ml-2"
          >
            <Check size={16} strokeWidth={3} />
            EMITIR FACTURA <span className="bg-black/10 px-1.5 py-0.5 rounded text-[10px] ml-1">F9</span>
          </button>
        </div>

      </div>
    </div>
  );
}
