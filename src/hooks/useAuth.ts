import { useAuthContext } from '@/contexts/AuthContextCore';

export type { Role } from '@/contexts/AuthContextCore';

export function useAuth() {
  const context = useAuthContext();
  return { 
    user: context.user, 
    role: context.role, 
    loading: context.loading, 
    isAdmin: context.isAdmin, 
    isEditor: context.isEditor,
    isB2B: context.isB2B,
    clienteData: context.clienteData,
    canManageProducts: context.canManageProducts,
    canManageUsers: context.canManageUsers,
    canManageSettings: context.canManageSettings,
    canManageOrders: context.canManageOrders,
    nombre_completo: context.nombre_completo,
    apellido: context.apellido,
    telefono: context.telefono,
    empresa_id: context.empresa_id,
    empresa_slug: context.empresa_slug,
    empresa_nombre: context.empresa_nombre,
    modulos_activos: context.modulos_activos,
    refreshProfile: context.refreshProfile,
    syncUser: context.syncUser,
    updateProfile: context.updateProfile,
    updateCredentials: context.updateCredentials
  };
}
