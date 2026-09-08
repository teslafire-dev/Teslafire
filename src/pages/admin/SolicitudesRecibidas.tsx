import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  Eye, 
  Package, 
  X, 
  FileText,
  AlertTriangle,
  Building2,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface TrasladoItem {
  producto_id: string;
  sku: string;
  nombre: string;
  cantidad: number;
}

interface SolicitudRecibida {
  id: string;
  referencia: string;
  origen_tienda_id: string;
  origen_nombre: string;
  destino_tienda_id: string;
  destino_nombre: string;
  estado: 'Pendiente' | 'Por despachar' | 'En tránsito' | 'Recibida' | 'Rechazada';
  items_count: number;
  notas?: string;
  motivo_rechazo?: string;
  created_at: string;
  items?: TrasladoItem[];
}

export default function SolicitudesRecibidas() {
  const [solicitudes, setSolicitudes] = useState<SolicitudRecibida[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Ver Detalle / Despachar
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudRecibida | null>(null);
  
  // Modal Rechazar con motivo
  const [rejectingSolicitud, setRejectingSolicitud] = useState<SolicitudRecibida | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      // 1. Intentar cargar desde Supabase
      const { data, error } = await supabase
        .from('solicitudes_traslado')
        .select('*, items:solicitud_traslado_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSolicitudes(data);
      } else {
        // Fallback localStorage
        const local = localStorage.getItem('teslafire_solicitudes_traslado');
        if (local) setSolicitudes(JSON.parse(local));
      }
    } catch (err) {
      const local = localStorage.getItem('teslafire_solicitudes_traslado');
      if (local) setSolicitudes(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  // Contadores según especificación:
  // "Por despachar" son las solicitudes en estado Pendiente o Por despachar
  const porDespacharCount = solicitudes.filter(
    s => s.estado === 'Pendiente' || s.estado === 'Por despachar'
  ).length;

  const enTransitoCount = solicitudes.filter(
    s => s.estado === 'En tránsito'
  ).length;

  // Acción: Despachar mercancía (Pasa a 'En tránsito')
  const handleDespachar = async (solicitud: SolicitudRecibida) => {
    setSubmittingAction(true);
    try {
      await supabase
        .from('solicitudes_traslado')
        .update({ 
          estado: 'En tránsito', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', solicitud.id);

      const updated = solicitudes.map(s => 
        s.id === solicitud.id ? { ...s, estado: 'En tránsito' as const } : s
      );
      setSolicitudes(updated);
      localStorage.setItem('teslafire_solicitudes_traslado', JSON.stringify(updated));

      toast.success(`Solicitud ${solicitud.referencia} despachada. Estado: En tránsito.`);
      setSelectedSolicitud(null);
    } catch (err) {
      console.error(err);
      toast.error('Error al despachar mercancía');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Acción: Rechazar con motivo
  const handleConfirmRechazo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSolicitud) return;
    if (!motivoRechazo.trim()) {
      toast.error('Indique el motivo del rechazo');
      return;
    }

    setSubmittingAction(true);
    try {
      await supabase
        .from('solicitudes_traslado')
        .update({ 
          estado: 'Rechazada', 
          motivo_rechazo: motivoRechazo.trim(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', rejectingSolicitud.id);

      const updated = solicitudes.map(s => 
        s.id === rejectingSolicitud.id 
          ? { ...s, estado: 'Rechazada' as const, motivo_rechazo: motivoRechazo.trim() } 
          : s
      );
      setSolicitudes(updated);
      localStorage.setItem('teslafire_solicitudes_traslado', JSON.stringify(updated));

      toast.success(`Solicitud ${rejectingSolicitud.referencia} rechazada.`);
      setRejectingSolicitud(null);
      setMotivoRechazo('');
    } catch (err) {
      console.error(err);
      toast.error('Error al registrar rechazo');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO DE LA PÁGINA
      ══════════════════════════════════════════════════ */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Solicitudes Recibidas
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
          Pedidos de mercancía que hacen las tiendas. Flujo: <span className="font-bold text-gray-800">Despachar</span> para enviar o <span className="font-bold text-gray-800">Rechazar</span> con motivo.
        </p>

        {/* Badges de Estado */}
        <div className="flex items-center gap-2 mt-4">
          {/* Por despachar */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50/80 border border-amber-200/70 rounded-full text-xs font-bold text-amber-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>{porDespacharCount} Por despachar</span>
          </div>

          {/* En tránsito */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100/90 border border-gray-200 rounded-full text-xs font-bold text-gray-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-gray-600 inline-block"></span>
            <span>{enTransitoCount} En tránsito</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TABLA DE SOLICITUDES RECIBIDAS
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  REFERENCIA
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  TIENDA QUE SOLICITA
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
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto mb-2" />
                    <span className="text-xs font-semibold text-gray-400">Cargando pedidos entrantes...</span>
                  </td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-xs font-medium text-gray-400">
                    No hay solicitudes entrantes por ahora.
                  </td>
                </tr>
              ) : (
                solicitudes.map((sol) => {
                  const isPending = sol.estado === 'Pendiente' || sol.estado === 'Por despachar';
                  const inTransit = sol.estado === 'En tránsito';
                  const isReceived = sol.estado === 'Recibida';
                  const isRejected = sol.estado === 'Rechazada';

                  return (
                    <tr key={sol.id} className="hover:bg-gray-50/70 transition-colors">
                      
                      {/* REFERENCIA */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-black text-gray-900 font-rajdhani bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                          {sol.referencia}
                        </span>
                      </td>

                      {/* TIENDA QUE SOLICITA */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900">
                            {sol.destino_nombre}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">
                            Hacia: {sol.origen_nombre}
                          </span>
                        </div>
                      </td>

                      {/* ITEMS */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-xs font-bold text-gray-700 bg-gray-50 px-2.5 py-0.5 rounded border border-gray-200">
                          {sol.items_count} unid.
                        </span>
                      </td>

                      {/* ESTADO */}
                      <td className="py-3.5 px-4 text-center">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Por despachar
                          </span>
                        )}
                        {inTransit && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Truck className="w-3 h-3" /> En tránsito
                          </span>
                        )}
                        {isReceived && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Recibida
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3" /> Rechazada
                          </span>
                        )}
                      </td>

                      {/* FECHA */}
                      <td className="py-3.5 px-4 text-center text-xs font-medium text-gray-500">
                        {new Date(sol.created_at).toLocaleDateString('es-VE', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </td>

                      {/* ACCIONES */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDespachar(sol)}
                                className="px-3 py-1.5 bg-[#009b63] hover:bg-[#008756] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                                title="Despachar pedido"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Despachar</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingSolicitud(sol);
                                  setMotivoRechazo('');
                                }}
                                className="px-2.5 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg transition-all"
                                title="Rechazar con motivo"
                              >
                                Rechazar
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedSolicitud(sol)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-3.5 h-3.5" />
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

      {/* Modal Detalle de Pedido */}
      {selectedSolicitud && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-900">
                  Pedido Entrante {selectedSolicitud.referencia}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSolicitud(null)} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Solicitado por:</span>
                <span className="font-bold text-gray-800">{selectedSolicitud.destino_nombre}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Almacén despachador:</span>
                <span className="font-bold text-gray-800">{selectedSolicitud.origen_nombre}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Estado:</span>
                <span className="font-bold text-gray-900">{selectedSolicitud.estado}</span>
              </div>

              {selectedSolicitud.notas && (
                <div className="py-1 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100 text-amber-900">
                  <span className="font-bold block mb-0.5">Nota del solicitante:</span>
                  {selectedSolicitud.notas}
                </div>
              )}

              {selectedSolicitud.motivo_rechazo && (
                <div className="py-1 bg-red-50 p-2.5 rounded-lg border border-red-100 text-red-800">
                  <span className="font-bold block mb-0.5">Motivo del rechazo:</span>
                  {selectedSolicitud.motivo_rechazo}
                </div>
              )}

              {selectedSolicitud.items && selectedSolicitud.items.length > 0 && (
                <div className="pt-2">
                  <span className="font-bold text-gray-700 block mb-1">Mercancía requerida:</span>
                  <div className="space-y-1">
                    {selectedSolicitud.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-gray-800 font-medium">{it.nombre}</span>
                        <span className="font-bold text-emerald-600 font-rajdhani text-sm">
                          {it.cantidad} unid.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              {(selectedSolicitud.estado === 'Pendiente' || selectedSolicitud.estado === 'Por despachar') && (
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleDespachar(selectedSolicitud)}
                  className="px-4 py-2 bg-[#009b63] hover:bg-[#008756] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Despachar Ahora</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedSolicitud(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazar con Motivo */}
      {rejectingSolicitud && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center gap-2 mb-3 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-gray-900">Rechazar Solicitud</h3>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Indica la razón por la que no se puede despachar la solicitud <span className="font-bold text-gray-800">{rejectingSolicitud.referencia}</span>:
            </p>

            <form onSubmit={handleConfirmRechazo}>
              <textarea
                required
                rows={3}
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Ej: Sin stock suficiente en almacén central..."
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 mb-4 bg-white"
                autoFocus
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingSolicitud(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
