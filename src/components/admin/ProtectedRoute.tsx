import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mientras se verifica la sesión inicial, mostramos un estado de carga premium
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
          <Loader2 className="w-8 h-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">
            Verificando Credenciales
          </span>
          <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-slate-500">
            Acceso Seguro Dobell Industrial
          </span>
        </div>
      </div>
    );
  }

  // Si no hay usuario y no está cargando, redirigimos al login
  if (!user) {
    // Guardamos la ubicación actual para volver después del login si es necesario
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Si hay usuario, permitimos el acceso a las rutas hijas
  return <Outlet />;
}
