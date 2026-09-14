import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Briefcase, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function PortalLogin() {
  const navigate = useNavigate();
  const { user, isB2B } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  // Form Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form Registro Empresa
  const [razonSocial, setRazonSocial] = useState('');
  const [rif, setRif] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

  // Si ya está logueado como cliente_b2b, redirigir al dashboard
  React.useEffect(() => {
    if (user && isB2B) {
      navigate('/portal/dashboard');
    }
  }, [user, isB2B, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        toast.error('Credenciales incorrectas o usuario no encontrado');
        setLoading(false);
        return;
      }

      // Validar si tiene rol de cliente o perfiles
      const { data: profile } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const { data: clienteRecord } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();

      toast.success('Bienvenido al Portal Corporativo Tesla Fire');
      navigate('/portal/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!razonSocial.trim() || !rif.trim() || !regEmail.trim() || !regPassword) {
      toast.error('Por favor completa los campos obligatorios (*)');
      return;
    }

    if (regPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: {
            nombre_completo: razonSocial.trim(),
            contacto_nombre: contacto.trim(),
            rol: 'cliente_b2b',
            es_empresa: true
          }
        }
      });

      if (authError) {
        toast.error(authError.message || 'Error al registrar la empresa');
        setLoading(false);
        return;
      }

      const newUserId = authData.user?.id;
      if (!newUserId) {
        toast.success('Registro completado. Por favor verifica tu correo para activar tu cuenta.');
        setTab('login');
        setLoading(false);
        return;
      }

      // 2. Crear / actualizar perfil con rol cliente_b2b
      await supabase.from('perfiles').upsert({
        id: newUserId,
        email: regEmail.trim(),
        nombre_completo: razonSocial.trim(),
        rol: 'cliente_b2b',
        activo: true,
        updated_at: new Date().toISOString()
      });

      // 3. Crear registro en la tabla clientes vinculado
      const { error: clienteError } = await supabase.from('clientes').insert([
        {
          user_id: newUserId,
          documento: rif.trim().toUpperCase(),
          nombre: razonSocial.trim(),
          telefono: telefono.trim(),
          email: regEmail.trim(),
          direccion: direccion.trim(),
          canal_venta: 'mayor',
          limite_credito: 0.00, // Inicialmente 0 hasta que administración apruebe línea
          dias_credito: 0,
          saldo_favor: 0.00,
          estado_aprobacion: 'PENDIENTE',
          activo: true
        }
      ]);

      if (clienteError) {
        console.warn('Nota: error al crear cliente en tabla clientes', clienteError);
      }

      toast.success('¡Registro exitoso! Ya puedes iniciar sesión en tu portal corporativo');
      setTab('login');
      setLoginEmail(regEmail.trim());
      setLoginPassword(regPassword);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error inesperado durante el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Barra superior minimalista */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-cyan-500/20">
            TF
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white block leading-none">TESLA FIRE</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">Portal Empresas & Mayoristas</span>
          </div>
        </Link>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <Link to="/productos" className="hover:text-white transition-colors">
            Catálogo Público
          </Link>
          <span className="text-slate-700">|</span>
          <Link to="/admin/login" className="hover:text-cyan-400 transition-colors">
            Acceso Personal ERP
          </Link>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Lado izquierdo: Información de valor B2B */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              Canal Exclusivo B2B
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Precios de Mayor, Crédito y Cotizaciones Directas.
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed">
              Diseñado para distribuidores, instaladores y clientes corporativos de protección contra incendios. Realiza pedidos mayoristas, descarga tus facturas y gestiona tu estado de cuenta en tiempo real.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Precios Mayoristas Preferenciales</h4>
                  <p className="text-[11px] text-slate-400">Acceso a listas de precio con descuentos automáticos por volumen.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Línea de Crédito Comercial</h4>
                  <p className="text-[11px] text-slate-400">Condiciones de pago a 15, 30 y 45 días con seguimiento de saldo disponible.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Emisión Inmediata de Cotizaciones</h4>
                  <p className="text-[11px] text-slate-400">Genera solicitudes de cotización formales y descarga facturas fiscales.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho: Formulario Login / Registro */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            
            {/* Tabs selector */}
            <div className="flex p-1 bg-slate-950/60 rounded-2xl border border-slate-800/80 mb-6">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'login'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ingreso Empresas
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'register'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Registro de Nueva Empresa
              </button>
            </div>

            {/* TAB LOGIN */}
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Correo Electrónico Corporativo
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="compras@tuempresa.com"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Contraseña
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 hover:from-cyan-400 to-blue-600 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando Acceso...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar al Portal B2B</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-500">
                    ¿Tu empresa aún no tiene cuenta mayorista?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('register')}
                      className="text-cyan-400 font-bold hover:underline cursor-pointer"
                    >
                      Registrar Empresa
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* TAB REGISTRO */
              <form onSubmit={handleRegister} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Razón Social / Nombre de Empresa *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                      placeholder="Ej: Inversiones y Servicios C.A."
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      RIF Jurídico *
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={rif}
                        onChange={(e) => setRif(e.target.value)}
                        placeholder="J-12345678-9"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Persona de Contacto
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={contacto}
                        onChange={(e) => setContacto(e.target.value)}
                        placeholder="Nombre y Apellido"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Teléfono Corporativo *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="0414-1234567"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Correo Corporativo *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="compras@empresa.com"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Dirección Fiscal / Despacho
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Zona industrial, calle, galpón, ciudad..."
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mínimo 6 carácteres"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Confirmar Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        placeholder="Repite la contraseña"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 hover:from-cyan-400 to-blue-600 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando Empresa...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Completar Registro B2B</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>
      </main>

      {/* Pie de página */}
      <footer className="border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Tesla Fire — Plataforma B2B de Protección Contra Incendios y Seguridad Industrial.
      </footer>
    </div>
  );
}
