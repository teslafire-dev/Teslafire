import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Receipt, 
  LogOut, 
  ShoppingCart, 
  Building2, 
  Menu, 
  X, 
  CreditCard, 
  DollarSign, 
  ChevronRight,
  Trash2,
  Send,
  Loader2,
  Check
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useB2BCartStore } from '@/lib/store/b2bCartStore';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function PortalLayout() {
  const { empresa_slug } = useParams<{ empresa_slug: string }>();
  const { user, loading, role, clienteData, refreshProfile, empresa_id } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, getIva, getTotal, getTotalItems } = useB2BCartStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [condicionPago, setCondicionPago] = useState<'CREDITO' | 'CONTADO'>('CREDITO');
  const [notasPedido, setNotasPedido] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Cliente info dinámico
  const [currentCliente, setCurrentCliente] = useState<any>(clienteData || null);
  const [loadingCliente, setLoadingCliente] = useState(!clienteData);

  const [tiendaPublicaActiva, setTiendaPublicaActiva] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Cargar configuración de tienda pública del tenant
  useEffect(() => {
    const fetchConfig = async () => {
      if (!empresa_slug) return;
      try {
        const { data } = await supabase
          .from('empresas')
          .select('tienda_publica_activa')
          .eq('slug', empresa_slug)
          .maybeSingle();
        if (data) {
          setTiendaPublicaActiva(data.tienda_publica_activa || false);
        }
      } catch (err) {
        console.error('Error verificando configuración:', err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, [empresa_slug]);

  // Redirigir a login si no hay sesión Y la tienda NO es pública
  useEffect(() => {
    if (loading || loadingConfig) return;

    if (!user && !tiendaPublicaActiva) {
      navigate(`/${empresa_slug}/portal/login`);
      return;
    }

    if (user && !currentCliente) {
      // Intenta cargar cliente
    }
  }, [user, loading, loadingConfig, tiendaPublicaActiva, currentCliente, empresa_slug, navigate]);

  useEffect(() => {
    const fetchClienteInfo = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setCurrentCliente(data);
        } else if (clienteData) {
          setCurrentCliente(clienteData);
        }
      } catch (err) {
        console.error('Error cargando cliente B2B:', err);
      } finally {
        setLoadingCliente(false);
      }
    };

    fetchClienteInfo();
  }, [user, loading, clienteData, navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión finalizada');
      navigate(`/${empresa_slug}/portal/login`);
    } catch (err) {
      console.error(err);
    }
  };

  const baseNavItems = [
    { name: 'Catálogo de Productos', path: `/${empresa_slug}/portal/catalogo`, icon: Package },
  ];

  const privateNavItems = [
    { name: 'Resumen Financiero', path: `/${empresa_slug}/portal/dashboard`, icon: LayoutDashboard },
    { name: 'Mis Pedidos / Cotizaciones', path: `/${empresa_slug}/portal/pedidos`, icon: FileText },
    { name: 'Mis Facturas', path: `/${empresa_slug}/portal/facturas`, icon: Receipt },
  ];

  const navItems = user ? [...privateNavItems.slice(0,1), ...baseNavItems, ...privateNavItems.slice(1)] : baseNavItems;

  // Enviar pedido / cotización B2B
  const handleCrearPedidoB2B = async () => {
    if (items.length === 0) {
      toast.error('El carrito mayorista está vacío');
      return;
    }

    if (!user) {
      // Flujo B2C (Invitado): Enviar pedido por WhatsApp
      try {
        const { data: configData } = await supabase
          .from('configuracion')
          .select('valor')
          .eq('clave', 'telefono_whatsapp')
          .maybeSingle();

        const phone = configData?.valor || '584123419669'; // Default si no hay en DB
        
        let msg = `*NUEVO PEDIDO DESDE TIENDA ONLINE*\n\n`;
        items.forEach(it => {
          msg += `• ${it.cantidad}x ${it.nombre} ($${it.precio_venta} c/u)\n`;
        });
        msg += `\n*Total estimado: $${getTotal().toFixed(2)}*`;
        if (notasPedido) msg += `\n\n*Notas:* ${notasPedido}`;

        const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        
        clearCart();
        setCartDrawerOpen(false);
        setNotasPedido('');
        toast.success('Pedido enviado por WhatsApp');
      } catch (err) {
        console.error('Error enviando WhatsApp', err);
      }
      return;
    }

    setSubmittingOrder(true);
    try {
      const subtotal = getSubtotal();
      const iva = getIva();
      const total = getTotal();
      const numeroPedido = `PED-B2B-${Date.now().toString().slice(-6)}`;

      const { data: orderData, error: orderError } = await supabase
        .from('pedidos_b2b')
        .insert([
          {
            numero: numeroPedido,
            cliente_id: currentCliente?.id || null,
            user_id: user.id,
            cliente_nombre: currentCliente?.nombre || user.user_metadata?.nombre_completo || 'EMPRESA B2B',
            cliente_documento: currentCliente?.documento || 'J-00000000',
            cliente_telefono: currentCliente?.telefono || '',
            cliente_email: user.email || '',
            cliente_direccion: currentCliente?.direccion || '',
            estado: 'PENDIENTE',
            condicion_pago: condicionPago,
            subtotal_usd: subtotal,
            iva_usd: iva,
            total_usd: total,
            tasa_bcv: 36.50,
            total_bs: total * 36.50,
            notas: notasPedido.trim(),
            creado_por: 'CLIENTE_PORTAL',
            empresa_id: empresa_id
          }
        ])
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Insertar items
      if (orderData && orderData.id) {
        const orderItems = items.map((it) => ({
          pedido_id: orderData.id,
          producto_id: it.id,
          sku: it.sku,
          nombre: it.nombre,
          cantidad: it.cantidad,
          precio_unitario: it.precio_mayor,
          subtotal: it.precio_mayor * it.cantidad
        }));

        const { error: itemsError } = await supabase
          .from('pedido_b2b_items')
          .insert(orderItems);

        if (itemsError) {
          console.warn('Error insertando items de pedido B2B', itemsError);
        }
      }

      toast.success(`¡Solicitud ${numeroPedido} registrada exitosamente!`);
      clearCart();
      setCartDrawerOpen(false);
      setNotasPedido('');
      navigate('/portal/pedidos');
    } catch (err: any) {
      console.error('Error generando pedido B2B:', err);
      toast.error(err.message || 'Error al procesar la solicitud de pedido');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const totalCartCount = getTotalItems();

  const limiteCredito = Number(currentCliente?.limite_credito || 0);
  const diasCredito = Number(currentCliente?.dias_credito || 0);

  if (loading || loadingCliente) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Cargando Portal B2B...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* CABECERA SUPERIOR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        
        {/* Logo e Info de la Empresa */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/portal/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center font-black text-white text-base shadow-md shadow-indigo-500/20">
              TF
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-black tracking-tight text-slate-900 block leading-none">TESLA FIRE</span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-indigo-600">PORTAL B2B</span>
            </div>
          </Link>
        </div>

        {/* Info central de la empresa cliente */}
        {user ? (
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="font-bold text-slate-900 block leading-none">
                  {currentCliente?.nombre || user?.email?.split('@')[0] || 'Empresa Cliente'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {currentCliente?.documento || 'RIF En Trámite'}
                </span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] text-slate-500 block leading-none">Línea de Crédito</span>
                <span className="font-black text-slate-900 font-mono text-xs">
                  ${limiteCredito.toFixed(2)} USD ({diasCredito} días)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-xl">
              Catálogo Abierto
            </span>
          </div>
        )}

        {/* Acciones derecha: Carrito B2B y Salir */}
        <div className="flex items-center gap-3">
          {/* Botón Carrito */}
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            className="relative px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">{user ? 'Pedido B2B' : 'Mi Carrito'}</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Botón Salir o Iniciar Sesión */}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar Sesión B2B"
              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <Link
              to={`/${empresa_slug}/portal/login`}
              className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Iniciar Sesión B2B
            </Link>
          )}
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <div className="flex-1 flex">
        
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white p-4 shrink-0">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Soporte Mayorista
              </span>
              <p className="text-[11px] text-slate-600">
                Atención preferencial a distribuidores y compras al mayor.
              </p>
            </div>
            <Link
              to="/productos"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-[11px]"
            >
              <span>Ver Web Pública</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* MENU MOBILE OVERLAY */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden flex">
            <div className="w-72 bg-white h-full p-5 border-r border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Menú Portal B2B</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems.map((item) => {
                    const active = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 text-red-400 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
          </div>
        )}

        {/* CONTENIDO DE LA PÁGINA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet context={{ currentCliente, refreshProfile }} />
        </main>
      </div>

      {/* DRAWER DEL CARRITO B2B / SOLICITUD DE PEDIDO */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            
            {/* Header Drawer */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Solicitud de Pedido Mayorista
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCartDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {items.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-3">
                  <Package className="w-12 h-12 mx-auto text-slate-700" />
                  <p className="text-xs font-semibold">No has agregado productos al pedido</p>
                  <Link
                    to="/portal/catalogo"
                    onClick={() => setCartDrawerOpen(false)}
                    className="inline-block text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Explorar Catálogo con Precios de Mayor →
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.nombre}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.sku} · ${item.precio_mayor.toFixed(2)} USD c/u
                      </span>
                    </div>

                    {/* Selector Cantidad */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-xs font-mono font-black text-indigo-600 border-x border-slate-200">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        title="Eliminar item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Opciones y Footer del Pedido */}
            {items.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 space-y-3">
                
                {/* Condición de Pago */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Condición Solicitada
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCondicionPago('CREDITO')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        condicionPago === 'CREDITO'
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                          : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      A Crédito ({diasCredito} días)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCondicionPago('CONTADO')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        condicionPago === 'CONTADO'
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                          : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      De Contado
                    </button>
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <input
                    type="text"
                    value={notasPedido}
                    onChange={(e) => setNotasPedido(e.target.value)}
                    placeholder="Instrucciones o notas adicionales (opcional)..."
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Subtotales */}
                <div className="space-y-1 pt-1 text-xs border-t border-slate-800/80">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Mayorista:</span>
                    <span className="font-mono font-bold">${getSubtotal().toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IVA (16%):</span>
                    <span className="font-mono font-bold">${getIva().toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-slate-800/60">
                    <span>Total Estimado:</span>
                    <span className="font-mono text-cyan-400">${getTotal().toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Botón Emitir */}
                <button
                  type="button"
                  disabled={submittingOrder}
                  onClick={handleCrearPedidoB2B}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 hover:from-cyan-400 to-blue-600 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Procesando Solicitud...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Solicitud de Pedido</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
