import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  Eye, 
  Printer, 
  MessageCircle, 
  X, 
  Check, 
  Loader2, 
  Building2, 
  Trash2, 
  DollarSign, 
  Send,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface CotizacionItemProducto {
  producto_id: string;
  nombre: string;
  sku: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface Cotizacion {
  id: string;
  numero: string;
  cliente_id?: string;
  cliente_nombre: string;
  cliente_documento: string;
  cliente_telefono?: string;
  vendedor_nombre: string;
  tienda_id?: string;
  tienda_nombre?: string;
  items_count: number;
  items?: CotizacionItemProducto[];
  subtotal: number;
  iva: number;
  total: number;
  validez: string;
  estado: 'Vigente' | 'Convertida' | 'Vencida' | 'Rechazada';
  documento_convertido?: string;
  notas?: string;
  created_at: string;
}

// Datos iniciales fieles a la captura de pantalla
const defaultCotizacionesDemo: Cotizacion[] = [
  {
    id: 'cot-1',
    numero: 'PRTF-000001',
    cliente_nombre: 'roberth diaz',
    cliente_documento: 'V24969560',
    cliente_telefono: '0412-1234567',
    vendedor_nombre: 'Mostrador',
    tienda_nombre: 'Almacén Tesla Fire',
    items_count: 2,
    subtotal: 229.85,
    iva: 36.98,
    total: 266.83,
    validez: '21/09/2026',
    estado: 'Convertida',
    documento_convertido: 'FFTF-000002',
    created_at: '2026-09-06T09:59:00Z',
    items: [
      {
        producto_id: 'p1',
        nombre: 'Extintor CO2 15 Lbs',
        sku: 'EXT-C02-15',
        cantidad: 1,
        precio_unitario: 219.96,
        subtotal: 219.96
      },
      {
        producto_id: 'p2',
        nombre: 'Detector de humo fotoeléctrico',
        sku: 'DET-HUM-01',
        cantidad: 1,
        precio_unitario: 46.87,
        subtotal: 46.87
      }
    ]
  }
];

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros de barra superior
  const [desde, setDesde] = useState('2026-09-01');
  const [hasta, setHasta] = useState('2026-09-08');
  const [estadoFiltro, setEstadoFiltro] = useState('Todas');
  const [buscar, setBuscar] = useState('');

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState<Cotizacion | null>(null);
  const [saving, setSaving] = useState(false);

  // Datos para creación
  const [clientesList, setClientesList] = useState<any[]>([]);
  const [productosList, setProductosList] = useState<any[]>([]);
  const [tiendasList, setTiendasList] = useState<any[]>([]);

  // Formulario nueva cotización
  const [newClienteNombre, setNewClienteNombre] = useState('');
  const [newClienteDoc, setNewClienteDoc] = useState('');
  const [newClienteTel, setNewClienteTel] = useState('');
  const [newTiendaId, setNewTiendaId] = useState('');
  const [newValidezDias, setNewValidezDias] = useState(15);
  const [newNotas, setNewNotas] = useState('');
  const [newItems, setNewItems] = useState<CotizacionItemProducto[]>([]);

  // Selector de item temporal
  const [selProdId, setSelProdId] = useState('');
  const [selCantidad, setSelCantidad] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Clientes
      const { data: cls } = await supabase.from('clientes').select('id, nombre, documento, telefono');
      if (cls) setClientesList(cls);

      // 2. Productos
      const { data: prods } = await supabase.from('productos').select('id, sku, nombre, precio, stock').eq('activo', true);
      if (prods) setProductosList(prods);

      // 3. Tiendas
      const { data: stores } = await supabase.from('tiendas').select('id, nombre');
      if (stores) {
        setTiendasList(stores);
        if (stores.length > 0 && !newTiendaId) setNewTiendaId(stores[0].id);
      }

      // 4. Cotizaciones
      try {
        const { data: cots, error } = await supabase
          .from('cotizaciones')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && cots && cots.length > 0) {
          const mapped: Cotizacion[] = cots.map(c => ({
            id: c.id,
            numero: c.numero,
            cliente_nombre: c.cliente_nombre,
            cliente_documento: c.cliente_documento,
            cliente_telefono: c.cliente_telefono,
            vendedor_nombre: c.vendedor_nombre || 'Mostrador',
            items_count: 2,
            subtotal: Number(c.subtotal) || 0,
            iva: Number(c.iva) || 0,
            total: Number(c.total) || 0,
            validez: c.fecha_validez ? new Date(c.fecha_validez).toLocaleDateString('es-VE') : '21/09/2026',
            estado: c.estado || 'Vigente',
            documento_convertido: c.documento_convertido,
            notas: c.notas,
            created_at: c.created_at
          }));
          setCotizaciones(mapped);
        } else {
          loadLocalData();
        }
      } catch (err) {
        loadLocalData();
      }
    } catch (err) {
      loadLocalData();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalData = () => {
    const local = localStorage.getItem('teslafire_cotizaciones');
    if (local) {
      setCotizaciones(JSON.parse(local));
    } else {
      setCotizaciones(defaultCotizacionesDemo);
      localStorage.setItem('teslafire_cotizaciones', JSON.stringify(defaultCotizacionesDemo));
    }
  };

  // Agregar item al borrador
  const handleAddItem = () => {
    if (!selProdId) {
      toast.error('Selecciona un producto');
      return;
    }
    const prod = productosList.find(p => p.id === selProdId);
    if (!prod) return;

    const unitPrice = Number(prod.precio) || 10;
    const sub = unitPrice * selCantidad;

    const existIndex = newItems.findIndex(i => i.producto_id === selProdId);
    if (existIndex >= 0) {
      const updated = [...newItems];
      updated[existIndex].cantidad += selCantidad;
      updated[existIndex].subtotal = updated[existIndex].cantidad * unitPrice;
      setNewItems(updated);
    } else {
      setNewItems([
        ...newItems,
        {
          producto_id: prod.id,
          nombre: prod.nombre,
          sku: prod.sku,
          cantidad: selCantidad,
          precio_unitario: unitPrice,
          subtotal: sub
        }
      ]);
    }

    setSelProdId('');
    setSelCantidad(1);
  };

  const handleRemoveItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  // Cálculos totales
  const formSubtotal = newItems.reduce((acc, i) => acc + i.subtotal, 0);
  const formIva = formSubtotal * 0.16;
  const formTotal = formSubtotal + formIva;

  const handleCrearCotizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClienteNombre.trim()) {
      toast.error('Ingresa el nombre del cliente');
      return;
    }
    if (newItems.length === 0) {
      toast.error('Agrega al menos un producto a la cotización');
      return;
    }

    setSaving(true);
    const nextSeq = cotizaciones.length + 1;
    const nextNum = `PRTF-${nextSeq.toString().padStart(6, '0')}`;
    const validezDate = new Date();
    validezDate.setDate(validezDate.getDate() + newValidezDias);

    const newCot: Cotizacion = {
      id: crypto.randomUUID(),
      numero: nextNum,
      cliente_nombre: newClienteNombre.trim(),
      cliente_documento: newClienteDoc.trim() || 'V-00000000',
      cliente_telefono: newClienteTel.trim(),
      vendedor_nombre: 'Mostrador',
      items_count: newItems.length,
      items: newItems,
      subtotal: formSubtotal,
      iva: formIva,
      total: formTotal,
      validez: validezDate.toLocaleDateString('es-VE'),
      estado: 'Vigente',
      notas: newNotas.trim(),
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('cotizaciones').insert([{
        id: newCot.id,
        numero: newCot.numero,
        cliente_nombre: newCot.cliente_nombre,
        cliente_documento: newCot.cliente_documento,
        cliente_telefono: newCot.cliente_telefono,
        vendedor_nombre: newCot.vendedor_nombre,
        subtotal: newCot.subtotal,
        iva: newCot.iva,
        total: newCot.total,
        estado: newCot.estado,
        fecha_validez: validezDate.toISOString().split('T')[0],
        notas: newCot.notas
      }]);

      const updated = [newCot, ...cotizaciones];
      setCotizaciones(updated);
      localStorage.setItem('teslafire_cotizaciones', JSON.stringify(updated));

      toast.success(`Cotización ${nextNum} generada exitosamente`);
      setShowCreateModal(false);
      setNewClienteNombre('');
      setNewClienteDoc('');
      setNewClienteTel('');
      setNewNotas('');
      setNewItems([]);
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar cotización');
    } finally {
      setSaving(false);
    }
  };

  // WhatsApp
  const handleWhatsApp = (cot: Cotizacion) => {
    const tel = cot.cliente_telefono ? cot.cliente_telefono.replace(/[^0-9]/g, '') : '';
    const phoneParam = tel.startsWith('0') ? `58${tel.slice(1)}` : tel || '584141234567';
    const text = encodeURIComponent(
      `Hola ${cot.cliente_nombre}, te compartimos tu cotización *${cot.numero}* emitida por Tesla Fire por un total de *$${cot.total.toFixed(2)}*. Validez hasta: ${cot.validez}. ¡Quedamos a tu orden!`
    );
    window.open(`https://wa.me/${phoneParam}?text=${text}`, '_blank');
  };

  // Filtrado
  const filteredCotizaciones = cotizaciones.filter(c => {
    if (estadoFiltro !== 'Todas' && c.estado !== estadoFiltro) return false;
    if (buscar.trim()) {
      const q = buscar.toLowerCase();
      const matchNum = c.numero.toLowerCase().includes(q);
      const matchNom = c.cliente_nombre.toLowerCase().includes(q);
      const matchDoc = c.cliente_documento.toLowerCase().includes(q);
      if (!matchNum && !matchNom && !matchDoc) return false;
    }
    return true;
  });

  const vigentesCount = cotizaciones.filter(c => c.estado === 'Vigente').length;

  return (
    <div className="min-h-screen bg-[#f8fafc]/70 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO DE LA PÁGINA
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-gray-700" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Cotizaciones
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Proponen precios sin apartar mercancía. Se importan luego en una Nota de Entrega.
          </p>
        </div>

        {/* Lado derecho: Píldora vigentes y Botón + Nueva Cotización */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200/90 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <span>{vigentesCount} vigentes</span>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#343a40] hover:bg-[#23272b] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Nueva Cotización</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          BARRA DE FILTROS (Desde, Hasta, Estado, Buscar, Filtrar)
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          
          {/* Desde */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Hasta */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Hasta
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Estado */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Estado
            </label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="Todas">Todas</option>
              <option value="Vigente">Vigente</option>
              <option value="Convertida">Convertida</option>
              <option value="Vencida">Vencida</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>

          {/* Buscar */}
          <div className="lg:col-span-5">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Buscar
            </label>
            <input
              type="text"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar por número o cliente..."
              className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-brand-500 placeholder:text-gray-400"
            />
          </div>

          {/* Botón Filtrar */}
          <div className="lg:col-span-1">
            <button
              type="button"
              className="w-full py-2 px-4 bg-[#343a40] hover:bg-[#23272b] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center cursor-pointer"
            >
              Filtrar
            </button>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TABLA DE COTIZACIONES
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100/90 bg-gray-50/40">
                <th className="py-3 px-5 w-32">NÚMERO</th>
                <th className="py-3 px-5">CLIENTE</th>
                <th className="py-3 px-4">VENDEDOR</th>
                <th className="py-3 px-4 text-center">ÍTEMS</th>
                <th className="py-3 px-4 text-right">TOTAL</th>
                <th className="py-3 px-4 text-center">VALIDEZ</th>
                <th className="py-3 px-5 text-center">ESTADO</th>
                <th className="py-3 px-5">FECHA</th>
                <th className="py-3 px-5 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto mb-2" />
                    <span className="text-xs text-gray-400 font-semibold">Cargando cotizaciones...</span>
                  </td>
                </tr>
              ) : filteredCotizaciones.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-xs text-gray-400 font-medium">
                    No se encontraron cotizaciones para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredCotizaciones.map((cot) => {
                  const fechaObj = new Date(cot.created_at);
                  const fechaFormateada = `${fechaObj.toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })} ${fechaObj.toLocaleTimeString('es-VE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}`;

                  return (
                    <tr 
                      key={cot.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* NÚMERO */}
                      <td className="py-4 px-5 align-middle font-mono font-bold text-gray-800 text-xs">
                        {cot.numero}
                      </td>

                      {/* CLIENTE */}
                      <td className="py-4 px-5 align-middle">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm leading-snug">
                          {cot.cliente_nombre}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          ({cot.cliente_documento})
                        </div>
                      </td>

                      {/* VENDEDOR */}
                      <td className="py-4 px-4 align-middle text-gray-600 text-xs">
                        {cot.vendedor_nombre}
                      </td>

                      {/* ÍTEMS */}
                      <td className="py-4 px-4 align-middle text-center font-bold text-gray-700">
                        {cot.items_count}
                      </td>

                      {/* TOTAL */}
                      <td className="py-4 px-4 align-middle text-right font-rajdhani font-black text-gray-900 text-sm">
                        $ {cot.total.toFixed(2)}
                      </td>

                      {/* VALIDEZ */}
                      <td className="py-4 px-4 align-middle text-center text-gray-600 text-xs">
                        {cot.validez}
                      </td>

                      {/* ESTADO */}
                      <td className="py-4 px-5 align-middle text-center">
                        <div className="inline-flex flex-col items-center">
                          {cot.estado === 'Convertida' && (
                            <span className="px-2 py-0.5 rounded bg-[#d1fae5] text-[#065f46] text-[10px] font-bold">
                              Convertida
                            </span>
                          )}
                          {cot.estado === 'Vigente' && (
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                              Vigente
                            </span>
                          )}
                          {cot.estado === 'Vencida' && (
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold">
                              Vencida
                            </span>
                          )}
                          {cot.documento_convertido && (
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                              {cot.documento_convertido}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* FECHA */}
                      <td className="py-4 px-5 align-middle text-gray-500 text-xs">
                        {fechaFormateada}
                      </td>

                      {/* ACCIONES (Ojo, Impresora, WhatsApp) */}
                      <td className="py-4 px-5 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Ver Detalle */}
                          <button
                            type="button"
                            onClick={() => setSelectedCotizacion(cot)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                            title="Ver Cotización"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Imprimir */}
                          <button
                            type="button"
                            onClick={() => toast.success(`Imprimiendo cotización ${cot.numero}...`)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                            title="Imprimir"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* WhatsApp */}
                          <button
                            type="button"
                            onClick={() => handleWhatsApp(cot)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                            title="Enviar por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MODAL: + NUEVA COTIZACIÓN
      ══════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-800" />
                <h3 className="text-base font-bold text-gray-900">
                  Emitir Nueva Cotización
                </h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCrearCotizacion} className="py-4 space-y-4">
              
              {/* Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClienteNombre}
                    onChange={(e) => setNewClienteNombre(e.target.value)}
                    placeholder="Ej: Roberth Díaz"
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Cédula / RIF
                  </label>
                  <input
                    type="text"
                    value={newClienteDoc}
                    onChange={(e) => setNewClienteDoc(e.target.value)}
                    placeholder="V24969560"
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>
              </div>

              {/* Teléfono y Días de Validez */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Teléfono (para WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={newClienteTel}
                    onChange={(e) => setNewClienteTel(e.target.value)}
                    placeholder="0412-1234567"
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Validez de la Oferta (Días)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newValidezDias}
                    onChange={(e) => setNewValidezDias(parseInt(e.target.value) || 15)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white font-rajdhani font-bold"
                  />
                </div>
              </div>

              {/* Selector de productos */}
              <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-200/80 space-y-3">
                <label className="block text-xs font-bold text-gray-800">
                  Agregar Productos a la Cotización
                </label>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-8">
                    <select
                      value={selProdId}
                      onChange={(e) => setSelProdId(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white cursor-pointer"
                    >
                      <option value="">Selecciona un producto...</option>
                      {productosList.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} ({p.sku}) — ${Number(p.precio).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={selCantidad}
                      onChange={(e) => setSelCantidad(parseInt(e.target.value) || 1)}
                      className="w-full text-xs font-bold text-center px-2 py-2 rounded-xl border border-gray-200 bg-white font-rajdhani"
                    />
                  </div>

                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full py-2 bg-[#343a40] hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      + Añadir
                    </button>
                  </div>
                </div>

                {/* Lista de items añadidos */}
                {newItems.length > 0 && (
                  <div className="mt-3 divide-y divide-gray-200 border-t border-gray-200 pt-2 space-y-2">
                    {newItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs pt-1.5">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-gray-800 block truncate">{item.nombre}</span>
                          <span className="text-[11px] text-gray-400">{item.sku} · {item.cantidad} u × ${item.precio_unitario.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-black font-rajdhani text-gray-900">${item.subtotal.toFixed(2)}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumen de totales */}
              <div className="bg-white rounded-xl p-3 border border-gray-200 space-y-1 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span className="font-rajdhani font-bold">${formSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>IVA (16%):</span>
                  <span className="font-rajdhani font-bold">${formIva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total Cotización:</span>
                  <span className="font-rajdhani font-black text-base text-brand-600">${formTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Notas / Condiciones
                </label>
                <input
                  type="text"
                  value={newNotas}
                  onChange={(e) => setNewNotas(e.target.value)}
                  placeholder="Ej: Precios en divisas calculados a la tasa del día de pago."
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#343a40] hover:bg-black text-white rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Guardar Cotización</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: VISTA PREVIA DE COTIZACIÓN
      ══════════════════════════════════════════════════ */}
      {selectedCotizacion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Cotización {selectedCotizacion.numero}
                </h3>
                <span className="text-[11px] text-gray-400">
                  Emitida el {new Date(selectedCotizacion.created_at).toLocaleDateString('es-VE')}
                </span>
              </div>
              <button 
                onClick={() => setSelectedCotizacion(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Info Cliente */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1">
                <div className="font-bold text-gray-900">{selectedCotizacion.cliente_nombre}</div>
                <div className="text-gray-500">Documento: {selectedCotizacion.cliente_documento}</div>
                {selectedCotizacion.cliente_telefono && (
                  <div className="text-gray-500">Teléfono: {selectedCotizacion.cliente_telefono}</div>
                )}
                <div className="text-gray-500">Validez: Hasta el {selectedCotizacion.validez}</div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold">Estado:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {selectedCotizacion.estado}
                  </span>
                  {selectedCotizacion.documento_convertido && (
                    <span className="text-gray-400 font-mono">({selectedCotizacion.documento_convertido})</span>
                  )}
                </div>
              </div>

              {/* Items */}
              {selectedCotizacion.items && selectedCotizacion.items.length > 0 && (
                <div>
                  <span className="font-bold text-gray-700 block mb-2">Artículos cotizados:</span>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {selectedCotizacion.items.map((it, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <div className="font-bold text-gray-900">{it.nombre}</div>
                          <div className="text-[10px] text-gray-400">{it.sku} · {it.cantidad} u × ${it.precio_unitario.toFixed(2)}</div>
                        </div>
                        <div className="font-rajdhani font-black text-gray-900 text-sm">
                          ${it.subtotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totales */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <span className="font-bold text-gray-700">Total Cotización:</span>
                <span className="font-black font-rajdhani text-lg text-gray-900">
                  $ {selectedCotizacion.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleWhatsApp(selectedCotizacion)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toast.success(`Imprimiendo cotización ${selectedCotizacion.numero}...`)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCotizacion(null)}
                  className="px-4 py-2 bg-[#343a40] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
