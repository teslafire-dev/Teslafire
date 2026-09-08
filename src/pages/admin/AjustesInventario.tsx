import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Plus, 
  FileText, 
  FileSpreadsheet, 
  Check, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  X, 
  Package, 
  Calendar,
  AlertTriangle,
  Building2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface AjusteRegistro {
  id: string;
  referencia: string;
  tienda_id: string;
  tienda_nombre: string;
  tipo: 'Entrada' | 'Salida' | 'Físico';
  motivo: string;
  items_count: number;
  neto: number;
  aplicado_por: string;
  notas?: string;
  created_at: string;
}

export default function AjustesInventario() {
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [ajustes, setAjustes] = useState<AjusteRegistro[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros Reporte de Ajustes
  const hoy = new Date().toISOString().split('T')[0];
  const primerDia = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [fechaDesde, setFechaDesde] = useState(primerDia);
  const [fechaHasta, setFechaHasta] = useState(hoy);
  const [tipoFiltro, setTipoFiltro] = useState('Entradas y salidas');
  const [motivoFiltro, setMotivoFiltro] = useState('Todos');

  // Modal Nuevo Movimiento
  const [showModalMovimiento, setShowModalMovimiento] = useState(false);
  const [modalTiendaId, setModalTiendaId] = useState('');
  const [modalTipo, setModalTipo] = useState<'Entrada' | 'Salida'>('Entrada');
  const [modalProdId, setModalProdId] = useState('');
  const [modalCantidad, setModalCantidad] = useState<number>(1);
  const [modalMotivo, setModalMotivo] = useState('Sobrante encontrado');
  const [modalNotas, setModalNotas] = useState('');
  const [savingMovimiento, setSavingMovimiento] = useState(false);

  // Modal Detalle
  const [selectedAjuste, setSelectedAjuste] = useState<AjusteRegistro | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Tiendas
      const { data: stores } = await supabase
        .from('tiendas')
        .select('id, nombre, codigo, es_principal')
        .order('es_principal', { ascending: false });

      if (stores) {
        setTiendas(stores);
        if (stores.length > 0 && !modalTiendaId) {
          setModalTiendaId(stores[0].id);
        }
      }

      // 2. Productos
      const { data: prods } = await supabase
        .from('productos')
        .select('id, sku, nombre, precio, stock, producto_stock(stock_actual, tienda_id)')
        .eq('activo', true)
        .order('nombre');

      if (prods) setProductos(prods);

      // 3. Ajustes
      try {
        const { data: ajs, error } = await supabase
          .from('ajustes_inventario')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && ajs) {
          setAjustes(ajs);
        } else {
          const local = localStorage.getItem('teslafire_ajustes_inventario');
          if (local) setAjustes(JSON.parse(local));
        }
      } catch (err) {
        const local = localStorage.getItem('teslafire_ajustes_inventario');
        if (local) setAjustes(JSON.parse(local));
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarNuevoMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTiendaId) {
      toast.error('Seleccione la tienda');
      return;
    }
    if (!modalProdId) {
      toast.error('Seleccione el producto');
      return;
    }
    if (modalCantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    setSavingMovimiento(true);
    const storeObj = tiendas.find(t => t.id === modalTiendaId);
    const prodObj = productos.find(p => p.id === modalProdId);
    const ref = `AJ-${Date.now().toString().slice(-4)}`;

    try {
      // 1. Actualizar stock
      const stockActual = prodObj?.producto_stock?.find((s: any) => s.tienda_id === modalTiendaId)?.stock_actual ?? prodObj?.stock ?? 0;
      const nuevoStock = modalTipo === 'Entrada' ? stockActual + modalCantidad : Math.max(0, stockActual - modalCantidad);

      await supabase
        .from('producto_stock')
        .upsert({
          producto_id: modalProdId,
          tienda_id: modalTiendaId,
          stock_actual: nuevoStock,
          stock_comprometido: 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'producto_id,tienda_id' });

      // 2. Registrar en ajustes_inventario
      const netoCalculado = modalTipo === 'Entrada' ? modalCantidad : -modalCantidad;
      const newRecord: AjusteRegistro = {
        id: crypto.randomUUID(),
        referencia: ref,
        tienda_id: modalTiendaId,
        tienda_nombre: storeObj?.nombre || 'Tienda',
        tipo: modalTipo,
        motivo: modalMotivo,
        items_count: 1,
        neto: netoCalculado,
        aplicado_por: 'Admin',
        notas: modalNotas.trim(),
        created_at: new Date().toISOString()
      };

      await supabase.from('ajustes_inventario').insert([newRecord]);

      const updated = [newRecord, ...ajustes];
      setAjustes(updated);
      localStorage.setItem('teslafire_ajustes_inventario', JSON.stringify(updated));

      toast.success(`Ajuste ${ref} aplicado con éxito al stock.`);
      setShowModalMovimiento(false);
      setModalProdId('');
      setModalCantidad(1);
      setModalNotas('');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error('Error al aplicar el movimiento de ajuste');
    } finally {
      setSavingMovimiento(false);
    }
  };

  // Exportar Excel
  const handleExportExcel = () => {
    const filtrados = ajustes.filter(a => {
      const f = a.created_at.split('T')[0];
      const matchFecha = f >= fechaDesde && f <= fechaHasta;
      const matchTipo = tipoFiltro === 'Entradas y salidas' ? true : (tipoFiltro === 'Solo entradas' ? a.tipo === 'Entrada' : a.tipo === 'Salida');
      const matchMotivo = motivoFiltro === 'Todos' ? true : a.motivo === motivoFiltro;
      return matchFecha && matchTipo && matchMotivo;
    });

    if (filtrados.length === 0) {
      toast.error('No hay ajustes para el rango de fechas seleccionado');
      return;
    }

    const data = filtrados.map(a => ({
      Fecha: new Date(a.created_at).toLocaleDateString('es-VE'),
      Referencia: a.referencia,
      Tienda: a.tienda_nombre,
      Tipo: a.tipo,
      Motivo: a.motivo,
      Items: a.items_count,
      Neto: a.neto,
      Aplicó: a.aplicado_por
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ajustes_Inventario");
    XLSX.writeFile(wb, `reporte_ajustes_${fechaDesde}_al_${fechaHasta}.xlsx`);
    toast.success("Reporte Excel descargado correctamente");
  };

  // Exportar PDF
  const handleExportPDF = () => {
    toast('Generando reporte PDF...', { icon: '📄' });
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO DE LA PÁGINA
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Ajustes de Inventario
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Revisa las tomas físicas de las tiendas y aplica el ajuste al stock. Solo tú (con permiso) puedes ajustar.
          </p>
        </div>

        {/* Botón + Nuevo Movimiento */}
        <button
          type="button"
          onClick={() => setShowModalMovimiento(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#343a40] hover:bg-[#23272b] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>+ Nuevo Movimiento</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA 1: REPORTE DE AJUSTES (PDF)
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="w-4 h-4 text-gray-700" />
          <h2 className="text-sm font-bold text-gray-900">
            Reporte de Ajustes (PDF)
          </h2>
        </div>
        <p className="text-xs text-gray-400 font-medium mb-4">
          Todas las entradas y salidas por motivo —incluidos los ajustes del conteo físico—, por fecha. Elige y genera el PDF.
        </p>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* DESDE */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              DESDE
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* HASTA */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              HASTA
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* TIPO */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              TIPO
            </label>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="Entradas y salidas">Entradas y salidas</option>
              <option value="Solo entradas">Solo entradas</option>
              <option value="Solo salidas">Solo salidas</option>
            </select>
          </div>

          {/* MOTIVO */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              MOTIVO
            </label>
            <select
              value={motivoFiltro}
              onChange={(e) => setMotivoFiltro(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Ajuste por conteo físico">Ajuste por conteo físico</option>
              <option value="Merma o daño">Merma o daño</option>
              <option value="Sobrante encontrado">Sobrante encontrado</option>
              <option value="Ajuste contable">Ajuste contable</option>
            </select>
          </div>

          {/* Botones PDF y Excel */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              className="flex-1 py-2 px-3 bg-[#343a40] hover:bg-[#23272b] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="flex-1 py-2 px-3 bg-[#009b63] hover:bg-[#008756] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA 2: TOMAS FÍSICAS PENDIENTES DE AJUSTE
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs mb-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">
          Tomas Físicas Pendientes de Ajuste
        </h2>

        {/* Estado vacío fiel a la captura */}
        <div className="py-14 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100/70 flex items-center justify-center mb-3">
            <Check className="w-6 h-6 text-gray-300 stroke-[3]" />
          </div>
          <span className="text-xs font-medium text-gray-400">
            No hay tomas físicas pendientes. Todo al día.
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA 3: AJUSTES APLICADOS
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-gray-900 mb-4">
          Ajustes Aplicados
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  FECHA AJUSTE
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  REFERENCIA / TIENDA
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  ITEMS
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  NETO
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  APLICÓ
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  REPORTE
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto mb-2" />
                    <span className="text-xs font-semibold text-gray-400">Cargando ajustes...</span>
                  </td>
                </tr>
              ) : ajustes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs font-medium text-gray-400">
                    Aún no se han aplicado ajustes.
                  </td>
                </tr>
              ) : (
                ajustes.map((aj) => (
                  <tr key={aj.id} className="hover:bg-gray-50/70 transition-colors">
                    
                    {/* FECHA AJUSTE */}
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-500">
                      {new Date(aj.created_at).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>

                    {/* REFERENCIA / TIENDA */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">
                          {aj.referencia}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {aj.tienda_nombre} · {aj.motivo}
                        </span>
                      </div>
                    </td>

                    {/* ITEMS */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                        {aj.items_count}
                      </span>
                    </td>

                    {/* NETO */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-xs font-black font-rajdhani ${aj.neto >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {aj.neto >= 0 ? `+${aj.neto}` : aj.neto}
                      </span>
                    </td>

                    {/* APLICÓ */}
                    <td className="py-3.5 px-4 text-center text-xs font-medium text-gray-600">
                      {aj.aplicado_por}
                    </td>

                    {/* REPORTE */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedAjuste(aj)}
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

      {/* Modal Nuevo Movimiento de Ajuste */}
      {showModalMovimiento && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900">Nuevo Movimiento de Ajuste</h3>
              </div>
              <button 
                onClick={() => setShowModalMovimiento(false)} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarNuevoMovimiento} className="space-y-3.5 py-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tienda / Almacén *</label>
                <select
                  value={modalTiendaId}
                  onChange={(e) => setModalTiendaId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  {tiendas.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Ajuste *</label>
                  <select
                    value={modalTipo}
                    onChange={(e) => setModalTipo(e.target.value as 'Entrada' | 'Salida')}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Entrada">Entrada (Suma)</option>
                    <option value="Salida">Salida (Resta)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cantidad *</label>
                  <input
                    type="number"
                    min="1"
                    value={modalCantidad}
                    onChange={(e) => setModalCantidad(parseInt(e.target.value) || 1)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 text-center bg-white font-rajdhani"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Producto *</label>
                <select
                  value={modalProdId}
                  onChange={(e) => setModalProdId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  <option value="">Seleccione producto...</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Motivo *</label>
                <select
                  value={modalMotivo}
                  onChange={(e) => setModalMotivo(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  <option value="Sobrante encontrado">Sobrante encontrado</option>
                  <option value="Merma o daño">Merma o daño</option>
                  <option value="Ajuste por conteo físico">Ajuste por conteo físico</option>
                  <option value="Corrección de ingreso">Corrección de ingreso</option>
                  <option value="Ajuste contable">Ajuste contable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notas / Justificación</label>
                <input
                  type="text"
                  value={modalNotas}
                  onChange={(e) => setModalNotas(e.target.value)}
                  placeholder="Ej: Detectado en inventario de cierre..."
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalMovimiento(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingMovimiento}
                  className="px-5 py-2 text-xs font-bold bg-[#343a40] hover:bg-black text-white rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingMovimiento ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Aplicar Ajuste</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle de Ajuste Aplicado */}
      {selectedAjuste && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-900">Ajuste {selectedAjuste.referencia}</h3>
              </div>
              <button 
                onClick={() => setSelectedAjuste(null)} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Tienda:</span>
                <span className="font-bold text-gray-800">{selectedAjuste.tienda_nombre}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Tipo:</span>
                <span className="font-bold text-gray-800">{selectedAjuste.tipo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Motivo:</span>
                <span className="font-bold text-gray-800">{selectedAjuste.motivo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Impacto Neto:</span>
                <span className={`font-bold font-rajdhani ${selectedAjuste.neto >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {selectedAjuste.neto >= 0 ? `+${selectedAjuste.neto}` : selectedAjuste.neto}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Aplicado por:</span>
                <span className="font-bold text-gray-800">{selectedAjuste.aplicado_por}</span>
              </div>
              {selectedAjuste.notas && (
                <div className="pt-1 text-gray-500">
                  <span className="font-bold block text-gray-700">Notas:</span>
                  {selectedAjuste.notas}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAjuste(null)}
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
