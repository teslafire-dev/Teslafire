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
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { role, isAdmin, user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate("/admin/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin", roles: ["admin", "editor", "invitado"] },
    { name: "Productos", icon: Package, href: "/admin/productos", roles: ["admin", "editor", "invitado"] },
    { name: "Usuarios", icon: Users, href: "/admin/usuarios", roles: ["admin"] },
    { name: "Configuración", icon: Settings, href: "/admin/configuracion", roles: ["admin"] },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-80 bg-primary-950 text-slate-400 flex flex-col fixed inset-y-0 z-50 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        
        <div className="p-10 pb-16 flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-primary-950 font-black text-2xl font-outfit">D</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black leading-none text-2xl font-outfit tracking-tighter uppercase">Dobell</span>
            <div className="flex items-center gap-2 mt-1">
               <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${isAdmin ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-slate-800 text-slate-400'}`}>
                 {role}
               </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-3 px-8 relative z-10">
          {menuItems.map((item) => {
            if (role && !item.roles.includes(role)) return null;
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
      <main className="flex-1 ml-80 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-24 bg-white/70 border-b border-slate-100 px-12 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Panel de Control</span>
             <h2 className="text-xl font-black text-primary-950 uppercase tracking-tighter">Bienvenido, {user?.email?.split('@')[0]}</h2>
          </div>

          <div className="flex items-center gap-8">
            <button className="relative p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-accent transition-smooth shadow-inner">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-white shadow-lg shadow-destructive/20"></span>
            </button>
            <div className="h-10 w-[1px] bg-slate-100"></div>
            <div className="flex items-center gap-5 group cursor-pointer">
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-primary-950 uppercase tracking-tighter leading-none">Dobell Staff</span>
                <span className="text-[9px] font-black text-accent uppercase tracking-widest mt-1">{role}</span>
              </div>
              <div className="w-12 h-12 bg-primary-950 rounded-2xl flex items-center justify-center shadow-2xl group-hover:bg-accent transition-smooth">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-12 animate-in fade-in slide-in-from-right-12 duration-700 max-w-7xl mx-auto w-full">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
