import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ShoppingCart, FileText, BarChart3, Users, Building2,
  CreditCard, Wallet, ArrowRight, CheckCircle, ChevronDown,
  Boxes, Receipt, DollarSign, TrendingUp, ShieldCheck, Globe,
  Zap, Star, ArrowUpRight, MessageCircle, Layers, Clock,
  LayoutDashboard, Truck, BookOpen
} from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard en Tiempo Real',
    desc: 'KPIs de ventas, inventario y cartera al instante. Toma decisiones con datos reales.',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    icon: Boxes,
    title: 'Inventario Inteligente',
    desc: 'Control total de stock, traslados entre almacenes, auditorías físicas y alertas de reposición.',
    color: 'from-emerald-500 to-teal-400'
  },
  {
    icon: ShoppingCart,
    title: 'Punto de Venta (POS)',
    desc: 'POS ultrarrápido con búsqueda por código de barra, múltiples métodos de pago y vuelto automático.',
    color: 'from-violet-500 to-purple-400'
  },
  {
    icon: FileText,
    title: 'Facturación Fiscal',
    desc: 'Genera facturas fiscales, notas de entrega y cotizaciones con numeración automática.',
    color: 'from-orange-500 to-amber-400'
  },
  {
    icon: BookOpen,
    title: 'Contabilidad & Fiscal',
    desc: 'Libros de IVA, retenciones ISLR, declaraciones SENIAT y conciliación bancaria integrados.',
    color: 'from-rose-500 to-pink-400'
  },
  {
    icon: Globe,
    title: 'Multi-Moneda',
    desc: 'Soporte nativo para USD, Bs, EUR y más. Tasa BCV actualizada en tiempo real.',
    color: 'from-sky-500 to-indigo-400'
  },
  {
    icon: Users,
    title: 'CRM de Clientes',
    desc: 'Ficha completa, historial de compras, crédito y seguimiento de cartera por cobrar.',
    color: 'from-lime-500 to-green-400'
  },
  {
    icon: Truck,
    title: 'Compras & Proveedores',
    desc: 'Órdenes de compra, recepción en almacén, cuentas por pagar y seguimiento de mercancía en tránsito.',
    color: 'from-fuchsia-500 to-pink-400'
  },
  {
    icon: TrendingUp,
    title: 'Analíticas Gerenciales',
    desc: 'Informe gerencial, top productos, existencia de inventario y tablero diario para tomar el pulso del negocio.',
    color: 'from-yellow-500 to-orange-400'
  },
];

const planes = [
  {
    nombre: 'Starter',
    precio: '$49',
    periodo: '/mes',
    desc: 'Para pequeñas empresas que empiezan a digitalizar.',
    color: 'border-white/10',
    badge: null,
    items: [
      '1 usuario admin',
      'Inventario básico',
      'Punto de Venta (POS)',
      'Facturación simple',
      '5 GB de almacenamiento',
      'Soporte por email',
    ]
  },
  {
    nombre: 'Profesional',
    precio: '$99',
    periodo: '/mes',
    desc: 'El más elegido. Para negocios en crecimiento.',
    color: 'border-cyan-400',
    badge: 'MÁS POPULAR',
    items: [
      'Hasta 5 usuarios',
      'Inventario multi-almacén',
      'POS avanzado + Cotizaciones',
      'Facturación Fiscal completa',
      'CRM + Cuentas por Cobrar',
      'Módulo Fiscal (SENIAT)',
      '20 GB de almacenamiento',
      'Soporte prioritario',
    ]
  },
  {
    nombre: 'Empresarial',
    precio: 'A medida',
    periodo: '',
    desc: 'Para corporaciones con necesidades específicas.',
    color: 'border-white/10',
    badge: null,
    items: [
      'Usuarios ilimitados',
      'Multi-empresa / Sucursales',
      'Panel de Revendedores',
      'API personalizada',
      'Módulo Contabilidad completa',
      'Almacenamiento ilimitado',
      'Soporte 24/7 dedicado',
      'Capacitación incluida',
    ]
  }
];

const testimonios = [
  { nombre: 'Carlos M.', empresa: 'Distribuidora del Este', texto: 'Antes llevábamos el inventario en Excel. Ahora controlamos 3 almacenes desde el celular. El POS es increíble.', estrellas: 5 },
  { nombre: 'Andreina V.', empresa: 'Ferretería La Central', texto: 'La facturación con IVA y el libro SENIAT nos ahorran 4 horas de trabajo a la semana. Completamente recomendado.', estrellas: 5 },
  { nombre: 'Jesús R.', empresa: 'TechStore Barquisimeto', texto: 'El soporte es excelente. Nos ayudaron a migrar todos los datos en un día. El sistema es muy intuitivo.', estrellas: 5 },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const faqs = [
    { q: '¿Necesito instalar algo?', a: 'No. El sistema funciona 100% en la nube desde cualquier navegador. Solo necesitas internet.' },
    { q: '¿Mis datos están seguros?', a: 'Sí. Usamos Supabase con cifrado AES-256, backups automáticos diarios y acceso protegido por roles.' },
    { q: '¿Puedo migrar desde otro sistema?', a: 'Sí. Te ayudamos a importar tu catálogo de productos y clientes. El proceso toma menos de un día.' },
    { q: '¿El sistema maneja el SENIAT?', a: 'Sí. Genera libros de IVA, retenciones, archivo TXT para el portal SENIAT e ISLR.' },
    { q: '¿Puedo usarlo con múltiples monedas?', a: 'Sí. USD, Bs y cualquier otra moneda. La tasa BCV se actualiza automáticamente en tiempo real.' },
    { q: '¿Qué pasa si tengo varias sucursales?', a: 'El plan Empresarial incluye multi-almacén y control de traslados entre sucursales en tiempo real.' },
  ];

  return (
    <div className="bg-[#080A0C] text-white min-h-screen font-sans antialiased">

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080A0C]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 w-8 h-8 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" strokeWidth={3} />
            </div>
            <span className="font-black text-lg tracking-tight">Tesla<span className="text-cyan-400">ERP</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#modulos" className="hover:text-white transition-colors">Módulos</a>
            <a href="#precios" className="hover:text-white transition-colors">Precios</a>
            <a href="#testimonios" className="hover:text-white transition-colors">Testimonios</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/login" className="text-sm font-bold text-white/60 hover:text-white transition-colors px-4 py-2">
              Iniciar Sesión
            </Link>
            <a href="#precios" className="bg-cyan-400 hover:bg-cyan-300 text-black text-sm font-black px-5 py-2.5 rounded-xl transition-colors">
              Empieza Gratis
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-8">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            Sistema ERP/POS en la Nube · Multi-Moneda · Venezuela & Latinoamérica
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            El sistema que tu<br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              negocio necesita
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Inventario, Facturación Fiscal, Punto de Venta, Contabilidad, CRM y más. 
            Todo integrado. Todo en tiempo real. Sin servidores que mantener.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a href="#precios" className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black px-8 py-4 rounded-2xl text-base transition-all shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/40 hover:-translate-y-0.5">
              Ver Planes y Precios <ArrowRight size={18} strokeWidth={3} />
            </a>
            <Link to="/tienda/tesla-fire" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all">
              Ver Demo en Vivo <ArrowUpRight size={18} />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { n: '60+', l: 'Módulos' },
              { n: '100%', l: 'En la Nube' },
              { n: '24/7', l: 'Disponible' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-3xl font-black text-white">{s.n}</div>
                <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MÓDULOS ─── */}
      <section id="modulos" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[.3em] text-cyan-400 mb-4">Módulos Incluidos</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Todo lo que necesita<br />tu empresa</h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">Desde el inventario hasta la declaración del SENIAT. Un solo sistema, sin integraciones complicadas.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <f.icon size={22} className="text-white" strokeWidth={2} />
                </div>
                <h3 className="font-black text-base mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRECIOS ─── */}
      <section id="precios" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[.3em] text-cyan-400 mb-4">Planes</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Precio justo,<br />valor real</h2>
            <p className="text-white/40 text-lg">Sin costos ocultos. Cancela cuando quieras.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planes.map((p) => (
              <div key={p.nombre} className={`relative flex flex-col border-2 ${p.color} rounded-3xl p-8 ${p.badge ? 'bg-gradient-to-b from-cyan-500/10 to-transparent' : 'bg-white/[0.03]'}`}>
                {p.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-400 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    {p.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-black text-lg mb-1">{p.nombre}</h3>
                  <p className="text-white/40 text-sm mb-5">{p.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black">{p.precio}</span>
                    <span className="text-white/40 font-semibold mb-2">{p.periodo}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {p.items.map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                      <CheckCircle size={15} className="text-cyan-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="#contacto" className={`w-full py-3.5 rounded-xl font-black text-sm text-center transition-all ${p.badge ? 'bg-cyan-400 hover:bg-cyan-300 text-black' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'}`}>
                  {p.nombre === 'Empresarial' ? 'Contactar' : 'Comenzar Ahora'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIOS ─── */}
      <section id="testimonios" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[.3em] text-cyan-400 mb-4">Testimonios</p>
            <h2 className="text-4xl md:text-5xl font-black">Lo que dicen<br />nuestros clientes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonios.map((t) => (
              <div key={t.nombre} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.estrellas }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.texto}"</p>
                <div>
                  <div className="font-black text-sm">{t.nombre}</div>
                  <div className="text-white/30 text-xs">{t.empresa}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[.3em] text-cyan-400 mb-4">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-black">Preguntas<br />frecuentes</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-bold text-sm hover:bg-white/[0.03] transition-colors"
                >
                  {faq.q}
                  <ChevronDown size={16} className={`text-white/40 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section id="contacto" className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-violet-500/20 border border-white/10 rounded-3xl p-12 md:p-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-violet-400/5 rounded-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-4">¿Listo para digitalizar<br />tu empresa?</h2>
              <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">Agenda una demo gratuita y te mostramos el sistema funcionando con tus datos reales en menos de 30 minutos.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://wa.me/584241234567?text=Hola,%20quiero%20una%20demo%20del%20sistema"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-emerald-500/30"
                >
                  <MessageCircle size={20} />
                  Escribir por WhatsApp
                </a>
                <Link to="/tienda/tesla-fire" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-2xl transition-all">
                  Ver Demo <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white/30 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 w-6 h-6 rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white" strokeWidth={3} />
            </div>
            <span className="font-black text-white/60">Tesla<span className="text-cyan-400">ERP</span></span>
          </div>
          <p>© 2026 TeslaFire. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#modulos" className="hover:text-white/60 transition-colors">Módulos</a>
            <a href="#precios" className="hover:text-white/60 transition-colors">Precios</a>
            <Link to="/admin/login" className="hover:text-white/60 transition-colors">Panel</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
