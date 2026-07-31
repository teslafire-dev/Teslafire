import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, LogOut, Sun, Moon, Languages, ExternalLink, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Editable } from "../admin/Editable";
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
  const { items: cartItems, removeItem, updateQuantity, clearCart } = useCartStore();
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const { pathname } = useLocation();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

  const [dynamicMenus, setDynamicMenus] = useState<any[]>([]);

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

    async function fetchMenus() {
      const { data } = await supabase
        .from('menus')
        .select('*')
        .eq('location', 'header')
        .order('orden', { ascending: true });
      if (data) setDynamicMenus(data);
    }

    fetchConfig();
    fetchMenus();
  }, []);

  // Tree Logic for Dropdowns
  const menuTree = dynamicMenus.filter(m => !m.parent_id).map(parent => ({
    ...parent,
    children: dynamicMenus.filter(child => child.parent_id === parent.id)
  }));

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
        {/* Logo dinámico */}
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
                alt="Logo Venemax" 
                className="h-16 w-auto object-contain transition-smooth group-hover:scale-105"
              />
            ) : null}
          </AnimatePresence>
        </Link>

        {/* Desktop Navigation with Submenus */}
        <nav className="hidden lg:flex items-center gap-8 ml-16 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-widest h-full">
          {menuTree.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            return (
              <div 
                key={item.id} 
                className="relative h-full flex items-center"
                onMouseEnter={() => {
                  setActiveDropdown(item.id);
                  const win = window as any;
                  if (win.headerTimeout) clearTimeout(win.headerTimeout);
                }}
                onMouseLeave={() => {
                  const win = window as any;
                  win.headerTimeout = setTimeout(() => setActiveDropdown(null), 200);
                }}
              >
                <NavLink 
                  to={item.url} 
                  className={({ isActive }) => 
                    `relative h-full flex items-center gap-1.5 hover:text-accent transition-all ${isActive ? 'text-accent opacity-100' : 'opacity-80'}`
                  }
                >
                  <Editable keyName={`menu_label_${item.id}`} className="pointer-events-none">
                    {(lang === 'EN' && item.label_en) ? item.label_en : item.label}
                  </Editable>
                  {hasChildren && <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />}
                </NavLink>

                {/* Submenu Dropdown */}
                <AnimatePresence>
                  {hasChildren && activeDropdown === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-0 w-64 bg-white dark:bg-slate-900 shadow-2xl rounded-b-[2.5rem] border border-slate-100 dark:border-slate-800 p-4 z-[100] animate-in slide-in-from-top-2"
                    >
                      <div className="flex flex-col gap-1">
                        {item.children.map((child: any) => (
                           <Link
                             key={child.id}
                             to={child.url}
                             className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl text-slate-500 hover:text-accent transition-all text-xs font-black uppercase tracking-tighter"
                           >
                              {(lang === 'EN' && child.label_en) ? child.label_en : child.label}
                           </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
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
          </div>
          
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
             {/* Admin Live Count */}
            {isAdmin && (
              <div className="relative" ref={liveRef}>
                <button onClick={() => setIsLiveDropdownOpen(!isLiveDropdownOpen)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-smooth ${isLiveDropdownOpen ? 'bg-primary-950 text-white' : 'bg-white dark:bg-slate-900'}`}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[9px] font-black uppercase">{onlineCount}</span>
                </button>
              </div>
            )}
            
            <button onClick={toggleDarkMode} className="p-2.5 rounded-xl text-slate-400 hover:text-accent transition-smooth">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-accent font-black uppercase text-[9px]">
               <Languages className="w-4 h-4" /> {lang}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
              <Link to="/carrito" className={`p-3 rounded-2xl transition-smooth flex items-center justify-center relative ${totalItems > 0 ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400'}`}>
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">{totalItems}</span>}
              </Link>
          </div>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-primary-950">
                <User className="w-6 h-6" />
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-slate-50 p-2 z-[100]">
                    <Link to="/perfil" className="block px-4 py-3 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50">Perfil</Link>
                    {isAdmin && <Link to="/admin" className="block px-4 py-3 text-[10px] font-black uppercase text-accent hover:bg-accent/5">Panel Admin</Link>}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase text-red-500 hover:bg-red-50">Salir</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="p-3 bg-slate-900 text-white rounded-2xl"><User className="w-6 h-6" /></button>
          )}

          <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu with logic */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="lg:hidden bg-white border-t border-slate-100 overflow-hidden">
             <nav className="flex flex-col p-6 gap-4">
                {menuTree.map(item => (
                   <div key={item.id} className="flex flex-col gap-2">
                      <Link to={item.url} onClick={() => setIsMenuOpen(false)} className="text-sm font-black uppercase text-primary-950 tracking-widest">{item.label}</Link>
                      <div className="flex flex-col pl-4 border-l border-slate-100 gap-3 mt-2">
                        {item.children.map((child: any) => (
                          <Link key={child.id} to={child.url} onClick={() => setIsMenuOpen(false)} className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {child.label}
                          </Link>
                        ))}
                      </div>
                   </div>
                ))}
             </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  );
}
