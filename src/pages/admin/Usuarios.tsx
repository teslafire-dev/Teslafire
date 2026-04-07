import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  ShieldCheck, 
  Search,
  UserCircle2,
  Loader2,
  ArrowRight,
  Package,
  Users,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function AdminUsuarios() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { canManageUsers } = useAuth();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (canManageUsers) fetchUsers();
  }, [canManageUsers]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        toast.error("Error al cargar usuarios");
      } else if (data) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Usuarios: Error en fetchUsers:", err);
      toast.error("Error de comunicación");
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("perfiles")
      .update({ rol: newRole })
      .eq("id", userId);

    if (error) {
      toast.error("Error al actualizar rol");
    } else {
      toast.success(`Usuario actualizado a ${newRole}`);
      fetchUsers();
    }
  };

  const togglePermission = async (userId: string, field: string, currentValue: boolean) => {
    setUpdatingId(userId);
    const { error } = await supabase
      .from("perfiles")
      .update({ [field]: !currentValue })
      .eq("id", userId);

    if (error) {
      toast.error("Error al actualizar permiso");
    } else {
      toast.success("Permiso actualizado");
      fetchUsers();
    }
    setUpdatingId(null);
  };

  if (!canManageUsers) return (
    <div className="p-24 text-center flex flex-col items-center gap-8 animate-in fade-in duration-1000">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
        <ShieldCheck className="w-12 h-12 text-red-600" />
      </div>
      <h2 className="text-4xl font-black text-primary-950 uppercase tracking-tighter">Acceso Restringido</h2>
      <p className="text-slate-500 font-medium max-w-md uppercase tracking-widest text-[10px]">Solo los Administradores de Nivel 1 pueden gestionar la seguridad del equipo.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-12">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black font-outfit text-primary-950 uppercase tracking-tighter">Equipo Administrativo</h1>
          <p className="text-slate-500 font-medium tracking-wide">Gestión de privilegios y auditoría de acceso al panel industrial.</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[4rem] border border-slate-50 shadow-sm overflow-hidden mb-20">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
           <div className="relative w-full md:w-[450px] group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-accent transition-smooth" />
              <input 
                type="text" 
                placeholder="Buscar por Email o Identificación técnica..."
                className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-16 pr-6 text-sm font-medium outline-none focus:ring-2 focus:ring-accent transition-smooth shadow-sm"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identidad de Usuario</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nivel de Acceso</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Permisos Modulares</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Escalación de Rango</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-10 py-32 text-center"><Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" /></td></tr>
              ) : users.map((user, i) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-smooth group active:bg-slate-100">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner group-hover:scale-110 transition-smooth">
                          <UserCircle2 className="w-7 h-7" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-primary-950 uppercase tracking-tight">{user.email}</span>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Registrado: {new Date(user.created_at).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center text-slate-600">
                    <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      user.rol === 'admin' ? 'bg-primary-950 text-white' :
                      user.rol === 'editor' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center justify-center gap-2">
                       <button 
                        onClick={() => togglePermission(user.id, 'can_manage_products', user.can_manage_products)}
                        disabled={updatingId === user.id}
                        title="Gestionar Productos"
                        className={`p-3 rounded-xl border transition-smooth ${user.can_manage_products ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-slate-50 border-slate-100 text-slate-300'}`}
                       >
                          <Package className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => togglePermission(user.id, 'can_manage_users', user.can_manage_users)}
                        disabled={updatingId === user.id}
                        title="Gestionar Usuarios"
                        className={`p-3 rounded-xl border transition-smooth ${user.can_manage_users ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-slate-50 border-slate-100 text-slate-300'}`}
                       >
                          <Users className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => togglePermission(user.id, 'can_manage_settings', user.can_manage_settings)}
                        disabled={updatingId === user.id}
                        title="Configuración Global"
                        className={`p-3 rounded-xl border transition-smooth ${user.can_manage_settings ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-slate-50 border-slate-100 text-slate-300'}`}
                       >
                          <Settings className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                       {user.rol !== 'admin' && (
                         <button 
                          onClick={() => updateRole(user.id, 'admin')}
                          className="h-11 px-6 text-[9px] font-black text-primary-950 bg-slate-100 rounded-xl hover:bg-primary-950 hover:text-white transition-smooth uppercase tracking-widest shadow-sm active:scale-95 flex items-center gap-2"
                         >
                            Elevar a Admin <ArrowRight className="w-3 h-3" />
                         </button>
                       )}
                       {user.rol === 'invitado' && (
                         <button 
                          onClick={() => updateRole(user.id, 'editor')}
                          className="h-11 px-6 text-[9px] font-black text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-smooth uppercase tracking-widest shadow-sm active:scale-95 flex items-center gap-2"
                         >
                            Hacer Editor <ArrowRight className="w-3 h-3" />
                         </button>
                       )}
                       {user.rol !== 'invitado' && (
                         <button 
                          onClick={() => updateRole(user.id, 'invitado')}
                          className="h-11 px-6 text-[9px] font-black text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-600 hover:text-white transition-smooth uppercase tracking-widest shadow-sm active:scale-95 flex items-center gap-2"
                         >
                            Degradar a Invitado
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-primary-950 text-white p-12 rounded-[4rem] shadow-2xl shadow-primary-950/40 flex items-center gap-10 group relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-smooth duration-1000"></div>
         <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-accent/20 transition-smooth">
            <ShieldCheck className="w-10 h-10 text-accent" />
         </div>
         <div className="flex flex-col gap-2 relative z-10">
            <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter">Protocolo de Autorización</h3>
            <p className="text-slate-400 text-sm font-medium max-w-3xl leading-relaxed">Como Administrador General, usted controla la integridad del catálogo industrial. Asegúrese de otorgar permisos de **Editor** únicamente a personal técnico capacitado para evitar inconsistencias en los SKUs.</p>
         </div>
      </div>
    </div>
  );
}
