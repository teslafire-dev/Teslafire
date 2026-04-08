import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Save, 
  ShieldCheck, 
  AlertCircle,
  ArrowLeft,
  Briefcase
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";

export default function Perfil() {
  const { user, nombre_completo, apellido, telefono, updateProfile, updateCredentials, refreshProfile } = useAuth();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: ""
  });
  
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: nombre_completo || "",
        apellido: apellido || "",
        telefono: telefono || "",
        email: user.email || ""
      });
    }
  }, [user, nombre_completo, apellido, telefono]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await updateProfile({
      nombre_completo: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono
    });

    if (error) {
      toast.error("Error");
    } else {
      toast.success("OK");
      refreshProfile();
    }
    setLoading(false);
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Error");
    }

    setLoading(true);
    
    const updates: any = {};
    if (formData.email !== user?.email) updates.email = formData.email;
    if (passwords.newPassword) updates.password = passwords.newPassword;

    if (Object.keys(updates).length === 0) {
      setLoading(false);
      return toast.error("Error");
    }

    const { error } = await updateCredentials(updates);

    if (error) {
      toast.error(error.message || "Error");
    } else {
      toast.success("OK");
      setPasswords({ newPassword: "", confirmPassword: "" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-primary-950 transition-colors group w-fit">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('profile.back_to_shop')}
            </Link>
            <h1 className="text-4xl md:text-6xl font-black font-outfit text-primary-950 uppercase tracking-tighter leading-none">
              {t('profile.title').split(' ')[0]} <span className="text-accent">{t('profile.title').split(' ')[1]}</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm tracking-tight">{t('profile.subtitle')}</p>
          </div>


        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Form */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-primary-950/5"
            >
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center outline outline-4 outline-white">
                   <Briefcase className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-black text-primary-950 uppercase tracking-tight">{t('profile.identity_data')}</h2>
              </div>

              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.name')}</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-accent transition-colors" />
                    <input 
                      type="text" 
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-accent outline-none transition-all"
                      placeholder="Ej: Juan"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.last_name')}</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-accent transition-colors" />
                    <input 
                      type="text" 
                      value={formData.apellido}
                      onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-accent outline-none transition-all"
                      placeholder="Ej: Pérez"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.phone')}</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-accent transition-colors" />
                    <input 
                      type="tel" 
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-accent outline-none transition-all"
                      placeholder="Ej: 0412-1234567"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-6">
                  <button 
                    disabled={loading}
                    className="w-full h-16 bg-primary-950 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all hover:bg-black hover:shadow-xl hover:shadow-primary-950/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? <Save className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {t('profile.save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Security & Access Section */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-2xl shadow-primary-950/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl transition-standard group-hover:bg-accent/10"></div>
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    <Lock className="w-4 h-4 text-accent" />
                 </div>
                 <h2 className="text-sm font-black text-primary-950 uppercase tracking-widest leading-none">{t('profile.security')}</h2>
              </div>

              <form onSubmit={handleUpdateCredentials} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.email')}</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-accent transition-colors" />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-bold focus:bg-white focus:border-accent outline-none transition-all"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 font-bold p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                   <div className="flex items-center gap-3 text-blue-600 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase">{t('profile.password_change')}</span>
                   </div>
                   <p className="text-[10px] text-blue-400 leading-tight uppercase tracking-wide">{t('profile.password_hint')}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-accent transition-colors" />
                    <input 
                      type="password" 
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-bold focus:bg-white focus:border-accent outline-none transition-all"
                      placeholder={t('profile.new_password')}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-accent transition-colors" />
                    <input 
                      type="password" 
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-bold focus:bg-white focus:border-accent outline-none transition-all"
                      placeholder={t('profile.confirm_password')}
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full h-14 bg-slate-100 text-primary-950 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all hover:bg-primary-950 hover:text-white disabled:opacity-50 mt-2"
                >
                  {t('profile.update_access')}
                </button>
              </form>
            </motion.div>

            <div className="bg-primary-950 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-primary-950/20">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent/20 rounded-full -mr-16 -mb-16 blur-3xl"></div>
               <div className="flex items-center gap-4 mb-4">
                  <ShieldCheck className="w-8 h-8 text-accent animate-pulse" />
                  <h3 className="text-xl font-black font-outfit uppercase tracking-tighter">{t('profile.protected_status')}</h3>
               </div>
               <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-wide">{t('profile.protected_description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
