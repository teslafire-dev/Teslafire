import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        toast.success("¡Sesión iniciada!");
        if (onSuccess) onSuccess();
        navigate("/admin", { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Cuenta creada con éxito. Inicie sesión para continuar.");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico primero para restaurar.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/admin/login'
      });
      if (error) throw error;
      toast.success("Enlace de recuperación enviado. Revisa tu bandeja de entrada.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Content Area with Padding */}
      <div className="p-2 flex flex-col gap-5">
        {/* Dynamic Header */}
        <div className="flex flex-col gap-1 text-center pb-2">
          <h2 className="text-lg font-black text-primary-950 dark:text-white uppercase tracking-tighter">
            {isLogin ? "Acceso Seguro" : "Registro de Usuario"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-[9px] leading-relaxed uppercase tracking-widest text-center">
            {isLogin ? "Ingrese credenciales" : "Nueva cuenta Dobell"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <Mail className="w-3 h-3 text-accent" /> Email
          </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@ejemplo.com"
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-accent outline-none transition-smooth placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3 h-3 text-accent" /> Clave
            </label>
            {isLogin && (
              <button 
                type="button"
                onClick={handleResetPassword}
                className="text-[9px] font-black text-accent hover:text-primary-950 dark:hover:text-white uppercase tracking-widest transition-smooth"
              >
                ¿Olvidó su clave?
              </button>
            )}
          </div>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-accent outline-none transition-smooth placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
            required
          />
        </div>

        <button 
          disabled={loading}
          className="w-full h-11 bg-primary-950 dark:bg-accent text-white font-black uppercase text-[9px] tracking-widest rounded-lg mt-1 flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-accent/80 transition-smooth active:scale-95 disabled:opacity-50 shadow-xl shadow-primary-950/20"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin text-accent" /> : (
            <>
              {isLogin ? "Conectarse" : "Crear Acceso"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-[10px] font-black text-accent hover:text-primary-950 dark:hover:text-white transition-smooth text-center uppercase tracking-widest"
        >
          {isLogin ? "¿No tiene cuenta? Regístrese" : "¿Ya tiene cuenta? Login"}
        </button>
      </div>

      {/* Footer Informative Banner - BLEEDS TO EDGES */}
      <div className={`p-5 flex items-center justify-center gap-3 border-t mt-auto ${
        isLogin ? "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800" : "bg-primary-50 dark:bg-accent/10 border-primary-100 dark:border-accent/20"
      }`}>
        <AlertCircle className={`w-4 h-4 ${isLogin ? "text-slate-400" : "text-accent"}`} />
        <p className={`text-[9px] font-black uppercase tracking-widest ${isLogin ? "text-slate-500" : "text-primary-900"}`}>
          {isLogin ? "Sistema DOBELL v1.1.0 • Estatus Protegido" : "Portal de Cliente • Registro Seguro"}
        </p>
      </div>
    </div>
  );
}
