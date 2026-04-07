import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import LoginModal from "../admin/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [config, setConfig] = useState<any>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, isAdmin, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Background transition logic
      setIsScrolled(currentScrollY > 20);

      // Hide/Show logic
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
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
      isScrolled ? 'bg-white/95 shadow-xl py-2' : 'bg-white/70 backdrop-blur-xl py-4'
    } border-b border-slate-100`}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-primary-950 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-smooth">
            <span className="text-white font-black text-2xl font-outfit">D</span>
          </div>
          <div className="flex flex-col">
            <span className="text-primary-950 font-black leading-none text-2xl font-outfit uppercase tracking-tighter">Dobell</span>
            <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em] mt-0.5">Industrial</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10 font-bold text-slate-600 transition-standard uppercase text-xs tracking-widest">
          <Link to="/productos" className="hover:text-accent transition-smooth">Productos</Link>
          <Link to="/soluciones" className="hover:text-accent transition-smooth">Soluciones</Link>
          <Link to="/nosotros" className="hover:text-accent transition-smooth">Nosotros</Link>
          {isAdmin && (
            <Link 
              to="/admin" 
              className="text-primary-950 px-4 py-2 bg-accent/10 rounded-xl border border-accent/20 hover:bg-accent hover:text-white transition-smooth flex items-center gap-2"
            >
              Panel Admin
            </Link>
          )}
        </nav>

        {/* Search & Actions */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8 group">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-smooth w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar equipamiento..." 
              className="w-full bg-slate-100/50 border border-transparent rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-accent outline-none transition-smooth shadow-inner"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/carrito" className="relative p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-accent hover:text-white transition-smooth shadow-inner">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
              0
            </span>
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-[9px] font-black text-primary-950 uppercase tracking-tighter leading-none">{user.email?.split('@')[0]}</span>
                <span className="text-[8px] font-black text-accent uppercase tracking-widest mt-1">{role}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 bg-slate-100 text-slate-400 hover:text-destructive transition-smooth rounded-2xl shadow-inner active:scale-95"
                title="Cerrar Sesión"
              >
                <User className="w-6 h-6" />
              </button>
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
        <div className="lg:hidden bg-white border-t border-slate-200 p-8 absolute top-full left-0 w-full shadow-2xl animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-6 font-bold text-slate-600 uppercase text-sm tracking-widest text-center">
            <Link to="/productos" onClick={() => setIsMenuOpen(false)}>Productos</Link>
            <Link to="/soluciones" onClick={() => setIsMenuOpen(false)}>Soluciones</Link>
            <Link to="/nosotros" onClick={() => setIsMenuOpen(false)}>Nosotros</Link>
            <Link to="/contacto" onClick={() => setIsMenuOpen(false)}>Contacto</Link>
            {isAdmin && (
              <Link to="/admin" className="text-accent" onClick={() => setIsMenuOpen(false)}>Panel Admin</Link>
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
