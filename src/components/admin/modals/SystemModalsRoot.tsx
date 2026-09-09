import React from 'react';
import ProductSearchModal from './ProductSearchModal';
import ClientSearchModal from './ClientSearchModal';
import PaymentModal from './PaymentModal';
import RefundModal from './RefundModal';
import ItemModal from './ItemModal';
import PriceConsultantModal from './PriceConsultantModal';
import RecoverSaleModal from './RecoverSaleModal';

export default function SystemModalsRoot() {
  return (
    <>
      <ProductSearchModal />
      <ClientSearchModal />
      <PaymentModal />
      <RefundModal />
      <ItemModal />
      <PriceConsultantModal />
      <RecoverSaleModal />
    </>
  );
}
