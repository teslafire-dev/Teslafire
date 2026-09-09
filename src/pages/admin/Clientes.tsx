import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

// ============================================================
// Tipos y definición de datos
// ============================================================
export interface ClienteItem {
  id: string;
  nombre: string;
  documento: string; // V-..., J-...
  telefono: string | null;
  email: string | null;
  canal_venta: string;
  estado: string | null;
  ciudad: string | null;
  direccion: string | null;
  limite_credito: number;
  dias_credito: number;
  saldo_favor: number;
  activo: boolean;
  categoria_cliente: string;
}

const CANALES: Record<string, [string, string]> = {
  detal: ['Detal', 'bg-sky-50 text-sky-700'],
  mayor: ['Mayor', 'bg-brand-50 text-brand-700'],
  corporativo: ['Corporativo', 'bg-amber-50 text-amber-700'],
  instalador: ['Instalador', 'bg-emerald-50 text-emerald-700']
};

const estadosVenezuela = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
  'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón',
  'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta',
  'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas / La Guaira',
  'Yaracuy', 'Zulia'
];

export default function Clientes() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [busqueda, setBusqueda] = useState('');
  
  const [resultados, setResultados] = useState<ClienteItem[]>([]);
  const [cargando, setCargando] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteItem | null>(null);
  const [modalEstadoCuenta, setModalEstadoCuenta] = useState<ClienteItem | null>(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, conCredito: 0, inactivos: 0 });

  // Formulario simple
  const [formNombre, setFormNombre] = useState('');
  const [formDoc, setFormDoc] = useState('');
  const [formTel, setFormTel] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCanal, setFormCanal] = useState('Detal');
  const [formEstado, setFormEstado] = useState('');
  const [formCiudad, setFormCiudad] = useState('');
  const [formDireccion, setFormDireccion] = useState('');
  const [formLimiteCredito, setFormLimiteCredito] = useState('0');
  const [formDiasCredito, setFormDiasCredito] = useState('0');

  const [isSaving, setIsSaving] = useState(false);

  const MIN_LETRAS = 2;

  // Cargar estadísticas iniciales
  useEffect(() => {
    const fetchStats = async () => {
      const { count: total } = await supabase.from('clientes').select('*', { count: 'exact', head: true });
      const { count: credit } = await supabase.from('clientes').select('*', { count: 'exact', head: true }).gt('limite_credito', 0);
      const { count: inact } = await supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('activo', false);
      
      setStats({
        total: total || 0,
        conCredito: credit || 0,
        inactivos: inact || 0
      });
    };
    fetchStats();
  }, []);

  // Buscador
  useEffect(() => {
    const q = busqueda.trim();
    if (q.length < MIN_LETRAS) {
      setResultados([]);
      return;
    }

    const fetchResultados = async () => {
      setCargando(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .or(`nombre.ilike.%${q}%,documento.ilike.%${q}%,telefono.ilike.%${q}%`)
        .limit(20);
      
      if (!error && data) {
        setResultados(data as ClienteItem[]);
      }
      setCargando(false);
    };

    const debounceFn = setTimeout(fetchResultados, 350);
    return () => clearTimeout(debounceFn);
  }, [busqueda]);

  const handleNuevoCliente = () => {
    setClienteSeleccionado(null);
    setFormNombre(busqueda.trim());
    setFormDoc('');
    setFormTel('');
    setFormEmail('');
    setFormCanal('Detal');
    setFormEstado('');
    setFormCiudad('');
    setFormDireccion('');
    setFormLimiteCredito('0');
    setFormDiasCredito('0');
    setView('form');
  };

  const handleVerFicha = (cli: ClienteItem) => {
    setClienteSeleccionado(cli);
    setFormNombre(cli.nombre || '');
    setFormDoc(cli.documento || '');
    setFormTel(cli.telefono || '');
    setFormEmail(cli.email || '');
    setFormCanal(cli.canal_venta || 'Detal');
    setFormEstado(cli.estado || '');
    setFormCiudad(cli.ciudad || '');
    setFormDireccion(cli.direccion || '');
    setFormLimiteCredito((cli.limite_credito || 0).toString());
    setFormDiasCredito((cli.dias_credito || 0).toString());
    setView('form');
  };

  const handleGuardarForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      nombre: formNombre.trim(),
      documento: formDoc.trim(),
      telefono: formTel.trim(),
      email: formEmail.trim(),
      canal_venta: formCanal,
      estado: formEstado,
      ciudad: formCiudad.trim(),
      direccion: formDireccion.trim(),
      limite_credito: parseFloat(formLimiteCredito) || 0,
      dias_credito: parseInt(formDiasCredito) || 0
    };

    if (clienteSeleccionado) {
      const { error } = await supabase
        .from('clientes')
        .update(payload)
        .eq('id', clienteSeleccionado.id);
        
      if (error) {
        toast.error('Error al actualizar: ' + error.message);
      } else {
        toast.success('Cliente actualizado correctamente');
        setView('list');
        // Refresh local if it matches search
        if (busqueda.trim().length >= MIN_LETRAS) {
          setBusqueda(busqueda + ' '); // trigger re-fetch hack
          setTimeout(() => setBusqueda(busqueda.trim()), 100);
        }
      }
    } else {
      const { error } = await supabase
        .from('clientes')
        .insert([payload]);
        
      if (error) {
        toast.error('Error al crear: ' + error.message);
      } else {
        toast.success('Cliente registrado correctamente');
        setView('list');
        setStats(prev => ({...prev, total: prev.total + 1}));
      }
    }
    
    setIsSaving(false);
  };

  return (
    <div className="w-full font-sans animate-in fade-in zoom-in-95 duration-300">
      
      {/* ══════════════════════════════════════════════════
          VISTA 1: DIRECTORIO DE CLIENTES
      ══════════════════════════════════════════════════ */}
      {view === 'list' && (
        <div className="p-4 md:p-6">
          
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Directorio de Clientes
              </h2>
              <p className="text-[11px] md:text-sm text-gray-500 mt-0.5">
                Busca por nombre, cédula/RIF o teléfono.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleNuevoCliente}
                className="w-full md:w-auto bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm md:text-base font-semibold shadow-lg shadow-brand-500/30 transition-all text-center cursor-pointer"
              >
                + Nuevo Cliente
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="flex flex-wrap gap-2 mb-4 md:mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-brand-50 text-brand-700">
              👥 {stats.total} clientes
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-emerald-50 text-emerald-700">
              💳 {stats.conCredito} con crédito
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-red-50 text-red-600">
              🔒 {stats.inactivos} inactivos
            </span>
          </div>

          {/* Buscador */}
          <div className="relative mb-4 md:mb-5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoComplete="off"
              autoFocus
              placeholder="Buscar por nombre, cédula/RIF o teléfono..."
              className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-10 py-3 md:py-3.5 text-sm md:text-base focus:outline-none focus:border-brand-500 transition-colors bg-white text-gray-800"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 px-1.5 text-lg cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Zona de resultados */}
          <div id="cli-resultados">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full overflow-hidden">
              
              {/* Estado Inicial */}
              {!busqueda.trim() && (
                <div className="p-10 md:p-16 text-center text-gray-400">
                  <div className="text-5xl mb-3">🔍</div>
                  <p className="text-sm md:text-base font-medium text-gray-500">
                    Escribe para buscar un cliente
                  </p>
                  <p className="text-xs md:text-sm mt-1">
                    Por nombre, cédula/RIF o número de teléfono.
                  </p>
                </div>
              )}

              {/* Estado Búsqueda corta */}
              {busqueda.trim().length > 0 && busqueda.trim().length < MIN_LETRAS && (
                <div className="p-8 md:p-12 text-center text-gray-400">
                  <div className="text-3xl mb-2">⌨️</div>
                  <p className="text-xs md:text-sm">
                    Escribe al menos {MIN_LETRAS} letras o números para buscar.
                  </p>
                </div>
              )}

              {/* Estado Cargando */}
              {cargando && (
                <div className="p-10 text-center text-gray-400">
                  <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-brand-500 rounded-full animate-spin"></div>
                  <p className="text-xs md:text-sm mt-3">Buscando...</p>
                </div>
              )}

              {/* Estado Vacío */}
              {busqueda.trim().length >= MIN_LETRAS && !cargando && resultados.length === 0 && (
                <div className="p-10 md:p-14 text-center text-gray-400">
                  <div className="text-4xl mb-2">👤</div>
                  <p className="text-sm text-gray-500 mb-1">
                    Ningún cliente coincide con <b>{busqueda}</b>.
                  </p>
                  <p className="text-xs mb-4">
                    Revisa el documento o prueba con parte del nombre.
                  </p>
                  <button
                    type="button"
                    onClick={handleNuevoCliente}
                    className="text-brand-600 hover:text-brand-700 font-semibold text-sm cursor-pointer"
                  >
                    + Registrar este cliente
                  </button>
                </div>
              )}

              {/* Tabla de Resultados */}
              {busqueda.trim().length >= MIN_LETRAS && !cargando && resultados.length > 0 && (
                <div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs md:text-sm table-fixed">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                        <tr>
                          <th className="p-3 md:p-4 font-semibold w-[42%]">Cliente</th>
                          <th className="p-3 md:p-4 font-semibold w-[26%] hidden md:table-cell">Canal / Crédito</th>
                          <th className="p-3 md:p-4 font-semibold w-[20%]">Contacto</th>
                          <th className="p-3 md:p-4 font-semibold w-[12%] text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {resultados.map((c) => {
                          const telWa = String(c.telefono || '').replace(/\D+/g, '');
                          const canalKey = (c.canal_venta || 'detal').toLowerCase();
                          const canal = CANALES[canalKey] || [(c.canal_venta || '—'), 'bg-gray-100 text-gray-600'];
                          const cupo = c.limite_credito || 0;
                          const clasif = c.categoria_cliente || 'REGULAR';
                          const clasifClass = clasif === 'PLATINUM'
                            ? 'bg-sky-100 text-sky-800 border-sky-200'
                            : clasif === 'GOLD'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200';

                          return (
                            <tr
                              key={c.id}
                              onClick={() => handleVerFicha(c)}
                              className="align-top hover:bg-gray-50/60 transition-colors cursor-pointer"
                            >
                              <td className="p-3 md:p-4">
                                <div className="font-medium text-gray-800 break-words">
                                  {c.nombre}
                                  {!c.activo && (
                                    <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 align-middle">
                                      Inactivo
                                    </span>
                                  )}
                                </div>
                                <div className="text-gray-500 font-mono text-[11px] md:text-xs mt-0.5">
                                  {c.documento || '—'}
                                </div>
                                <span className={`md:hidden inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${canal[1]}`}>
                                  {canal[0]}
                                </span>
                              </td>

                              <td className="p-3 md:p-4 hidden md:table-cell">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${canal[1]}`}>
                                  {canal[0]}
                                </span>
                                <div className={`text-[11px] mt-1 ${cupo > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                  {cupo > 0 ? `💳 $${cupo.toFixed(2)} · ${c.dias_credito || 0} días` : 'Sin crédito'}
                                </div>
                                <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${clasifClass}`}>
                                  🏷️ {clasif}
                                </span>
                              </td>

                              <td className="p-3 md:p-4 text-gray-600 break-words">
                                {c.telefono ? (
                                  <a
                                    href={`https://wa.me/${telWa}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium"
                                  >
                                    <span>📱</span>
                                    <span>{c.telefono}</span>
                                  </a>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>

                              <td className="p-3 md:p-4 text-right">
                                <div className="flex items-center justify-end gap-2 md:gap-3">
                                  <button
                                    type="button"
                                    title="Estado de cuenta"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setModalEstadoCuenta(c);
                                    }}
                                    className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors cursor-pointer inline-flex items-center"
                                  >
                                    <span>📑</span>
                                    <span className="hidden md:inline ml-1">Estado</span>
                                  </button>
                                  <button
                                    type="button"
                                    title="Ver ficha"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVerFicha(c);
                                    }}
                                    className="text-brand-500 hover:text-brand-700 font-semibold transition-colors cursor-pointer inline-flex items-center"
                                  >
                                    <span>👁️</span>
                                    <span className="hidden md:inline ml-1">Ficha</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 py-2 border-t border-gray-50 text-[11px] text-gray-400 text-center">
                    {resultados.length} {resultados.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════
          VISTA 2: ESTRUCTURA FORMULARIO REGISTRAR / FICHA
      ══════════════════════════════════════════════════ */}
      {view === 'form' && (
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {clienteSeleccionado ? 'Ficha de Cliente' : 'Registrar Nuevo Cliente'}
            </h2>
            <button
              type="button"
              onClick={() => setView('list')}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Volver al Buscador
            </button>
          </div>

          <form onSubmit={handleGuardarForm} className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nombre y Apellido / Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Ej: María Fernanda Moya"
                  className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Cédula / RIF <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formDoc}
                    onChange={(e) => setFormDoc(e.target.value)}
                    placeholder="V-00000000"
                    className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTel}
                    onChange={(e) => setFormTel(e.target.value)}
                    placeholder="0414-1234567"
                    className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Canal de Venta
                </label>
                <select
                  value={formCanal}
                  onChange={(e) => setFormCanal(e.target.value)}
                  className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-brand-500 bg-white text-gray-700 cursor-pointer"
                >
                  <option value="Detal">Detal</option>
                  <option value="Mayor">Mayor</option>
                  <option value="Corporativo">Corporativo</option>
                  <option value="Instalador">Instalador</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formEstado}
                    onChange={(e) => setFormEstado(e.target.value)}
                    className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-brand-500 bg-white text-gray-700 cursor-pointer"
                  >
                    <option value="">— Seleccionar —</option>
                    {estadosVenezuela.map(est => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formCiudad}
                    onChange={(e) => setFormCiudad(e.target.value)}
                    placeholder="Ciudad"
                    className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Dirección
                </label>
                <textarea
                  rows={2}
                  value={formDireccion}
                  onChange={(e) => setFormDireccion(e.target.value)}
                  placeholder="Dirección completa"
                  className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-brand-500 bg-white placeholder:text-gray-400 resize-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="text-base">💳</span>
                <h3 className="text-sm font-bold text-gray-900">
                  Condiciones Comerciales
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Límite de Crédito (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formLimiteCredito}
                    onChange={(e) => setFormLimiteCredito(e.target.value)}
                    className="w-full text-sm font-bold text-emerald-600 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Días de Crédito
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formDiasCredito}
                    onChange={(e) => setFormDiasCredito(e.target.value)}
                    className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="px-5 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL ESTADO DE CUENTA RÁPIDO
      ══════════════════════════════════════════════════ */}
      {modalEstadoCuenta && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📑</span>
                <h3 className="text-base font-bold text-gray-800">
                  Estado de Cuenta
                </h3>
              </div>
              <button
                onClick={() => setModalEstadoCuenta(null)}
                className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-800">
                {modalEstadoCuenta.nombre}
              </p>
              <p className="text-xs text-gray-500 font-mono">
                {modalEstadoCuenta.documento || 'Sin identificación'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="block text-[11px] text-gray-500 font-bold uppercase">Límite Crédito</span>
                <span className="text-base font-black text-gray-800">
                  ${(modalEstadoCuenta.limite_credito || 0).toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="block text-[11px] text-gray-500 font-bold uppercase">Días Crédito</span>
                <span className="text-base font-black text-gray-800">
                  {modalEstadoCuenta.dias_credito || 0}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="block text-[11px] text-emerald-600 font-bold uppercase">Billetera / Favor</span>
                <span className="text-base font-black text-emerald-700">
                  ${(modalEstadoCuenta.saldo_favor || 0).toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <span className="block text-[11px] text-red-600 font-bold uppercase">Deuda Actual</span>
                <span className="text-base font-black text-red-700">
                  $0.00
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setModalEstadoCuenta(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
