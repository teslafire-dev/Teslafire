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
    canManageProducts: context.canManageProducts,
    canManageUsers: context.canManageUsers,
    canManageSettings: context.canManageSettings,
    canManageOrders: context.canManageOrders,
    nombre_completo: context.nombre_completo,
    apellido: context.apellido,
    telefono: context.telefono,
    refreshProfile: context.refreshProfile,
    updateProfile: context.updateProfile,
    updateCredentials: context.updateCredentials
  };
}
