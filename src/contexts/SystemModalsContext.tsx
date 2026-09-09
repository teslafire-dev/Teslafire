import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Tipos para los modales
export interface ProductSearchConfig {
  onSelect?: (product: any) => void;
  title?: string;
  subtitle?: string;
}

export interface ClientSearchConfig {
  onSelect?: (client: any) => void;
  title?: string;
}

export interface PaymentConfig {
  totalUsd: number;
  totalBs: number;
  tasa: number;
  clientName?: string;
  onConfirm?: (payments: any[], vuelto: any) => void;
}

export interface RefundConfig {
  totalUsd: number;
  clientName?: string;
  onConfirm?: (refunds: any[]) => void;
}

export interface ItemModalConfig {
  modo: 'cantidad' | 'precio';
  titulo?: string;
  subtitulo?: string;
  valor?: number;
  max?: number;
  usd?: number;
  tasa?: number;
  min?: number;
  minSuave?: boolean;
  minTexto?: string;
  onConfirm?: (val: number) => void;
  extraBtn?: {
    label: string;
    onClick: () => void;
  };
}

interface SystemModalsContextProps {
  // Estado de Producto
  isProductSearchOpen: boolean;
  productSearchConfig: ProductSearchConfig | null;
  openProductSearch: (config?: ProductSearchConfig) => void;
  closeProductSearch: () => void;

  // Estado de Cliente
  isClientSearchOpen: boolean;
  clientSearchConfig: ClientSearchConfig | null;
  openClientSearch: (config?: ClientSearchConfig) => void;
  closeClientSearch: () => void;

  // Estado de Pago
  isPaymentModalOpen: boolean;
  paymentConfig: PaymentConfig | null;
  openPaymentModal: (config?: PaymentConfig) => void;
  closePaymentModal: () => void;

  // Estado de Reembolso
  isRefundModalOpen: boolean;
  refundConfig: RefundConfig | null;
  openRefundModal: (config?: RefundConfig) => void;
  closeRefundModal: () => void;

  // Estado de Item
  itemConfig: ItemModalConfig | null;
  openItemModal: (config: ItemModalConfig) => void;
  closeItemModal: () => void;

  // Estado de Consultor de Precios
  priceConsultantOpen: boolean;
  openPriceConsultant: () => void;
  closePriceConsultant: () => void;

  // Estado de Recuperar Venta
  recoverSaleConfig: { onSelect: (id: string | number) => void } | null;
  openRecoverSale: (onSelect: (id: string | number) => void) => void;
  closeRecoverSale: () => void;
}

const SystemModalsContext = createContext<SystemModalsContextProps | undefined>(undefined);

export function SystemModalsProvider({ children }: { children: ReactNode }) {
  // --- Productos ---
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [productSearchConfig, setProductSearchConfig] = useState<ProductSearchConfig | null>(null);

  const openProductSearch = useCallback((config?: ProductSearchConfig) => {
    setProductSearchConfig(config || null);
    setIsProductSearchOpen(true);
  }, []);

  const closeProductSearch = useCallback(() => {
    setIsProductSearchOpen(false);
    setTimeout(() => setProductSearchConfig(null), 300); // limpiar después de la animación
  }, []);

  // --- Clientes ---
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
  const [clientSearchConfig, setClientSearchConfig] = useState<ClientSearchConfig | null>(null);

  const openClientSearch = useCallback((config?: ClientSearchConfig) => {
    setClientSearchConfig(config || null);
    setIsClientSearchOpen(true);
  }, []);

  const closeClientSearch = useCallback(() => {
    setIsClientSearchOpen(false);
    setTimeout(() => setClientSearchConfig(null), 300);
  }, []);

  // --- Pagos ---
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);

  const openPaymentModal = useCallback((config?: PaymentConfig) => {
    setPaymentConfig(config || null);
    setIsPaymentModalOpen(true);
  }, []);

  const closePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    setTimeout(() => setPaymentConfig(null), 300);
  }, []);

  // --- Reembolsos ---
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundConfig, setRefundConfig] = useState<RefundConfig | null>(null);

  const openRefundModal = useCallback((config?: RefundConfig) => {
    setRefundConfig(config || null);
    setIsRefundModalOpen(true);
  }, []);

  const closeRefundModal = useCallback(() => {
    setIsRefundModalOpen(false);
    setTimeout(() => setRefundConfig(null), 300);
  }, []);

  // --- Items ---
  const [itemConfig, setItemConfig] = useState<ItemModalConfig | null>(null);
  const openItemModal = useCallback((config: ItemModalConfig) => setItemConfig(config), []);
  const closeItemModal = useCallback(() => setItemConfig(null), []);

  // --- Consultor de precios ---
  const [priceConsultantOpen, setPriceConsultantOpen] = useState(false);
  const openPriceConsultant = useCallback(() => setPriceConsultantOpen(true), []);
  const closePriceConsultant = useCallback(() => setPriceConsultantOpen(false), []);

  // --- Recuperar Venta ---
  const [recoverSaleConfig, setRecoverSaleConfig] = useState<{ onSelect: (id: string | number) => void } | null>(null);
  const openRecoverSale = useCallback((onSelect: (id: string | number) => void) => setRecoverSaleConfig({ onSelect }), []);
  const closeRecoverSale = useCallback(() => setRecoverSaleConfig(null), []);

  return (
    <SystemModalsContext.Provider
      value={{
        isProductSearchOpen,
        productSearchConfig,
        openProductSearch,
        closeProductSearch,

        isClientSearchOpen,
        clientSearchConfig,
        openClientSearch,
        closeClientSearch,

        isPaymentModalOpen,
        paymentConfig,
        openPaymentModal,
        closePaymentModal,

        isRefundModalOpen,
        refundConfig,
        openRefundModal,
        closeRefundModal,

        itemConfig,
        openItemModal,
        closeItemModal,

        priceConsultantOpen,
        openPriceConsultant,
        closePriceConsultant,

        recoverSaleConfig,
        openRecoverSale,
        closeRecoverSale
      }}
    >
      {children}
    </SystemModalsContext.Provider>
  );
}

export function useSystemModals() {
  const context = useContext(SystemModalsContext);
  if (context === undefined) {
    throw new Error('useSystemModals debe ser usado dentro de un SystemModalsProvider');
  }
  return context;
}
