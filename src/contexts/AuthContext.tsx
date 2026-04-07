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

    // Safety fallback: ensure loading is turned off after 6 seconds max
    const forceStopLoading = setTimeout(() => {
      if (mounted) {
        console.warn("AuthContext: Tiempo de espera de seguridad superado.");
        setLoading(false);
      }
    }, 6000);

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        
        if (mounted) {
          setUser(currentUser);
          if (currentUser) {
            await fetchProfile(currentUser.id);
          }
        }
      } catch (error) {
        console.error("AuthContext: Error de inicialización:", error);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(forceStopLoading);
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
    refreshProfile: async () => {
      if (user) await fetchProfile(user.id);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
