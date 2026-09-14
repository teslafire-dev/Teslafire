import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

interface EditableProps {
  keyName: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  children?: React.ReactNode;
}

export function Editable({ keyName, as: Tag = 'span', className = '', children }: EditableProps) {
  const { t } = useTranslation();

  const rawText = t(keyName);
  const hasTranslation = rawText && rawText !== keyName;
  const currentText = hasTranslation 
    ? String(rawText) 
    : (typeof children === 'string' ? children : '');

  return (
    <Tag className={className}>
      {currentText || children}
    </Tag>
  );
}
