import { createContext, useContext } from "react";
import { User } from "@supabase/supabase-js";

export type Role = 'admin' | 'gerente' | 'cajero' | 'almacenista' | 'contador' | 'editor' | 'invitado' | 'cliente_b2b';

export interface ClienteB2BData {
  id: string;
  nombre: string;
  documento: string;
  telefono: string | null;
  email: string | null;
  canal_venta?: string;
  direccion?: string | null;
  limite_credito: number;
  dias_credito: number;
  saldo_favor: number;
  estado_aprobacion?: string;
}

export interface AuthContextType {
  user: User | null;
  role: Role | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isB2B: boolean;
  clienteData: ClienteB2BData | null;
  canManageProducts: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageOrders: boolean;
  nombre_completo: string | null;
  apellido: string | null;
  telefono: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: { nombre_completo?: string; apellido?: string; telefono?: string }) => Promise<{ error: any }>;
  updateCredentials: (data: { email?: string; password?: string }) => Promise<{ error: any }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext debe usarse dentro de un AuthProvider");
  }
  return context;
}
