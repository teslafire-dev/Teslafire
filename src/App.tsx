import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Productos from './pages/Productos';
import ProductDetail from './pages/ProductDetail';
import Carrito from './pages/Carrito';
import Reservar from './pages/Reservar';
import Gracias from './pages/Gracias';
import AdminDashboard from './pages/admin/Dashboard';
import Login from './pages/admin/Login';
import AdminProductos from './pages/admin/Productos';
import AdminOrdenes from './pages/admin/Ordenes';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminCategorias from './pages/admin/Categorias';
import AdminConfiguracion from './pages/admin/Configuracion';
import AdminSEO from './pages/admin/SEO';
import AdminCRM from './pages/admin/CRM';
import AdminMenus from './pages/admin/Menus';
import AdminGaleria from './pages/admin/Galeria';
import AdminCatalogos from './pages/admin/Catalogos';
import POSPage from './pages/admin/POS';
import SolicitudTraslado from './pages/admin/SolicitudTraslado';
import SolicitudesRecibidas from './pages/admin/SolicitudesRecibidas';
import AdminTraslados from './pages/admin/Traslados';
import ConsumoInterno from './pages/admin/ConsumoInterno';
import AuditoriaInventario from './pages/admin/AuditoriaInventario';
import AjustesInventario from './pages/admin/AjustesInventario';
import EntradasSalidas from './pages/admin/EntradasSalidas';
import AlertaReposicion from './pages/admin/AlertaReposicion';
import ReportesInventario from './pages/admin/ReportesInventario';
import Clientes from './pages/admin/Clientes';
import Cotizaciones from './pages/admin/Cotizaciones';
import NotasEntrega from './pages/admin/NotasEntrega';
import Facturas from './pages/admin/Facturas';
import Devoluciones from './pages/admin/Devoluciones';
import CajaTurnos from './pages/admin/CajaTurnos';
import ReportesVentas from './pages/admin/ReportesVentas';
import ComprasDirectas from './pages/admin/ComprasDirectas';
import AdminLayout from './components/admin/AdminLayout';
import ModulePlaceholder from './components/admin/ModulePlaceholder';
// ── Nuevas páginas estructurales ──
import Kardex from './pages/admin/Kardex';
import OrdenesCompra from './pages/admin/OrdenesCompra';
import MercanciaTransito from './pages/admin/MercanciaTransito';
import RecepcionMercancia from './pages/admin/RecepcionMercancia';
import Proveedores from './pages/admin/Proveedores';
import CXPPagos from './pages/admin/CXPPagos';
import CXPNotasCredito from './pages/admin/CXPNotasCredito';
import CXCEstado from './pages/admin/CXCEstado';
import CXCCobros from './pages/admin/CXCCobros';
import CXCNotasDebito from './pages/admin/CXCNotasDebito';
import CXCAbonos from './pages/admin/CXCAbonos';
import BancosCuentas from './pages/admin/BancosCuentas';
import BancosMovimientos from './pages/admin/BancosMovimientos';
import BancosConciliacion from './pages/admin/BancosConciliacion';
import BancosDisponibilidad from './pages/admin/BancosDisponibilidad';
import FiscalRetenciones from './pages/admin/FiscalRetenciones';
import FiscalTxtIva from './pages/admin/FiscalTxtIva';
import FiscalISLR from './pages/admin/FiscalISLR';
import FiscalIvaProveedor from './pages/admin/FiscalIvaProveedor';
import FiscalLibros from './pages/admin/FiscalLibros';
import AdmonGastos from './pages/admin/AdmonGastos';
import AdmonReportes from './pages/admin/AdmonReportes';
import ConfigMarcas from './pages/admin/ConfigMarcas';
import ConfigMonedas from './pages/admin/ConfigMonedas';
import ConfigPrecios from './pages/admin/ConfigPrecios';
import ConfigMedios from './pages/admin/ConfigMedios';
import InformeGerencial from './pages/admin/InformeGerencial';
import TableroDiario from './pages/admin/TableroDiario';
import ListaPrecios from './pages/admin/ListaPrecios';
import ExistenciaInventario from './pages/admin/ExistenciaInventario';
import TopProductos from './pages/admin/TopProductos';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Nosotros from './pages/Nosotros';
import Servicios from './pages/Servicios';
import DynamicPage from './pages/DynamicPage';
import LandingPage from './pages/LandingPage';
import Perfil from './pages/perfil/Perfil';
import Historial from './pages/perfil/Historial';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Analytics from './components/analytics/Analytics';
import { useSecurity } from './hooks/useSecurity';
import { Lock } from 'lucide-react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const { isBlocked } = useSecurity();

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-red-500/20">
          <Lock className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none">Acceso Denegado</h1>
        <p className="text-slate-400 font-bold max-w-sm">Tu dirección IP ha sido bloqueada por razones de seguridad. Si crees que esto es un error, contacta a soporte.</p>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
        <Routes>
          {/* Landing Page SaaS — Página Principal */}
          <Route path="/" element={<LandingPage />} />

          {/* Tiendas Públicas por Empresa (con Header/Footer) */}
          <Route element={<><Analytics /><Header /><main className="flex-grow"><NavigationWrapper /></main><Footer /></>}>
            <Route path="/tienda" element={<Home />} />
            <Route path="/tienda/:slug" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/:slug" element={<ProductDetail />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/reservar" element={<Reservar />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/gracias/:localizador" element={<Gracias />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/perfil/historial" element={<Historial />} />
            <Route path="/software" element={<LandingPage />} />
            <Route path="/:pageSlug" element={<DynamicPage />} />
          </Route>

          {/* Admin Context (Login) */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin Protected Pages (with Sidebar) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/categorias" element={<AdminCategorias />} />
              <Route path="/admin/productos" element={<AdminProductos />} />
              <Route path="/admin/ordenes" element={<AdminOrdenes />} />
              <Route path="/admin/usuarios" element={<AdminUsuarios />} />
              <Route path="/admin/crm" element={<AdminCRM />} />
              <Route path="/admin/configuracion" element={<AdminConfiguracion />} />
              <Route path="/admin/seo" element={<AdminSEO />} />
              <Route path="/admin/menus" element={<AdminMenus />} />
              <Route path="/admin/galeria" element={<AdminGaleria />} />
              <Route path="/admin/catalogos" element={<AdminCatalogos />} />

              {/* ── Módulos Inventario ── */}
              <Route path="/admin/inventario/productos" element={<AdminProductos />} />
              <Route path="/admin/inventario/kardex" element={<Kardex />} />
              <Route path="/admin/inventario/solicitud-traslado" element={<SolicitudTraslado />} />
              <Route path="/admin/inventario/solicitudes-recibidas" element={<SolicitudesRecibidas />} />
              <Route path="/admin/inventario/traslados" element={<AdminTraslados />} />
              <Route path="/admin/inventario/consumo-interno" element={<ConsumoInterno />} />
              <Route path="/admin/inventario/auditoria" element={<AuditoriaInventario />} />
              <Route path="/admin/inventario/ajustes" element={<AjustesInventario />} />
              <Route path="/admin/inventario/movimientos" element={<EntradasSalidas />} />
              <Route path="/admin/inventario/reposicion" element={<AlertaReposicion />} />
              <Route path="/admin/inventario/reportes" element={<ReportesInventario />} />

              {/* ── Módulos Ventas ── */}
              <Route path="/admin/ventas/pos" element={<POSPage />} />
              <Route path="/admin/ventas/clientes" element={<Clientes />} />
              <Route path="/admin/ventas/cotizacion" element={<Cotizaciones />} />
              <Route path="/admin/ventas/notas-entrega" element={<NotasEntrega />} />
              <Route path="/admin/ventas/facturas" element={<Facturas />} />
              <Route path="/admin/ventas/devoluciones" element={<Devoluciones />} />
              <Route path="/admin/ventas/caja" element={<CajaTurnos />} />
              <Route path="/admin/ventas/reportes" element={<ReportesVentas />} />

              {/* ── Módulos Compras ── */}
              <Route path="/admin/compras/compra-directa" element={<ComprasDirectas />} />
              <Route path="/admin/compras/ordenes" element={<OrdenesCompra />} />
              <Route path="/admin/compras/transito" element={<MercanciaTransito />} />
              <Route path="/admin/compras/recepcion" element={<RecepcionMercancia />} />
              <Route path="/admin/compras/proveedores" element={<Proveedores />} />

              {/* ── Módulos CXP & CXC ── */}
              <Route path="/admin/cxp/pagos" element={<CXPPagos />} />
              <Route path="/admin/cxp/notas-credito" element={<CXPNotasCredito />} />
              <Route path="/admin/cxc/estado" element={<CXCEstado />} />
              <Route path="/admin/cxc/cobros" element={<CXCCobros />} />
              <Route path="/admin/cxc/notas-debito" element={<CXCNotasDebito />} />
              <Route path="/admin/cxc/abonos" element={<CXCAbonos />} />

              {/* ── Módulos Bancos ── */}
              <Route path="/admin/bancos/cuentas" element={<BancosCuentas />} />
              <Route path="/admin/bancos/movimientos" element={<BancosMovimientos />} />
              <Route path="/admin/bancos/conciliacion" element={<BancosConciliacion />} />
              <Route path="/admin/bancos/disponibilidad" element={<BancosDisponibilidad />} />

              {/* ── Módulos Fiscal / Contabilidad ── */}
              <Route path="/admin/fiscal/retenciones" element={<FiscalRetenciones />} />
              <Route path="/admin/fiscal/txt-iva" element={<FiscalTxtIva />} />
              <Route path="/admin/fiscal/islr" element={<FiscalISLR />} />
              <Route path="/admin/fiscal/iva-proveedor" element={<FiscalIvaProveedor />} />
              <Route path="/admin/fiscal/libros" element={<FiscalLibros />} />

              {/* ── Módulos Administración ── */}
              <Route path="/admin/administracion/gastos" element={<AdmonGastos />} />
              <Route path="/admin/administracion/reportes" element={<AdmonReportes />} />

              {/* ── Módulos Configuración ── */}
              <Route path="/admin/configuracion/empresa" element={<AdminConfiguracion />} />
              <Route path="/admin/configuracion/categorias" element={<AdminCategorias />} />
              <Route path="/admin/configuracion/marcas" element={<ConfigMarcas />} />
              <Route path="/admin/configuracion/monedas" element={<ConfigMonedas />} />
              <Route path="/admin/configuracion/precios" element={<ConfigPrecios />} />
              <Route path="/admin/configuracion/medios" element={<ConfigMedios />} />

              {/* ── Módulos Analíticas ── */}
              <Route path="/admin/analiticas/informe-gerencial" element={<InformeGerencial />} />
              <Route path="/admin/analiticas/tablero-diario" element={<TableroDiario />} />
              <Route path="/admin/analiticas/lista-precios" element={<ListaPrecios />} />
              <Route path="/admin/analiticas/existencia" element={<ExistenciaInventario />} />
              <Route path="/admin/analiticas/top-productos" element={<TopProductos />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '1rem',
              background: '#0F172A',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }
          }}
        />
      </div>
    </>
  );
}

import { WisingWinProvider } from './contexts/WisingWinContext';
import WisingWinToggle from './components/admin/WisingWinToggle';
import { SystemModalsProvider } from './contexts/SystemModalsContext';
import SystemModalsRoot from './components/admin/modals/SystemModalsRoot';

function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
    <WisingWinProvider>
    <TranslationProvider>
      <CurrencyProvider>
        <SystemModalsProvider>
          <Router>
            <AppContent />
            <WisingWinToggle />
            <SystemModalsRoot />
          </Router>
        </SystemModalsProvider>
      </CurrencyProvider>
    </TranslationProvider>
    </WisingWinProvider>
    </AuthProvider>
    </HelmetProvider>
  );
}


// Wrapper to handle shared layout for public pages
function NavigationWrapper() {
  return <Outlet />;
}

export default App;
