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
    refreshProfile: context.refreshProfile
  };
}
