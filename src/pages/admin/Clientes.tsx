import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  ArrowLeft, 
  Building, 
  CreditCard, 
  Lock, 
  Tag, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Upload, 
  Check, 
  Loader2, 
  Edit3, 
  X,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface ContactoItem {
  cargo: string;
  nombre: string;
  telefono: string;
}

interface ReferenciaProveedor {
  proveedor: string;
  telefono: string;
  archivo_nombre?: string;
}

interface Cliente {
  id: string;
  nombre: string;
  documento: string;
  telefono: string;
  email?: string;
  canal_venta: string;
  estado?: string;
  ciudad?: string;
  direccion: string;
  categoria_cliente: 'PLATINUM' | 'GOLD' | 'REGULAR';
  limite_credito: number;
  dias_credito: number;
  saldo_favor: number;
  bloqueado: boolean;
  
  // Datos Jurídicos
  rif_empresa?: string;
  cedula_rif_socio?: string;
  registro_mercantil_nro?: string;
  registro_mercantil_url?: string;
  contacto_socio?: string;
  contacto_1?: ContactoItem;
  contacto_2?: ContactoItem;
  referencias_proveedores?: ReferenciaProveedor[];
  created_at?: string;
}

const defaultClientesDemo: Cliente[] = [
  {
    id: 'cli-1',
    nombre: 'Inversiones Alfa & Omega C.A.',
    documento: 'J-40123456-7',
    telefono: '0414-9876543',
    email: 'contacto@alfaomega.com',
    canal_venta: 'Mayor',
    estado: 'Distrito Capital',
    ciudad: 'Caracas',
    direccion: 'Av. Francisco de Miranda, Edif. Centro Seguros, Piso 4, Ofic. 42',
    categoria_cliente: 'PLATINUM',
    limite_credito: 0,
    dias_credito: 0,
    saldo_favor: 0,
    bloqueado: false,
    rif_empresa: 'J-40123456-7',
    cedula_rif_socio: 'V-12345678',
    registro_mercantil_nro: 'Tomo 12-A, Folio 45',
    contacto_socio: '0414-9876543 / socio@alfaomega.com',
    contacto_1: { cargo: 'Gerente Compras', nombre: 'Carlos Mendoza', telefono: '0414-1112233' },
    contacto_2: { cargo: 'Administración', nombre: 'Lucía Paredes', telefono: '0424-9988776' },
    referencias_proveedores: [
      { proveedor: 'Extintores Nacionales S.A.', telefono: '0212-2345678' },
      { proveedor: 'Seguridad Industrial C.A.', telefono: '0212-9876543' },
      { proveedor: 'Ferretería Central', telefono: '0212-5554321' }
    ],
    created_at: '2026-08-15T10:00:00Z'
  },
  {
    id: 'cli-2',
    nombre: 'María Fernanda Moya',
    documento: 'V-18456789',
    telefono: '0414-1234567',
    email: 'mfmoya@ejemplo.com',
    canal_venta: 'Detal',
    estado: 'Miranda',
    ciudad: 'Guatire',
    direccion: 'Urb. Valle Arriba, Calle 3, Casa #14',
    categoria_cliente: 'REGULAR',
    limite_credito: 0,
    dias_credito: 0,
    saldo_favor: 0,
    bloqueado: false,
    created_at: '2026-09-01T14:30:00Z'
  }
];

const estadosVenezuela = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
  'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón',
  'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta',
  'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas / La Guaira',
  'Yaracuy', 'Zulia'
];

export default function Clientes() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Búsqueda
  const [busqueda, setBusqueda] = useState('');

  // Formulario
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [canalVenta, setCanalVenta] = useState('Detal');
  const [estado, setEstado] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');

  // Jurídicos
  const [rifEmpresa, setRifEmpresa] = useState('');
  const [cedulaRifSocio, setCedulaRifSocio] = useState('');
  const [registroMercantilNro, setRegistroMercantilNro] = useState('');
  const [registroMercantilFile, setRegistroMercantilFile] = useState<string>('');
  const [contactoSocio, setContactoSocio] = useState('');

  // Contactos adicionales
  const [contacto1, setContacto1] = useState<ContactoItem>({ cargo: '', nombre: '', telefono: '' });
  const [contacto2, setContacto2] = useState<ContactoItem>({ cargo: '', nombre: '', telefono: '' });

  // Referencias a crédito
  const [ref1, setRef1] = useState<ReferenciaProveedor>({ proveedor: '', telefono: '', archivo_nombre: '' });
  const [ref2, setRef2] = useState<ReferenciaProveedor>({ proveedor: '', telefono: '', archivo_nombre: '' });
  const [ref3, setRef3] = useState<ReferenciaProveedor>({ proveedor: '', telefono: '', archivo_nombre: '' });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setClientes(data as any);
      } else {
        const local = localStorage.getItem('teslafire_directorio_clientes');
        if (local) {
          setClientes(JSON.parse(local));
        } else {
          setClientes(defaultClientesDemo);
          localStorage.setItem('teslafire_directorio_clientes', JSON.stringify(defaultClientesDemo));
        }
      }
    } catch (err) {
      const local = localStorage.getItem('teslafire_directorio_clientes');
      setClientes(local ? JSON.parse(local) : defaultClientesDemo);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoCliente = () => {
    setEditingId(null);
    setNombre('');
    setDocumento('');
    setTelefono('');
    setEmail('');
    setCanalVenta('Detal');
    setEstado('');
    setCiudad('');
    setDireccion('');

    setRifEmpresa('');
    setCedulaRifSocio('');
    setRegistroMercantilNro('');
    setRegistroMercantilFile('');
    setContactoSocio('');

    setContacto1({ cargo: '', nombre: '', telefono: '' });
    setContacto2({ cargo: '', nombre: '', telefono: '' });

    setRef1({ proveedor: '', telefono: '', archivo_nombre: '' });
    setRef2({ proveedor: '', telefono: '', archivo_nombre: '' });
    setRef3({ proveedor: '', telefono: '', archivo_nombre: '' });

    setView('form');
  };

  const handleEditarCliente = (cli: Cliente) => {
    setEditingId(cli.id);
    setNombre(cli.nombre);
    setDocumento(cli.documento);
    setTelefono(cli.telefono);
    setEmail(cli.email || '');
    setCanalVenta(cli.canal_venta || 'Detal');
    setEstado(cli.estado || '');
    setCiudad(cli.ciudad || '');
    setDireccion(cli.direccion || '');

    setRifEmpresa(cli.rif_empresa || '');
    setCedulaRifSocio(cli.cedula_rif_socio || '');
    setRegistroMercantilNro(cli.registro_mercantil_nro || '');
    setRegistroMercantilFile(cli.registro_mercantil_url || '');
    setContactoSocio(cli.contacto_socio || '');

    setContacto1(cli.contacto_1 || { cargo: '', nombre: '', telefono: '' });
    setContacto2(cli.contacto_2 || { cargo: '', nombre: '', telefono: '' });

    const refs = cli.referencias_proveedores || [];
    setRef1(refs[0] || { proveedor: '', telefono: '', archivo_nombre: '' });
    setRef2(refs[1] || { proveedor: '', telefono: '', archivo_nombre: '' });
    setRef3(refs[2] || { proveedor: '', telefono: '', archivo_nombre: '' });

    setView('form');
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error('El nombre o razón social es obligatorio');
      return;
    }
    if (!documento.trim()) {
      toast.error('La cédula o RIF es obligatorio');
      return;
    }
    if (!telefono.trim()) {
      toast.error('El número de teléfono es obligatorio');
      return;
    }
    if (!direccion.trim()) {
      toast.error('La dirección completa es obligatoria');
      return;
    }

    // Verificar cédula duplicada
    const docNormalizado = documento.trim().toUpperCase();
    const existe = clientes.find(c => c.documento.toUpperCase() === docNormalizado && c.id !== editingId);
    if (existe) {
      toast.error('Ya existe un cliente registrado con esa misma Cédula / RIF');
      return;
    }

    setSaving(true);
    const clientePayload: Cliente = {
      id: editingId || crypto.randomUUID(),
      nombre: nombre.trim(),
      documento: docNormalizado,
      telefono: telefono.trim(),
      email: email.trim() || undefined,
      canal_venta: canalVenta,
      estado: estado || undefined,
      ciudad: ciudad.trim() || undefined,
      direccion: direccion.trim(),
      categoria_cliente: canalVenta === 'Mayor' ? 'PLATINUM' : 'REGULAR',
      limite_credito: 0,
      dias_credito: 0,
      saldo_favor: 0,
      bloqueado: false,

      rif_empresa: rifEmpresa.trim() || undefined,
      cedula_rif_socio: cedulaRifSocio.trim() || undefined,
      registro_mercantil_nro: registroMercantilNro.trim() || undefined,
      registro_mercantil_url: registroMercantilFile || undefined,
      contacto_socio: contactoSocio.trim() || undefined,
      contacto_1: contacto1,
      contacto_2: contacto2,
      referencias_proveedores: [ref1, ref2, ref3].filter(r => r.proveedor.trim() !== '')
    };

    try {
      const { error } = await supabase
        .from('clientes')
        .upsert(clientePayload);

      if (error) {
        console.warn('Upsert en Supabase falló o no existen columnas nuevas, guardando localmente:', error.message);
      }

      let updatedList: Cliente[];
      if (editingId) {
        updatedList = clientes.map(c => c.id === editingId ? { ...c, ...clientePayload } : c);
      } else {
        updatedList = [clientePayload, ...clientes];
      }

      setClientes(updatedList);
      localStorage.setItem('teslafire_directorio_clientes', JSON.stringify(updatedList));

      toast.success(editingId ? 'Cliente actualizado exitosamente' : 'Cliente registrado con éxito');
      setView('list');
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar cliente');
    } finally {
      setSaving(false);
    }
  };

  // KPIs
  const totalClientes = clientes.length;
  const conCredito = clientes.filter(c => (c.limite_credito || 0) > 0).length;
  const bloqueados = clientes.filter(c => c.bloqueado).length;
  const platinumCount = clientes.filter(c => c.categoria_cliente === 'PLATINUM').length;

  // Filtrado por búsqueda
  const resultados = clientes.filter(c => {
    if (!busqueda.trim()) return false;
    const q = busqueda.toLowerCase();
    const matchNom = c.nombre.toLowerCase().includes(q);
    const matchDoc = c.documento.toLowerCase().includes(q);
    const matchTel = c.telefono.toLowerCase().includes(q);
    return matchNom || matchDoc || matchTel;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]/70 pb-16 animate-in fade-in duration-200 font-sans">
      
      {/* ══════════════════════════════════════════════════
          VISTA 1: DIRECTORIO DE CLIENTES (LISTA Y BÚSQUEDA)
      ══════════════════════════════════════════════════ */}
      {view === 'list' && (
        <div className="space-y-6">
          
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Directorio de Clientes
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                Busca por nombre, cédula/RIF o teléfono.
              </p>
            </div>

            {/* Botón + Nuevo Cliente */}
            <button
              type="button"
              onClick={handleNuevoCliente}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#343a40] hover:bg-[#23272b] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Nuevo Cliente</span>
            </button>
          </div>

          {/* Fila de Píldoras / KPIs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1. Total clientes */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200/90 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-gray-600" />
              <span>{totalClientes} clientes</span>
            </div>

            {/* 2. Con crédito */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-bold text-emerald-700 shadow-2xs">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>{conCredito} con crédito</span>
            </div>

            {/* 3. Bloqueados */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200/80 rounded-xl text-xs font-bold text-red-700 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-red-600" />
              <span>{bloqueados} bloqueados</span>
            </div>

            {/* 4. Platinum */}
            <div className="flex items-center gap-1.5 px-3.5 py-1 bg-sky-50 border border-sky-200/80 rounded-xl text-xs font-bold text-sky-700 shadow-2xs">
              <Tag className="w-3.5 h-3.5 text-sky-600" />
              <span>{platinumCount} PLATINUM</span>
            </div>
          </div>

          {/* Barra de Búsqueda Grande */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 stroke-[2.2]" />
            </div>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, cédula/RIF o teléfono..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200/90 rounded-2xl text-xs sm:text-sm font-medium text-gray-800 placeholder:text-gray-400 shadow-xs focus:outline-none focus:border-brand-500 transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tarjeta Principal de Contenido */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs min-h-[300px] flex flex-col justify-center">
            
            {/* Estado Vacío (como en la captura cuando no hay texto escrito) */}
            {!busqueda.trim() ? (
              <div className="py-20 px-4 text-center">
                <div className="w-14 h-14 mx-auto mb-3.5 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center shadow-2xs">
                  <Search className="w-7 h-7 stroke-[2.2]" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">
                  Escribe para buscar un cliente
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Por nombre, cédula/RIF o número de teléfono.
                </p>

                {/* Opción rápida para explorar todos */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setBusqueda(' ')}
                    className="text-xs text-brand-600 font-bold hover:underline cursor-pointer"
                  >
                    Ver todos los clientes registrados ({clientes.length})
                  </button>
                </div>
              </div>
            ) : resultados.length === 0 ? (
              <div className="py-20 px-4 text-center">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-gray-700 mb-1">
                  No se encontraron resultados
                </h3>
                <p className="text-xs text-gray-400">
                  No hay ningún cliente que coincida con "{busqueda}".
                </p>
                <button
                  onClick={handleNuevoCliente}
                  className="mt-4 px-4 py-2 bg-[#343a40] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Registrar este cliente ahora
                </button>
              </div>
            ) : (
              /* Lista de Clientes Encontrados */
              <div className="p-5 divide-y divide-gray-100">
                <div className="text-xs text-gray-400 font-medium pb-3 flex items-center justify-between">
                  <span>Resultados de búsqueda: {resultados.length} cliente(s)</span>
                  <span className="text-[11px]">Click en editar para ver ficha completa</span>
                </div>

                {resultados.map((cli) => (
                  <div 
                    key={cli.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 p-3 rounded-xl transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900">
                          {cli.nombre}
                        </h4>
                        {cli.categoria_cliente === 'PLATINUM' && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-100 text-sky-800 tracking-wider">
                            PLATINUM
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          Canal: {cli.canal_venta}
                        </span>
                        {cli.bloqueado && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                            Bloqueado
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 font-medium">
                        <span className="font-mono text-gray-700 font-semibold">{cli.documento}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {cli.telefono}
                        </span>
                        {cli.email && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {cli.email}
                            </span>
                          </>
                        )}
                        {cli.ciudad && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {cli.ciudad}, {cli.estado}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="text-xs text-gray-400 truncate max-w-xl">
                        {cli.direccion}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditarCliente(cli)}
                        className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════
          VISTA 2: FORMULARIO REGISTRAR / EDITAR CLIENTE
      ══════════════════════════════════════════════════ */}
      {view === 'form' && (
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Encabezado Formulario */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {editingId ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
            </h1>
            
            <button
              type="button"
              onClick={() => setView('list')}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              Volver
            </button>
          </div>

          <form onSubmit={handleGuardar} className="space-y-6">
            
            {/* ── SECCIÓN 1: DATOS BÁSICOS ── */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
              
              {/* Nombre y Apellido / Razón Social */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nombre y Apellido / Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: María Fernanda Moya"
                  className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                />
              </div>

              {/* Grid: Cédula / RIF + Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Cédula / RIF <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="V-0000000"
                    className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="0414-1234567"
                    className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Mensaje de ayuda legal */}
              <p className="text-[11px] text-gray-400 font-medium -mt-1">
                Nombre, cédula y teléfono son obligatorios. No se puede registrar dos veces la misma cédula.
              </p>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                />
              </div>

              {/* Canal de Venta */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Canal de Venta
                </label>
                <select
                  value={canalVenta}
                  onChange={(e) => setCanalVenta(e.target.value)}
                  className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white text-gray-700 cursor-pointer"
                >
                  <option value="Detal">Detal</option>
                  <option value="Mayor">Mayor</option>
                  <option value="Corporativo / Empresa">Corporativo / Empresa</option>
                  <option value="Gobierno">Gobierno</option>
                </select>
              </div>

              {/* Grid: Estado + Ciudad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Estado
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white text-gray-700 cursor-pointer"
                  >
                    <option value="">— Seleccionar —</option>
                    {estadosVenezuela.map(est => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Ciudad"
                    className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Dirección completa"
                  className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400 resize-none"
                />
              </div>

            </div>

            {/* ── SECCIÓN 2: DATOS JURÍDICOS Y CRÉDITO ── */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
              
              {/* Título de la sección */}
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="text-base" role="img" aria-label="bank">🏛️</span>
                <h2 className="text-sm font-bold text-gray-900">
                  Datos Jurídicos y Crédito
                </h2>
              </div>

              {/* Grid: RIF de la empresa + Cédula - RIF socio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    RIF de la empresa
                  </label>
                  <input
                    type="text"
                    value={rifEmpresa}
                    onChange={(e) => setRifEmpresa(e.target.value)}
                    placeholder="J-00000000-0"
                    className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Cédula – RIF socio
                  </label>
                  <input
                    type="text"
                    value={cedulaRifSocio}
                    onChange={(e) => setCedulaRifSocio(e.target.value)}
                    placeholder="V-0000000"
                    className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Grid: Nº Registro mercantil + Archivo PDF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nº Registro mercantil
                  </label>
                  <input
                    type="text"
                    value={registroMercantilNro}
                    onChange={(e) => setRegistroMercantilNro(e.target.value)}
                    placeholder="Nº / Tomo / Folio"
                    className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Registro mercantil (PDF)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer border border-gray-200/80 transition-all shrink-0">
                      Seleccionar archivo
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setRegistroMercantilFile(f.name);
                        }}
                      />
                    </label>
                    <span className="text-xs text-gray-400 truncate">
                      {registroMercantilFile || 'Ningún archivo seleccionado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contacto del socio */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Contacto del socio
                </label>
                <input
                  type="text"
                  value={contactoSocio}
                  onChange={(e) => setContactoSocio(e.target.value)}
                  placeholder="Teléfono / correo del socio"
                  className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                />
              </div>

              {/* CONTACTO 1 */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  CONTACTO 1
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={contacto1.cargo}
                    onChange={(e) => setContacto1({ ...contacto1, cargo: e.target.value })}
                    placeholder="Cargo"
                    className="w-full text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    value={contacto1.nombre}
                    onChange={(e) => setContacto1({ ...contacto1, nombre: e.target.value })}
                    placeholder="Nombre"
                    className="w-full text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    value={contacto1.telefono}
                    onChange={(e) => setContacto1({ ...contacto1, telefono: e.target.value })}
                    placeholder="Teléfono"
                    className="w-full text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* CONTACTO 2 */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  CONTACTO 2
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={contacto2.cargo}
                    onChange={(e) => setContacto2({ ...contacto2, cargo: e.target.value })}
                    placeholder="Cargo"
                    className="w-full text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    value={contacto2.nombre}
                    onChange={(e) => setContacto2({ ...contacto2, nombre: e.target.value })}
                    placeholder="Nombre"
                    className="w-full text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    value={contacto2.telefono}
                    onChange={(e) => setContacto2({ ...contacto2, telefono: e.target.value })}
                    placeholder="Teléfono"
                    className="w-full text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* 3 REFERENCIAS DE PROVEEDORES A CRÉDITO */}
              <div className="space-y-2.5 pt-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  3 REFERENCIAS DE PROVEEDORES A CRÉDITO
                </label>

                {/* Referencia #1 */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-1 text-xs font-bold text-gray-400 text-center">#1</span>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={ref1.proveedor}
                      onChange={(e) => setRef1({ ...ref1, proveedor: e.target.value })}
                      placeholder="Proveedor"
                      className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={ref1.telefono}
                      onChange={(e) => setRef1({ ...ref1, telefono: e.target.value })}
                      placeholder="Teléfono"
                      className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="col-span-4 flex items-center gap-1.5">
                    <label className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-semibold rounded-xl cursor-pointer border border-gray-200/80 transition-all shrink-0">
                      Seleccionar archivo
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setRef1({ ...ref1, archivo_nombre: f.name });
                        }}
                      />
                    </label>
                    <span className="text-[11px] text-gray-400 truncate">
                      {ref1.archivo_nombre || 'Ningún archivo seleccionado'}
                    </span>
                  </div>
                </div>

                {/* Referencia #2 */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-1 text-xs font-bold text-gray-400 text-center">#2</span>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={ref2.proveedor}
                      onChange={(e) => setRef2({ ...ref2, proveedor: e.target.value })}
                      placeholder="Proveedor"
                      className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={ref2.telefono}
                      onChange={(e) => setRef2({ ...ref2, telefono: e.target.value })}
                      placeholder="Teléfono"
                      className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="col-span-4 flex items-center gap-1.5">
                    <label className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-semibold rounded-xl cursor-pointer border border-gray-200/80 transition-all shrink-0">
                      Seleccionar archivo
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setRef2({ ...ref2, archivo_nombre: f.name });
                        }}
                      />
                    </label>
                    <span className="text-[11px] text-gray-400 truncate">
                      {ref2.archivo_nombre || 'Ningún archivo seleccionado'}
                    </span>
                  </div>
                </div>

                {/* Referencia #3 */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-1 text-xs font-bold text-gray-400 text-center">#3</span>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={ref3.proveedor}
                      onChange={(e) => setRef3({ ...ref3, proveedor: e.target.value })}
                      placeholder="Proveedor"
                      className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={ref3.telefono}
                      onChange={(e) => setRef3({ ...ref3, telefono: e.target.value })}
                      placeholder="Teléfono"
                      className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="col-span-4 flex items-center gap-1.5">
                    <label className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-semibold rounded-xl cursor-pointer border border-gray-200/80 transition-all shrink-0">
                      Seleccionar archivo
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setRef3({ ...ref3, archivo_nombre: f.name });
                        }}
                      />
                    </label>
                    <span className="text-[11px] text-gray-400 truncate">
                      {ref3.archivo_nombre || 'Ningún archivo seleccionado'}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* ── BOTONES DE ACCIÓN FINAL ── */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#343a40] hover:bg-[#23272b] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar Cliente</span>
                )}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}
