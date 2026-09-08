import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Send, 
  Loader2, 
  Clock, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  Package,
  Eye,
  X,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface TrasladoItem {
  producto_id: string;
  sku: string;
  nombre: string;
  cantidad: number;
}

interface Solicitud {
  id: string;
  referencia: string;
  origen_tienda_id: string;
  origen_nombre: string;
  destino_tienda_id: string;
  destino_nombre: string;
  estado: 'Pendiente' | 'En tránsito' | 'Recibida' | 'Cancelada';
  items_count: number;
  notas?: string;
  created_at: string;
  items?: TrasladoItem[];
}

export default function SolicitudTraslado() {
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Formulario Nueva Solicitud
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [selectedProductoId, setSelectedProductoId] = useState('');
  const [itemCantidad, setItemCantidad] = useState<number>(1);
  const [itemsList, setItemsList] = useState<TrasladoItem[]>([]);
  const [notas, setNotas] = useState('');

  // Modal Detalle
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Cargar Tiendas / Almacenes
      const { data: stores } = await supabase
        .from('tiendas')
        .select('id, nombre, codigo, es_principal')
        .order('es_principal', { ascending: false });

      if (stores && stores.length > 0) {
        setTiendas(stores);
        // Preseleccionar destino por defecto: Almacén Tesla Fire (Tienda) si existe
        const defaultDestino = stores.find(s => s.nombre.includes('Tesla Fire') || !s.es_principal) || stores[0];
        setDestinoId(defaultDestino?.id || '');
      }

      // 2. Cargar Catálogo de Productos
      const { data: prods } = await supabase
        .from('productos')
        .select('id, sku, nombre, precio, imagenes_urls')
        .eq('activo', true)
        .order('nombre');

      if (prods) setProductos(prods);

      // 3. Cargar Solicitudes de Traslado (Supabase con fallback a localStorage)
      try {
        const { data: sols, error } = await supabase
          .from('solicitudes_traslado')
          .select('*, items:solicitud_traslado_items(*)')
          .order('created_at', { ascending: false });

        if (!error && sols) {
          setSolicitudes(sols);
        } else {
          // Fallback localStorage si la tabla aún no se ha creado en la consola de Supabase
          const local = localStorage.getItem('teslafire_solicitudes_traslado');
          if (local) setSolicitudes(JSON.parse(local));
        }
      } catch (err) {
        const local = localStorage.getItem('teslafire_solicitudes_traslado');
        if (local) setSolicitudes(JSON.parse(local));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Contadores de estado
  const pendientesCount = solicitudes.filter(s => s.estado === 'Pendiente').length;
  const enTransitoCount = solicitudes.filter(s => s.estado === 'En tránsito').length;
  const recibidasCount = solicitudes.filter(s => s.estado === 'Recibida').length;

  const handleAddItem = () => {
    if (!selectedProductoId) {
      toast.error('Selecciona un producto para agregar');
      return;
    }
    if (itemCantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    const prod = productos.find(p => p.id === selectedProductoId);
    if (!prod) return;

    const existingIndex = itemsList.findIndex(i => i.producto_id === prod.id);
    if (existingIndex >= 0) {
      const updated = [...itemsList];
      updated[existingIndex].cantidad += Number(itemCantidad);
      setItemsList(updated);
    } else {
      setItemsList([
        ...itemsList,
        {
          producto_id: prod.id,
          sku: prod.sku,
          nombre: prod.nombre,
          cantidad: Number(itemCantidad)
        }
      ]);
    }

    setSelectedProductoId('');
    setItemCantidad(1);
    toast.success('Renglón agregado');
  };

  const handleRemoveItem = (index: number) => {
    setItemsList(itemsList.filter((_, i) => i !== index));
  };

  const handleCrearSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origenId) {
      toast.error('Por favor seleccione el almacén origen');
      return;
    }
    if (!destinoId) {
      toast.error('Por favor seleccione el almacén destino');
      return;
    }
    if (origenId === destinoId) {
      toast.error('El origen y el destino no pueden ser el mismo almacén');
      return;
    }
    if (itemsList.length === 0) {
      toast.error('Debe agregar al menos un producto a la solicitud');
      return;
    }

    setSubmitting(true);
    const origenObj = tiendas.find(t => t.id === origenId);
    const destinoObj = tiendas.find(t => t.id === destinoId);

    const refNumber = `SOL-${Date.now().toString().slice(-4)}`;
    const newSolicitud: Solicitud = {
      id: crypto.randomUUID(),
      referencia: refNumber,
      origen_tienda_id: origenId,
      origen_nombre: origenObj?.nombre || 'Almacén Origen',
      destino_tienda_id: destinoId,
      destino_nombre: destinoObj?.nombre || 'Almacén Destino',
      estado: 'Pendiente',
      items_count: itemsList.reduce((acc, i) => acc + i.cantidad, 0),
      notas: notas.trim(),
      created_at: new Date().toISOString(),
      items: [...itemsList]
    };

    try {
      // 1. Guardar en Supabase si la tabla existe
      const { data: saved, error } = await supabase
        .from('solicitudes_traslado')
        .insert([{
          id: newSolicitud.id,
          referencia: newSolicitud.referencia,
          origen_tienda_id: newSolicitud.origen_tienda_id,
          origen_nombre: newSolicitud.origen_nombre,
          destino_tienda_id: newSolicitud.destino_tienda_id,
          destino_nombre: newSolicitud.destino_nombre,
          estado: newSolicitud.estado,
          items_count: newSolicitud.items_count,
          notas: newSolicitud.notas,
          created_at: newSolicitud.created_at
        }])
        .select()
        .single();

      if (!error && saved) {
        // Insertar items
        const itemsPayload = itemsList.map(item => ({
          solicitud_id: saved.id,
          producto_id: item.producto_id,
          sku: item.sku,
          nombre: item.nombre,
          cantidad: item.cantidad
        }));
        await supabase.from('solicitud_traslado_items').insert(itemsPayload);
      }

      // 2. Sincronizar en estado local / fallback
      const updatedSols = [newSolicitud, ...solicitudes];
      setSolicitudes(updatedSols);
      localStorage.setItem('teslafire_solicitudes_traslado', JSON.stringify(updatedSols));

      toast.success(`¡Solicitud ${refNumber} generada con éxito!`);
      // Limpiar formulario
      setOrigenId('');
      setItemsList([]);
      setNotas('');
    } catch (err: any) {
      console.error(err);
      toast.error('Error al registrar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: 'En tránsito' | 'Recibida' | 'Cancelada') => {
    try {
      await supabase
        .from('solicitudes_traslado')
        .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
        .eq('id', id);

      const updated = solicitudes.map(s => s.id === id ? { ...s, estado: nuevoEstado } : s);
      setSolicitudes(updated);
      localStorage.setItem('teslafire_solicitudes_traslado', JSON.stringify(updated));
      
      if (selectedSolicitud?.id === id) {
        setSelectedSolicitud(prev => prev ? { ...prev, estado: nuevoEstado } : null);
      }

      toast.success(`Solicitud actualizada a: ${nuevoEstado}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO DE LA PÁGINA
      ══════════════════════════════════════════════════ */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Solicitud de Traslado
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
          Pide mercancía al Almacén General u otra tienda hacia <span className="font-bold text-gray-800">el depósito destino que elijas</span>. Flujo: <span className="font-bold text-gray-800">Pedir → Despachar → Recibir</span>.
        </p>

        {/* Badges de Estado */}
        <div className="flex items-center gap-2 mt-4">
          {/* Pendientes */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50/80 border border-amber-200/70 rounded-full text-xs font-bold text-amber-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>{pendientesCount} Pendientes</span>
          </div>

          {/* En tránsito */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100/90 border border-gray-200 rounded-full text-xs font-bold text-gray-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-gray-600 inline-block"></span>
            <span>{enTransitoCount} En tránsito</span>
          </div>

          {/* Recibidas */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50/80 border border-emerald-200/70 rounded-full text-xs font-bold text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>{recibidasCount} Recibidas</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA 1: NUEVA SOLICITUD
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Mail className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-900">
            Nueva Solicitud
          </h2>
        </div>

        <form onSubmit={handleCrearSolicitud} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Solicitar desde (origen) * */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Solicitar desde (origen) <span className="text-red-500">*</span>
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

            {/* Destino * */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Destino <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={destinoId}
                  onChange={(e) => setDestinoId(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white cursor-pointer appearance-none pr-8 text-gray-800"
                >
                  {tiendas.map(t => (
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

          {/* Selector de Renglones / Productos cuando se selecciona un origen */}
          {origenId && (
            <div className="pt-4 border-t border-gray-100 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-gray-700 block mb-2">
                Agregar Artículos a Solicitar:
              </span>
              
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex-1 w-full">
                  <select
                    value={selectedProductoId}
                    onChange={(e) => setSelectedProductoId(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="">Seleccionar artículo del catálogo...</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-32">
                  <input
                    type="number"
                    min="1"
                    value={itemCantidad}
                    onChange={(e) => setItemCantidad(parseInt(e.target.value) || 1)}
                    placeholder="Cantidad"
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 text-center bg-white"
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

              {/* Lista de Artículos añadidos */}
              {itemsList.length > 0 && (
                <div className="mt-3 bg-gray-50/70 border border-gray-200/80 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Artículos en la solicitud ({itemsList.length}):
                  </span>
                  <div className="space-y-1.5">
                    {itemsList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200/60 text-xs">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-bold text-gray-800">{item.nombre}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">({item.sku})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-emerald-600 font-rajdhani text-sm">
                            {item.cantidad} unid.
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

                  {/* Notas y botón Enviar */}
                  <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200/60">
                    <input
                      type="text"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Observaciones o notas para el despacho (opcional)..."
                      className="w-full sm:flex-1 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#009b63] hover:bg-[#008756] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Enviar Solicitud</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA 2: MIS SOLICITUDES
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-gray-900 mb-4">
          Mis solicitudes
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  REFERENCIA
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  ORIGEN → DESTINO
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  ITEMS
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  ESTADO
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  FECHA
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto mb-2" />
                    <span className="text-xs font-semibold text-gray-400">Cargando solicitudes...</span>
                  </td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs font-medium text-gray-400">
                    Aún no hay solicitudes de traslado.
                  </td>
                </tr>
              ) : (
                solicitudes.map((sol) => (
                  <tr key={sol.id} className="hover:bg-gray-50/70 transition-colors">
                    
                    {/* Referencia */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-black text-gray-900 font-rajdhani bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                        {sol.referencia}
                      </span>
                    </td>

                    {/* Origen -> Destino */}
                    <td className="py-3.5 px-4 text-xs font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <span>{sol.origen_nombre}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-bold text-gray-900">{sol.destino_nombre}</span>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                        {sol.items_count} unid.
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4 text-center">
                      {sol.estado === 'Pendiente' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                      {sol.estado === 'En tránsito' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Truck className="w-3 h-3" /> En tránsito
                        </span>
                      )}
                      {sol.estado === 'Recibida' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Recibida
                        </span>
                      )}
                      {sol.estado === 'Cancelada' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          Cancelada
                        </span>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className="py-3.5 px-4 text-center text-xs font-medium text-gray-500">
                      {new Date(sol.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSolicitud(sol)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalle de Solicitud */}
      {selectedSolicitud && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-900">
                  Solicitud {selectedSolicitud.referencia}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSolicitud(null)} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Origen:</span>
                <span className="font-bold text-gray-800">{selectedSolicitud.origen_nombre}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Destino:</span>
                <span className="font-bold text-gray-800">{selectedSolicitud.destino_nombre}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Estado actual:</span>
                <span className="font-bold text-emerald-600">{selectedSolicitud.estado}</span>
              </div>

              {selectedSolicitud.items && selectedSolicitud.items.length > 0 && (
                <div className="pt-2">
                  <span className="font-bold text-gray-700 block mb-1">Renglones solicitados:</span>
                  <div className="space-y-1">
                    {selectedSolicitud.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between bg-gray-50 p-2 rounded">
                        <span>{it.nombre}</span>
                        <span className="font-bold">{it.cantidad} unid.</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Acciones de flujo: Pedir -> Despachar -> Recibir */}
            <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
              {selectedSolicitud.estado === 'Pendiente' && (
                <button
                  type="button"
                  onClick={() => handleCambiarEstado(selectedSolicitud.id, 'En tránsito')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Truck className="w-3.5 h-3.5" /> Despachar Mercancía
                </button>
              )}
              {selectedSolicitud.estado === 'En tránsito' && (
                <button
                  type="button"
                  onClick={() => handleCambiarEstado(selectedSolicitud.id, 'Recibida')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar Recibido
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedSolicitud(null)}
                className="px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
