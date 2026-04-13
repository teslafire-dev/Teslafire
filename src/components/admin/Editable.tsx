import React, { useState, useRef, useEffect } from 'react';
import { useWisingWin } from '@/contexts/WisingWinContext';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/contexts/TranslationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Type, Palette, Save, X, Smartphone, Monitor } from 'lucide-react';

interface EditableProps {
  keyName: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  children?: React.ReactNode;
}

export function Editable({ keyName, as: Tag = 'span', className = '', children }: EditableProps) {
  const { isActive, updateValue, updateStyle, getStyle, dbConfig } = useWisingWin();
  const { t, lang } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Local state for editing
  const [tempText, setTempText] = useState('');
  const [tempColor, setTempColor] = useState('');
  const [tempSize, setTempSize] = useState('');
  const [tempMobSize, setTempMobSize] = useState('');

  const rawText = t(keyName);
  // Si t() devuelve la misma llave o está vacío, usamos el children por defecto
  const hasTranslation = rawText && rawText !== keyName;
  
  // Aseguramos que currentText sea estrictamente un string o vacío para TS
  const currentText = hasTranslation 
    ? String(rawText) 
    : (typeof children === 'string' ? children : '');

  const langPrefix = lang.toLowerCase();
  const dbKey = `${langPrefix}_${keyName.replace(/\./g, '_')}`;

  const customColor = getStyle(keyName, 'color', lang);
  const customSize = getStyle(keyName, 'size', lang);
  const customMobSize = getStyle(keyName, 'mob_size', lang);

  useEffect(() => {
    if (showMenu) {
      setTempText(currentText);
      setTempColor(customColor || '');
      setTempSize(customSize || '');
      setTempMobSize(customMobSize || '');
    }
  }, [showMenu, currentText, customColor, customSize, customMobSize]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleSave = async () => {
    if (tempText !== currentText) {
      await updateValue(dbKey, tempText);
    }
    if (tempColor) await updateStyle(keyName, 'color', tempColor, lang);
    if (tempSize) await updateStyle(keyName, 'size', tempSize, lang);
    if (tempMobSize) await updateStyle(keyName, 'mob_size', tempMobSize, lang);
    
    setShowMenu(false);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const activeSize = isMobile ? (customMobSize || customSize) : customSize;
  const tempActiveSize = isMobile ? (tempMobSize || tempSize) : tempSize;

  const styleObj: React.CSSProperties = {
    color: (showMenu ? tempColor : customColor) || undefined,
    fontSize: (showMenu ? tempActiveSize : activeSize) ? `${showMenu ? tempActiveSize : activeSize}px` : undefined,
    position: 'relative'
  };

  if (!isActive) {
    return (
      <Tag className={className} style={styleObj}>
        {currentText || children}
      </Tag>
    );
  }

  return (
    <Tag 
      className={`${className} cursor-crosshair transition-all duration-300 group/editable relative inline-block`}
      style={styleObj}
      onClick={(e) => {
        e.stopPropagation();
        if (isActive) setShowMenu(true);
      }}
    >
      {/* Visual Indicator (Rendija) - ONLY ON HOVER (Used span to be valid inside <p>) */}
      <span className="absolute -inset-2 border-2 border-dashed border-accent/40 rounded-lg opacity-0 group-hover/editable:opacity-100 transition-opacity bg-accent/5 pointer-events-none z-0 block">
        <span className="absolute -top-3 -left-1 bg-accent text-white text-[7px] font-black px-1 rounded uppercase tracking-tighter block">
          {keyName}
        </span>
      </span>

      <span className="relative z-10">
        {(showMenu ? tempText : currentText) || children}
      </span>

      {/* Property Menu Popover (Rendered via Portal to avoid nesting errors) */}
      {showMenu && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 pointer-events-none">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-primary-950/20 backdrop-blur-sm pointer-events-auto"
            onClick={() => setShowMenu(false)}
          />

          <motion.div 
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[3rem] p-8 min-w-[340px] relative z-10 text-left pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                      <Edit3 className="w-5 h-5" />
                   </div>
                   <div className="flex flex-col">
                      <h4 className="text-[10px] font-black uppercase text-primary-950 dark:text-white tracking-[0.2em]">WisingWin Editor</h4>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{keyName}</span>
                   </div>
                </div>
                <button onClick={() => setShowMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                   <X className="w-4 h-4 text-slate-400" />
                </button>
             </div>

             <div className="flex flex-col gap-6">
                {/* Text Edit */}
                <div className="flex flex-col gap-2">
                   <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                      <Type className="w-3 h-3" /> Contenido ({lang})
                   </label>
                   <textarea 
                     value={tempText || ''}
                     onChange={(e) => setTempText(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 text-xs font-medium focus:ring-2 focus:ring-accent outline-none min-h-[120px] text-slate-950 dark:text-white transition-all shadow-inner"
                   />
                </div>

                <div className="grid grid-cols-1 gap-5">
                   {/* Color Edit */}
                   <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                         <Palette className="w-3 h-3" /> Color Texto
                      </label>
                      <div className="flex gap-3">
                         <input 
                           type="color" 
                           value={tempColor || '#000000'}
                           onChange={(e) => setTempColor(e.target.value)}
                           className="w-12 h-12 rounded-2xl overflow-hidden border-none p-0 cursor-pointer shadow-xl"
                         />
                         <input 
                           type="text" 
                           value={tempColor}
                           onChange={(e) => setTempColor(e.target.value)}
                           placeholder="#000000"
                           className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 text-[10px] font-mono outline-none text-slate-950 dark:text-white shadow-inner"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
                      {/* PC Font Size */}
                      <div className="flex flex-col gap-2">
                         <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                            <Monitor className="w-3 h-3" /> PC (px)
                         </label>
                         <input 
                            type="number" 
                            value={tempSize}
                            onChange={(e) => setTempSize(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-[11px] font-black outline-none text-slate-950 dark:text-white shadow-inner"
                         />
                      </div>

                      {/* Mobile Font Size */}
                      <div className="flex flex-col gap-2">
                         <label className="text-[9px] font-black uppercase text-accent flex items-center gap-2 tracking-widest">
                            <Smartphone className="w-3 h-3" /> Móvil (px)
                         </label>
                         <input 
                            type="number" 
                            value={tempMobSize}
                            onChange={(e) => setTempMobSize(e.target.value)}
                            className="w-full bg-accent/5 border border-accent/20 rounded-2xl px-5 py-4 text-[11px] font-black outline-none text-accent shadow-inner"
                         />
                      </div>
                   </div>
                </div>

                <button 
                  onClick={handleSave}
                  className="w-full bg-accent text-white font-black uppercase text-[10px] tracking-widest py-6 rounded-3xl flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-2xl shadow-accent/40 active:scale-95"
                >
                  <Save className="w-4 h-4" /> Guardar Cambios
                </button>
             </div>
          </motion.div>
        </div>,
        document.body
      )}

    </Tag>
  );
}
