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
import AdminLayout from './components/admin/AdminLayout';
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
