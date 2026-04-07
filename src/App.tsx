import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Productos from './pages/Productos';
import ProductDetail from './pages/ProductDetail';
import Carrito from './pages/Carrito';
import Reservar from './pages/Reservar';
import Gracias from './pages/Gracias';
import AdminDashboard from './pages/admin/Dashboard';
import Login from './pages/admin/Login';
import AdminProductos from './pages/admin/Productos';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminConfiguracion from './pages/admin/Configuracion';
import AdminLayout from './components/admin/AdminLayout';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Nosotros from './pages/Nosotros';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Public Context (with Header/Footer) */}
            <Route element={<><Header /><main className="flex-grow"><NavigationWrapper /></main><Footer /></>}>
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/productos/:id" element={<ProductDetail />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/reservar" element={<Reservar />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/gracias/:localizador" element={<Gracias />} />
            </Route>

            {/* Admin Context (Login) */}
            <Route path="/admin/login" element={<Login />} />

            {/* Admin Protected Pages (with Sidebar) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/productos" element={<AdminProductos />} />
                <Route path="/admin/usuarios" element={<AdminUsuarios />} />
                <Route path="/admin/configuracion" element={<AdminConfiguracion />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}


// Wrapper to handle shared layout for public pages
function NavigationWrapper() {
  return <Outlet />;
}

export default App;
