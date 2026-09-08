import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Download, 
  Info, 
  Plus, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  Loader2, 
  Package, 
  Calendar,
  AlertTriangle,
  Clock,
  User
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface ConsumoItem {
  producto_id: string;
  sku: string;
  nombre: string;
  cantidad: number;
  motivo: string;
  stock_disponible: number;
}

interface ConsumoRegistro {
  id: string;
  referencia: string;
  producto_id: string;
  producto_nombre: string;
  producto_sku: string;
  tienda_id: string;
  tienda_nombre: string;
  cantidad: number;
  motivo: string;
  notas?: string;
  usuario_nombre: string;
  created_at: string;
}

export default function ConsumoInterno() {
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [consumos, setConsumos] = useState<ConsumoRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Paso 1: Tienda de origen
  const [selectedTiendaId, setSelectedTiendaId] = useState('');

  // Paso 2: Producto, cantidad y motivo
  const [selectedProdId, setSelectedProdId] = useState('');
  const [cantidadInput, setCantidadInput] = useState<number>(1);
  const [motivoSelect, setMotivoSelect] = useState('Mantenimiento interno');
  const [otroMotivo, setOtroMotivo] = useState('');
  const [itemsList, setItemsList] = useState<ConsumoItem[]>([]);
  const [notas, setNotas] = useState('');

  // Exportación
  const hoy = new Date().toISOString().split('T')[0];
  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [fechaDesde, setFechaDesde] = useState(primerDiaMes);
  const [fechaHasta, setFechaHasta] = useState(hoy);

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

      // 2. Catálogo de productos con existencias
      const { data: prods } = await supabase
        .from('productos')
        .select('*, producto_stock(stock_actual, tienda_id)')
        .eq('activo', true)
        .order('nombre');

      if (prods) setProductos(prods);

      // 3. Consumos registrados
      try {
        const { data: cons, error } = await supabase
          .from('consumos_internos')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && cons) {
          setConsumos(cons);
        } else {
          const local = localStorage.getItem('teslafire_consumos_internos');
          if (local) setConsumos(JSON.parse(local));
        }
      } catch (err) {
        const local = localStorage.getItem('teslafire_consumos_internos');
        if (local) setConsumos(JSON.parse(local));
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStockInStore = (prodId: string) => {
    if (!selectedTiendaId) return 0;
    const prod = productos.find(p => p.id === prodId);
    if (!prod) return 0;
    const st = prod.producto_stock?.find((s: any) => s.tienda_id === selectedTiendaId);
    return st?.stock_actual ?? prod.stock ?? 0;
  };

  const handleAddItem = () => {
    if (!selectedProdId) {
      toast.error('Selecciona un producto');
      return;
    }

    const prod = productos.find(p => p.id === selectedProdId);
    if (!prod) return;

    const available = getStockInStore(prod.id);
    if (cantidadInput <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    if (cantidadInput > available) {
      toast.error(`Existencias insuficientes. Disponible: ${available}`);
      return;
    }

    const motivoFinal = motivoSelect === 'Otro' ? (otroMotivo.trim() || 'Consumo Operativo') : motivoSelect;

    const existingIdx = itemsList.findIndex(i => i.producto_id === prod.id && i.motivo === motivoFinal);
    if (existingIdx >= 0) {
      const newTotal = itemsList[existingIdx].cantidad + Number(cantidadInput);
      if (newTotal > available) {
        toast.error(`Excede las existencias disponibles (${available})`);
        return;
      }
      const updated = [...itemsList];
      updated[existingIdx].cantidad = newTotal;
      setItemsList(updated);
    } else {
      setItemsList([
        ...itemsList,
        {
          producto_id: prod.id,
          sku: prod.sku,
          nombre: prod.nombre,
          cantidad: Number(cantidadInput),
          motivo: motivoFinal,
          stock_disponible: available
        }
      ]);
    }

    setSelectedProdId('');
    setCantidadInput(1);
    toast.success('Renglón agregado al consumo');
  };

  const handleRemoveItem = (idx: number) => {
    setItemsList(itemsList.filter((_, i) => i !== idx));
  };

  const handleRegistrarConsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTiendaId) {
      toast.error('Seleccione la tienda de origen');
      return;
    }
    if (itemsList.length === 0) {
      toast.error('Agregue al menos un producto');
      return;
    }

    setSaving(true);
    const storeObj = tiendas.find(t => t.id === selectedTiendaId);

    try {
      const newRecords: ConsumoRegistro[] = [];

      for (const item of itemsList) {
        const ref = `CI-${Date.now().toString().slice(-4)}`;

        // 1. Descontar de inventario físico
        const stockActual = getStockInStore(item.producto_id);
        const stockNuevo = Math.max(0, stockActual - item.cantidad);
        await supabase
          .from('producto_stock')
          .upsert({
            producto_id: item.producto_id,
            tienda_id: selectedTiendaId,
            stock_actual: stockNuevo,
            stock_comprometido: 0,
            updated_at: new Date().toISOString()
          }, { onConflict: 'producto_id,tienda_id' });

        // 2. Registrar en histórico de consumos
        const record: ConsumoRegistro = {
          id: crypto.randomUUID(),
          referencia: ref,
          producto_id: item.producto_id,
          producto_nombre: item.nombre,
          producto_sku: item.sku,
          tienda_id: selectedTiendaId,
          tienda_nombre: storeObj?.nombre || 'Tienda',
          cantidad: item.cantidad,
          motivo: item.motivo,
          notas: notas.trim(),
          usuario_nombre: 'Admin',
          created_at: new Date().toISOString()
        };

        // Intentar guardar en Supabase
        await supabase.from('consumos_internos').insert([record]);
        newRecords.push(record);
      }

      // Sincronizar localmente
      const updatedConsumos = [...newRecords, ...consumos];
      setConsumos(updatedConsumos);
      localStorage.setItem('teslafire_consumos_internos', JSON.stringify(updatedConsumos));

      toast.success('¡Consumo interno registrado y descontado del inventario!');
      setSelectedTiendaId('');
      setItemsList([]);
      setNotas('');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar el consumo interno');
    } finally {
      setSaving(false);
    }
  };

  // Exportar Excel
  const handleExportExcel = () => {
    const filtrados = consumos.filter(c => {
      const f = c.created_at.split('T')[0];
      return f >= fechaDesde && f <= fechaHasta;
    });

    if (filtrados.length === 0) {
      toast.error('No hay consumos en el rango de fechas seleccionado');
      return;
    }

    const data = filtrados.map(c => ({
      Referencia: c.referencia,
      Fecha: new Date(c.created_at).toLocaleDateString('es-VE'),
      Producto: c.producto_nombre,
      SKU: c.producto_sku,
      Tienda: c.tienda_nombre,
      Motivo: c.motivo,
      Cantidad: c.cantidad,
      Usuario: c.usuario_nombre
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Consumos_Internos");
    XLSX.writeFile(wb, `reporte_consumos_${fechaDesde}_al_${fechaHasta}.xlsx`);
    toast.success("Reporte Excel descargado correctamente");
  };

  // Exportar PDF
  const handleExportPDF = () => {
    toast('Generando PDF del reporte...', { icon: '📄' });
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO DE LA PÁGINA
      ══════════════════════════════════════════════════ */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Consumo Interno
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Registra la salida de mercancía utilizada para fines operativos de la empresa.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA 1: REGISTRAR CONSUMO INTERNO
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs mb-6">
        
        {/* Título de la tarjeta con icono de papelera naranja */}
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-bold text-gray-900">
            Registrar Consumo Interno
          </h2>
        </div>

        {/* Paso 1: Selecciona la tienda de origen */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[11px] font-bold">
            1
          </div>
          <span className="text-xs font-bold text-gray-800">
            Selecciona la tienda de origen
          </span>
        </div>

        <form onSubmit={handleRegistrarConsumo}>
          {/* Selector de tienda */}
          <div className="max-w-md">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Tienda <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedTiendaId}
                onChange={(e) => setSelectedTiendaId(e.target.value)}
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

          {/* Mensaje de guía inicial */}
          {!selectedTiendaId && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-3">
              <Info className="w-3.5 h-3.5 text-gray-400" />
              <span>Selecciona la tienda para continuar</span>
            </div>
          )}

          {/* Paso 2: Aparece reactivamente cuando se elige la tienda */}
          {selectedTiendaId && (
            <div className="mt-5 pt-5 border-t border-gray-100 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[11px] font-bold">
                  2
                </div>
                <span className="text-xs font-bold text-gray-800">
                  Selecciona el producto y motivo de consumo
                </span>
              </div>

              {/* Fila de controles para agregar producto */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end mb-3">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Producto</label>
                  <select
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="">Seleccione producto...</option>
                    {productos.map(p => {
                      const st = getStockInStore(p.id);
                      return (
                        <option key={p.id} value={p.id} disabled={st <= 0}>
                          {p.nombre} ({p.sku}) — Stock disp: {st}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={cantidadInput}
                    onChange={(e) => setCantidadInput(parseInt(e.target.value) || 1)}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 text-center bg-white font-rajdhani"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Motivo</label>
                  <select
                    value={motivoSelect}
                    onChange={(e) => setMotivoSelect(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="Mantenimiento interno">Mantenimiento interno</option>
                    <option value="Uso operativo en taller">Uso operativo en taller</option>
                    <option value="Muestra / Exhibición">Muestra / Exhibición</option>
                    <option value="Garantía de servicio">Garantía de servicio</option>
                    <option value="Pruebas de recarga">Pruebas de recarga</option>
                    <option value="Otro">Otro motivo...</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-2.5 px-4 bg-[#495057] hover:bg-[#343a40] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar
                  </button>
                </div>
              </div>

              {motivoSelect === 'Otro' && (
                <div className="mb-3 max-w-md">
                  <input
                    type="text"
                    value={otroMotivo}
                    onChange={(e) => setOtroMotivo(e.target.value)}
                    placeholder="Especifique el motivo del consumo..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  />
                </div>
              )}

              {/* Lista de productos para consumo */}
              {itemsList.length > 0 && (
                <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-3 mb-4">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Artículos a dar de salida ({itemsList.length}):
                  </span>
                  <div className="space-y-1.5">
                    {itemsList.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200/60 text-xs">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-bold text-gray-800">{it.nombre}</span>
                          <span className="text-[10px] text-gray-400">({it.sku})</span>
                          <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-semibold border border-orange-100">
                            {it.motivo}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-orange-600 font-rajdhani text-sm">
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

                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200/60">
                    <input
                      type="text"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Observaciones adicionales o técnico responsable..."
                      className="w-full sm:flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Registrar Salida de Consumo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA 2: EXPORTAR CONSUMOS
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Download className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-bold text-gray-900">
            Exportar Consumos
          </h2>
        </div>
        <p className="text-xs text-gray-400 font-medium mb-4">
          Elige el rango de fechas y descarga el reporte en PDF o Excel.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {/* Desde */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">Desde</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Hasta */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">Hasta</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Botón PDF */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-all shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          {/* Botón Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-600 font-bold text-xs rounded-xl transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETA 3: ÚLTIMOS CONSUMOS REGISTRADOS
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-gray-900 mb-4">
          Últimos Consumos Registrados
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
                <th className="py-3 px-4 text-[11px] font-bold text-orange-500 uppercase tracking-wider text-center">
                  TIENDA
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  MOTIVO
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
                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin mx-auto mb-2" />
                    <span className="text-xs font-semibold text-gray-400">Cargando consumos...</span>
                  </td>
                </tr>
              ) : consumos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs font-medium text-gray-400">
                    No hay consumos internos recientes.
                  </td>
                </tr>
              ) : (
                consumos.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                    
                    {/* FECHA */}
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-500">
                      {new Date(c.created_at).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>

                    {/* PRODUCTO */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">
                          {c.producto_nombre}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          SKU: {c.producto_sku}
                        </span>
                      </div>
                    </td>

                    {/* TIENDA */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded">
                        {c.tienda_nombre}
                      </span>
                    </td>

                    {/* MOTIVO */}
                    <td className="py-3.5 px-4 text-center text-xs font-medium text-gray-700">
                      {c.motivo}
                    </td>

                    {/* CANTIDAD */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs font-black text-gray-900 font-rajdhani">
                        {c.cantidad}
                      </span>
                    </td>

                    {/* USUARIO */}
                    <td className="py-3.5 px-4 text-center text-xs font-medium text-gray-600">
                      {c.usuario_nombre}
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
