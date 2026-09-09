import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Users, ArrowUpRight, Plus, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useSystemModals } from '@/contexts/SystemModalsContext';
import toast from 'react-hot-toast';

export default function ClientSearchModal() {
  const { isClientSearchOpen, clientSearchConfig, closeClientSearch } = useSystemModals();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // Formulario nuevo cliente
  const [newClient, setNewClient] = useState({
    documento: '',
    nombre: '',
    telefono: '',
    direccion: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isClientSearchOpen) {
      setSearchTerm('');
      setResults([]);
      setSelectedIndex(-1);
      setIsCreatingNew(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isClientSearchOpen]);

  useEffect(() => {
    if (!searchTerm.trim() || isCreatingNew) {
      setResults([]);
      return;
    }

    const fetchClients = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .or(`nombre.ilike.%${searchTerm}%,documento.ilike.%${searchTerm}%,telefono.ilike.%${searchTerm}%`)
        .eq('activo', true)
        .limit(10);
      
      if (!error && data) {
        setResults(data);
        setSelectedIndex(data.length > 0 ? 0 : -1);
      }
      setIsLoading(false);
    };

    const delayDebounceFn = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, isCreatingNew]);

  const handleSelect = (client: any) => {
    if (clientSearchConfig?.onSelect) {
      clientSearchConfig.onSelect(client);
    }
    closeClientSearch();
  };

  const handleSaveNewClient = async () => {
    if (!newClient.documento || !newClient.nombre || !newClient.telefono || !newClient.direccion) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    setIsSaving(true);
    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        documento: newClient.documento,
        nombre: newClient.nombre,
        telefono: newClient.telefono,
        direccion: newClient.direccion
      }])
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      toast.error('Error al crear cliente: ' + error.message);
    } else if (data) {
      toast.success('Cliente registrado correctamente');
      handleSelect(data);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'F3') {
      e.preventDefault();
      setIsCreatingNew(!isCreatingNew);
      return;
    }

    if (isCreatingNew) return; // Si está en el formulario, no navegar por la lista

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeClientSearch();
    }
  };

  return (
    <AnimatePresence>
      {isClientSearchOpen && (
        <div className="fixed inset-0 z-[9998] flex items-start justify-center px-4 pt-[5vh] pb-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh]"
          >
            {/* Header */}
            <div className="p-5 md:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-brand-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
                    {clientSearchConfig?.title || 'Seleccionar Cliente'}
                  </h3>
                </div>
                <button
                  onClick={closeClientSearch}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Búsqueda y Botón Nuevo */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isCreatingNew}
                    className="block w-full pl-11 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-brand-500 focus:bg-white transition-colors disabled:opacity-50"
                    placeholder="Buscar por nombre, RIF o teléfono..."
                    autoComplete="off"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(!isCreatingNew)}
                  className={`flex-shrink-0 px-4 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors ${
                    isCreatingNew ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-brand-600 hover:bg-brand-700 text-white'
                  }`}
                >
                  {!isCreatingNew && <kbd className="hidden sm:block px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-bold leading-none">F3</kbd>}
                  <span className="hidden sm:inline">{isCreatingNew ? 'Cancelar' : 'Nuevo'}</span>
                  {isCreatingNew ? <X className="w-4 h-4 sm:hidden" /> : <Plus className="w-4 h-4 sm:hidden" />}
                </button>
              </div>
            </div>

            {/* Formulario Nuevo Cliente */}
            {isCreatingNew && (
              <div className="p-5 md:p-6 border-b border-gray-100 bg-brand-50/40">
                <div className="flex items-center gap-2 mb-4 text-brand-700">
                  <UserPlus className="w-5 h-5" />
                  <h4 className="font-bold">Registro Rápido de Cliente</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Nombre y Apellido <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newClient.nombre}
                      onChange={(e) => setNewClient({...newClient, nombre: e.target.value})}
                      className="w-full text-sm border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500 bg-white"
                      placeholder="Ej: María Fernanda Moya"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Cédula / RIF <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newClient.documento}
                      onChange={(e) => setNewClient({...newClient, documento: e.target.value})}
                      className="w-full text-sm border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500 bg-white"
                      placeholder="V-00000000"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Teléfono <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newClient.telefono}
                      onChange={(e) => setNewClient({...newClient, telefono: e.target.value})}
                      className="w-full text-sm border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500 bg-white"
                      placeholder="0414-1234567"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Dirección <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newClient.direccion}
                      onChange={(e) => setNewClient({...newClient, direccion: e.target.value})}
                      className="w-full text-sm border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500 bg-white"
                      placeholder="Dirección del cliente"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewClient}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar y Usar'}
                  </button>
                </div>
              </div>
            )}

            {/* Resultados */}
            {!isCreatingNew && (
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                {isLoading && (
                  <div className="p-8 text-center text-gray-400">
                    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm">Buscando clientes...</p>
                  </div>
                )}

                {!isLoading && searchTerm.trim() && results.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-base font-medium text-gray-600">No se encontraron clientes</p>
                    <p className="text-sm mt-1">Presiona F3 para registrar uno nuevo.</p>
                  </div>
                )}

                {!isLoading && results.map((client, index) => (
                  <div
                    key={client.id}
                    onClick={() => handleSelect(client)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                      selectedIndex === index ? 'bg-brand-50/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500 font-bold text-sm">
                      {client.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{client.nombre}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-600">{client.documento}</span>
                        <span className="truncate">{client.telefono}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 text-xs">
                      {client.limite_credito > 0 && (
                        <div className="font-bold text-brand-600">Crédito Activo</div>
                      )}
                      {client.saldo_favor > 0 && (
                        <div className="font-bold text-emerald-600">Billetera: ${Number(client.saldo_favor).toFixed(2)}</div>
                      )}
                    </div>
                    <div className="hidden sm:flex items-center text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                ))}

                {!isLoading && !searchTerm.trim() && (
                  <div className="p-10 text-center text-gray-400">
                    <div className="text-5xl mb-3">🔍</div>
                    <p className="text-sm font-medium text-gray-500">Escribe para buscar un cliente</p>
                    <p className="text-xs mt-1">Por nombre, cédula/RIF o teléfono.</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            {!isCreatingNew && (
              <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
                <span className="font-medium">{results.length} clientes encontrados</span>
                <span className="text-gray-400 font-semibold">Tesla Fire</span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
