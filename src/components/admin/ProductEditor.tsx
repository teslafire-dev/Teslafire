import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  Image as ImageIcon, 
  Trash2, 
  Search, 
  Scale, 
  Building2, 
  DollarSign, 
  Settings, 
  AlertTriangle, 
  Check, 
  Loader2, 
  Upload
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface ProductEditorProps {
  product?: any | null; // Si es null, es modo Crear
  onBack: () => void;
  onSaved: () => void;
}

export default function ProductEditor({ product, onBack, onSaved }: ProductEditorProps) {
  const isEditing = Boolean(product && product.id);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);

  // Estados de Imagen
  const [imageUrl, setImageUrl] = useState<string>(product?.imagen_url || product?.imagenes_urls?.[0] || '');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [tempUrlInput, setTempUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formulario Completo de Tesla Fire
  const [form, setForm] = useState({
    sku: product?.sku || '',
    nombre: product?.nombre || '',
    codigo_barra: product?.codigo_barra || '',
    descripcion: product?.descripcion || '',
    peso_kg: product?.peso_kg ?? 0.000,
    dimensiones: product?.dimensiones || '',
    ubicacion_almacen: product?.ubicacion_almacen || '',
    clasificacion_origen: product?.clasificacion_origen || 'Fabricación Nacional',
    unidades_por_caja: product?.unidades_por_caja ?? 1,
    categoria_id: product?.categoria_id || '',
    grupo_nombre: product?.grupo_nombre || 'Extintores CO2',
    proveedor_nombre: product?.proveedor_nombre || '',
    marca_nombre: product?.marca_nombre || 'Tesla Fire',
    marca_id: product?.marca_id || '',
    
    // Costos y Precios
    costo: product?.costo_promedio ?? (product?.costo ?? 115.00),
    precio_divisas: product?.precio ?? 190.00,
    precio_detal_bcv: product?.precio_detal_bcv ?? 233.72,
    precio_mayor: product?.precio_mayor ?? 167.20,
    precio_credito: product?.precio_credito ?? 0.00,
    tratamiento_iva: product?.tratamiento_iva || 'General — 16,00%',
    
    // Configuración
    punto_reposicion: product?.stock_minimo ?? 4,
    garantia_meses: product?.garantia_meses ?? 0,
    es_servicio: Boolean(product?.es_servicio),
    es_varios: Boolean(product?.es_varios),
    bloquear_mayor: Boolean(product?.bloquear_mayor)
  });

  // Factor de cálculo automático Detal BCV (Divisas * factor)
  const factorParalelaBcv = 1.2301;

  useEffect(() => {
    fetchAuxData();
  }, []);

  const fetchAuxData = async () => {
    try {
      const [{ data: cats }, { data: marks }] = await Promise.all([
        supabase.from('categorias').select('id, nombre, slug').order('nombre'),
        supabase.from('marcas').select('id, nombre').order('nombre')
      ]);
      if (cats) setCategorias(cats);
      if (marks) setMarcas(marks);
    } catch (err) {
      console.error('Error fetching aux data:', err);
    }
  };

  // Actualizar Detal BCV automáticamente cuando cambia Divisas Detal
  const handlePrecioDivisasChange = (val: number) => {
    const autoBcv = Number((val * factorParalelaBcv).toFixed(2));
    setForm(prev => ({
      ...prev,
      precio_divisas: val,
      precio_detal_bcv: autoBcv
    }));
  };

  // Cálculo dinámico de márgenes de ganancia sobre el costo
  const calcMargen = (precio: number) => {
    if (!form.costo || form.costo <= 0) return 0;
    return Math.round(((precio - form.costo) / form.costo) * 100);
  };

  const margenDivisas = calcMargen(form.precio_divisas);
  const margenDetal = calcMargen(form.precio_detal_bcv);
  const margenMayor = calcMargen(form.precio_mayor);
  const margenCredito = form.precio_credito > 0 ? calcMargen(form.precio_credito) : -100;

  const hayPrecioBajoCosto = 
    (form.precio_divisas > 0 && form.precio_divisas < form.costo) ||
    (form.precio_mayor > 0 && form.precio_mayor < form.costo) ||
    (form.precio_detal_bcv > 0 && form.precio_detal_bcv < form.costo);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
      toast.success('Imagen cargada localmente');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!tempUrlInput.trim()) return;
    setImageUrl(tempUrlInput.trim());
    setShowUrlModal(false);
    setTempUrlInput('');
    toast.success('Enlace de imagen asignado');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku.trim()) {
      toast.error('El código SKU es obligatorio');
      return;
    }
    if (!form.nombre.trim()) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        sku: form.sku.trim(),
        nombre: form.nombre.trim(),
        codigo_barra: form.codigo_barra.trim() || form.sku.trim(),
        descripcion: form.descripcion,
        precio: Number(form.precio_divisas),
        costo_promedio: Number(form.costo),
        precio_mayor: Number(form.precio_mayor),
        stock_minimo: Number(form.punto_reposicion),
        es_servicio: form.es_servicio,
        es_varios: form.es_varios,
        activo: true,
        updated_at: new Date().toISOString()
      };

      if (imageUrl) {
        payload.imagenes_urls = [imageUrl];
      }

      if (form.categoria_id) {
        payload.categoria_id = form.categoria_id;
      }

      if (form.marca_id) {
        payload.marca_id = form.marca_id;
      }

      // Campos extendidos de Tesla Fire
      payload.precio_detal_bcv = Number(form.precio_detal_bcv);
      payload.precio_credito = Number(form.precio_credito);
      payload.tratamiento_iva = form.tratamiento_iva;
      payload.peso_kg = Number(form.peso_kg);
      payload.dimensiones = form.dimensiones;
      payload.ubicacion_almacen = form.ubicacion_almacen;
      payload.clasificacion_origen = form.clasificacion_origen;
      payload.unidades_por_caja = Number(form.unidades_por_caja);
      payload.garantia_meses = Number(form.garantia_meses);
      payload.bloquear_mayor = form.bloquear_mayor;
      payload.proveedor_nombre = form.proveedor_nombre;

      let error;
      if (isEditing) {
        const res = await supabase.from('productos').update(payload).eq('id', product.id);
        error = res.error;
      } else {
        payload.created_at = new Date().toISOString();
        const res = await supabase.from('productos').insert([payload]);
        error = res.error;
      }

      if (error) {
        // Si falló por alguna columna que no existe en BD, reintentamos con los campos base garantizados
        console.warn('Fallo guardado extendido, guardando campos estándar:', error.message);
        const basePayload = {
          sku: payload.sku,
          nombre: payload.nombre,
          codigo_barra: payload.codigo_barra,
          descripcion: payload.descripcion,
          precio: payload.precio,
          costo_promedio: payload.costo_promedio,
          precio_mayor: payload.precio_mayor,
          stock_minimo: payload.stock_minimo,
          es_servicio: payload.es_servicio,
          es_varios: payload.es_varios,
          imagenes_urls: payload.imagenes_urls || []
        };

        const fallbackRes = isEditing
          ? await supabase.from('productos').update(basePayload).eq('id', product.id)
          : await supabase.from('productos').insert([basePayload]);

        if (fallbackRes.error) throw fallbackRes.error;
      }

      toast.success(isEditing ? '¡Producto actualizado con éxito!' : '¡Producto creado con éxito!');
      onSaved();
    } catch (err: any) {
      console.error('Error al guardar producto:', err);
      toast.error(err.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 animate-in fade-in duration-200 font-sans">
      {/* Barra Superior / Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-rajdhani tracking-wide">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <p className="text-xs font-semibold text-gray-500 mt-0.5">
            {isEditing ? 'Modifica los datos del artículo.' : 'Registra un nuevo artículo en el catálogo.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al listado
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ══════════════════════════════════════════════════
            COLUMNA IZQUIERDA (7 Columnas): Foto, Identificación, Físicas, Origen
        ══════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Foto del Producto */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
                <ImageIcon className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Foto del Producto</h2>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50 min-h-[220px] relative group">
              {imageUrl ? (
                <div className="relative flex flex-col items-center">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-44 max-w-full object-contain rounded-xl shadow-sm bg-white p-2 border border-gray-100"
                  />
                  <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-gray-500">
                    <span>Mantener foto actual.</span>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-red-500 hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Quitar Foto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-2">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 block">No hay foto asignada</span>
                  <span className="text-[10px] text-gray-400">Puedes subir un archivo o pegar un enlace web</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUrlModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 shadow-sm transition-all"
              >
                <Search className="w-3.5 h-3.5 text-gray-400" />
                Buscar foto en internet / Pegar URL
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-all flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5 text-gray-500" />
                Subir Archivo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Card 2: Identificación */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
                <Search className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Identificación</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Código de Producto (SKU)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                    disabled={isEditing}
                    className={`w-full text-xs font-semibold px-3 py-2.5 rounded-xl border transition-all ${
                      isEditing 
                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed pr-9' 
                        : 'bg-white text-gray-900 border-gray-200 focus:outline-none focus:border-brand-500'
                    }`}
                    placeholder="Ej: EXT-CO2-15"
                  />
                  {isEditing && (
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  El código no puede cambiarse una vez asignado, para evitar SKU duplicados.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  placeholder="Ej: Extintor CO2 15 Lbs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Código de Barra
                </label>
                <input
                  type="text"
                  value={form.codigo_barra}
                  onChange={(e) => setForm({ ...form, codigo_barra: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  placeholder="Ej: EXT-CO2-15 o código EAN"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Descripción o Notas
                </label>
                <textarea
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  placeholder="Detalles técnicos, especificaciones, certificaciones..."
                />
              </div>
            </div>
          </div>

          {/* Card 3: Características Físicas */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Scale className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Características Físicas</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={form.peso_kg}
                  onChange={(e) => setForm({ ...form, peso_kg: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  placeholder="0.000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Dimensiones
                </label>
                <input
                  type="text"
                  value={form.dimensiones}
                  onChange={(e) => setForm({ ...form, dimensiones: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  placeholder="Ej: 10x10x5 cm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ubicación en almacén · principal
                </label>
                <input
                  type="text"
                  value={form.ubicacion_almacen}
                  onChange={(e) => setForm({ ...form, ubicacion_almacen: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  placeholder="Ej: Pasillo 1, Paleta 4"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Clasificación
                </label>
                <select
                  value={form.clasificacion_origen}
                  onChange={(e) => setForm({ ...form, clasificacion_origen: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                >
                  <option value="Fabricación Nacional">Fabricación Nacional</option>
                  <option value="Producto Importado">Producto Importado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Unidades por caja
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.unidades_por_caja}
                  onChange={(e) => setForm({ ...form, unidades_por_caja: parseInt(e.target.value) || 1 })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Clasificación Comercial / Origen */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Clasificación Comercial / Origen</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Grupo
                </label>
                <select
                  value={form.categoria_id}
                  onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                >
                  <option value="">-- Sin grupo --</option>
                  <option value="ext_pqs">Extintores PQS</option>
                  <option value="ext_co2">Extintores CO2</option>
                  <option value="ext_esp">Extintores Especiales</option>
                  <option value="repuestos">Repuestos y Accesorios</option>
                  <option value="deteccion">Detección y Alarma</option>
                  <option value="senalizacion">Señalización y Seguridad</option>
                  <option value="servicios">Servicios</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Proveedor Asignado
                </label>
                <input
                  type="text"
                  value={form.proveedor_nombre}
                  onChange={(e) => setForm({ ...form, proveedor_nombre: e.target.value })}
                  placeholder="Buscar Proveedor..."
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Marca
                </label>
                <select
                  value={form.marca_nombre}
                  onChange={(e) => setForm({ ...form, marca_nombre: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                >
                  <option value="">-- Sin marca --</option>
                  <option value="Tesla Fire">Tesla Fire</option>
                  <option value="Amerex">Amerex</option>
                  <option value="Kidde">Kidde</option>
                  <option value="Ansul">Ansul</option>
                  <option value="Buckeye">Buckeye</option>
                  <option value="Badger">Badger</option>
                  <option value="Bosch">Bosch</option>
                  <option value="Genérico">Genérico</option>
                  {marcas.map(m => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            COLUMNA DERECHA (5 Columnas): Costos y Precios, Configuración
        ══════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 5: Costos y Precios */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Costos y Precios</h2>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                Independiente
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Costo */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Costo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.costo}
                    onChange={(e) => setForm({ ...form, costo: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs font-semibold pl-7 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white text-right font-rajdhani text-sm font-bold"
                  />
                </div>
              </div>

              {/* Divisas Detal USD (Precio Líder) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    Divisas <span className="text-gray-400 font-normal">Detal USD *</span>
                  </label>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-gray-900 text-white rounded tracking-widest uppercase">
                    PRECIO LÍDER
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precio_divisas}
                    onChange={(e) => handlePrecioDivisasChange(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold pl-7 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white text-right font-rajdhani text-base font-extrabold text-gray-900"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Se teclea a mano. Es la base de los demás precios.
                </p>
              </div>

              {/* Detal BCV en $ (Automático) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Detal BCV <span className="text-gray-400 font-normal">en $ ·</span> <span className="text-emerald-600 font-bold">automático</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precio_detal_bcv}
                    onChange={(e) => setForm({ ...form, precio_detal_bcv: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs pl-7 pr-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50/40 text-right font-rajdhani text-base font-extrabold text-emerald-700 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                  En dólares, no en bolívares. Divisas × 1,2301 (paralela ÷ BCV); al facturar se multiplica por la tasa BCV.
                </p>
              </div>

              {/* Mayor */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mayor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precio_mayor}
                    onChange={(e) => setForm({ ...form, precio_mayor: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs font-semibold pl-7 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white text-right font-rajdhani text-sm font-bold"
                  />
                </div>
              </div>

              {/* Crédito */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Crédito</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precio_credito}
                    onChange={(e) => setForm({ ...form, precio_credito: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs font-semibold pl-7 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white text-right font-rajdhani text-sm font-bold"
                  />
                </div>
              </div>

              {/* Tratamiento de IVA */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Tratamiento de IVA</label>
                <select
                  value={form.tratamiento_iva}
                  onChange={(e) => setForm({ ...form, tratamiento_iva: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                >
                  <option value="General — 16,00%">General — 16,00%</option>
                  <option value="Reducida — 8,00%">Reducida — 8,00% (alimentos, primera necesidad)</option>
                  <option value="Suntuario — 31,00%">Suntuario — 31,00% (bienes de lujo)</option>
                  <option value="Exento — no grava">Exento — no grava</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                  Los precios de arriba van sin IVA: la tasa se suma al facturar. Los renglones exentos salen marcados con (E) en la factura.
                </p>
              </div>

              {/* Margen de ganancia sobre el costo */}
              <div className="pt-3 border-t border-gray-100">
                <span className="block text-[11px] font-bold text-gray-700 mb-2">
                  Margen de ganancia sobre el costo
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-1.5">
                    <span className="text-[9px] text-gray-400 font-bold block">Divisas</span>
                    <span className={`text-xs font-black font-rajdhani ${margenDivisas >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {margenDivisas >= 0 ? `+${margenDivisas}%` : `${margenDivisas}%`}
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-1.5">
                    <span className="text-[9px] text-gray-400 font-bold block">Detal</span>
                    <span className={`text-xs font-black font-rajdhani ${margenDetal >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {margenDetal >= 0 ? `+${margenDetal}%` : `${margenDetal}%`}
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-1.5">
                    <span className="text-[9px] text-gray-400 font-bold block">Mayor</span>
                    <span className={`text-xs font-black font-rajdhani ${margenMayor >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {margenMayor >= 0 ? `+${margenMayor}%` : `${margenMayor}%`}
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-1.5">
                    <span className="text-[9px] text-gray-400 font-bold block">Crédito</span>
                    <span className={`text-xs font-black font-rajdhani ${margenCredito >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {margenCredito >= 0 ? `+${margenCredito}%` : `${margenCredito}%`}
                    </span>
                  </div>
                </div>

                {hayPrecioBajoCosto && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-600 font-semibold leading-tight">
                      <b>Ojo:</b> hay precios por debajo del costo. El sistema bloquea vender así.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 6: Configuración */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
                <Settings className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Configuración</h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-0.5">
                Alerta Punto de Reposición
              </label>
              <p className="text-[10px] text-gray-400 mb-1.5 leading-snug">
                El sistema te alertará (Stock Crítico) cuando la cantidad física llegue a este número.
              </p>
              <input
                type="number"
                min="0"
                value={form.punto_reposicion}
                onChange={(e) => setForm({ ...form, punto_reposicion: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white text-right font-rajdhani text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-0.5">
                Garantía (meses)
              </label>
              <p className="text-[10px] text-gray-400 mb-1.5 leading-snug">
                Tiempo de garantía del producto. 0 = sin garantía.
              </p>
              <input
                type="number"
                min="0"
                value={form.garantia_meses}
                onChange={(e) => setForm({ ...form, garantia_meses: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white text-right font-rajdhani text-sm font-bold"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-100">
              {/* Es un Servicio */}
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.es_servicio}
                  onChange={(e) => setForm({ ...form, es_servicio: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mt-1"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 group-hover:text-brand-600 transition-colors block">
                    Es un Servicio
                  </span>
                  <span className="text-[10px] text-gray-400 leading-snug block">
                    No maneja inventario ni stock. El precio se fija abajo (Precio 1) y aplica igual en cualquier canal.
                  </span>
                </div>
              </label>

              {/* Es Varios */}
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.es_varios}
                  onChange={(e) => setForm({ ...form, es_varios: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mt-1"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 group-hover:text-brand-600 transition-colors block">
                    Es Varios
                  </span>
                  <span className="text-[10px] text-gray-400 leading-snug block">
                    Sin precio ni inventario fijo. Cada vez que se agregue a una venta, se preguntará el precio.
                  </span>
                </div>
              </label>

              {/* No se vende al mayor */}
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.bloquear_mayor}
                  onChange={(e) => setForm({ ...form, bloquear_mayor: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mt-1"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 group-hover:text-brand-600 transition-colors block">
                    Este producto no se vende al mayor
                  </span>
                  <span className="text-[10px] text-gray-400 leading-snug block">
                    El producto conserva su precio en Divisas — sigue siendo la base con la que se calculan los demás. Lo que se bloquea es venderlo a ese precio: al cliente de canal Mayor se le cobrará el Precio 2 (Detal Divisas) en cualquier documento — factura, cotización, presupuesto, nota de entrega, pedido y portal del cliente. Divisas, Detal y Crédito no cambian.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 px-6 bg-brand-950 hover:bg-black text-white text-xs font-black font-rajdhani uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-electrico-400" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-electrico-400" />
                  {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              disabled={saving}
              className="py-3 px-6 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>

      {/* Modal para pegar URL de Imagen de Internet */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Buscar foto en internet / Pegar URL</h3>
            <p className="text-xs text-gray-500 mb-4">
              Pega el enlace directo (.jpg, .png, .webp) de la foto del producto:
            </p>
            <input
              type="url"
              value={tempUrlInput}
              onChange={(e) => setTempUrlInput(e.target.value)}
              placeholder="https://ejemplo.com/foto_extintor.jpg"
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUrlModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2 text-xs font-bold bg-brand-950 text-white rounded-xl shadow"
              >
                Aplicar Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
