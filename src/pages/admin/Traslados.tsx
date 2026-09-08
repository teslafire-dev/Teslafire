import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Info, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Package, 
  Building2, 
  User, 
  Calendar,
  Send
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface TrasladoMovimiento {
  id: string;
  referencia: string;
  producto_id: string;
  producto_nombre: string;
  producto_sku: string;
  origen_tienda_id: string;
  origen_nombre: string;
  destino_tienda_id: string;
  destino_nombre: string;
  cantidad: number;
  usuario_nombre: string;
  created_at: string;
}

interface ItemTransferencia {
  producto_id: string;
  sku: string;
  nombre: string;
  stock_disponible: number;
  cantidad: number;
}

export default function AdminTraslados() {
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [movimientos, setMovimientos] = useState<TrasladoMovimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);

  // Formulario Paso 1: Depósitos
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');

  // Formulario Paso 2: Productos y Cantidad
  const [selectedProdId, setSelectedProdId] = useState('');
  const [cantidadInput, setCantidadInput] = useState<number>(1);
  const [itemsToTransfer, setItemsToTransfer] = useState<ItemTransferencia[]>([]);
  const [notas, setNotas] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Tiendas / Almacenes
      const { data: stores } = await supabase
        .from('tiendas')
        .select('id, nombre, codigo, es_principal')
        .order('es_principal', { ascending: false });

      if (stores) setTiendas(stores);

      // 2. Productos con Stock
      const { data: prods } = await supabase
        .from('productos')
        .select('*, producto_stock(stock_actual, tienda_id)')
        .eq('activo', true)
        .order('nombre');

      if (prods) setProductos(prods);

      // 3. Movimientos históricos
      try {
        const { data: movs, error } = await supabase
          .from('traslados_movimientos')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && movs) {
          setMovimientos(movs);
        } else {
          const local = localStorage.getItem('teslafire_traslados_movimientos');
          if (local) setMovimientos(JSON.parse(local));
        }
      } catch (err) {
        const local = localStorage.getItem('teslafire_traslados_movimientos');
        if (local) setMovimientos(JSON.parse(local));
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener stock de un producto en el origen seleccionado
  const getProductStockInOrigin = (prodId: string) => {
    if (!origenId) return 0;
    const prod = productos.find(p => p.id === prodId);
    if (!prod) return 0;
    const st = prod.producto_stock?.find((s: any) => s.tienda_id === origenId);
    return st?.stock_actual ?? prod.stock ?? 0;
  };

  const handleAddItem = () => {
    if (!selectedProdId) {
      toast.error('Selecciona un producto');
      return;
    }

    const prod = productos.find(p => p.id === selectedProdId);
    if (!prod) return;

    const availableStock = getProductStockInOrigin(prod.id);
    if (cantidadInput <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    if (cantidadInput > availableStock) {
      toast.error(`Stock insuficiente. Disponible en origen: ${availableStock}`);
      return;
    }

    const existingIndex = itemsToTransfer.findIndex(i => i.producto_id === prod.id);
    if (existingIndex >= 0) {
      const newTotal = itemsToTransfer[existingIndex].cantidad + Number(cantidadInput);
      if (newTotal > availableStock) {
        toast.error(`Excede el stock disponible (${availableStock})`);
        return;
      }
      const updated = [...itemsToTransfer];
      updated[existingIndex].cantidad = newTotal;
      setItemsToTransfer(updated);
    } else {
      setItemsToTransfer([
        ...itemsToTransfer,
        {
          producto_id: prod.id,
          sku: prod.sku,
          nombre: prod.nombre,
          stock_disponible: availableStock,
          cantidad: Number(cantidadInput)
        }
      ]);
    }

    setSelectedProdId('');
    setCantidadInput(1);
    toast.success('Producto agregado al traslado');
  };

  const handleRemoveItem = (idx: number) => {
    setItemsToTransfer(itemsToTransfer.filter((_, i) => i !== idx));
  };

  const handleEjecutarTraslado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origenId || !destinoId) {
      toast.error('Seleccione origen y destino');
      return;
    }
    if (origenId === destinoId) {
      toast.error('El depósito origen y destino no pueden ser iguales');
      return;
    }
    if (itemsToTransfer.length === 0) {
      toast.error('Agregue al menos un producto para trasladar');
      return;
    }

    setTransferring(true);
    const origenObj = tiendas.find(t => t.id === origenId);
    const destinoObj = tiendas.find(t => t.id === destinoId);

    try {
      const newMovements: TrasladoMovimiento[] = [];

      for (const item of itemsToTransfer) {
        const ref = `TR-${Date.now().toString().slice(-4)}`;
        
        // 1. Restar de origen
        const stockOrigenActual = getProductStockInOrigin(item.producto_id);
        const stockOrigenNuevo = Math.max(0, stockOrigenActual - item.cantidad);
        await supabase
          .from('producto_stock')
          .upsert({
            producto_id: item.producto_id,
            tienda_id: origenId,
            stock_actual: stockOrigenNuevo,
            stock_comprometido: 0,
            updated_at: new Date().toISOString()
          }, { onConflict: 'producto_id,tienda_id' });

        // 2. Sumar a destino
        const prod = productos.find(p => p.id === item.producto_id);
        const stockDestinoActual = prod?.producto_stock?.find((s: any) => s.tienda_id === destinoId)?.stock_actual ?? 0;
        const stockDestinoNuevo = stockDestinoActual + item.cantidad;
        await supabase
          .from('producto_stock')
          .upsert({
            producto_id: item.producto_id,
            tienda_id: destinoId,
            stock_actual: stockDestinoNuevo,
            stock_comprometido: 0,
            updated_at: new Date().toISOString()
          }, { onConflict: 'producto_id,tienda_id' });

        // 3. Registrar movimiento
        const movRecord: TrasladoMovimiento = {
          id: crypto.randomUUID(),
          referencia: ref,
          producto_id: item.producto_id,
          producto_nombre: item.nombre,
          producto_sku: item.sku,
          origen_tienda_id: origenId,
          origen_nombre: origenObj?.nombre || 'Origen',
          destino_tienda_id: destinoId,
          destino_nombre: destinoObj?.nombre || 'Destino',
          cantidad: item.cantidad,
          usuario_nombre: 'Admin',
          created_at: new Date().toISOString()
        };

        // Intentar guardar en Supabase
        await supabase.from('traslados_movimientos').insert([movRecord]);
        newMovements.push(movRecord);
      }

      // Sincronizar en historial local
      const updatedMovs = [...newMovements, ...movimientos];
      setMovimientos(updatedMovs);
      localStorage.setItem('teslafire_traslados_movimientos', JSON.stringify(updatedMovs));

      toast.success('¡Traslado ejecutado y stock actualizado con éxito!');
      
      // Limpiar selección
      setOrigenId('');
      setDestinoId('');
      setItemsToTransfer([]);
      setNotas('');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar el traslado');
    } finally {
      setTransferring(false);
    }
  };

  const hasSelectedBothDeposits = Boolean(origenId && destinoId && origenId !== destinoId);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO DE LA PÁGINA
      ══════════════════════════════════════════════════ */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Traslados de Inventario
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Mueve mercancía entre el almacén general y las tiendas.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA 1: NUEVO TRASLADO
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs mb-6">
        
        {/* Título de la tarjeta */}
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeftRight className="w-4 h-4 text-gray-700" />
          <h2 className="text-sm font-bold text-gray-900">
            Nuevo Traslado
          </h2>
        </div>

        {/* Paso 1: Selecciona los depósitos */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] font-bold">
            1
          </div>
          <span className="text-xs font-bold text-gray-800">
            Selecciona los depósitos
          </span>
        </div>

        <form onSubmit={handleEjecutarTraslado}>
          {/* Fila con los 2 selectores de depósitos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Depósito Origen * */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Depósito Origen <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={origenId}
                  onChange={(e) => setOrigenId(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white cursor-pointer appearance-none pr-8 text-gray-800"
                >
                  <option value="">Seleccione origen...</option>
                  {tiendas.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} {t.es_principal ? '(Principal)' : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Depósito Destino * */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Depósito Destino <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={destinoId}
                  onChange={(e) => setDestinoId(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white cursor-pointer appearance-none pr-8 text-gray-800"
                >
                  <option value="">Seleccione destino...</option>
                  {tiendas
                    .filter(t => t.id !== origenId)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje de guía si no se han seleccionado ambos */}
          {!hasSelectedBothDeposits && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-3">
              <Info className="w-3.5 h-3.5 text-gray-400" />
              <span>Selecciona origen y destino para continuar</span>
            </div>
          )}

          {/* Paso 2: Aparece cuando se han seleccionado los depósitos */}
          {hasSelectedBothDeposits && (
            <div className="mt-5 pt-5 border-t border-gray-100 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] font-bold">
                  2
                </div>
                <span className="text-xs font-bold text-gray-800">
                  Selecciona los productos y cantidades a trasladar
                </span>
              </div>

              {/* Selector de producto y cantidad */}
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
                <div className="flex-1 w-full">
                  <select
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="">Seleccione producto...</option>
                    {productos.map(p => {
                      const st = getProductStockInOrigin(p.id);
                      return (
                        <option key={p.id} value={p.id} disabled={st <= 0}>
                          {p.nombre} ({p.sku}) — Stock disp: {st}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="w-full sm:w-32">
                  <input
                    type="number"
                    min="1"
                    value={cantidadInput}
                    onChange={(e) => setCantidadInput(parseInt(e.target.value) || 1)}
                    placeholder="Cant."
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 text-center bg-white font-rajdhani"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#495057] hover:bg-[#343a40] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar
                </button>
              </div>

              {/* Lista de productos a trasladar */}
              {itemsToTransfer.length > 0 && (
                <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-3 mb-4">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Mercancía a transferir ({itemsToTransfer.length}):
                  </span>
                  <div className="space-y-1.5">
                    {itemsToTransfer.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200/60 text-xs">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-bold text-gray-800">{it.nombre}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">({it.sku})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-emerald-600 font-rajdhani text-sm">
                            {it.cantidad} unid.
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botón Confirmar */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={transferring}
                      className="px-6 py-2.5 bg-[#009b63] hover:bg-[#008756] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {transferring ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Confirmar Traslado de Mercancía</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA 2: ÚLTIMOS MOVIMIENTOS DE TRASLADO
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-gray-900 mb-4">
          Últimos movimientos de traslado
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  FECHA
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  PRODUCTO
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-red-500 uppercase tracking-wider text-center">
                  SALIDA
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-emerald-600 uppercase tracking-wider text-center">
                  ENTRADA
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  CANT.
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  USUARIO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto mb-2" />
                    <span className="text-xs font-semibold text-gray-400">Cargando movimientos...</span>
                  </td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs font-medium text-gray-400">
                    No hay traslados recientes registrados.
                  </td>
                </tr>
              ) : (
                movimientos.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50/70 transition-colors">
                    
                    {/* FECHA */}
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-500">
                      {new Date(mov.created_at).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>

                    {/* PRODUCTO */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">
                          {mov.producto_nombre}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          SKU: {mov.producto_sku}
                        </span>
                      </div>
                    </td>

                    {/* SALIDA */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                        {mov.origen_nombre}
                      </span>
                    </td>

                    {/* ENTRADA */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                        {mov.destino_nombre}
                      </span>
                    </td>

                    {/* CANTIDAD */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs font-black text-gray-900 font-rajdhani">
                        {mov.cantidad}
                      </span>
                    </td>

                    {/* USUARIO */}
                    <td className="py-3.5 px-4 text-center text-xs font-medium text-gray-600">
                      {mov.usuario_nombre}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
