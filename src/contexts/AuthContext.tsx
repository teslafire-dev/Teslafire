import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { AuthContext, Role } from "./AuthContextCore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch or refresh the profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setRole(profile?.rol as Role ?? 'invitado');
    } catch (error) {
      console.error("AuthContext: Error al obtener el perfil:", error);
      setRole('invitado'); // Default safely
    }
  };

  useEffect(() => {
    let mounted = true;

    // Safety timeout: forced end of loading after 5 seconds
    const timeout = setTimeout(() => {
      if (mounted) {
        console.log("AuthContext: Tiempo de espera agotado. Forzando fin de carga.");
        setLoading(false);
      }
    }, 5000);

    const initialize = async () => {
      console.log("AuthContext: Iniciando fase de verificación...");
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        console.log("AuthContext: Sesión detectada:", currentUser?.email || "Ninguna");
        
        if (mounted) {
          setUser(currentUser);
          if (currentUser) {
            console.log("AuthContext: Cargando perfil de usuario...");
            await fetchProfile(currentUser.id);
          }
        }
      } catch (error) {
        console.error("AuthContext: Error de inicialización:", error);
      } finally {
        if (mounted) {
          console.log("AuthContext: Verificación completada.");
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext: Evento de Auth:", event);
      const currentUser = session?.user ?? null;
      
      if (mounted) {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          setUser(currentUser);
          if (currentUser) {
            await fetchProfile(currentUser.id);
          } else {
            setRole(null);
          }
          // After auth change, also make sure loading is false
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    role,
    loading,
    isAdmin: role === 'admin',
    isEditor: role === 'admin' || role === 'editor',
    refreshProfile: async () => {
      if (user) await fetchProfile(user.id);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
