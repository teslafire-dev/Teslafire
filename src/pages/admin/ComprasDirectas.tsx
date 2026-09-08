import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  ChevronLeft, 
  Check, 
  X, 
  Calendar, 
  Building2, 
  CreditCard, 
  Clock, 
  DollarSign, 
  Trash2, 
  Loader2, 
  AlertCircle,
  FileText,
  Boxes,
  HelpCircle,
  Globe
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface CompraItemRow {
  producto_id: string;
  nombre: string;
  sku: string;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
}

interface CompraDirecta {
  id: string;
  numero_doc: string;
  numero_control?: string;
  proveedor_nombre: string;
  deposito_nombre: string;
  tipo_pago: 'CONTADO' | 'CREDITO';
  total: number;
  fecha: string;
  vence: string;
}

interface Proveedor {
  id: string;
  nombre: string;
  rif: string;
  telefono: string;
  contacto?: string;
  email?: string;
  dias_credito: number;
}

export default function ComprasDirectas() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [compras, setCompras] = useState<CompraDirecta[]>([]);
  const [loading, setLoading] = useState(false);

  // Listas de datos
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);

  // Formulario Compra
  const [proveedorId, setProveedorId] = useState('');
  const [depositoId, setDepositoId] = useState('');
  const [pagoTipo, setPagoTipo] = useState<'CONTADO' | 'CREDITO'>('CONTADO');
  const [formaPago, setFormaPago] = useState('Efectivo (USD)');
  const [saleDe, setSaleDe] = useState('-- No descontar de ninguna cuenta --');
  const [fechaCompra, setFechaCompra] = useState('2026-09-08');
  const [referencia, setReferencia] = useState('');
  const [nroControl, setNroControl] = useState('');
  const [items, setItems] = useState<CompraItemRow[]>([]);
  const [retenerIva, setRetenerIva] = useState(false);
  const [retencionPct, setRetencionPct] = useState(75);
  const [observaciones, setObservaciones] = useState('');
  const [savingCompra, setSavingCompra] = useState(false);

  // Modal Crear Proveedor
  const [showModalProveedor, setShowModalProveedor] = useState(false);
  const [provNombre, setProvNombre] = useState('');
  const [provRif, setProvRif] = useState('');
  const [provTel, setProvTel] = useState('');
  const [provContacto, setProvContacto] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provDiasCredito, setProvDiasCredito] = useState(0);

  // Modal Crear Producto
  const [showModalProducto, setShowModalProducto] = useState(false);
  const [prodNombre, setProdNombre] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodBarcode, setProdBarcode] = useState('');
  const [prodCategoria, setProdCategoria] = useState('');
  const [prodMarca, setProdMarca] = useState('');
  const [prodProveedor, setProdProveedor] = useState('');
  const [prodClasificacion, setProdClasificacion] = useState('Nacional');
  const [prodCosto, setProdCosto] = useState<number | string>('0.00');
  const [prodPrecioMayor, setProdPrecioMayor] = useState<number | string>('0.00');
  const [prodPuntoReposicion, setProdPuntoReposicion] = useState(5);
  const [prodGarantia, setProdGarantia] = useState(0);
  const [prodUnidCaja, setProdUnidCaja] = useState(1);
  const [prodStockInicial, setProdStockInicial] = useState(0);
  const [prodDescripcion, setProdDescripcion] = useState('');
  const [prodManejaSeriales, setProdManejaSeriales] = useState(false);

  // Modal Agregar Producto a la lista
  const [showModalAddItem, setShowModalAddItem] = useState(false);
  const [selProdId, setSelProdId] = useState('');
  const [selCantidad, setSelCantidad] = useState(1);
  const [selCosto, setSelCosto] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Tiendas
      const { data: stores } = await supabase.from('tiendas').select('id, nombre').order('nombre');
      if (stores) {
        setTiendas(stores);
        if (stores.length > 0 && !depositoId) setDepositoId(stores[0].id);
      }

      // 2. Proveedores
      const { data: provs } = await supabase.from('proveedores').select('*').order('nombre');
      if (provs && provs.length > 0) {
        setProveedores(provs);
      } else {
        const localProvs = localStorage.getItem('teslafire_proveedores');
        if (localProvs) setProveedores(JSON.parse(localProvs));
      }

      // 3. Productos
      const { data: prods } = await supabase.from('productos').select('id, sku, nombre, costo_promedio, precio, stock').eq('activo', true);
      if (prods) setProductos(prods);

      // 4. Compras
      const { data: comps } = await supabase.from('compras').select('*').order('created_at', { ascending: false });
      if (comps && comps.length > 0) {
        setCompras(comps.map(c => ({
          id: c.id,
          numero_doc: c.numero_doc,
          numero_control: c.numero_control,
          proveedor_nombre: c.proveedor_nombre || 'Sin proveedor',
          deposito_nombre: c.deposito_nombre || 'Almacén Tesla Fire',
          tipo_pago: c.tipo_pago || 'CONTADO',
          total: Number(c.total) || 0,
          fecha: new Date(c.fecha_compra).toLocaleDateString('es-VE'),
          vence: c.fecha_vencimiento ? new Date(c.fecha_vencimiento).toLocaleDateString('es-VE') : '—'
        })));
      } else {
        const localComps = localStorage.getItem('teslafire_compras');
        if (localComps) setCompras(JSON.parse(localComps));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos de Totales
  const baseGravable = items.reduce((acc, i) => acc + i.subtotal, 0);
  const ivaMonto = baseGravable * 0.16;
  const totalFactura = baseGravable + ivaMonto;
  const montoRetencion = retenerIva ? (ivaMonto * (retencionPct / 100)) : 0;
  const seLePagaAlProveedor = totalFactura - montoRetencion;

  // Manejar Agregar Producto a la Compra
  const handleConfirmAddItem = () => {
    if (!selProdId) {
      toast.error('Selecciona un producto');
      return;
    }
    const prod = productos.find(p => p.id === selProdId);
    if (!prod) return;

    const unitCost = Number(selCosto) || Number(prod.costo_promedio) || 10;
    const sub = unitCost * selCantidad;

    const existIndex = items.findIndex(i => i.producto_id === selProdId);
    if (existIndex >= 0) {
      const updated = [...items];
      updated[existIndex].cantidad += selCantidad;
      updated[existIndex].costo_unitario = unitCost;
      updated[existIndex].subtotal = updated[existIndex].cantidad * unitCost;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          producto_id: prod.id,
          nombre: prod.nombre,
          sku: prod.sku,
          cantidad: selCantidad,
          costo_unitario: unitCost,
          subtotal: sub
        }
      ]);
    }

    setShowModalAddItem(false);
    setSelProdId('');
    setSelCantidad(1);
    setSelCosto(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItemQty = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].cantidad = Math.max(1, qty);
    updated[index].subtotal = updated[index].cantidad * updated[index].costo_unitario;
    setItems(updated);
  };

  const handleUpdateItemCost = (index: number, cost: number) => {
    const updated = [...items];
    updated[index].costo_unitario = Math.max(0, cost);
    updated[index].subtotal = updated[index].cantidad * updated[index].costo_unitario;
    setItems(updated);
  };

  // Crear Proveedor
  const handleGuardarProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provNombre.trim()) {
      toast.error('El nombre o razón social es obligatorio');
      return;
    }

    const newProv: Proveedor = {
      id: crypto.randomUUID(),
      nombre: provNombre.trim(),
      rif: provRif.trim(),
      telefono: provTel.trim(),
      contacto: provContacto.trim(),
      email: provEmail.trim(),
      dias_credito: Number(provDiasCredito) || 0
    };

    try {
      await supabase.from('proveedores').insert([newProv]);
    } catch (err) {
      console.warn(err);
    }

    const updated = [newProv, ...proveedores];
    setProveedores(updated);
    localStorage.setItem('teslafire_proveedores', JSON.stringify(updated));
    setProveedorId(newProv.id);
    toast.success(`Proveedor ${newProv.nombre} creado con éxito`);
    setShowModalProveedor(false);
    setProvNombre('');
    setProvRif('');
    setProvTel('');
    setProvContacto('');
    setProvEmail('');
  };

  // Crear Producto rápido
  const handleGuardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNombre.trim()) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }

    const finalSku = prodSku.trim() || `SKU-${Date.now().toString().slice(-6)}`;
    const costVal = Number(prodCosto) || 0;
    const mayorVal = Number(prodPrecioMayor) || costVal * 1.3;
    const detalVal = costVal * 1.5;

    const newProd = {
      id: crypto.randomUUID(),
      sku: finalSku,
      nombre: prodNombre.trim(),
      codigo_barra: prodBarcode.trim(),
      costo_promedio: costVal,
      precio: detalVal,
      precio_mayor: mayorVal,
      stock: Number(prodStockInicial) || 0,
      stock_minimo: Number(prodPuntoReposicion) || 5,
      descripcion: prodDescripcion.trim(),
      activo: true
    };

    try {
      await supabase.from('productos').insert([newProd]);
    } catch (err) {
      console.warn(err);
    }

    const updated = [newProd, ...productos];
    setProductos(updated);
    toast.success(`Producto ${newProd.nombre} creado`);
    setShowModalProducto(false);
    setProdNombre('');
    setProdSku('');
    setProdBarcode('');
    setProdCosto('0.00');
    setProdPrecioMayor('0.00');
  };

  // Guardar Compra Directa
  const handleRegistrarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositoId) {
      toast.error('Selecciona un depósito destino');
      return;
    }
    if (items.length === 0) {
      toast.error('Agrega al menos un producto a la compra');
      return;
    }

    setSavingCompra(true);
    const provObj = proveedores.find(p => p.id === proveedorId);
    const storeObj = tiendas.find(t => t.id === depositoId);
    const nroDocFinal = referencia.trim() || `CMP-${Date.now().toString().slice(-6)}`;

    const newCompra: CompraDirecta = {
      id: crypto.randomUUID(),
      numero_doc: nroDocFinal,
      numero_control: nroControl.trim(),
      proveedor_nombre: provObj?.nombre || 'Sin proveedor',
      deposito_nombre: storeObj?.nombre || 'Almacén Tesla Fire',
      tipo_pago: pagoTipo,
      total: seLePagaAlProveedor,
      fecha: new Date(fechaCompra).toLocaleDateString('es-VE'),
      vence: pagoTipo === 'CREDITO' && provObj?.dias_credito ? new Date(Date.now() + provObj.dias_credito * 86400000).toLocaleDateString('es-VE') : '—'
    };

    try {
      // 1. Guardar compra en Supabase
      await supabase.from('compras').insert([{
        id: newCompra.id,
        numero_doc: newCompra.numero_doc,
        numero_control: newCompra.numero_control,
        proveedor_id: proveedorId || null,
        proveedor_nombre: newCompra.proveedor_nombre,
        deposito_id: depositoId,
        deposito_nombre: newCompra.deposito_nombre,
        tipo_pago: pagoTipo,
        forma_pago: formaPago,
        cuenta_origen: saleDe,
        fecha_compra: fechaCompra,
        base_gravable: baseGravable,
        iva_monto: ivaMonto,
        total: totalFactura,
        retener_iva: retenerIva,
        iva_retenido: montoRetencion,
        monto_a_pagar: seLePagaAlProveedor,
        observaciones: observaciones.trim()
      }]);

      // 2. Alimenta inventario de inmediato (Upsert stock por tienda)
      for (const it of items) {
        const prod = productos.find(p => p.id === it.producto_id);
        const stockActual = prod?.stock || 0;
        const nuevoStock = stockActual + it.cantidad;

        await supabase.from('producto_stock').upsert({
          producto_id: it.producto_id,
          tienda_id: depositoId,
          stock_actual: nuevoStock,
          updated_at: new Date().toISOString()
        }, { onConflict: 'producto_id,tienda_id' });
      }

      const updated = [newCompra, ...compras];
      setCompras(updated);
      localStorage.setItem('teslafire_compras', JSON.stringify(updated));

      toast.success(`Compra ${nroDocFinal} registrada. Inventario actualizado.`);
      setView('list');
      setItems([]);
      setReferencia('');
      setNroControl('');
      setObservaciones('');
    } catch (err) {
      console.error(err);
      toast.error('Error al registrar compra');
    } finally {
      setSavingCompra(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/70 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          VISTA 1: HISTORIAL DE COMPRAS DIRECTAS
      ══════════════════════════════════════════════════ */}
      {view === 'list' && (
        <div className="space-y-6">
          
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Compras
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                Registrar compra directa — alimenta inventario de inmediato
              </p>
            </div>

            {/* Botón + Nueva Compra */}
            <button
              type="button"
              onClick={() => setView('form')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1e293b] hover:bg-black text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Nueva Compra</span>
            </button>
          </div>

          {/* Tarjeta de Historial de Compras */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-white">
              <h2 className="text-xs sm:text-sm font-bold text-gray-800">
                Historial de Compras Directas
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100/90 bg-gray-50/40">
                    <th className="py-3 px-5">Nº DOC</th>
                    <th className="py-3 px-5">PROVEEDOR</th>
                    <th className="py-3 px-4">DEPÓSITO</th>
                    <th className="py-3 px-4">PAGO</th>
                    <th className="py-3 px-4 text-right">TOTAL</th>
                    <th className="py-3 px-4">FECHA</th>
                    <th className="py-3 px-5">VENCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium">
                  {compras.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-xs text-gray-400 font-medium">
                        Sin compras directas registradas
                      </td>
                    </tr>
                  ) : (
                    compras.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-gray-900">{c.numero_doc}</td>
                        <td className="py-3.5 px-5 text-gray-800 font-bold">{c.proveedor_nombre}</td>
                        <td className="py-3.5 px-4 text-gray-600">{c.deposito_nombre}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.tipo_pago === 'CONTADO' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {c.tipo_pago}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black font-rajdhani text-gray-900 text-sm">
                          ${c.total.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">{c.fecha}</td>
                        <td className="py-3.5 px-5 text-gray-400">{c.vence}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════
          VISTA 2: FORMULARIO NUEVA COMPRA DIRECTA
      ══════════════════════════════════════════════════ */}
      {view === 'form' && (
        <div className="space-y-6 max-w-6xl mx-auto">
          
          {/* Encabezado con Botones + Crear Proveedor y + Crear Producto */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Nueva Compra Directa
                </h1>
              </div>
              <p className="text-xs text-gray-400 font-medium pl-7">
                Alimenta el inventario de inmediato al registrar
              </p>
            </div>

            {/* Botones de creación rápida */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowModalProveedor(true)}
                className="px-3.5 py-1.5 bg-white hover:bg-orange-50 border border-orange-500 text-orange-600 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Crear Proveedor</span>
              </button>

              <button
                type="button"
                onClick={() => setShowModalProducto(true)}
                className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Crear Producto</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleRegistrarCompra} className="space-y-6">
            
            {/* ── CARD 1: DATOS DE LA COMPRA ── */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-gray-700">
                Datos de la Compra
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Proveedor */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Proveedor
                  </label>
                  <select
                    value={proveedorId}
                    onChange={(e) => setProveedorId(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 cursor-pointer focus:outline-none focus:border-brand-500"
                  >
                    <option value="">— Sin proveedor —</option>
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} {p.rif ? `(${p.rif})` : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Depósito destino */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Depósito destino <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={depositoId}
                    onChange={(e) => setDepositoId(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 cursor-pointer focus:outline-none focus:border-brand-500"
                  >
                    <option value="">— Selecciona depósito —</option>
                    {tiendas.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── CARD 2: ¿CÓMO SE PAGÓ? ── */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
              <div>
                <h2 className="text-xs font-bold text-gray-800">
                  ¿Cómo se pagó?
                </h2>
                <p className="text-[11px] text-gray-400 font-medium">
                  Decide si la compra queda saldada o como deuda con el proveedor.
                </p>
              </div>

              {/* 2 Tarjetas Seleccionables: Ya está pagada / Queda a crédito */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Ya está pagada */}
                <div 
                  onClick={() => setPagoTipo('CONTADO')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    pagoTipo === 'CONTADO' 
                      ? 'border-gray-900 bg-white shadow-2xs' 
                      : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>Ya está pagada</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium mt-1 pl-6">
                    El dinero sale ahora. Queda en cero.
                  </p>
                </div>

                {/* Queda a crédito */}
                <div 
                  onClick={() => setPagoTipo('CREDITO')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    pagoTipo === 'CREDITO' 
                      ? 'border-gray-900 bg-white shadow-2xs' 
                      : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Queda a crédito</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium mt-1 pl-6">
                    Deuda pendiente en Cuentas por Pagar.
                  </p>
                </div>
              </div>

              {/* Campos en fila: Forma de pago, Sale de, Fecha Compra */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Forma de pago <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formaPago}
                    onChange={(e) => setFormaPago(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 cursor-pointer"
                  >
                    <option value="Efectivo (USD)">Efectivo (USD)</option>
                    <option value="Efectivo (Bs)">Efectivo (Bs)</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Pago Móvil">Pago Móvil</option>
                    <option value="Zelle">Zelle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Sale de (banco/caja)
                  </label>
                  <select
                    value={saleDe}
                    onChange={(e) => setSaleDe(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 cursor-pointer"
                  >
                    <option value="-- No descontar de ninguna cuenta --">— No descontar de ninguna cuenta —</option>
                    <option value="Caja Principal">Caja Principal</option>
                    <option value="Banesco Corriente">Banesco Corriente</option>
                    <option value="BNC Divisas">BNC Divisas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Fecha Compra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaCompra}
                    onChange={(e) => setFechaCompra(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700"
                  />
                </div>
              </div>

              {/* Referencia y Nº de Control */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Referencia <span className="text-gray-400 font-normal">— Nº de factura del proveedor, o de la transferencia</span>
                  </label>
                  <input
                    type="text"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Opcional"
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Nº de Control <span className="text-gray-400 font-normal">— el que viene impreso en la factura del proveedor</span>
                  </label>
                  <input
                    type="text"
                    value={nroControl}
                    onChange={(e) => setNroControl(e.target.value)}
                    placeholder="Ej: 00-123456"
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Caja informativa inferior */}
              <div className="bg-[#f8fafc] border border-gray-200/80 rounded-xl p-3 text-[11px] text-gray-400">
                Sin proveedor no se puede asentar en Cuentas por Pagar: solo entra la mercancía. Tampoco se descontará dinero de ninguna cuenta.
              </div>

            </div>

            {/* ── CARD 3: PRODUCTOS ── */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-800">
                  Productos <span className="text-red-500">*</span>
                </h2>
                
                <button
                  type="button"
                  onClick={() => setShowModalAddItem(true)}
                  className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-500" />
                  <span>Agregar producto</span>
                </button>
              </div>

              {/* Tabla de Productos de la Compra */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                      <th className="py-2.5 px-4">PRODUCTO</th>
                      <th className="py-2.5 px-4 text-center w-28">CANTIDAD</th>
                      <th className="py-2.5 px-4 text-right w-36">COSTO UNIT.</th>
                      <th className="py-2.5 px-4 text-right w-36">SUBTOTAL</th>
                      <th className="py-2.5 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-gray-400 font-medium">
                          Sin productos. Haz clic en "Agregar producto".
                        </td>
                      </tr>
                    ) : (
                      items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4">
                            <div className="font-bold text-gray-900">{it.nombre}</div>
                            <div className="text-[10px] font-mono text-gray-400">{it.sku}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min="1"
                              value={it.cantidad}
                              onChange={(e) => handleUpdateItemQty(idx, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center font-bold font-rajdhani bg-white"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={it.costo_unitario}
                              onChange={(e) => handleUpdateItemCost(idx, parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-right font-bold font-rajdhani bg-white"
                            />
                          </td>
                          <td className="py-3 px-4 text-right font-black font-rajdhani text-gray-900 text-sm">
                            ${it.subtotal.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bloque de Totales Alineado a la Derecha */}
              <div className="flex flex-col items-end pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between w-64 text-gray-500">
                  <span>Mercancía (base gravable)</span>
                  <span className="font-rajdhani font-bold text-gray-800">${baseGravable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-64 text-gray-500">
                  <span>IVA</span>
                  <span className="font-rajdhani font-bold text-gray-800">${ivaMonto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-64 font-bold text-gray-800 pt-1 border-t border-gray-100">
                  <span>TOTAL FACTURA</span>
                  <span className="font-rajdhani font-black text-gray-900">${totalFactura.toFixed(2)}</span>
                </div>
                {retenerIva && (
                  <div className="flex justify-between w-64 text-rose-600 font-medium">
                    <span>Retención IVA ({retencionPct}%):</span>
                    <span className="font-rajdhani font-bold">-${montoRetencion.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between w-64 font-black text-gray-900 text-sm pt-1 border-t border-gray-200">
                  <span>SE LE PAGA AL PROVEEDOR</span>
                  <span className="font-rajdhani font-black text-base text-gray-900">${seLePagaAlProveedor.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* ── CARD 4: RETENER EL IVA DE ESTA COMPRA ── */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-start gap-3">
              <input
                type="checkbox"
                id="retener-iva"
                checked={retenerIva}
                onChange={(e) => setRetenerIva(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 mt-0.5 cursor-pointer"
              />
              <div>
                <label htmlFor="retener-iva" className="text-xs font-bold text-gray-800 block cursor-pointer">
                  Retener el IVA de esta compra
                </label>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  Se le retiene al proveedor una parte del IVA y se entera al fisco por cuenta de él. Se genera el comprobante numerado que hay que entregarle, y del pago sale únicamente la diferencia.
                </p>
                {retenerIva && (
                  <div className="flex items-center gap-4 mt-2">
                    <label className="text-xs font-medium text-gray-700">Porcentaje de retención:</label>
                    <select
                      value={retencionPct}
                      onChange={(e) => setRetencionPct(Number(e.target.value))}
                      className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg bg-white"
                    >
                      <option value={75}>75% (General)</option>
                      <option value={100}>100% (Especial)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* ── CARD 5: OBSERVACIONES ── */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-1.5">
              <label className="block text-xs font-medium text-gray-600">
                Observaciones
              </label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Opcional..."
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
              />
            </div>

            {/* ── BOTONES FINALES ── */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={savingCompra}
                className="px-6 py-2.5 bg-[#1e293b] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingCompra ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Registrar Compra</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: CREAR PROVEEDOR
      ══════════════════════════════════════════════════ */}
      {showModalProveedor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100/70 text-orange-600 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Crear Proveedor
                </h3>
              </div>
              <button 
                onClick={() => setShowModalProveedor(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarProveedor} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nombre / Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={provNombre}
                  onChange={(e) => setProvNombre(e.target.value)}
                  placeholder="Ej: Tesla Fire 2022, C.A."
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-600 mb-1">RIF</label>
                  <input
                    type="text"
                    value={provRif}
                    onChange={(e) => setProvRif(e.target.value)}
                    placeholder="J-12345678-9"
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={provTel}
                    onChange={(e) => setProvTel(e.target.value)}
                    placeholder="0414-..."
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Contacto</label>
                  <input
                    type="text"
                    value={provContacto}
                    onChange={(e) => setProvContacto(e.target.value)}
                    placeholder="Persona de contacto"
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={provEmail}
                    onChange={(e) => setProvEmail(e.target.value)}
                    placeholder="correo@proveedor.com"
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Días de crédito</label>
                <input
                  type="number"
                  min="0"
                  value={provDiasCredito}
                  onChange={(e) => setProvDiasCredito(parseInt(e.target.value) || 0)}
                  className="w-full text-xs font-bold font-rajdhani px-3 py-2 rounded-xl border border-gray-200 bg-white text-right"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalProveedor(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold shadow-xs"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: CREAR PRODUCTO RÁPIDO
      ══════════════════════════════════════════════════ */}
      {showModalProducto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold">
                  +
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Crear Producto
                </h3>
              </div>
              <button 
                onClick={() => setShowModalProducto(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarProducto} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={prodNombre}
                  onChange={(e) => setProdNombre(e.target.value)}
                  placeholder="Ej: Router Mercusys AC10"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Código (SKU) *</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="SE AUTOGENERA SI LO DEJAS VACÍO"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white uppercase text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Código de Barra</label>
                  <input
                    type="text"
                    value={prodBarcode}
                    onChange={(e) => setProdBarcode(e.target.value)}
                    placeholder="Opcional"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Categoría</label>
                  <select
                    value={prodCategoria}
                    onChange={(e) => setProdCategoria(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="">-- Sin grupo --</option>
                    <option value="Extintores">Extintores PQS</option>
                    <option value="Detección">Detección y Alarma</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Marca</label>
                  <select
                    value={prodMarca}
                    onChange={(e) => setProdMarca(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="">-- Sin marca --</option>
                    <option value="Tesla Fire">Tesla Fire</option>
                    <option value="Bosch">Bosch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Proveedor Asignado</label>
                  <select
                    value={prodProveedor}
                    onChange={(e) => setProdProveedor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="">-- Sin proveedor --</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Clasificación</label>
                  <select
                    value={prodClasificacion}
                    onChange={(e) => setProdClasificacion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Nacional">Nacional</option>
                    <option value="Importado">Importado</option>
                  </select>
                </div>
              </div>

              {/* Precios Row 1 */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Costo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodCosto}
                    onChange={(e) => setProdCosto(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-right font-rajdhani font-bold bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Precio Mayor ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPrecioMayor}
                    onChange={(e) => setProdPrecioMayor(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-right font-rajdhani font-bold bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-500 mb-1 text-[11px]">Detal Divisas · auto</label>
                  <div className="px-3 py-1.5 bg-emerald-50/70 border border-emerald-300 rounded-xl text-right font-rajdhani font-bold text-emerald-600">
                    {(Number(prodCosto) * 1.5).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Precios Row 2 */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-medium text-gray-500 mb-1 text-[11px]">Detal BCV · auto</label>
                  <div className="px-3 py-1.5 bg-teal-50/70 border border-teal-300 rounded-xl text-right font-rajdhani font-bold text-teal-600">
                    {(Number(prodCosto) * 1.6).toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-gray-500 mb-1 text-[11px]">Corporativo · auto</label>
                  <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-right font-rajdhani font-bold text-gray-700">
                    {(Number(prodCosto) * 1.35).toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-gray-500 mb-1 text-[11px]">Instalador · auto</label>
                  <div className="px-3 py-1.5 bg-sky-50/70 border border-sky-300 rounded-xl text-right font-rajdhani font-bold text-sky-600">
                    {(Number(prodCosto) * 1.25).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-medium text-gray-500 mb-1 text-[11px]">Punto reposición</label>
                  <input
                    type="number"
                    value={prodPuntoReposicion}
                    onChange={(e) => setProdPuntoReposicion(parseInt(e.target.value) || 5)}
                    className="w-full px-2 py-1 border border-gray-200 rounded-xl text-center font-rajdhani font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-500 mb-1 text-[11px]">Garantía (meses)</label>
                  <input
                    type="number"
                    value={prodGarantia}
                    onChange={(e) => setProdGarantia(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-200 rounded-xl text-center font-rajdhani font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-500 mb-1 text-[11px]">Unid. por caja</label>
                  <input
                    type="number"
                    value={prodUnidCaja}
                    onChange={(e) => setProdUnidCaja(parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 border border-gray-200 rounded-xl text-center font-rajdhani font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-500 mb-1 text-[11px]">Stock inicial</label>
                  <input
                    type="number"
                    value={prodStockInicial}
                    onChange={(e) => setProdStockInicial(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-200 rounded-xl text-center font-rajdhani font-bold bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="seriales"
                  checked={prodManejaSeriales}
                  onChange={(e) => setProdManejaSeriales(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="seriales" className="text-gray-600 cursor-pointer">
                  Maneja Seriales (exigir serial por unidad)
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalProducto(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#343a40] hover:bg-black text-white font-bold shadow-xs"
                >
                  Guardar Producto
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: AGREGAR PRODUCTO A LA LISTA
      ══════════════════════════════════════════════════ */}
      {showModalAddItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Agregar Producto a la Compra</h3>
              <button onClick={() => setShowModalAddItem(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Producto</label>
                <select
                  value={selProdId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelProdId(id);
                    const prod = productos.find(p => p.id === id);
                    if (prod) setSelCosto(Number(prod.costo_promedio) || 10);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="">Selecciona un producto...</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cantidad (uds)</label>
                  <input
                    type="number"
                    min="1"
                    value={selCantidad}
                    onChange={(e) => setSelCantidad(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-center font-bold font-rajdhani bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Costo Unitario ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selCosto}
                    onChange={(e) => setSelCosto(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-right font-bold font-rajdhani bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalAddItem(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddItem}
                  className="flex-1 py-2 rounded-xl bg-[#1e293b] hover:bg-black text-white font-bold"
                >
                  + Añadir a la Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
