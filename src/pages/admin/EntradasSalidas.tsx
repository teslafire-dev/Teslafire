import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowDown, 
  ArrowUp, 
  Search, 
  X, 
  Building2, 
  Calendar, 
  User, 
  Package, 
  Check, 
  Loader2, 
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface MovimientoItem {
  id: string;
  referencia: string;
  tipo: 'Entrada' | 'Salida';
  motivo: string;
  producto_id: string;
  producto_nombre: string;
  producto_sku: string;
  tienda_id: string;
  tienda_nombre: string;
  cantidad: number;
  usuario_nombre: string;
  notas?: string;
  created_at: string;
}

// Datos iniciales fieles a la captura
const defaultMovimientosDemo: MovimientoItem[] = [
  {
    id: '1',
    referencia: 'FFTF-000002',
    tipo: 'Salida',
    motivo: 'Venta regular (Factura Fiscal)',
    producto_id: 'prod-1',
    producto_nombre: 'Detector de humo fotoeléctrico',
    producto_sku: 'DET-HUM-01',
    tienda_id: 'store-1',
    tienda_nombre: 'Almacén Tesla Fire',
    cantidad: 1,
    usuario_nombre: 'Gerencia',
    created_at: '2026-09-06T10:04:00'
  },
  {
    id: '2',
    referencia: 'FFTF-000002',
    tipo: 'Salida',
    motivo: 'Venta regular (Factura Fiscal)',
    producto_id: 'prod-2',
    producto_nombre: 'Extintor Clase K 6 Lts (cocinas)',
    producto_sku: 'EXT-CLK-06',
    tienda_id: 'store-1',
    tienda_nombre: 'Almacén Tesla Fire',
    cantidad: 1,
    usuario_nombre: 'Gerencia',
    created_at: '2026-09-06T10:04:00'
  },
  {
    id: '3',
    referencia: 'NTF-000001',
    tipo: 'Salida',
    motivo: 'Venta regular (Nota de Entrega)',
    producto_id: 'prod-3',
    producto_nombre: 'Extintor CO2 15 Lbs',
    producto_sku: 'EXT-CO2-15',
    tienda_id: 'store-1',
    tienda_nombre: 'Almacén Tesla Fire',
    cantidad: 1,
    usuario_nombre: 'Gerencia',
    created_at: '2026-09-03T22:03:00'
  },
  {
    id: '4',
    referencia: 'FFTF-000001',
    tipo: 'Salida',
    motivo: 'Venta regular (Factura Fiscal)',
    producto_id: 'prod-4',
    producto_nombre: 'Estación manual de alarma',
    producto_sku: 'DET-EST-01',
    tienda_id: 'store-1',
    tienda_nombre: 'Almacén Tesla Fire',
    cantidad: 1,
    usuario_nombre: 'Gerencia',
    created_at: '2026-09-03T22:01:00'
  }
];

export default function EntradasSalidas() {
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [buscar, setBuscar] = useState('');
  const [tipo, setTipo] = useState('Todos');
  const [motivo, setMotivo] = useState('Todos');
  const [tiendaFiltro, setTiendaFiltro] = useState('Todas');
  const [desde, setDesde] = useState('2026-09-01');
  const [hasta, setHasta] = useState('2026-09-08');

  // Modal Nuevo Movimiento
  const [showModal, setShowModal] = useState(false);
  const [modalTiendaId, setModalTiendaId] = useState('');
  const [modalTipo, setModalTipo] = useState<'Entrada' | 'Salida'>('Salida');
  const [modalProdId, setModalProdId] = useState('');
  const [modalCantidad, setModalCantidad] = useState<number>(1);
  const [modalMotivo, setModalMotivo] = useState('Venta regular (Factura Fiscal)');
  const [modalRef, setModalRef] = useState('');
  const [modalNotas, setModalNotas] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Tiendas
      const { data: stores } = await supabase
        .from('tiendas')
        .select('id, nombre, es_principal')
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

      // 3. Movimientos
      try {
        const { data: movs, error } = await supabase
          .from('movimientos_inventario')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && movs && movs.length > 0) {
          setMovimientos(movs);
        } else {
          const local = localStorage.getItem('teslafire_movimientos_inventario');
          if (local) {
            setMovimientos(JSON.parse(local));
          } else {
            setMovimientos(defaultMovimientosDemo);
            localStorage.setItem('teslafire_movimientos_inventario', JSON.stringify(defaultMovimientosDemo));
          }
        }
      } catch (err) {
        const local = localStorage.getItem('teslafire_movimientos_inventario');
        setMovimientos(local ? JSON.parse(local) : defaultMovimientosDemo);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTiendaId) {
      toast.error('Selecciona una tienda');
      return;
    }
    if (!modalProdId) {
      toast.error('Selecciona un producto');
      return;
    }
    if (modalCantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    setSaving(true);
    const storeObj = tiendas.find(t => t.id === modalTiendaId);
    const prodObj = productos.find(p => p.id === modalProdId);
    const refFinal = modalRef.trim() || `MOV-${Date.now().toString().slice(-6)}`;

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

      // 2. Registrar movimiento
      const newRecord: MovimientoItem = {
        id: crypto.randomUUID(),
        referencia: refFinal,
        tipo: modalTipo,
        motivo: modalMotivo,
        producto_id: modalProdId,
        producto_nombre: prodObj?.nombre || 'Producto',
        producto_sku: prodObj?.sku || 'SKU',
        tienda_id: modalTiendaId,
        tienda_nombre: storeObj?.nombre || 'Almacén Tesla Fire',
        cantidad: modalCantidad,
        usuario_nombre: 'Gerencia',
        notas: modalNotas.trim(),
        created_at: new Date().toISOString()
      };

      await supabase.from('movimientos_inventario').insert([newRecord]);

      const updated = [newRecord, ...movimientos];
      setMovimientos(updated);
      localStorage.setItem('teslafire_movimientos_inventario', JSON.stringify(updated));

      toast.success(`Movimiento ${refFinal} registrado con éxito`);
      setShowModal(false);
      setModalProdId('');
      setModalCantidad(1);
      setModalRef('');
      setModalNotas('');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error al registrar movimiento');
    } finally {
      setSaving(false);
    }
  };

  // Filtrado
  const filteredMovimientos = movimientos.filter(m => {
    // Buscar
    if (buscar.trim()) {
      const q = buscar.toLowerCase();
      const matchP = m.producto_nombre.toLowerCase().includes(q);
      const matchS = m.producto_sku.toLowerCase().includes(q);
      const matchR = m.referencia.toLowerCase().includes(q);
      if (!matchP && !matchS && !matchR) return false;
    }

    // Tipo
    if (tipo !== 'Todos' && m.tipo !== tipo) return false;

    // Motivo
    if (motivo !== 'Todos' && m.motivo !== motivo) return false;

    // Tienda
    if (tiendaFiltro !== 'Todas') {
      const storeObj = tiendas.find(t => t.id === tiendaFiltro);
      if (storeObj && m.tienda_nombre !== storeObj.nombre) return false;
    }

    // Rango fechas
    const f = m.created_at.split('T')[0];
    if (desde && f < desde) return false;
    if (hasta && f > hasta) return false;

    return true;
  });

  // KPIs
  const totalCount = filteredMovimientos.length;
  const salidasList = filteredMovimientos.filter(m => m.tipo === 'Salida');
  const salidasCount = salidasList.length;
  const salidasTotalQty = salidasList.reduce((acc, m) => acc + m.cantidad, 0);

  const entradasList = filteredMovimientos.filter(m => m.tipo === 'Entrada');
  const entradasCount = entradasList.length;
  const entradasTotalQty = entradasList.reduce((acc, m) => acc + m.cantidad, 0);

  const handleResetFiltros = () => {
    setBuscar('');
    setTipo('Todos');
    setMotivo('Todos');
    setTiendaFiltro('Todas');
    setDesde('2026-09-01');
    setHasta('2026-09-08');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          ENCABEZADO DE LA PÁGINA
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Entradas y Salidas
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Trazabilidad completa de todos los movimientos de inventario.
          </p>
        </div>

        {/* Botón + Nuevo Movimiento */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#343a40] hover:bg-[#23272b] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>+ Nuevo Movimiento</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          TARJETAS KPI SUPERIORES
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        
        {/* TOTAL */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs min-w-[150px] w-44">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
            TOTAL
          </span>
          <span className="text-3xl font-black text-gray-900 font-rajdhani block leading-none">
            {totalCount}
          </span>
          <span className="text-xs text-gray-400 font-medium mt-1 block">
            movimientos
          </span>
        </div>

        {/* SALIDA */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs min-w-[150px] w-44">
          <div className="inline-flex items-center gap-1 bg-red-50 text-red-600 rounded-full px-2 py-0.5 text-[10px] font-bold mb-1">
            <ArrowDown className="w-3 h-3" />
            <span>SALIDA</span>
          </div>
          <span className="text-3xl font-black text-gray-900 font-rajdhani block leading-none">
            {salidasCount}
          </span>
          <span className="text-xs font-bold text-red-500 font-rajdhani mt-1 block">
            -{salidasTotalQty}
          </span>
        </div>

        {/* ENTRADA (si aplica) */}
        {entradasCount > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs min-w-[150px] w-44">
            <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5 text-[10px] font-bold mb-1">
              <ArrowUp className="w-3 h-3" />
              <span>ENTRADA</span>
            </div>
            <span className="text-3xl font-black text-gray-900 font-rajdhani block leading-none">
              {entradasCount}
            </span>
            <span className="text-xs font-bold text-emerald-600 font-rajdhani mt-1 block">
              +{entradasTotalQty}
            </span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          BARRA DE FILTROS
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          
          {/* BUSCAR */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              BUSCAR
            </label>
            <input
              type="text"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Producto, referencia..."
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
            />
          </div>

          {/* TIPO */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              TIPO
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Entrada">Entrada</option>
              <option value="Salida">Salida</option>
            </select>
          </div>

          {/* MOTIVO */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              MOTIVO
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Venta regular (Factura Fiscal)">Venta regular (Factura Fiscal)</option>
              <option value="Venta regular (Nota de Entrega)">Venta regular (Nota de Entrega)</option>
              <option value="Consumo interno">Consumo interno</option>
              <option value="Traslado">Traslado</option>
              <option value="Ajuste de inventario">Ajuste de inventario</option>
              <option value="Compra a proveedor">Compra a proveedor</option>
            </select>
          </div>

          {/* TIENDA */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              TIENDA
            </label>
            <select
              value={tiendaFiltro}
              onChange={(e) => setTiendaFiltro(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white cursor-pointer"
            >
              <option value="Todas">Todas</option>
              {tiendas.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          {/* DESDE */}
          <div className="lg:col-span-1">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              DESDE
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full text-xs font-medium px-2 py-2.5 rounded-xl border border-gray-200 bg-white"
            />
          </div>

          {/* HASTA */}
          <div className="lg:col-span-1">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              HASTA
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full text-xs font-medium px-2 py-2.5 rounded-xl border border-gray-200 bg-white"
            />
          </div>

          {/* BOTONES ACCIÓN FILTRAR Y LIMPIAR */}
          <div className="lg:col-span-1 flex items-center gap-1.5">
            <button
              type="button"
              className="flex-1 py-2.5 px-3 bg-[#343a40] hover:bg-[#23272b] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center"
            >
              Filtrar
            </button>
            <button
              type="button"
              onClick={handleResetFiltros}
              className="p-2.5 border border-gray-200 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-xl transition-all"
              title="Limpiar filtros"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          LISTA DE MOVIMIENTOS
      ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        
        {/* Cabecera resumen de registros */}
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-4 pb-2 border-b border-gray-100">
          <span>{filteredMovimientos.length} registros</span>
          <span>{desde} → {hasta}</span>
        </div>

        {/* Lista de Registros */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-2" />
            <span className="text-xs text-gray-400 font-semibold">Cargando movimientos...</span>
          </div>
        ) : filteredMovimientos.length === 0 ? (
          <div className="py-20 text-center text-xs text-gray-400 font-medium">
            No se encontraron movimientos para los filtros seleccionados.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMovimientos.map((mov) => {
              const isSalida = mov.tipo === 'Salida';
              const fechaFormatted = new Date(mov.created_at).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={mov.id} 
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100/90 hover:border-gray-200 hover:bg-gray-50/50 transition-all bg-white"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Icono Redondo: Salida (flecha abajo rosa/rojo) o Entrada (flecha arriba verde) */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isSalida ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {isSalida ? (
                        <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    {/* Información Principal */}
                    <div className="min-w-0">
                      {/* Línea 1: Nombre + Pill Salida/Entrada */}
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                          {mov.producto_nombre}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isSalida ? 'bg-red-100/70 text-red-700' : 'bg-emerald-100/70 text-emerald-800'
                        }`}>
                          {mov.tipo}
                        </span>
                      </div>

                      {/* Línea 2: SKU · Tienda · Fecha · Usuario · Referencia Doc */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-gray-400 font-medium">
                        <span>{mov.producto_sku}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Building2 className="w-3 h-3 text-gray-400" />
                          {mov.tienda_nombre}
                        </span>
                        <span>·</span>
                        <span>{fechaFormatted}</span>
                        <span>·</span>
                        <span className="text-gray-500">{mov.usuario_nombre}</span>
                        {mov.referencia && (
                          <span className="ml-1 bg-gray-100 text-gray-600 font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-gray-200/60">
                            {mov.referencia}
                          </span>
                        )}
                      </div>

                      {/* Línea 3: Motivo */}
                      <div className="text-xs text-gray-500 mt-0.5">
                        {mov.motivo}
                      </div>
                    </div>
                  </div>

                  {/* Cantidad a la derecha */}
                  <div className="text-right shrink-0 pl-4">
                    <span className={`text-xl font-black font-rajdhani block leading-none ${
                      isSalida ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {isSalida ? `-${mov.cantidad}` : `+${mov.cantidad}`}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">
                      uds
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Nuevo Movimiento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900">Registrar Movimiento de Inventario</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCrearMovimiento} className="space-y-3.5 py-4">
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Movimiento *</label>
                  <select
                    value={modalTipo}
                    onChange={(e) => setModalTipo(e.target.value as 'Entrada' | 'Salida')}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Salida">Salida (Resta)</option>
                    <option value="Entrada">Entrada (Suma)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cantidad (uds) *</label>
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
                  <option value="Venta regular (Factura Fiscal)">Venta regular (Factura Fiscal)</option>
                  <option value="Venta regular (Nota de Entrega)">Venta regular (Nota de Entrega)</option>
                  <option value="Consumo interno">Consumo interno</option>
                  <option value="Traslado">Traslado</option>
                  <option value="Ajuste de inventario">Ajuste de inventario</option>
                  <option value="Compra a proveedor">Compra a proveedor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Referencia de Documento</label>
                <input
                  type="text"
                  value={modalRef}
                  onChange={(e) => setModalRef(e.target.value)}
                  placeholder="Ej: FFTF-000003 o NTF-000002"
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Observaciones</label>
                <input
                  type="text"
                  value={modalNotas}
                  onChange={(e) => setModalNotas(e.target.value)}
                  placeholder="Notas adicionales..."
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#343a40] hover:bg-black text-white rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Guardar Movimiento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
