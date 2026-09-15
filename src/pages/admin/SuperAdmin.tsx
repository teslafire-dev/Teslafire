import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Building2, Power, PowerOff, Loader2, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { ERP_MODULES, ERPModuleId } from '@/config/erpModules';

export default function SuperAdmin() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('empresas').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setEmpresas(data);
    }
    setLoading(false);
  };

  const toggleEmpresaStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('empresas')
      .update({ activa: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('Error al actualizar la empresa');
    } else {
      toast.success(`Empresa ${!currentStatus ? 'activada' : 'suspendida'}`);
      fetchEmpresas();
    }
  };

  const toggleModulo = async (empresaId: string, moduloId: ERPModuleId, currentModules: string[]) => {
    let newModules = [...(currentModules || [])];
    if (newModules.includes(moduloId)) {
      newModules = newModules.filter(m => m !== moduloId);
    } else {
      newModules.push(moduloId);
    }

    const { error } = await supabase
      .from('empresas')
      .update({ modulos_activos: newModules })
      .eq('id', empresaId);

    if (error) {
      toast.error('Error al actualizar módulos');
    } else {
      toast.success('Módulos de la empresa actualizados');
      fetchEmpresas();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Super Admin SaaS</h1>
          <p className="text-slate-500">Gestión de Inquilinos (Tenants) y Suscripciones</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresas.map((empresa) => (
            <div key={empresa.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${empresa.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {empresa.activa ? 'Activa' : 'Suspendida'}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">{empresa.nombre}</h3>
                <p className="text-slate-500 text-sm mb-4">URL: /{empresa.slug}/tienda</p>
                
                {/* Módulos SaaS */}
                <div className="mb-6 border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Módulos Activos (SaaS)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ERP_MODULES.map(mod => {
                      const isActive = (empresa.modulos_activos || []).includes(mod.id);
                      return (
                        <button 
                          key={mod.id}
                          onClick={() => toggleModulo(empresa.id, mod.id, empresa.modulos_activos)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${isActive ? 'bg-primary-50 text-primary-900 font-medium' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                          {isActive ? <CheckSquare className="w-4 h-4 text-primary-600" /> : <Square className="w-4 h-4" />}
                          <span className="truncate">{mod.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => toggleEmpresaStatus(empresa.id, empresa.activa)}
                className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors ${empresa.activa ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
              >
                {empresa.activa ? <><PowerOff className="w-4 h-4" /> Suspender Servicio</> : <><Power className="w-4 h-4" /> Reactivar Empresa</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
