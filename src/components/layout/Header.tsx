import { Link, useNavigate, NavLink } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, LogOut, Sun, Moon, Languages } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import LoginModal from "../admin/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/store/cartStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [config, setConfig] = useState<any>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { lang, setLang, t } = useTranslation();
  const { user, isAdmin, role, nombre_completo } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    toast.success(t(isDarkMode ? 'toast.theme.light' : 'toast.theme.dark'), {
      icon: isDarkMode ? '☀️' : '🌙',
      style: { borderRadius: '1rem', background: '#0F172A', color: '#fff' }
    });
  };

  const toggleLanguage = () => {
    setLang(lang === 'ES' ? 'EN' : 'ES');
  };

  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false);
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout logout")), 2000)
      );
      await Promise.race([signOutPromise, timeoutPromise]);
      toast.success("Sesión cerrada");
    } catch (error: any) {
      console.error("Header: Error al cerrar sesión:", error);
      localStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } finally {
      window.location.href = "/";
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef]);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from('configuracion').select('*');
      if (data) {
        const configMap = data.reduce((acc: any, item: any) => {
          acc[item.clave] = item.valor;
          return acc;
        }, {});
        setConfig(configMap);
      }
    }
    fetchConfig();
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    } ${
      isScrolled 
        ? 'bg-white/95 dark:bg-slate-900/95 shadow-xl py-2' 
        : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl py-4'
    } border-b border-slate-100 dark:border-slate-800`}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-primary-950 dark:bg-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-smooth">
            <span className="text-white font-black text-2xl font-outfit">D</span>
          </div>
          <div className="flex flex-col">
            <span className="text-primary-950 dark:text-white font-black leading-none text-2xl font-outfit uppercase tracking-tighter">Dobell</span>
            <span className="text-accent dark:text-accent-light text-[10px] font-black uppercase tracking-[0.3em] mt-0.5">Industrial</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10 ml-16 font-bold text-slate-600 dark:text-slate-400 transition-standard uppercase text-xs tracking-widest">
          {[
            { to: '/', label: t('nav.home') },
            { to: '/productos', label: t('nav.productos') },
            { to: '/soluciones', label: t('nav.soluciones') },
            { to: '/nosotros', label: t('nav.nosotros') }
          ].map((item) => (
            <NavLink 
              key={item.to}
              to={item.to} 
              className={({ isActive }) => 
                `relative hover:text-accent transition-standard ${isActive ? 'text-accent opacity-100 after:absolute after:bottom-[-8px] after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-accent after:rounded-full after:shadow-[0_0_12px_rgba(249,115,22,0.8)]' : 'opacity-80'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <Link 
              to="/admin" 
              className="text-primary-950 dark:text-white px-4 py-2 bg-accent/10 rounded-xl border border-accent/20 hover:bg-accent hover:text-white transition-smooth flex items-center gap-2"
            >
              {t('admin.panel')}
            </Link>
          )}
        </nav>

        {/* Search & Actions */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-[380px] mx-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-accent transition-smooth w-4 h-4" />
            <input 
              type="text" 
              placeholder={t('search.placeholder')}
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-transparent rounded-2xl py-2.5 pl-11 pr-4 text-xs font-bold focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-accent outline-none transition-smooth shadow-inner dark:text-slate-100 uppercase tracking-wider"
            />
          </div>
          
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl transition-smooth hover:bg-white dark:hover:bg-slate-700 hover:text-primary-950 dark:hover:text-white text-slate-400 active:scale-90"
              title="Alternar Tema"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-smooth hover:bg-white dark:hover:bg-slate-700 hover:text-primary-950 dark:hover:text-white text-slate-400 active:scale-90"
              title="Cambiar Idioma"
            >
              <Languages className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase">{lang}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            key={totalItems}
            initial={totalItems > 0 ? { scale: 1.2 } : {}}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Link 
              to="/carrito" 
              className={`relative flex items-center justify-center p-3 rounded-2xl transition-smooth shadow-inner border border-transparent ${
                totalItems > 0 
                  ? 'bg-accent text-white shadow-accent/20 border-accent/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>
          {user ? (
            <div className="flex items-center gap-3 relative" ref={userMenuRef}>
              <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-[9px] font-black text-primary-950 dark:text-slate-200 uppercase tracking-tighter leading-none">{nombre_completo || user.email?.split('@')[0]}</span>
                <span className="text-[8px] font-black text-accent uppercase tracking-widest mt-1">
                  {role === 'invitado' ? 'Cliente' : role}
                </span>
              </div>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`p-3 transition-smooth rounded-2xl shadow-inner active:scale-95 ${
                  isUserMenuOpen 
                    ? 'bg-primary-950 dark:bg-accent text-white shadow-2xl' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary-950 dark:hover:text-white'
                }`}
                title="Menú de Usuario"
              >
                <User className="w-6 h-6" />
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-slate-50 overflow-hidden z-[100]"
                  >
                    <div className="p-2 flex flex-col">
                      <div className="px-5 py-4 border-b border-slate-50 mb-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Cuenta Activa</p>
                        <p className="text-xs font-bold text-primary-950 mt-1 truncate">{user.email}</p>
                      </div>
                      
                      <Link 
                        to="/perfil" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-primary-950 rounded-2xl transition-smooth uppercase tracking-widest"
                      >
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </Link>

                      <Link 
                        to="/perfil/historial" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-primary-950 rounded-2xl transition-smooth uppercase tracking-widest"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Mis Reservas
                      </Link>

                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-600 hover:bg-primary-950 hover:text-white rounded-2xl transition-smooth uppercase tracking-widest bg-slate-50 mt-1"
                        >
                          <Menu className="w-4 h-4" />
                          Panel Admin
                        </Link>
                      )}

                      <div className="h-px bg-slate-50 my-1 mx-2"></div>

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-destructive hover:bg-destructive/5 hover:text-destructive transition-smooth rounded-2xl uppercase tracking-widest"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-smooth shadow-lg active:scale-95"
            >
              <User className="w-6 h-6" />
            </button>
          )}
          <button 
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-8 absolute top-full left-0 w-full shadow-2xl animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-6 font-bold text-slate-600 dark:text-slate-400 uppercase text-sm tracking-widest text-center">
            {[
              { to: '/', label: t('nav.home') },
              { to: '/productos', label: t('nav.productos') },
              { to: '/soluciones', label: t('nav.soluciones') },
              { to: '/nosotros', label: t('nav.nosotros') },
              { to: '/contacto', label: t('nav.contacto') }
            ].map((item) => (
              <NavLink 
                key={item.to}
                to={item.to} 
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => 
                  `transition-smooth ${isActive ? 'text-accent scale-110' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {isAdmin && (
              <Link to="/admin" className="text-accent underline underline-offset-8 decoration-accent/30" onClick={() => setIsMenuOpen(false)}>
                {t('admin.panel')}
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </header>
  );
}
