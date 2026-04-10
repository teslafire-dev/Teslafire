import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, LogOut, Sun, Moon, Languages } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import LoginModal from "../admin/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/store/cartStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [config, setConfig] = useState<any>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { lang, setLang, t } = useTranslation();
  const { usdRate, eurRate } = useCurrency();
  const { user, isAdmin, role, nombre_completo } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [isLiveDropdownOpen, setIsLiveDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const { items: cartItems, removeItem, updateQuantity } = useCartStore();
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const { pathname } = useLocation();

  // AUTO-OPEN ON ADD
  const prevTotalRef = useRef(totalItems);
  useEffect(() => {
    if (totalItems > prevTotalRef.current && pathname !== '/carrito') {
      setIsMiniCartOpen(true);
      const timer = setTimeout(() => setIsMiniCartOpen(false), 3000);
      return () => clearTimeout(timer);
    }
    prevTotalRef.current = totalItems;
  }, [totalItems, pathname]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 4) {
        setIsSearching(true);
        try {
          const { data } = await supabase
            .from('productos')
            .select('id, nombre, nombre_en, sku, slug, imagenes_urls')
            .or(`nombre.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%,nombre_en.ilike.%${searchQuery}%`)
            .limit(6);
          
          setSearchResults(data || []);
        } catch (error) {
          console.error("Error searching:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      if (liveRef.current && !liveRef.current.contains(event.target as Node)) {
        setIsLiveDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef, liveRef]);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      setIsVisible(true); 
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

  // Presence Tracking
  useEffect(() => {
    let visitorId = localStorage.getItem('dobell_visitor_id');
    if (!visitorId) {
      visitorId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('dobell_visitor_id', visitorId);
    }

    let userIp = '0.0.0.0';
    
    const fetchIp = async () => {
      const services = [
        'https://api.ipify.org?format=json',
        'https://api64.ipify.org?format=json',
        'https://ipapi.co/json/'
      ];
      
      for (const service of services) {
        try {
          const res = await fetch(service, { timeout: 2000 } as any);
          const data = await res.json();
          const foundIp = data.ip || data.query;
          if (foundIp && foundIp !== '0.0.0.0') {
            userIp = foundIp;
            break;
          }
        } catch (e) {
          continue;
        }
      }
    };

    const setupPresence = async () => {
      await fetchIp();
      
      const channel = supabase.channel('online-users', {
        config: {
          presence: {
            key: user?.id || visitorId!,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const allPresences = Object.values(state).flat() as any[];
          
          const uniqueUsersMap = new Map();
          allPresences.forEach(curr => {
            const identity = curr.ip && curr.ip !== '0.0.0.0' ? curr.ip : (curr.visitor_id || curr.email);
            if (!uniqueUsersMap.has(identity)) {
              uniqueUsersMap.set(identity, curr);
            }
          });

          const uniqueUsers = Array.from(uniqueUsersMap.values());
          setOnlineUsers(uniqueUsers);
          setOnlineCount(uniqueUsers.length || 1);
          
          if (uniqueUsers.length > 1) {
            checkAndUpdatePeak(uniqueUsers.length);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              online_at: new Date().toISOString(),
              email: user?.email || 'Visitante',
              ip: userIp,
              visitor_id: visitorId
            });
          }
        });

      return channel;
    };

    const channelPromise = setupPresence();

    return () => {
      channelPromise.then(channel => {
        if (channel) channel.unsubscribe();
      });
    };
  }, [user]);

  const checkAndUpdatePeak = async (current: number) => {
    try {
      const { data } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', 'max_concurrent_visitors')
        .single();
      
      const peak = parseInt(data?.valor || '0');
      if (current > peak) {
        await supabase
          .from('configuracion')
          .update({ valor: current.toString() })
          .eq('clave', 'max_concurrent_visitors');
      }
    } catch (e) {
      // Ignore errors in background tracking
    }
  };

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out ${
      isScrolled 
        ? 'bg-white/95 dark:bg-slate-900/95 shadow-xl py-2' 
        : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl py-4'
    } border-b border-slate-100 dark:border-slate-800`}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo dinámico (Claro/Oscuro) */}
        <Link to="/" className="flex items-center group h-16 relative">
          <AnimatePresence mode="wait">
            {(config.site_logo || config.site_logo_dark) ? (
              <motion.img 
                key={isDarkMode ? 'dark' : 'light'}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={isDarkMode ? (config.site_logo_dark || config.site_logo) : (config.site_logo || config.site_logo_dark)} 
                alt="Logo Dobell" 
                className="h-16 w-auto object-contain transition-smooth group-hover:scale-105"
              />
            ) : null}
          </AnimatePresence>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10 ml-16 font-bold text-slate-600 dark:text-slate-400 transition-standard uppercase text-xs tracking-widest">
          {[
            { to: '/', label: t('nav.home') },
            { to: '/productos', label: t('nav.productos') },
            { to: '/servicios', label: t('nav.servicios') },
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
        </nav>

        {/* Search & Actions */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-[600px] mx-8 relative" ref={searchRef}>
          <div className="relative flex-1 group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-smooth w-4 h-4 ${isSearching ? 'text-accent animate-pulse' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-accent'}`} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-transparent rounded-2xl py-2.5 pl-11 pr-4 text-xs font-bold focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-accent outline-none transition-smooth shadow-inner dark:text-slate-100 uppercase tracking-wider"
            />
            
            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[60]"
                >
                  <div className="max-h-[380px] overflow-y-auto p-2">
                    <p className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800 mb-1">Resultados encontrados</p>
                    {searchResults.map((prod) => (
                      <Link
                        key={prod.id}
                        to={`/productos/${prod.slug || prod.id}`}
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-smooth group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                          <img 
                            src={prod.imagenes_urls?.[0] || '/placeholder-product.png'} 
                            alt={prod.nombre}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-black text-primary-950 dark:text-white uppercase truncate tracking-tight group-hover:text-accent transition-colors">
                            {(lang === 'EN' && prod.nombre_en) ? prod.nombre_en : prod.nombre}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">SKU: {prod.sku}</span>
                        </div>
                      </Link>
                    ))}
                    <Link 
                      to="/productos" 
                      onClick={() => setSearchResults([])}
                      className="block text-center py-3 text-[9px] font-black text-accent uppercase tracking-widest hover:bg-accent/5 transition-smooth mt-1 rounded-xl"
                    >
                      Ver todos los productos
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            {/* Live Count (Admin only) */}
            {isAdmin && (
              <div className="relative" ref={liveRef}>
                <button 
                  onClick={() => setIsLiveDropdownOpen(!isLiveDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm mr-1 transition-smooth active:scale-95 ${
                    isLiveDropdownOpen ? 'bg-primary-950 text-white border-primary-950' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700'
                  }`}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                    {onlineCount} <span className={isLiveDropdownOpen ? 'text-accent' : 'text-slate-400 dark:text-slate-500'}>Live</span>
                  </span>
                </button>

                {/* Live Users Dropdown */}
                <AnimatePresence>
                  {isLiveDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-50 dark:border-slate-800 p-2 z-[100] overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Tráfico en Tiempo Real</p>
                      </div>
                      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
                        {onlineUsers.map((u, i) => (
                          <div key={i} className="flex flex-col p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-smooth border border-transparent hover:border-slate-100">
                             <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black text-primary-950 dark:text-white uppercase truncate max-w-[150px]">
                                 {u.email && u.email !== 'Visitante' ? u.email : 'Visitante Anónimo'}
                               </span>
                               <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Activo</span>
                             </div>
                             <span className="text-[9px] font-bold text-slate-400 mt-1 font-mono tracking-tighter bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded w-fit">
                               {!u.ip || u.ip === '0.0.0.0' ? 'IP Protegida/VPN' : u.ip}
                             </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
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
          <div 
            className="relative"
            onMouseEnter={() => setIsMiniCartOpen(true)}
            onMouseLeave={() => setIsMiniCartOpen(false)}
          >
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

            <AnimatePresence>
              {(isMiniCartOpen && totalItems > 0 && pathname !== '/carrito') && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`fixed lg:absolute top-full lg:top-full left-0 lg:left-auto right-0 lg:mt-4 w-full lg:w-80 bg-white dark:bg-slate-900 shadow-2xl lg:rounded-[2.5rem] border-b lg:border border-slate-100 dark:border-slate-800 overflow-hidden z-[100]`}
                >
                  {/* Vista Mobile (Sub-Header deslizable) */}
                  <div className="lg:hidden flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 gap-4">
                    <div className="flex-1 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1">
                      {cartItems.map((item) => (
                        <Link 
                          key={item.id} 
                          to={`/productos/${item.slug}`}
                          onClick={() => setIsMiniCartOpen(false)}
                          className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex-shrink-0 border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm relative"
                        >
                          <img src={item.image} className="w-full h-full object-contain" />
                          {item.quantity > 1 && (
                            <div className="absolute top-0 right-0 bg-accent text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                              {item.quantity}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                    <Link 
                      to="/carrito" 
                      onClick={() => setIsMiniCartOpen(false)}
                      className="bg-primary-950 text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary-950/20 active:scale-95 whitespace-nowrap"
                    >
                      Ver Carrito
                    </Link>
                  </div>

                  {/* Vista Desktop (Dropdown) */}
                  <div className="hidden lg:block p-6">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-4 mb-4">
                      Mi Cotización ({totalItems})
                    </p>
                               <div className="flex flex-col gap-4 max-h-80 overflow-y-auto custom-scrollbar pr-2 -mx-2 px-2 pb-2">
                       {cartItems.map((item) => {
                         const currentRate = (item.moneda === 'EUR' || item.moneda === 'EUR_ONLY') ? (eurRate || 1) : (usdRate || 1);
                         const unitPrice = Number(item.price) || 0;
                         const lineTotal = unitPrice * item.quantity;
                         const showBs = item.moneda !== 'NONE' && item.moneda !== 'USD_ONLY' && item.moneda !== 'EUR_ONLY';
                         const currencySymbol = (item.moneda === 'EUR' || item.moneda === 'EUR_ONLY') ? 'EUR' : 'USD';

                         return (
                          <div key={item.id} className="flex gap-4 items-center group/item p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-smooth">
                            <Link 
                              to={`/productos/${item.slug}`}
                              onClick={() => setIsMiniCartOpen(false)}
                              className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700 p-1 hover:border-accent transition-colors block"
                            >
                               <img src={item.image || '/placeholder-product.png'} className="w-full h-full object-contain" />
                            </Link>
                            <div className="flex flex-col min-w-0 flex-1">
                               <div className="flex justify-between items-start gap-2">
                                 <Link 
                                   to={`/productos/${item.slug}`}
                                   onClick={() => setIsMiniCartOpen(false)}
                                   className="text-[11px] font-black text-primary-950 dark:text-white uppercase truncate tracking-tight leading-tight hover:text-accent transition-colors"
                                 >
                                   {item.name}
                                 </Link>
                                 <button 
                                   onClick={() => removeItem(item.id)}
                                   className="text-slate-300 hover:text-destructive transition-smooth p-1"
                                 >
                                   <X className="w-3 h-3" />
                                 </button>
                               </div>
                               <div className="flex items-center justify-between mt-2">
                                 <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg p-1">
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="w-5 h-5 flex items-center justify-center text-xs font-black text-slate-400 hover:text-accent transition-smooth"
                                    >
                                      -
                                    </button>
                                    <span className="text-[10px] font-black text-primary-950 dark:text-white w-4 text-center">{item.quantity}</span>
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="w-5 h-5 flex items-center justify-center text-xs font-black text-slate-400 hover:text-accent transition-smooth"
                                    >
                                      +
                                    </button>
                                 </div>
                                 <div className="flex flex-col items-end">
                                   <span className="text-[11px] font-black text-accent dark:text-accent-light uppercase tracking-widest">
                                     {lineTotal.toLocaleString('en-US', { style: 'currency', currency: currencySymbol })}
                                   </span>
                                   {showBs && (
                                     <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-0.5">
                                       Bs. {(lineTotal * currentRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                     </span>
                                   )}
                                 </div>
                               </div>
                            </div>
                          </div>
                         );
                       })}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                       <Link 
                        to="/carrito" 
                        onClick={() => setIsMiniCartOpen(false)}
                        className="w-full block bg-primary-950 dark:bg-accent text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:opacity-90 transition-smooth shadow-xl active:scale-95"
                       >
                         Ver Carrito
                       </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
              { to: '/servicios', label: t('nav.servicios') },
              { to: '/nosotros', label: t('nav.nosotros') },
              { to: '/nosotros#contacto', label: t('nav.contacto') }
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

            {/* Mobile Controls */}
            <div className="flex items-center justify-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
               <button 
                  onClick={toggleDarkMode}
                  className="flex-1 flex items-center justify-center gap-3 bg-slate-50 dark:bg-slate-800 py-4 rounded-2xl text-[10px] font-black text-slate-400"
               >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDarkMode ? 'MODO LUZ' : 'MODO OSCURO'}
               </button>
               <button 
                  onClick={toggleLanguage}
                  className="flex-1 flex items-center justify-center gap-3 bg-slate-50 dark:bg-slate-800 py-4 rounded-2xl text-[10px] font-black text-slate-400"
               >
                  <Languages className="w-4 h-4" />
                  {lang}
               </button>
            </div>
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
