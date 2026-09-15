import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ERP_MODULES } from '@/config/erpModules';
import { Lock } from 'lucide-react';

export default function AppLauncher() {
  const { user, role, modulos_activos, empresa_nombre } = useAuth();
  const navigate = useNavigate();

  // Si no hay empresa asignada (o es SuperAdmin puro), podría mostrar todo o nada
  // Asumimos que los módulos activos vienen en modulos_activos
  
  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
          {empresa_nombre || 'Mi Empresa'} ERP
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Selecciona el módulo con el que deseas trabajar hoy.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ERP_MODULES.map((modulo) => {
          const isModulePaid = (modulos_activos || []).includes(modulo.id) || modulos_activos?.length === 0; // Si no tiene, por defecto mostramos? Mejor bloquear
          const isRoleAllowed = modulo.rolesAllowed.includes(role || '');
          const canAccess = isModulePaid && isRoleAllowed;

          return (
            <button
              key={modulo.id}
              onClick={() => {
                if (canAccess) {
                  navigate(modulo.basePath);
                }
              }}
              className={`relative overflow-hidden group p-8 rounded-3xl text-left transition-all duration-300 ${
                canAccess 
                  ? `${modulo.color} hover:-translate-y-1 hover:shadow-xl hover:shadow-${modulo.color.replace('bg-', '')}/30` 
                  : 'bg-slate-200 dark:bg-slate-800 cursor-not-allowed opacity-75'
              }`}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${canAccess ? 'bg-white/20 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'}`}>
                    <modulo.icon className="w-8 h-8" />
                  </div>
                  {!canAccess && (
                    <div className="p-2 bg-slate-300 dark:bg-slate-700 rounded-full text-slate-500">
                      <Lock className="w-5 h-5" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${canAccess ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {modulo.name}
                  </h3>
                  <p className={`text-sm ${canAccess ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                    {modulo.description}
                  </p>
                </div>
              </div>
              
              {/* Decorative background element */}
              {canAccess && (
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                  <modulo.icon className="w-48 h-48 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
