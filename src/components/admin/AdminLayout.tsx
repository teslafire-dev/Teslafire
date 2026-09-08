import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  ShoppingCart, 
  CreditCard, 
  Building2, 
  FileText, 
  Settings, 
  BarChart3, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  Menu, 
  X, 
  Bell, 
  Store, 
  Search, 
  Truck, 
  Inbox, 
  RotateCcw, 
  Boxes, 
  ClipboardCheck, 
  SlidersHorizontal, 
  ArrowLeftRight, 
  AlertTriangle, 
  Users, 
  Receipt, 
  FileCheck, 
  DollarSign, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  BookOpen, 
  Tags, 
  Coins, 
  TrendingUp, 
  ShieldAlert, 
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import ModalSelectorDoc from './ModalSelectorDoc';

interface SubmenuItem {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  onClick?: (e: React.MouseEvent) => void;
}

interface NavSection {
  id: string;
  name: string;
  icon: React.ElementType;
  path?: string;
  subitems?: SubmenuItem[];
}

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, role, nombre_completo } = useAuth();
  const { usdRate } = useCurrency();

  // Estados de interfaz
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('inventario');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayName = nombre_completo || user?.email?.split('@')[0] || 'Gerencia';
  const displayRole = role === 'admin' ? 'Gerente' : (role === 'editor' ? 'Vendedor' : 'Staff');

  // Formato Tasa BCV
  const bcvDisplay = usdRate && usdRate > 0 ? usdRate.toFixed(2).replace('.', ',') : '804,81';

  // Listener global de F1 para Emitir Venta
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsDocModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cerrar notificaciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Expandir automáticamente el menú activo al cargar la ruta
  useEffect(() => {
    sections.forEach(sec => {
      if (sec.subitems?.some(sub => pathname.startsWith(sub.path))) {
        setExpandedSection(sec.id);
      }
    });
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada correctamente');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSection(prev => (prev === id ? null : id));
  };

  // ══════════════════════════════════════════════════════
  // DEFINICIÓN DE MENÚS Y SUBMÓDULOS DE TESLA FIRE
  // ══════════════════════════════════════════════════════
  const sections: NavSection[] = [
    {
      id: 'inventario',
      name: 'Inventario',
      icon: Boxes,
      subitems: [
        { id: 'productos', name: 'Productos', path: '/admin/inventario/productos', icon: Package },
        { id: 'kardex', name: 'Kardex / Buscador', path: '/admin/inventario/kardex', icon: Search },
        { id: 'solicitud_traslado', name: 'Solicitud de Traslado', path: '/admin/inventario/solicitud-traslado', icon: FileText },
        { id: 'solicitudes_recibidas', name: 'Solicitudes Recibidas', path: '/admin/inventario/solicitudes-recibidas', icon: Inbox, badge: '2', badgeColor: 'bg-red-500 animate-pulse' },
        { id: 'traslados', name: 'Traslados', path: '/admin/inventario/traslados', icon: Truck },
        { id: 'consumo_interno', name: 'Consumo Interno', path: '/admin/inventario/consumo-interno', icon: ArrowLeftRight },
        { id: 'auditoria', name: 'Auditoría Física', path: '/admin/inventario/auditoria', icon: ClipboardCheck },
        { id: 'auditoria_ajustes', name: 'Ajustes de Inventario', path: '/admin/inventario/ajustes', icon: SlidersHorizontal },
        { id: 'movimientos', name: 'Entradas / Salidas', path: '/admin/inventario/movimientos', icon: ArrowUpDown },
        { id: 'sugerencias', name: 'Alerta de Reposición', path: '/admin/inventario/reposicion', icon: AlertTriangle },
        { id: 'reportes_inv', name: 'Reportes', path: '/admin/inventario/reportes', icon: BarChart3 },
      ]
    },
    {
      id: 'ventas',
      name: 'Ventas',
      icon: ShoppingBag,
      subitems: [
        { id: 'clientes', name: 'Clientes', path: '/admin/ventas/clientes', icon: Users },
        { id: 'cotizacion', name: 'Cotización', path: '/admin/ventas/cotizacion', icon: FileText },
        { 
          id: 'emitir_venta', 
          name: 'Emitir Venta (F1)', 
          path: '#', 
          icon: ChevronRight, 
          onClick: (e) => { 
            e.preventDefault(); 
            setIsDocModalOpen(true); 
          } 
        },
        { id: 'nota_entrega', name: 'Nota de Entrega', path: '/admin/ventas/notas-entrega', icon: Receipt },
        { id: 'factura_fiscal', name: 'Factura Fiscal', path: '/admin/ventas/facturas', icon: FileCheck },
        { id: 'devoluciones', name: 'Devoluciones', path: '/admin/ventas/devoluciones', icon: RotateCcw },
        { id: 'caja', name: 'Caja y Turnos', path: '/admin/ventas/caja', icon: DollarSign },
        { id: 'reporte_vendedores', name: 'Reportes de Ventas', path: '/admin/ventas/reportes', icon: BarChart3 },
      ]
    },
    {
      id: 'compras',
      name: 'Compras',
      icon: ShoppingCart,
      subitems: [
        { id: 'compra_directa', name: 'Compra Directa', path: '/admin/compras/compra-directa', icon: ShoppingBag },
        { id: 'ordenes_compra', name: 'Órdenes de Compra', path: '/admin/compras/ordenes', icon: FileText },
        { id: 'mercancia_transito', name: 'Mercancía en Tránsito', path: '/admin/compras/transito', icon: Truck },
        { id: 'recepcion_mercancia', name: 'Recepción en Almacén', path: '/admin/compras/recepcion', icon: Inbox },
        { id: 'proveedores', name: 'Proveedores', path: '/admin/compras/proveedores', icon: Building2 },
      ]
    },
    {
      id: 'cxp',
      name: 'Cuentas por Pagar',
      icon: ArrowUpRight,
      subitems: [
        { id: 'pagos', name: 'Pagar a Proveedor', path: '/admin/cxp/pagos', icon: Wallet },
        { id: 'notas_credito', name: 'Notas de Crédito', path: '/admin/cxp/notas-credito', icon: FileCheck },
      ]
    },
    {
      id: 'cxc',
      name: 'Cuentas por Cobrar',
      icon: ArrowDownLeft,
      subitems: [
        { id: 'cxc_estado', name: 'Estado de Cuenta', path: '/admin/cxc/estado', icon: FileText },
        { id: 'cobros', name: 'Cobros', path: '/admin/cxc/cobros', icon: DollarSign },
        { id: 'notas_debito', name: 'Notas de Débito', path: '/admin/cxc/notas-debito', icon: FileCheck },
        { id: 'abonos', name: 'Historial de Cobros', path: '/admin/cxc/abonos', icon: Wallet },
      ]
    },
    {
      id: 'bancos',
      name: 'Bancos',
      icon: Building2,
      subitems: [
        { id: 'bancos_cuentas', name: 'Cuentas Bancarias', path: '/admin/bancos/cuentas', icon: Building2 },
        { id: 'bancos_flujo', name: 'Movimientos Bancarios', path: '/admin/bancos/movimientos', icon: ArrowLeftRight },
        { id: 'conciliacion', name: 'Conciliación Bancaria', path: '/admin/bancos/conciliacion', icon: ClipboardCheck, badge: '!', badgeColor: 'bg-amber-500' },
        { id: 'disponibilidad', name: 'Disponibilidad de Saldos', path: '/admin/bancos/disponibilidad', icon: DollarSign },
      ]
    },
    {
      id: 'contabilidad',
      name: 'Contabilidad',
      icon: BookOpen,
      subitems: [
        { id: 'retenciones', name: 'Retenciones', path: '/admin/fiscal/retenciones', icon: FileCheck },
        { id: 'txt_iva', name: 'Reporte TXT IVA', path: '/admin/fiscal/txt-iva', icon: FileText },
        { id: 'reporte_islr', name: 'Reporte ISLR', path: '/admin/fiscal/islr', icon: FileText },
        { id: 'iva_proveedor', name: 'Reporte IVA Proveedor', path: '/admin/fiscal/iva-proveedor', icon: Building2 },
        { id: 'libros_fiscales', name: 'Libros Compras/Ventas', path: '/admin/fiscal/libros', icon: BookOpen },
      ]
    },
    {
      id: 'administracion',
      name: 'Administración',
      icon: Building2,
      subitems: [
        { id: 'gastos', name: 'Gastos Operativos', path: '/admin/administracion/gastos', icon: Wallet },
        { id: 'reportes_admin', name: 'Reportes', path: '/admin/administracion/reportes', icon: BarChart3 },
      ]
    },
    {
      id: 'configuracion',
      name: 'Configuración',
      icon: Settings,
      subitems: [
        { id: 'empresa', name: 'Datos Empresa', path: '/admin/configuracion/empresa', icon: Building2 },
        { id: 'categorias', name: 'Gestión de Grupos', path: '/admin/configuracion/categorias', icon: Layers },
        { id: 'marcas', name: 'Gestión de Marcas', path: '/admin/configuracion/marcas', icon: Tags },
        { id: 'monedas', name: 'Monedas', path: '/admin/configuracion/monedas', icon: Coins },
        { id: 'precios', name: 'Configuración de Precios', path: '/admin/configuracion/precios', icon: DollarSign },
        { id: 'medios', name: 'Medios de Emisión', path: '/admin/configuracion/medios', icon: Receipt },
      ]
    },
    {
      id: 'analiticas',
      name: 'Analíticas',
      icon: BarChart3,
      subitems: [
        { id: 'informe_gerencial', name: 'Informe Gerencial', path: '/admin/analiticas/informe-gerencial', icon: FileText },
        { id: 'tablero_diario', name: 'Tablero Diario', path: '/admin/analiticas/tablero-diario', icon: TrendingUp },
        { id: 'lista_precios', name: 'Lista de Precios $', path: '/admin/analiticas/lista-precios', icon: DollarSign },
        { id: 'existencia_inventario', name: 'Existencia Inventario', path: '/admin/analiticas/existencia', icon: Boxes },
        { id: 'top_productos', name: 'Top Productos', path: '/admin/analiticas/top-productos', icon: TrendingUp },
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* ════════════════════════════════════
           SIDEBAR
      ════════════════════════════════════ */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shadow-xl lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'w-64'}`}
      >
        {/* Logo & Marca */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl px-2.5 py-1.5 bg-electrico-50 border border-electrico-200 flex items-center justify-center">
              <span className="font-extrabold text-xs tracking-wider text-brand-900 font-rajdhani">TESLA FIRE</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">v1.0.0</span>
            )}
          </div>
          {/* Botón cerrar móvil */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación Principal con Scroll */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar text-xs font-semibold">
          {/* Principal / Dashboard */}
          <div className="px-3 pt-2 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Principal</span>
          </div>
          
          <Link
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              pathname === '/admin' 
                ? 'bg-brand-900 text-white shadow-md shadow-brand-900/20' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-brand-900'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${pathname === '/admin' ? 'text-electrico-500' : 'text-gray-500'}`} />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </Link>

          {/* Secciones con Acordeón */}
          {sections.map((section) => {
            const isExpanded = expandedSection === section.id;
            const hasActiveChild = section.subitems?.some(sub => pathname.startsWith(sub.path));

            return (
              <div key={section.id} className="pt-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-left transition-all ${
                    hasActiveChild && !isExpanded 
                      ? 'bg-brand-50 text-brand-900 font-bold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <section.icon className={`w-4 h-4 flex-shrink-0 ${hasActiveChild ? 'text-electrico-600' : 'text-gray-500'}`} />
                    {!sidebarCollapsed && <span className="truncate">{section.name}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-brand-900' : ''}`} />
                  )}
                </button>

                {/* Submenú desplegable */}
                {isExpanded && !sidebarCollapsed && section.subitems && (
                  <div className="mt-1 ml-3 pl-3 border-l-2 border-gray-100 space-y-1">
                    {section.subitems.map((sub) => {
                      const isSubActive = pathname === sub.path;
                      
                      if (sub.onClick) {
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={(e) => {
                              sub.onClick?.(e);
                              setSidebarOpen(false);
                            }}
                            className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs font-bold text-electrico-700 hover:bg-electrico-50 transition-colors text-left"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <sub.icon className="w-3.5 h-3.5 text-electrico-600 flex-shrink-0" />
                              <span>{sub.name}</span>
                            </span>
                          </button>
                        );
                      }

                      return (
                        <Link
                          key={sub.id}
                          to={sub.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            isSubActive
                              ? 'bg-brand-900 text-white font-bold'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-brand-900 font-medium'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <sub.icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSubActive ? 'text-electrico-500' : 'text-gray-400'}`} />
                            <span className="truncate">{sub.name}</span>
                          </span>
                          {sub.badge && (
                            <span className={`text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full ${sub.badgeColor || 'bg-brand-500'}`}>
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Sistema / Logout */}
          <div className="px-3 pt-4 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sistema</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 text-red-500" />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </nav>

        {/* Usuario inferior */}
        <div className="p-3.5 border-t border-gray-100 bg-white flex items-center gap-3 flex-shrink-0">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg,#1B1F23,#080A0C)' }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden min-w-0">
              <div className="text-xs font-bold text-gray-800 truncate">{displayName}</div>
              <div className="text-[10px] text-gray-400 truncate">{displayRole}</div>
            </div>
          )}
        </div>
      </aside>

      {/* Backdrop móvil */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ════════════════════════════════════
           CONTENIDO PRINCIPAL Y HEADER
      ════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header Global Persistente */}
        <header className="flex-shrink-0 bg-white border-b border-gray-100 px-4 md:px-6 py-2.5 flex items-center gap-3 flex-wrap relative z-20 shadow-sm">
          {/* Botón menú móvil */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-brand-900 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Toggle sidebar desktop */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex text-gray-400 hover:text-brand-900 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            title="Colapsar / Expandir menú"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Tasa BCV Chip con Gradiente Oscuro */}
          <div 
            className="flex items-center gap-2 rounded-xl pl-2.5 pr-3 py-1.5 flex-shrink-0 shadow-sm"
            style={{ background: '#080A0C' }}
          >
            <span 
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-brand-900"
              style={{ background: 'linear-gradient(135deg,#00E5FF 0%,#0072FF 100%)' }}
            >
              Bs
            </span>
            <div className="leading-none">
              <div className="text-[8px] md:text-[9px] uppercase tracking-wider text-gray-400 font-bold">Tasa BCV</div>
              <div className="text-xs md:text-sm font-bold text-electrico-500 font-rajdhani">
                Bs {bcvDisplay}
              </div>
            </div>
          </div>

          <span className="w-px h-6 bg-gray-200 flex-shrink-0 hidden sm:block" />

          {/* Tienda actual */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <Store className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="leading-none">
              <div className="text-[8px] md:text-[9px] uppercase tracking-wider text-gray-400 font-bold">Tienda</div>
              <div className="text-xs md:text-sm font-bold text-gray-800">Tesla Fire</div>
            </div>
          </div>

          {/* Botón rápido Emitir Venta (F1) */}
          <button
            onClick={() => setIsDocModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-bold transition-all ml-auto shadow-sm"
          >
            <Receipt className="w-3.5 h-3.5 text-electrico-500" />
            <span>Emitir Venta</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-electrico-400 font-mono">F1</kbd>
          </button>

          {/* Campana de Notificaciones */}
          <div className="relative ml-auto md:ml-0" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-brand-900 transition-colors"
              title="Pendientes"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
                2
              </span>
            </button>

            {/* Panel flotante de pendientes */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <span className="text-xs font-bold text-gray-800">Pendientes</span>
                  <span className="text-[10px] text-gray-400">2 alertas activas</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 text-xs">
                  <div className="p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="font-bold text-red-600">Stock Crítico</div>
                    <div className="text-gray-500 text-[11px] mt-0.5">47 producto(s) en quiebre o stock mínimo.</div>
                  </div>
                  <div className="p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="font-bold text-amber-600">Conciliación Bancaria</div>
                    <div className="text-gray-500 text-[11px] mt-0.5">3 movimientos pendientes por verificar.</div>
                  </div>
                </div>
                <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                  <span className="text-[11px] text-gray-400 font-medium">✓ Todo al día en los demás módulos</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Área de Contenido Principal (Outlet SPA) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>

      {/* Modal F1: Selector de Documento */}
      <ModalSelectorDoc 
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />
    </div>
  );
}
