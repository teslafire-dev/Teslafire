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
    <div className="min-h-screen bg-[#080A0C] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-electrico-500/10 blur-[130px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-electrico-400/10 blur-[130px] rounded-full animate-pulse"></div>
      </div>

      <div className="w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/10">
          {/* Header */}
          <div className="bg-[#080A0C] p-8 text-center flex flex-col items-center gap-4 border-b border-gray-800">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1B1F23] to-[#0D1013] border border-electrico-500/30 rounded-2xl flex items-center justify-center shadow-lg group hover:scale-105 transition-all">
              <span className="text-electrico-400 font-black text-2xl font-rajdhani tracking-wider">TF</span>
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-white text-2xl font-black font-rajdhani uppercase tracking-wider">Tesla Fire ERP</h1>
              <p className="text-electrico-400/80 text-[10px] font-bold uppercase tracking-[0.25em]">Acceso Administrativo & POS</p>
            </div>
          </div>

          <div className="p-6 bg-white">
            <LoginForm />
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em]">
           <div className="flex items-center gap-2 text-electrico-400"><ShieldCheck className="w-4 h-4" /> Sistema Protegido</div>
           <span>•</span>
           <span>Tesla Fire v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
