import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut, 
  ChevronRight,
  Bell,
  User,
  Users,
  ShieldAlert,
  ExternalLink,
  ShoppingBag
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { 
    role, 
    isAdmin, 
    user, 
    canManageProducts, 
    canManageUsers, 
    canManageSettings, 
    canManageOrders,
    nombre_completo 
  } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const displayName = nombre_completo || user?.email?.split('@')[0] || 'Usuario';
  const displayRole = role === 'invitado' ? 'Staff' : role;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // Competimos el cierre de sesión contra un timeout de 2s
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout logout")), 2000)
      );

      await Promise.race([signOutPromise, timeoutPromise]);
      toast.success("Sesión cerrada");
    } catch (error: any) {
      console.error("AdminLayout: Error al cerrar sesión (o timeout):", error);
      // Limpieza manual total por si acaso
      localStorage.clear();
      // Eliminar cookies de supabase si existen
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } finally {
      window.location.href = "/admin/login";
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin", permission: true },
    { name: "Órdenes", icon: ShoppingBag, href: "/admin/ordenes", permission: canManageOrders },
    { name: "Productos", icon: Package, href: "/admin/productos", permission: canManageProducts },
    { name: "Usuarios", icon: Users, href: "/admin/usuarios", permission: canManageUsers },
    { name: "Configuración", icon: Settings, href: "/admin/configuracion", permission: canManageSettings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-80 bg-primary-950 text-slate-400 flex flex-col fixed inset-y-0 z-50 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        
        <Link to="/" className="p-10 pb-16 flex items-center gap-4 relative z-10 group">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-smooth">
            <span className="text-primary-950 font-black text-2xl font-outfit">D</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black leading-none text-2xl font-outfit uppercase tracking-tighter uppercase group-hover:text-accent transition-smooth">Dobell</span>
            <div className="flex items-center gap-2 mt-1">
               <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${isAdmin ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-slate-800 text-slate-400'}`}>
                 {displayRole}
               </span>
            </div>
          </div>
        </Link>

        <nav className="flex-1 flex flex-col gap-3 px-8 relative z-10">
          {menuItems.map((item) => {
            if (!item.permission) return null;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name}
                to={item.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-smooth group ${isActive ? 'bg-accent text-white shadow-2xl shadow-accent/30' : 'hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon className={`w-5 h-5 transition-smooth ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-accent'}`} />
                {item.name}
                {isActive && <ChevronRight className="ml-auto w-4 h-4 text-white/50" />}
              </Link>
            );
          })}
        </nav>

        {role === 'invitado' && (
           <div className="m-8 p-6 rounded-[2rem] bg-accent/10 border border-accent/20 relative z-10">
              <div className="flex items-center gap-3 text-accent mb-3">
                 <ShieldAlert className="w-5 h-5" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Modo Lectura</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-wide">Su cuenta requiere aprobación del administrador para gestionar el catálogo.</p>
           </div>
        )}

        <div className="p-10 border-t border-white/5 relative z-10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-destructive/10 hover:text-destructive transition-smooth w-full active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80 flex flex-col min-h-screen min-w-0">
        {/* Top Header */}
        <header className="h-24 bg-white/70 border-b border-slate-100 px-12 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Panel de Control</span>
             <h2 className="text-xl font-black text-primary-950 uppercase tracking-tighter">Bienvenido, {displayName}</h2>
          </div>

          <div className="flex items-center gap-8">
            <button className="relative p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-accent transition-smooth shadow-inner">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-white shadow-lg shadow-destructive/20"></span>
            </button>
            <div className="h-10 w-[1px] bg-slate-100"></div>
            
            <div className="relative" ref={userMenuRef}>
              <div 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-5 group cursor-pointer"
              >
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-sm font-black text-primary-950 uppercase tracking-tighter leading-none group-hover:text-accent transition-smooth">
                    {displayName}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {displayRole} • {isAdmin ? 'Nivel 1' : 'Staff'}
                  </span>
                </div>
                <div className="w-12 h-12 bg-primary-950 rounded-2xl flex items-center justify-center shadow-2xl group-hover:bg-accent transition-smooth relative">
                  <User className="w-6 h-6 text-white" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              </div>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-72 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-4 z-50 overflow-hidden"
                  >
                    <div className="p-6 border-b border-slate-50 flex flex-col gap-1">
                       <span className="text-[10px] font-black text-accent uppercase tracking-widest">Cuenta Activa</span>
                       <span className="text-sm font-bold text-primary-950 truncate">{user?.email}</span>
                    </div>
                    
                    <div className="p-2 flex flex-col gap-1">
                      <Link 
                        to="/" 
                        className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-smooth group"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-accent" />
                        Ver Tienda
                      </Link>
                      
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-destructive hover:bg-red-50 transition-smooth group"
                      >
                        <LogOut className="w-4 h-4 text-red-300 group-hover:text-red-500" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-12 duration-700 w-full overflow-x-hidden">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
