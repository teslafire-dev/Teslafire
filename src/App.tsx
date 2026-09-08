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
import AdminLayout from './components/admin/AdminLayout';
import ModulePlaceholder from './components/admin/ModulePlaceholder';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Nosotros from './pages/Nosotros';
import Servicios from './pages/Servicios';
import DynamicPage from './pages/DynamicPage';
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
          {/* Public Context (with Header/Footer) */}
          <Route element={<><Analytics /><Header /><main className="flex-grow"><NavigationWrapper /></main><Footer /></>}>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/:slug" element={<ProductDetail />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/reservar" element={<Reservar />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/gracias/:localizador" element={<Gracias />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/perfil/historial" element={<Historial />} />
            <Route path="/:slug" element={<DynamicPage />} />
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
              <Route path="/admin/inventario/kardex" element={<ModulePlaceholder modulo="Inventario" viewTitle="Kardex / Buscador" description="Trazabilidad cronológica de movimientos de entrada, salida y saldos en tiempo real." />} />
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
              <Route path="/admin/compras/compra-directa" element={<ModulePlaceholder modulo="Compras" viewTitle="Compra Directa" description="Registro de facturas de compra inmediata a proveedores." primaryActionLabel="Registrar Compra" />} />
              <Route path="/admin/compras/ordenes" element={<ModulePlaceholder modulo="Compras" viewTitle="Órdenes de Compra" description="Generación y control del ciclo de órdenes de compra." primaryActionLabel="Nueva Orden" />} />
              <Route path="/admin/compras/transito" element={<ModulePlaceholder modulo="Compras" viewTitle="Mercancía en Tránsito" description="Seguimiento de pedidos nacionales e internacionales en camino." />} />
              <Route path="/admin/compras/recepcion" element={<ModulePlaceholder modulo="Compras" viewTitle="Recepción en Almacén" description="Cotejo de compras contra órdenes y carga en Kardex." primaryActionLabel="Recepcionar Carga" />} />
              <Route path="/admin/compras/proveedores" element={<ModulePlaceholder modulo="Compras" viewTitle="Proveedores" description="Directorio de proveedores, RIF y condiciones de crédito." primaryActionLabel="Nuevo Proveedor" />} />

              {/* ── Módulos CXP & CXC ── */}
              <Route path="/admin/cxp/pagos" element={<ModulePlaceholder modulo="CXP" viewTitle="Pagar a Proveedor" description="Programación y liquidación de pagos multimoneda a proveedores." primaryActionLabel="Registrar Pago" />} />
              <Route path="/admin/cxp/notas-credito" element={<ModulePlaceholder modulo="CXP" viewTitle="Notas de Crédito Proveedor" description="Control de notas de crédito comerciales emitidas por proveedores." />} />
              <Route path="/admin/cxc/estado" element={<ModulePlaceholder modulo="CXC" viewTitle="Estado de Cuenta" description="Cartera de clientes, cuentas vencidas y límites de crédito." />} />
              <Route path="/admin/cxc/cobros" element={<ModulePlaceholder modulo="CXC" viewTitle="Cobros" description="Registro de cobranzas de facturas a crédito." primaryActionLabel="Registrar Cobro" />} />
              <Route path="/admin/cxc/notas-debito" element={<ModulePlaceholder modulo="CXC" viewTitle="Notas de Débito" description="Emisión de notas de débito a clientes." primaryActionLabel="Nueva Nota" />} />
              <Route path="/admin/cxc/abonos" element={<ModulePlaceholder modulo="CXC" viewTitle="Historial de Cobros" description="Historial de recibos y abonos recibidos." />} />

              {/* ── Módulos Bancos ── */}
              <Route path="/admin/bancos/cuentas" element={<ModulePlaceholder modulo="Bancos" viewTitle="Cuentas Bancarias" description="Cuentas corrientes en Bs, cuentas custodia en divisas y cajas fuertes." primaryActionLabel="Nueva Cuenta" />} />
              <Route path="/admin/bancos/movimientos" element={<ModulePlaceholder modulo="Bancos" viewTitle="Movimientos Bancarios" description="Libro de bancos con ingresos, egresos y comisiones." primaryActionLabel="Nuevo Movimiento" />} />
              <Route path="/admin/bancos/conciliacion" element={<ModulePlaceholder modulo="Bancos" viewTitle="Conciliación Bancaria" description="Cotejo de extractos bancarios contra transacciones registradas." badge="Revisión" primaryActionLabel="Iniciar Conciliación" />} />
              <Route path="/admin/bancos/disponibilidad" element={<ModulePlaceholder modulo="Bancos" viewTitle="Disponibilidad de Saldos" description="Flujo de caja y disponibilidad de saldo proyectada." />} />

              {/* ── Módulos Fiscal / Contabilidad ── */}
              <Route path="/admin/fiscal/retenciones" element={<ModulePlaceholder modulo="Contabilidad" viewTitle="Retenciones IVA / ISLR" description="Emisión y comprobantes de retención fiscal." primaryActionLabel="Nueva Retención" />} />
              <Route path="/admin/fiscal/txt-iva" element={<ModulePlaceholder modulo="Contabilidad" viewTitle="Reporte TXT IVA" description="Generador de archivos TXT para la declaración quincenal del SENIAT." primaryActionLabel="Generar TXT" />} />
              <Route path="/admin/fiscal/islr" element={<ModulePlaceholder modulo="Contabilidad" viewTitle="Reporte ISLR" description="Comprobantes AR-C y archivo XML/TXT oficial de ISLR." primaryActionLabel="Exportar Reporte" />} />
              <Route path="/admin/fiscal/iva-proveedor" element={<ModulePlaceholder modulo="Contabilidad" viewTitle="Reporte IVA Proveedor" description="Relación de créditos fiscales de compras." />} />
              <Route path="/admin/fiscal/libros" element={<ModulePlaceholder modulo="Contabilidad" viewTitle="Libros Compras / Ventas" description="Libro oficial de ventas y compras según providencias del SENIAT." primaryActionLabel="Exportar Libros" />} />

              {/* ── Módulos Administración ── */}
              <Route path="/admin/administracion/gastos" element={<ModulePlaceholder modulo="Administración" viewTitle="Gastos Operativos" description="Registro y clasificación de egresos y centros de costos." primaryActionLabel="Registrar Gasto" />} />
              <Route path="/admin/administracion/reportes" element={<ModulePlaceholder modulo="Administración" viewTitle="Reportes Administrativos" description="Métricas de pérdidas, ganancias y gastos operativos." />} />

              {/* ── Módulos Configuración ── */}
              <Route path="/admin/configuracion/empresa" element={<AdminConfiguracion />} />
              <Route path="/admin/configuracion/categorias" element={<AdminCategorias />} />
              <Route path="/admin/configuracion/marcas" element={<ModulePlaceholder modulo="Configuración" viewTitle="Gestión de Marcas" description="Catálogo de marcas comerciales registradas." primaryActionLabel="Nueva Marca" />} />
              <Route path="/admin/configuracion/monedas" element={<ModulePlaceholder modulo="Configuración" viewTitle="Monedas y Tasas" description="Configuración de monedas activas y tasas BCV / Paralelo." primaryActionLabel="Actualizar Tasas" />} />
              <Route path="/admin/configuracion/precios" element={<ModulePlaceholder modulo="Configuración" viewTitle="Configuración de Precios e IGTF" description="Márgenes de comercialización y porcentaje de alícuota IGTF." />} />
              <Route path="/admin/configuracion/medios" element={<ModulePlaceholder modulo="Configuración" viewTitle="Medios de Emisión" description="Configuración de impresoras térmicas, PDF y formato fiscal." />} />

              {/* ── Módulos Analíticas ── */}
              <Route path="/admin/analiticas/informe-gerencial" element={<ModulePlaceholder modulo="Analíticas" viewTitle="Informe Gerencial" description="Resumen ejecutivo del desempeño del negocio." />} />
              <Route path="/admin/analiticas/tablero-diario" element={<ModulePlaceholder modulo="Analíticas" viewTitle="Tablero Diario" description="Métricas en vivo de ingresos, ventas y visitas de hoy." />} />
              <Route path="/admin/analiticas/lista-precios" element={<ModulePlaceholder modulo="Analíticas" viewTitle="Lista de Precios $" description="Lista de precios general en divisas con cálculo a tasa oficial." primaryActionLabel="Imprimir Lista" />} />
              <Route path="/admin/analiticas/existencia" element={<ModulePlaceholder modulo="Analíticas" viewTitle="Existencia de Inventario" description="Disponibilidad consolidada por producto y tienda." />} />
              <Route path="/admin/analiticas/top-productos" element={<ModulePlaceholder modulo="Analíticas" viewTitle="Top Productos" description="Ranking de productos con mayor volumen y margen de venta." />} />
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

function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
    <WisingWinProvider>
    <TranslationProvider>
      <CurrencyProvider>
          <Router>
            <AppContent />
            <WisingWinToggle />
          </Router>
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
