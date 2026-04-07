import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { AuthContext, Role } from "./AuthContextCore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [canManageProducts, setCanManageProducts] = useState(false);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [canManageSettings, setCanManageSettings] = useState(false);

  // Function to fetch or refresh the profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('perfiles')
        .select('rol, can_manage_products, can_manage_users, can_manage_settings')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setRole(profile?.rol as Role ?? 'invitado');
      setCanManageProducts(!!profile?.can_manage_products);
      setCanManageUsers(!!profile?.can_manage_users);
      setCanManageSettings(!!profile?.can_manage_settings);
    } catch (error) {
      console.error("AuthContext: Error al obtener el perfil:", error);
      setRole('invitado'); // Default safely
      setCanManageProducts(false);
      setCanManageUsers(false);
      setCanManageSettings(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Safety fallback: ensure loading is turned off after 6 seconds max
    const forceStopLoading = setTimeout(() => {
      if (mounted) {
        console.warn("AuthContext: Tiempo de espera de seguridad superado.");
        setLoading(false);
      }
    }, 6000);

    const initialize = async () => {
      console.log(`[${new Date().toISOString()}] AuthContext: Iniciando inicialización...`);
      try {
        // Creamos una promesa que resuelve tras un pequeño timeout para no colgar la app
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout getSession")), 2000)
        );

        // Competimos: si getSession tarda más de 2s, seguimos sin él
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        const currentUser = session?.user ?? null;
        console.log(`[${new Date().toISOString()}] AuthContext: Sesión obtenida:`, currentUser?.id || 'Ninguna');
        
        if (mounted) {
          setUser(currentUser);
          if (currentUser) {
            fetchProfile(currentUser.id);
          }
        }
      } catch (error: any) {
        if (error.message === "Timeout getSession") {
          console.warn("AuthContext: getSession ha tardado demasiado, continuando sin sesión inicial.");
        } else {
          console.error("AuthContext: Error de inicialización:", error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(forceStopLoading);
          console.log(`[${new Date().toISOString()}] AuthContext: Loading finalizado`);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      
      if (mounted) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          setUser(currentUser);
          if (currentUser) {
            await fetchProfile(currentUser.id);
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(forceStopLoading);
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    role,
    loading,
    isAdmin: role === 'admin',
    isEditor: role === 'admin' || role === 'editor',
    canManageProducts,
    canManageUsers,
    canManageSettings,
    refreshProfile: async () => {
      if (user) await fetchProfile(user.id);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
