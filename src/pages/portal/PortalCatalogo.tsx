import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  ShoppingCart, 
  Check, 
  Plus, 
  Minus, 
  Tag, 
  Layers, 
  ShieldCheck, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useB2BCartStore } from '@/lib/store/b2bCartStore';
import toast from 'react-hot-toast';

export default function PortalCatalogo() {
  const { addItem, items: cartItems } = useB2BCartStore();
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [cantidades, setCantidades] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar categorías
        const { data: catData } = await supabase
          .from('categorias')
          .select('id, nombre, slug')
          .order('nombre');
        if (catData) setCategorias(catData);

        // Cargar productos
        const { data: prodData } = await supabase
          .from('productos')
          .select('*')
          .eq('activo', true)
          .order('nombre');

        if (prodData) {
          setProductos(prodData);
        }
      } catch (err) {
        console.error('Error cargando catálogo B2B:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCantidadChange = (prodId: string, val: number) => {
    setCantidades((prev) => ({
      ...prev,
      [prodId]: Math.max(1, val)
    }));
  };

  const handleAdd = (prod: any) => {
    const qty = cantidades[prod.id] || 1;
    const precioMayor = Number(prod.precio_mayor) > 0 ? Number(prod.precio_mayor) : Number(prod.precio) * 0.85;

    addItem(
      {
        id: prod.id,
        sku: prod.sku || 'SIN-SKU',
        nombre: prod.nombre,
        precio_mayor: precioMayor,
        precio_detal: Number(prod.precio),
        unidad_medida: prod.unidad_medida || 'UND',
        imagen: prod.imagenes_urls?.[0] || ''
      },
      qty
    );

    toast.success(`Se agregaron ${qty}x ${prod.nombre} al pedido mayorista`);
  };

  const filteredProductos = productos.filter((p) => {
    if (categoriaSeleccionada !== 'todas' && p.categoria_id !== categoriaSeleccionada) {
      return false;
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const matchNombre = p.nombre.toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      if (!matchNombre && !matchSku) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Tarifario Corporativo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Catálogo con Precios Mayoristas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Precios especiales por volumen para instaladores, distribuidores y empresas aliadas.
          </p>
        </div>

        {/* Buscador */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Filtros de Categoría */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setCategoriaSeleccionada('todas')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            categoriaSeleccionada === 'todas'
              ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Todas las Categorías
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoriaSeleccionada(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              categoriaSeleccionada === cat.id
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Grid de Productos */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="text-xs uppercase tracking-wider font-bold">Cargando catálogo mayorista...</span>
        </div>
      ) : filteredProductos.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <Package className="w-12 h-12 mx-auto text-slate-700 mb-2" />
          <p className="text-sm font-bold text-slate-300">No se encontraron productos</p>
          <p className="text-xs text-slate-500 mt-1">Prueba cambiando los términos de búsqueda o la categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProductos.map((prod) => {
            const precioDetal = Number(prod.precio || 0);
            const precioMayor = Number(prod.precio_mayor) > 0 ? Number(prod.precio_mayor) : precioDetal * 0.85;
            const ahorro = precioDetal > precioMayor ? Math.round(((precioDetal - precioMayor) / precioDetal) * 100) : 0;
            const currentQty = cantidades[prod.id] || 1;
            const inCart = cartItems.find((i) => i.id === prod.id);

            return (
              <div
                key={prod.id}
                className="bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 rounded-3xl p-4 flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Imagen y Badges */}
                  <div className="aspect-square rounded-2xl bg-slate-950/80 border border-slate-800/60 overflow-hidden relative flex items-center justify-center p-3 mb-3">
                    {prod.imagenes_urls?.[0] ? (
                      <img
                        src={prod.imagenes_urls[0]}
                        alt={prod.nombre}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-slate-800" />
                    )}

                    {ahorro > 0 && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-cyan-500 text-slate-950 font-black text-[10px] tracking-tight">
                        -{ahorro}% B2B
                      </span>
                    )}

                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-slate-900/90 text-slate-400 font-mono text-[10px] border border-slate-800">
                      {prod.sku}
                    </span>
                  </div>

                  {/* Nombre y descripción */}
                  <h3 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                    {prod.nombre}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium">
                    Unidad: <span className="text-slate-400">{prod.unidad_medida || 'UND'}</span>
                  </p>
                </div>

                {/* Precios y Botón */}
                <div className="pt-4 mt-3 border-t border-slate-800/60 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block leading-none mb-0.5">
                        Precio Mayor
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black font-mono text-white">
                          ${precioMayor.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">USD</span>
                      </div>
                    </div>

                    {precioDetal > precioMayor && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block leading-none">Detal</span>
                        <span className="text-xs text-slate-500 line-through font-mono font-medium">
                          ${precioDetal.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Selector Cantidad y Botón Añadir */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950 overflow-hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCantidadChange(prod.id, currentQty - 1)}
                        className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={currentQty}
                        onChange={(e) => handleCantidadChange(prod.id, parseInt(e.target.value) || 1)}
                        className="w-10 text-center text-xs font-mono font-bold bg-transparent text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCantidadChange(prod.id, currentQty + 1)}
                        className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdd(prod)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        inCart
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/10'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{inCart ? `En Pedido (${inCart.cantidad})` : '+ Añadir'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
