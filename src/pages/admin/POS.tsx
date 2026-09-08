import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign, 
  Receipt, 
  FileText, 
  Share2, 
  Download, 
  RotateCcw, 
  User, 
  Store, 
  CheckCircle2, 
  Truck, 
  Package, 
  AlertCircle,
  Clock,
  Printer
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import toast from 'react-hot-toast';
import ModalCobro, { LineaPago } from '@/components/admin/ModalCobro';
import { descargarFacturaPdf, DatosFacturaPdf } from '@/lib/pdf/generadorFacturaPdf';

interface CartItem {
  id: string;
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
}

export default function POSPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { usdRate } = useCurrency();
  const tasaBcv = usdRate && usdRate > 0 ? usdRate : 804.81;

  const docParam = searchParams.get('doc');
  const [tipoDoc, setTipoDoc] = useState<'factura_fiscal' | 'pedido'>(
    docParam === 'pedido' ? 'pedido' : 'factura_fiscal'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCobroOpen, setIsCobroOpen] = useState(false);
  const [clienteNombre, setClienteNombre] = useState('Cliente de Contado');
  const [clienteDocumento, setClienteDocumento] = useState('V-00000000');
  const [clienteTelefono, setClienteTelefono] = useState('');

  // Última venta para modal de éxito / WhatsApp
  const [lastVenta, setLastVenta] = useState<any | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data } = await supabase
        .from('productos')
        .select('*')
        .order('nombre')
        .limit(30);

      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Filtrado reactivo de productos
  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const hay = `${p.nombre || ''} ${p.codigo || ''} ${p.codigo_barra || ''}`.toLowerCase();
    return q.split(' ').every(term => hay.includes(term));
  });

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          codigo: product.codigo || product.sku || 'PROD-01',
          nombre: product.nombre,
          precio: Number(product.precio) || 10,
          cantidad: 1,
          stock: product.stock || 99
        }
      ];
    });
    toast.success(`${product.nombre} agregado`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = Math.max(1, item.cantidad + delta);
            return { ...item, cantidad: newQty };
          }
          return item;
        })
        .filter(item => item.cantidad > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Totales
  const subtotalUsd = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const esFiscal = tipoDoc === 'factura_fiscal';
  const ivaPorcentaje = esFiscal ? 16 : 0;
  const ivaUsd = esFiscal ? Number((subtotalUsd * 0.16).toFixed(2)) : 0;
  const totalUsd = Number((subtotalUsd + ivaUsd).toFixed(2));
  const totalBs = Number((totalUsd * tasaBcv).toFixed(2));

  // Confirmar Cobro
  const handleConfirmarCobro = (pagos: LineaPago[], resumen: any) => {
    const numDoc = `TF-${Math.floor(1000 + Math.random() * 9000)}`;

    const datosPdf: DatosFacturaPdf = {
      tipoDocumento: esFiscal ? 'FACTURA FISCAL' : 'NOTA DE ENTREGA',
      numeroDocumento: numDoc,
      numeroControl: esFiscal ? `00-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      fechaEmision: new Date().toLocaleDateString('es-VE'),
      horaEmision: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
      condicionPago: 'CONTADO',
      empresa: {
        nombre: 'Tesla Fire, C.A.',
        rif: 'J-50123456-7',
        direccion: 'Av. Principal, Edif. Tesla Fire, Caracas, Venezuela',
        telefono: '+58 (212) 555-0199',
        email: 'ventas@teslafire.com'
      },
      cliente: {
        nombre: clienteNombre,
        documento: clienteDocumento,
        telefono: clienteTelefono
      },
      tasaBcv,
      items: cart.map(i => ({
        codigo: i.codigo,
        descripcion: i.nombre,
        cantidad: i.cantidad,
        precioUnitarioUsd: i.precio,
        subtotalUsd: i.precio * i.cantidad
      })),
      subtotalUsd,
      ivaPorcentaje,
      ivaUsd,
      igtfUsd: resumen.igtfUsd,
      totalUsd: resumen.totalUsd,
      totalBs: Number((resumen.totalUsd * tasaBcv).toFixed(2)),
      pagos: pagos.map(p => ({
        metodo: p.nombre,
        moneda: p.esBase ? 'USD' : 'BS',
        montoMoneda: p.montoMoneda,
        tasa: p.tasaCambio,
        montoUsd: p.montoUsd,
        referencia: p.referencia
      })),
      vueltoUsd: resumen.vueltoUsd,
      vueltoDestino: resumen.vueltoDestino
    };

    setLastVenta({
      datosPdf,
      numDoc,
      totalUsd: resumen.totalUsd,
      totalBs: Number((resumen.totalUsd * tasaBcv).toFixed(2))
    });

    // Descarga el PDF impecable
    descargarFacturaPdf(datosPdf);
    toast.success('¡Venta registrada y comprobante generado!');
    setCart([]);
  };

  const getWhatsAppLink = () => {
    if (!lastVenta) return '#';
    const text = encodeURIComponent(
      `Hola ${clienteNombre}, gracias por tu compra en Tesla Fire. Adjuntamos tu ${
        esFiscal ? 'Factura Fiscal' : 'Nota de Entrega'
      } #${lastVenta.numDoc} por un total de $ ${lastVenta.totalUsd.toFixed(2)} (Bs. ${lastVenta.totalBs.toFixed(2)}). ¡Esperamos verte pronto!`
    );
    return `https://wa.me/${clienteTelefono.replace(/[^0-9]/g, '')}?text=${text}`;
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Barra Superior del Punto de Venta */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 border border-white/60 shadow-sm flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-900 flex items-center justify-center text-electrico-500 shadow-sm">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-900 font-rajdhani text-lg">Punto de Venta Rápido (POS)</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                esFiscal ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {esFiscal ? 'Factura Fiscal (IVA 16%)' : 'Nota de Entrega (Sin IVA)'}
              </span>
            </div>
            <div className="text-xs text-gray-400">Sucursal: <b>Tesla Fire Principal</b> · Tasa BCV: <b>Bs. {tasaBcv.toFixed(2)}</b></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternar Documento */}
          <button
            onClick={() => setTipoDoc(prev => (prev === 'factura_fiscal' ? 'pedido' : 'factura_fiscal'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cambiar a {esFiscal ? 'Nota de Entrega' : 'Factura Fiscal'}</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Catálogo (Izquierda) + Carrito y Cobro (Derecha) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Catálogo de Productos (7 columnas en escritorio) */}
        <div className="lg:col-span-7 bg-white/80 backdrop-blur-md rounded-3xl p-4 border border-white/60 shadow-sm flex flex-col min-h-0">
          {/* Buscador de Producto */}
          <div className="relative mb-3 flex-shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, código o escanear código de barras..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-semibold"
            />
          </div>

          {/* Grid de Productos */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 custom-scrollbar">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="group p-3 bg-white border border-gray-100 hover:border-electrico-500/40 rounded-2xl text-left hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] font-bold text-gray-400 font-mono block truncate">
                    {p.codigo || p.sku || 'REF-100'}
                  </span>
                  <span className="font-bold text-xs text-gray-900 group-hover:text-brand-900 line-clamp-2 leading-snug mt-0.5">
                    {p.nombre}
                  </span>
                </div>

                <div className="flex items-end justify-between mt-3 pt-2 border-t border-gray-50">
                  <div>
                    <span className="text-[10px] text-gray-400 block leading-none">Stock: {p.stock ?? 12}</span>
                    <span className="text-base font-black text-brand-900 font-rajdhani">
                      $ {Number(p.precio || 10).toFixed(2)}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-brand-900 text-white flex items-center justify-center group-hover:bg-electrico-500 transition-colors shadow-sm">
                    <Plus className="w-4 h-4 text-electrico-500 group-hover:text-brand-900" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Carrito de Compra & Cobro (5 columnas en escritorio) */}
        <div className="lg:col-span-5 bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-sm flex flex-col min-h-0">
          {/* Datos del Cliente */}
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl mb-3 flex-shrink-0 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase">Cliente</label>
              <input
                type="text"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                className="w-full text-xs font-semibold bg-transparent border-b border-gray-200 focus:outline-none focus:border-brand-500 py-0.5"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase">RIF / Cédula</label>
              <input
                type="text"
                value={clienteDocumento}
                onChange={(e) => setClienteDocumento(e.target.value)}
                className="w-full text-xs font-semibold bg-transparent border-b border-gray-200 focus:outline-none focus:border-brand-500 py-0.5"
              />
            </div>
          </div>

          {/* Lista de Ítems en Carrito */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[120px]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-8">
                <Package className="w-8 h-8 text-gray-300 mb-2" />
                <span className="text-xs font-semibold">El carrito está vacío</span>
                <span className="text-[10px] text-gray-400">Haz clic en los productos para agregarlos</span>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-2.5 bg-white border border-gray-100 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-gray-900 truncate">{item.nombre}</div>
                    <div className="text-[10px] text-gray-400">$ {item.precio.toFixed(2)} c/u</div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-500 hover:text-red-500">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-gray-800 w-5 text-center">{item.cantidad}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-500 hover:text-emerald-500">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[65px]">
                    <div className="text-sm font-black text-gray-900 font-rajdhani">
                      $ {(item.precio * item.cantidad).toFixed(2)}
                    </div>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Totales y Botón de Cobro */}
          <div className="pt-3 border-t border-gray-100 mt-3 flex-shrink-0 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-800">$ {subtotalUsd.toFixed(2)}</span>
            </div>
            {esFiscal && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>IVA (16%):</span>
                <span className="font-bold text-gray-800">$ {ivaUsd.toFixed(2)}</span>
              </div>
            )}

            <div 
              className="p-3.5 rounded-2xl text-white flex items-center justify-between shadow-md"
              style={{ background: 'linear-gradient(120deg, #080A0C, #1B1F23)' }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total a Cobrar</span>
                <div className="text-2xl font-black font-rajdhani text-white leading-tight">
                  $ {totalUsd.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">En Bolívares (BCV)</span>
                <div className="text-base font-bold text-electrico-500 font-rajdhani leading-tight">
                  Bs. {totalBs.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.').replace('.', ',')}
                </div>
              </div>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setIsCobroOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-extrabold font-rajdhani text-lg tracking-wider transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              <span>PROCESAR PAGO (F2)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Cobro Multimoneda */}
      <ModalCobro
        isOpen={isCobroOpen}
        onClose={() => setIsCobroOpen(false)}
        totalUsd={totalUsd}
        tasaBcv={tasaBcv}
        clienteNombre={clienteNombre}
        onConfirmarCobro={handleConfirmarCobro}
      />

      {/* Modal / Toast Flotante de Venta Exitosa con WhatsApp */}
      {lastVenta && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-gray-100 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 max-w-sm">
          <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-sm mb-1">
            <CheckCircle2 className="w-5 h-5" />
            <span>¡Venta #{lastVenta.numDoc} Completada!</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Comprobante descargado en PDF vectorial. ¿Deseas enviarlo por WhatsApp?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => descargarFacturaPdf(lastVenta.datosPdf)}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Re-descargar</span>
            </button>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
