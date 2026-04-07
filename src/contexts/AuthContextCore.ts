import { createContext, useContext } from "react";
import { User } from "@supabase/supabase-js";

export type Role = 'admin' | 'editor' | 'invitado';

export interface AuthContextType {
  user: User | null;
  role: Role | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  canManageProducts: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext debe usarse dentro de un AuthProvider");
  }
  return context;
}
