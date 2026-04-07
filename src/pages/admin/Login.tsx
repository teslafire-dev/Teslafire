import { 
  ShieldCheck 
} from "lucide-react";
import LoginForm from "@/components/admin/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user, loading } = useAuth();

  // Si ya tenemos usuario y no está cargando, lo enviamos al admin
  if (user && !loading) {
    return <Navigate to="/admin" replace />;
  }
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-900/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full animate-pulse decoration-accent"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/10">
          {/* Header */}
          <div className="bg-primary-950 p-12 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl group hover:scale-110 transition-smooth">
              <span className="text-primary-950 font-black text-4xl font-outfit">D</span>
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-white text-3xl font-black font-outfit uppercase tracking-tighter">Dobell Admin</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Control de Seguridad Industrial</p>
            </div>
          </div>

          <div className="p-12">
            <LoginForm />
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
           <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-accent" /> Sistema Protegido</div>
           <span>•</span>
           <span>DOBELL v1.1.0</span>
        </div>
      </div>
    </div>
  );
}
