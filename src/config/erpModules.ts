import { 
  ShoppingCart, 
  Package, 
  Briefcase, 
  DollarSign, 
  BarChart2, 
  Settings 
} from 'lucide-react';

export type ERPModuleId = 'VENTAS' | 'INVENTARIO' | 'COMPRAS' | 'FINANZAS' | 'ANALITICAS' | 'CONFIGURACION';

export interface ERPModule {
  id: ERPModuleId;
  name: string;
  description: string;
  icon: any;
  color: string;
  basePath: string;
  rolesAllowed: string[]; // Qué roles pueden acceder a este módulo si está activo en la empresa
}

export const ERP_MODULES: ERPModule[] = [
  {
    id: 'VENTAS',
    name: 'Ventas y CRM',
    description: 'Punto de venta, clientes, cotizaciones y pedidos B2B.',
    icon: ShoppingCart,
    color: 'bg-blue-500',
    basePath: '/admin/ventas/clientes',
    rolesAllowed: ['admin', 'gerente', 'vendedor', 'cajero']
  },
  {
    id: 'INVENTARIO',
    name: 'Inventario y Almacén',
    description: 'Productos, categorías, movimientos, y traslados.',
    icon: Package,
    color: 'bg-indigo-500',
    basePath: '/admin/inventario/kardex',
    rolesAllowed: ['admin', 'gerente', 'almacenista']
  },
  {
    id: 'COMPRAS',
    name: 'Compras y Proveedores',
    description: 'Órdenes de compra y gestión de proveedores.',
    icon: Briefcase,
    color: 'bg-purple-500',
    basePath: '/admin/compras/proveedores',
    rolesAllowed: ['admin', 'gerente', 'contador']
  },
  {
    id: 'FINANZAS',
    name: 'Finanzas y Tesorería',
    description: 'Cuentas por cobrar/pagar, bancos y libros fiscales.',
    icon: DollarSign,
    color: 'bg-emerald-500',
    basePath: '/admin/bancos/cuentas', // O /admin/cxc/estado
    rolesAllowed: ['admin', 'gerente', 'contador']
  },
  {
    id: 'ANALITICAS',
    name: 'Inteligencia de Negocios',
    description: 'Reportes avanzados y tablero diario (BI).',
    icon: BarChart2,
    color: 'bg-orange-500',
    basePath: '/admin/dashboard',
    rolesAllowed: ['admin', 'gerente']
  },
  {
    id: 'CONFIGURACION',
    name: 'Configuración SaaS',
    description: 'Roles, usuarios, datos de la empresa y web.',
    icon: Settings,
    color: 'bg-slate-700',
    basePath: '/admin/configuracion/empresa', // o basepath múltiple si hay varios
    rolesAllowed: ['admin']
  }
];
