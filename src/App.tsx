import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
import AdminConfiguracion from './pages/admin/Configuracion';
import AdminLayout from './components/admin/AdminLayout';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Nosotros from './pages/Nosotros';
import Soluciones from './pages/Soluciones';
import Perfil from './pages/perfil/Perfil';
import Historial from './pages/perfil/Historial';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import ProtectedRoute from './components/admin/ProtectedRoute';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
            <Routes>
              {/* Public Context (with Header/Footer) */}
              <Route element={<><Header /><main className="flex-grow"><NavigationWrapper /></main><Footer /></>}>
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/productos/:id" element={<ProductDetail />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/reservar" element={<Reservar />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/soluciones" element={<Soluciones />} />
                <Route path="/gracias/:localizador" element={<Gracias />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/perfil/historial" element={<Historial />} />
              </Route>

              {/* Admin Context (Login) */}
              <Route path="/admin/login" element={<Login />} />

              {/* Admin Protected Pages (with Sidebar) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/productos" element={<AdminProductos />} />
                  <Route path="/admin/ordenes" element={<AdminOrdenes />} />
                  <Route path="/admin/usuarios" element={<AdminUsuarios />} />
                  <Route path="/admin/configuracion" element={<AdminConfiguracion />} />
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
        </Router>
      </AuthProvider>
    </TranslationProvider>
  );
}


// Wrapper to handle shared layout for public pages
function NavigationWrapper() {
  return <Outlet />;
}

export default App;
