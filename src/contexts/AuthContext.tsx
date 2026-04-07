import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { AuthContext, Role } from "./AuthContextCore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{
    user: User | null;
    role: Role | null;
    loading: boolean;
    canManageProducts: boolean;
    canManageUsers: boolean;
    canManageSettings: boolean;
    canManageOrders: boolean;
    nombre_completo: string | null;
    apellido: string | null;
    telefono: string | null;
  }>({
    user: null,
    role: null,
    loading: true,
    canManageProducts: false,
    canManageUsers: false,
    canManageSettings: false,
    canManageOrders: false,
    nombre_completo: null,
    apellido: null,
    telefono: null
  });

  const getProfileData = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); 
      
      if (error) {
         console.warn("AuthContext: error executing maybeSingle()", error);
      }
      
      const role = (profile?.rol as Role) ?? 'invitado';
      
      return {
        role,
        can_manage_products: profile?.can_manage_products ?? (role === 'admin' || role === 'editor'),
        can_manage_users: profile?.can_manage_users ?? (role === 'admin'),
        can_manage_settings: profile?.can_manage_settings ?? (role === 'admin'),
        can_manage_orders: profile?.can_manage_orders ?? (role === 'admin' || role === 'editor'),
        nombre_completo: profile?.nombre_completo ?? null,
        apellido: profile?.apellido ?? null,
        telefono: profile?.telefono ?? null
      };
    } catch (error) {
      console.error("AuthContext: Error crítico al obtener el perfil:", error);
      return {
        role: 'invitado' as Role,
        can_manage_products: false,
        can_manage_users: false,
        can_manage_settings: false,
        can_manage_orders: false,
        nombre_completo: null,
        apellido: null,
        telefono: null
      };
    }
  };

  useEffect(() => {
    let mounted = true;

    // Safety timeout: 8 seconds
    const forceStopLoading = setTimeout(() => {
      if (mounted) {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    }, 8000);

    const syncUser = async (session: any) => {
      if (!session?.user) {
        if (mounted) setAuthState({ 
          user: null, 
          role: null, 
          loading: false, 
          canManageProducts: false, 
          canManageUsers: false, 
          canManageSettings: false, 
          canManageOrders: false, 
          nombre_completo: null, 
          apellido: null,
          telefono: null 
        });
        return;
      }
      
      const profileData = await getProfileData(session.user.id);
      if (mounted) {
        setAuthState({
          user: session.user,
          role: profileData.role,
          loading: false,
          canManageProducts: profileData.can_manage_products,
          canManageUsers: profileData.can_manage_users,
          canManageSettings: profileData.can_manage_settings,
          canManageOrders: profileData.can_manage_orders,
          nombre_completo: profileData.nombre_completo,
          apellido: profileData.apellido,
          telefono: profileData.telefono
        });
      }
    };

    // Strict initialization
    supabase.auth.getSession().then(({ data: { session }, error }) => {
       if (error) console.error("Initial getSession error:", error);
       if (mounted) syncUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      if (mounted) {
        clearTimeout(forceStopLoading);
        syncUser(session);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(forceStopLoading);
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    ...authState,
    isAdmin: authState.role === 'admin',
    isEditor: authState.role === 'admin' || authState.role === 'editor',
    refreshProfile: async () => {
      if (authState.user) {
        const profileData = await getProfileData(authState.user.id);
        setAuthState(prev => ({
          ...prev,
          role: profileData.role,
          canManageProducts: profileData.can_manage_products,
          canManageUsers: profileData.can_manage_users,
          canManageSettings: profileData.can_manage_settings,
          canManageOrders: profileData.can_manage_orders,
          nombre_completo: profileData.nombre_completo,
          apellido: profileData.apellido,
          telefono: profileData.telefono
        }));
      }
    },
    updateProfile: async (data: { nombre_completo?: string; apellido?: string; telefono?: string }) => {
      if (!authState.user) return { error: { message: "No session" } };
      
      const { error } = await supabase
        .from('perfiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (!error) {
        setAuthState(prev => ({
          ...prev,
          ...data
        }));
      }
      return { error };
    },
    updateCredentials: async (data: { email?: string; password?: string }) => {
      if (!authState.user) return { error: { message: "No session" } };
      
      const { error } = await supabase.auth.updateUser(data);
      
      if (!error && data.email) {
        // En Supabase, cambiar el email requiere confirmación por lo general,
        // pero podemos actualizar el estado local si es necesario o esperar al evento
      }
      
      return { error };
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
