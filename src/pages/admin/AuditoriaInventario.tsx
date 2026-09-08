import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Info, 
  Search, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  Download, 
  Eye, 
  X,
  Package,
  Calendar,
  AlertTriangle,
  Building2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface AuditItemCount {
  producto_id: string;
  sku: string;
  nombre: string;
  stock_sistema: number;
  conteo_fisico: number;
}

interface AuditoriaSesion {
  id: string;
  referencia: string;
  nombre_sesion?: string;
  tienda_id: string;
  tienda_nombre: string;
  total_items: number;
  total_deficit: number;
  total_exceso: number;
  neto: number;
  estado: string;
  usuario_nombre: string;
  created_at: string;
  items?: AuditItemCount[];
}

export default function AuditoriaInventario() {
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [auditorias, setAuditorias] = useState<AuditoriaSesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAudit, setSavingAudit] = useState(false);

  // Formulario Paso 1: Configurar sesión
  const [tiendaId, setTiendaId] = useState('');
  const [nombreSesion, setNombreSesion] = useState('');

  // Paso 2: Conteo Físico
  const [auditItems, setAuditItems] = useState<AuditItemCount[]>([]);
  const [filtroBuscador, setFiltroBuscador] = useState('');

  // Modal Ver Detalle / Reporte
  const [selectedAudit, setSelectedAudit] = useState<AuditoriaSesion | null>(null);

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

      // 2. Productos
      const { data: prods } = await supabase
        .from('productos')
        .select('id, sku, nombre, precio, stock, producto_stock(stock_actual, tienda_id)')
        .eq('activo', true)
        .order('nombre');

      if (prods) setProductos(prods);

      // 3. Auditorías previas
      try {
        const { data: auds, error } = await supabase
          .from('auditorias_inventario')
          .select('*, items:auditoria_items(*)')
          .order('created_at', { ascending: false });

        if (!error && auds) {
          setAuditorias(auds);
        } else {
          const local = localStorage.getItem('teslafire_auditorias');
          if (local) setAuditorias(JSON.parse(local));
        }
      } catch (err) {
        const local = localStorage.getItem('teslafire_auditorias');
        if (local) setAuditorias(JSON.parse(local));
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Al seleccionar la tienda a auditar, inicializamos el conteo con el stock del sistema
  const handleSelectTienda = (storeId: string) => {
    setTiendaId(storeId);
    if (!storeId) {
      setAuditItems([]);
      return;
    }

    const items: AuditItemCount[] = productos.map(p => {
      const st = p.producto_stock?.find((s: any) => s.tienda_id === storeId);
      const stockSistema = Number(st?.stock_actual ?? p.stock ?? 0);
      return {
        producto_id: p.id,
        sku: p.sku,
        nombre: p.nombre,
        stock_sistema: stockSistema,
        conteo_fisico: stockSistema // Inicialmente igual al sistema
      };
    });

    setAuditItems(items);
  };

  const handleUpdateConteo = (prodId: string, val: number) => {
    setAuditItems(prev => prev.map(item => {
      if (item.producto_id === prodId) {
        return { ...item, conteo_fisico: val };
      }
      return item;
    }));
  };

  // Cálculos de diferencias
  const totalDeficit = auditItems.reduce((acc, item) => {
    const diff = item.conteo_fisico - item.stock_sistema;
    return diff < 0 ? acc + Math.abs(diff) : acc;
  }, 0);

  const totalExceso = auditItems.reduce((acc, item) => {
    const diff = item.conteo_fisico - item.stock_sistema;
    return diff > 0 ? acc + diff : acc;
  }, 0);

  const netoTotal = totalExceso - totalDeficit;

  const handleFinalizarAuditoria = async () => {
    if (!tiendaId) return;
    setSavingAudit(true);
    const storeObj = tiendas.find(t => t.id === tiendaId);
    const ref = `AUD-${Date.now().toString().slice(-4)}`;

    try {
      // 1. Actualizar el stock físico de cada producto en la tienda
      for (const item of auditItems) {
        if (item.conteo_fisico !== item.stock_sistema) {
          await supabase
            .from('producto_stock')
            .upsert({
              producto_id: item.producto_id,
              tienda_id: tiendaId,
              stock_actual: Number(item.conteo_fisico),
              stock_comprometido: 0,
              updated_at: new Date().toISOString()
            }, { onConflict: 'producto_id,tienda_id' });
        }
      }

      // 2. Registrar la sesión de auditoría
      const auditRecord: AuditoriaSesion = {
        id: crypto.randomUUID(),
        referencia: ref,
        nombre_sesion: nombreSesion.trim() || undefined,
        tienda_id: tiendaId,
        tienda_nombre: storeObj?.nombre || 'Tienda',
        total_items: auditItems.length,
        total_deficit: totalDeficit,
        total_exceso: totalExceso,
        neto: netoTotal,
        estado: 'Completada',
        usuario_nombre: 'Admin',
        created_at: new Date().toISOString(),
        items: [...auditItems]
      };

      await supabase.from('auditorias_inventario').insert([{
        id: auditRecord.id,
        referencia: auditRecord.referencia,
        nombre_sesion: auditRecord.nombre_sesion,
        tienda_id: auditRecord.tienda_id,
        tienda_nombre: auditRecord.tienda_nombre,
        total_items: auditRecord.total_items,
        total_deficit: auditRecord.total_deficit,
        total_exceso: auditRecord.total_exceso,
        neto: auditRecord.neto,
        estado: auditRecord.estado,
        usuario_nombre: auditRecord.usuario_nombre,
        created_at: auditRecord.created_at
      }]);

      const itemsPayload = auditItems.map(item => ({
        auditoria_id: auditRecord.id,
        producto_id: item.producto_id,
        producto_sku: item.sku,
        producto_nombre: item.nombre,
        stock_sistema: item.stock_sistema,
        conteo_fisico: item.conteo_fisico,
        diferencia: item.conteo_fisico - item.stock_sistema
      }));
      await supabase.from('auditoria_items').insert(itemsPayload);

      // Sincronizar localmente
      const updatedAuds = [auditRecord, ...auditorias];
      setAuditorias(updatedAuds);
      localStorage.setItem('teslafire_auditorias', JSON.stringify(updatedAuds));

      toast.success('¡Auditoría finalizada y stock ajustado en el sistema!');
      setTiendaId('');
      setNombreSesion('');
      setAuditItems([]);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar la auditoría');
    } finally {
      setSavingAudit(false);
    }
  };

  const filteredItems = auditItems.filter(i => 
    i.nombre.toLowerCase().includes(filtroBuscador.toLowerCase()) || 
    i.sku.toLowerCase().includes(filtroBuscador.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO DE LA PÁGINA
      ══════════════════════════════════════════════════ */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Auditoría Física de Inventario
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Cuenta el inventario físico, compara contra el sistema y aplica ajustes (mermas / sobrantes).
        </p>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA 1: NUEVA TOMA FÍSICA DE INVENTARIO
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs mb-6">
        
        {/* Encabezado con icono de checklist */}
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="w-4 h-4 text-gray-700" />
          <h2 className="text-sm font-bold text-gray-900">
            Nueva Toma Física de Inventario
          </h2>
        </div>

        {/* Paso 1: Configura la sesión de auditoría */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] font-bold">
            1
          </div>
          <span className="text-xs font-bold text-gray-800">
            Configura la sesión de auditoría
          </span>
        </div>

        {/* Fila con los 2 campos: Tienda y Nombre de la sesión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Tienda a auditar * */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Tienda a auditar <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={tiendaId}
                onChange={(e) => handleSelectTienda(e.target.value)}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white cursor-pointer appearance-none pr-8 text-gray-800"
              >
                <option value="">Seleccione tienda...</option>
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

          {/* Nombre de la sesión (opcional) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Nombre de la sesión <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={nombreSesion}
              onChange={(e) => setNombreSesion(e.target.value)}
              placeholder="Ej. Cierre Junio 2026"
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Mensaje de guía inicial */}
        {!tiendaId && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-3">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            <span>Selecciona la tienda para comenzar el conteo</span>
          </div>
        )}

        {/* Tabla de Conteo Físico (Paso 2) */}
        {tiendaId && (
          <div className="mt-6 pt-5 border-t border-gray-100 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] font-bold">
                  2
                </div>
                <span className="text-xs font-bold text-gray-800">
                  Conteo Físico vs Stock del Sistema ({auditItems.length} artículos)
                </span>
              </div>

              {/* Buscador de artículos en la toma */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filtroBuscador}
                  onChange={(e) => setFiltroBuscador(e.target.value)}
                  placeholder="Filtrar por SKU o nombre..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Tabla de Conteo */}
            <div className="border border-gray-200/80 rounded-xl overflow-hidden mb-4">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-4 font-bold text-gray-600">PRODUCTO / SKU</th>
                      <th className="py-2.5 px-4 font-bold text-gray-600 text-center w-32">SISTEMA</th>
                      <th className="py-2.5 px-4 font-bold text-gray-900 text-center w-36">CONTEO FÍSICO</th>
                      <th className="py-2.5 px-4 font-bold text-gray-600 text-center w-32">DIFERENCIA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredItems.map((item) => {
                      const diff = item.conteo_fisico - item.stock_sistema;
                      return (
                        <tr key={item.producto_id} className="hover:bg-gray-50/70">
                          <td className="py-2.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900">{item.nombre}</span>
                              <span className="text-[10px] text-gray-400 font-semibold">SKU: {item.sku}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold text-gray-600 font-rajdhani text-sm">
                            {item.stock_sistema}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={item.conteo_fisico}
                              onChange={(e) => handleUpdateConteo(item.producto_id, parseFloat(e.target.value) || 0)}
                              className="w-24 text-center font-bold font-rajdhani text-sm py-1 px-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500 bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {diff === 0 && (
                              <span className="text-xs font-bold text-gray-400 font-rajdhani">
                                0.00
                              </span>
                            )}
                            {diff < 0 && (
                              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded font-rajdhani">
                                {diff.toFixed(2)} (Déficit)
                              </span>
                            )}
                            {diff > 0 && (
                              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-rajdhani">
                                +{diff.toFixed(2)} (Exceso)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tarjeta de Resumen y Botón Finalizar */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Déficit (Mermas)</span>
                  <span className="text-base font-black text-red-600 font-rajdhani">-{totalDeficit.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Exceso (Sobrantes)</span>
                  <span className="text-base font-black text-orange-600 font-rajdhani">+{totalExceso.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Impacto Neto</span>
                  <span className={`text-base font-black font-rajdhani ${netoTotal >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {netoTotal >= 0 ? `+${netoTotal.toFixed(2)}` : netoTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={savingAudit}
                onClick={handleFinalizarAuditoria}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#343a40] hover:bg-[#23272b] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingAudit ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Aplicar Ajuste de Auditoría</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA 2: TOMAS FÍSICAS RECIENTES
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-gray-900 mb-4">
          Tomas Físicas Recientes
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  FECHA
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  REFERENCIA / TIENDA
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  ITEMS
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-red-500 uppercase tracking-wider text-center">
                  DÉFICIT
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-orange-500 uppercase tracking-wider text-center">
                  EXCESO
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  NETO
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  ESTADO
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  REPORTE
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto mb-2" />
                    <span className="text-xs font-semibold text-gray-400">Cargando tomas físicas...</span>
                  </td>
                </tr>
              ) : auditorias.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs font-medium text-gray-400">
                    Aún no has registrado tomas físicas.
                  </td>
                </tr>
              ) : (
                auditorias.map((aud) => (
                  <tr key={aud.id} className="hover:bg-gray-50/70 transition-colors">
                    
                    {/* FECHA */}
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-500">
                      {new Date(aud.created_at).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>

                    {/* REFERENCIA / TIENDA */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">
                          {aud.referencia} {aud.nombre_sesion ? `· ${aud.nombre_sesion}` : ''}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {aud.tienda_nombre}
                        </span>
                      </div>
                    </td>

                    {/* ITEMS */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                        {aud.total_items}
                      </span>
                    </td>

                    {/* DÉFICIT */}
                    <td className="py-3.5 px-4 text-center font-bold text-red-600 font-rajdhani text-xs">
                      {aud.total_deficit > 0 ? `-${aud.total_deficit}` : '0'}
                    </td>

                    {/* EXCESO */}
                    <td className="py-3.5 px-4 text-center font-bold text-orange-600 font-rajdhani text-xs">
                      {aud.total_exceso > 0 ? `+${aud.total_exceso}` : '0'}
                    </td>

                    {/* NETO */}
                    <td className="py-3.5 px-4 text-center font-bold font-rajdhani text-xs text-gray-700">
                      {aud.neto >= 0 ? `+${aud.neto}` : aud.neto}
                    </td>

                    {/* ESTADO */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {aud.estado}
                      </span>
                    </td>

                    {/* REPORTE */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedAudit(aud)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        title="Ver reporte"
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

      {/* Modal Detalle de Auditoría */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-900">
                  Auditoría {selectedAudit.referencia}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedAudit(null)} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Tienda:</span>
                <span className="font-bold text-gray-800">{selectedAudit.tienda_nombre}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Déficit (Mermas):</span>
                <span className="font-bold text-red-600">-{selectedAudit.total_deficit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Exceso (Sobrantes):</span>
                <span className="font-bold text-orange-600">+{selectedAudit.total_exceso}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Impacto Neto:</span>
                <span className="font-bold text-gray-900">{selectedAudit.neto}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
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
