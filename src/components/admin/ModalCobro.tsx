import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Coins, 
  Paperclip, 
  Check, 
  AlertCircle,
  ArrowRight,
  Trash2,
  Upload,
  Layers,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export interface MetodoCobro {
  id: number;
  nombre: string;
  codigoMoneda: 'USD' | 'BS';
  esBase: boolean;
  requiereBanco?: boolean;
  requiereReferencia?: boolean;
  requiereComprobante?: boolean;
}

export interface LineaPago {
  metodoId: number;
  nombre: string;
  esBase: boolean;
  montoMoneda: number;
  montoUsd: number;
  tasaCambio: number;
  referencia?: string;
  bancoId?: string;
  comprobanteUrl?: string;
  isBilletera?: boolean;
}

interface ModalCobroProps {
  isOpen: boolean;
  onClose: () => void;
  totalUsd: number;
  tasaBcv: number;
  clienteNombre?: string;
  clienteSaldoFavor?: number;
  onConfirmarCobro: (pagos: LineaPago[], resumen: {
    totalUsd: number;
    pagadoUsd: number;
    vueltoUsd: number;
    vueltoDestino: string;
    igtfUsd: number;
  }) => void;
}

export default function ModalCobro({
  isOpen,
  onClose,
  totalUsd,
  tasaBcv,
  clienteNombre,
  clienteSaldoFavor = 0,
  onConfirmarCobro
}: ModalCobroProps) {
  const metodos: MetodoCobro[] = [
    { id: 1, nombre: 'Divisa Efectivo ($)', codigoMoneda: 'USD', esBase: true },
    { id: 2, nombre: 'Efectivo (Bs)', codigoMoneda: 'BS', esBase: false },
    { id: 3, nombre: 'Pago Móvil', codigoMoneda: 'BS', esBase: false, requiereBanco: true, requiereReferencia: true, requiereComprobante: true },
    { id: 4, nombre: 'Punto de Venta', codigoMoneda: 'BS', esBase: false, requiereReferencia: true },
    { id: 5, nombre: 'Transferencia (Bs)', codigoMoneda: 'BS', esBase: false, requiereBanco: true, requiereReferencia: true, requiereComprobante: true },
    { id: 6, nombre: 'Zelle ($ USD)', codigoMoneda: 'USD', esBase: true, requiereReferencia: true, requiereComprobante: true },
    { id: 7, nombre: 'CASHEA', codigoMoneda: 'USD', esBase: true },
    { id: 8, nombre: 'Binance (USDT)', codigoMoneda: 'USD', esBase: true, requiereReferencia: true },
    { id: 9, nombre: 'BOFA ($ USD)', codigoMoneda: 'USD', esBase: true, requiereBanco: true, requiereReferencia: true, requiereComprobante: true },
  ];

  const bancos = [
    { id: 'bcv-1', nombre: 'Banco de Venezuela — Cta. Corriente Bs', moneda: 'BS' },
    { id: 'banesco-1', nombre: 'Banesco — Cta. Corriente Bs', moneda: 'BS' },
    { id: 'bofa-1', nombre: 'Bank of America — Custodia ($)', moneda: 'USD' },
    { id: 'caja-1', nombre: 'Caja Fuerte Principal ($)', moneda: 'USD' }
  ];

  const [lineas, setLineas] = useState<LineaPago[]>([]);
  const [activeMetodo, setActiveMetodo] = useState<MetodoCobro | null>(null);

  // Formulario de la línea en captura
  const [inputMontoUsd, setInputMontoUsd] = useState<number>(0);
  const [inputMontoBs, setInputMontoBs] = useState<number>(0);
  const [inputReferencia, setInputReferencia] = useState('');
  const [inputBanco, setInputBanco] = useState('');
  const [inputComprobante, setInputComprobante] = useState<string | null>(null);

  // Vuelto
  const [vueltoDestino, setVueltoDestino] = useState<'EFECTIVO_USD' | 'EFECTIVO_BS' | 'A_FAVOR' | 'SOBRANTE'>('EFECTIVO_USD');

  // Cálculos
  const igtfAlícuota = 0.03; // 3%
  const pagadoUsd = lineas.reduce((acc, l) => acc + l.montoUsd, 0);
  const pagadoDivisas = lineas.filter(l => l.esBase && !l.isBilletera).reduce((acc, l) => acc + l.montoUsd, 0);
  const igtfMonto = pagadoDivisas > 0 ? Number((pagadoDivisas * igtfAlícuota).toFixed(2)) : 0;
  const totalConIgtf = Number((totalUsd + igtfMonto).toFixed(2));
  const restanteUsd = Number((totalConIgtf - pagadoUsd).toFixed(2));
  const vueltoUsd = restanteUsd < 0 ? Math.abs(restanteUsd) : 0;

  // Iniciar al abrir
  useEffect(() => {
    if (isOpen) {
      setLineas([]);
      setActiveMetodo(null);
      setInputComprobante(null);
      setVueltoDestino('EFECTIVO_USD');
    }
  }, [isOpen, totalUsd]);

  // Manejo de atajos numéricos (1-9) y teclas rápidas
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Si está escribiendo en un input, no interceptamos 1-9
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';

      if (e.key === 'Escape') {
        e.preventDefault();
        if (activeMetodo) {
          setActiveMetodo(null);
        } else {
          onClose();
        }
      } else if (e.key === 'Enter') {
        if (activeMetodo) {
          e.preventDefault();
          agregarLinea();
        } else if (restanteUsd <= 0.01 && lineas.length > 0) {
          e.preventDefault();
          confirmar();
        }
      } else if (!isInput && /^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (metodos[idx]) {
          e.preventDefault();
          seleccionarMetodo(metodos[idx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeMetodo, restanteUsd, lineas, inputMontoUsd, inputMontoBs]);

  // Listener para pegar imagen (Ctrl + V)
  useEffect(() => {
    if (!isOpen || !activeMetodo) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setInputComprobante(event.target?.result as string);
              toast.success('Comprobante pegado desde el portapapeles');
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, activeMetodo]);

  const seleccionarMetodo = (m: MetodoCobro) => {
    setActiveMetodo(m);
    const sugeridoUsd = Math.max(0, restanteUsd);
    setInputMontoUsd(sugeridoUsd);
    setInputMontoBs(Number((sugeridoUsd * tasaBcv).toFixed(2)));
    setInputReferencia('');
    setInputBanco('');
    setInputComprobante(null);
  };

  const seleccionarBilletera = () => {
    if (clienteSaldoFavor <= 0) {
      toast.error('El cliente no tiene saldo a favor en su billetera');
      return;
    }
    const montoUsar = Math.min(clienteSaldoFavor, Math.max(0, restanteUsd));
    setLineas(prev => [
      ...prev,
      {
        metodoId: -1,
        nombre: 'Billetera (Saldo a Favor)',
        esBase: true,
        montoMoneda: montoUsar,
        montoUsd: montoUsar,
        tasaCambio: 1,
        isBilletera: true
      }
    ]);
    toast.success(`Abonado $ ${montoUsar.toFixed(2)} de la billetera`);
  };

  const agregarLinea = () => {
    if (!activeMetodo) return;

    const montoFinalUsd = activeMetodo.esBase ? inputMontoUsd : Number((inputMontoBs / tasaBcv).toFixed(2));
    const montoFinalMoneda = activeMetodo.esBase ? inputMontoUsd : inputMontoBs;

    if (montoFinalUsd <= 0) {
      toast.error('Ingresa un monto válido mayor a cero');
      return;
    }

    if (activeMetodo.requiereReferencia && !inputReferencia.trim()) {
      toast.error('El número de referencia es obligatorio');
      return;
    }

    setLineas(prev => [
      ...prev,
      {
        metodoId: activeMetodo.id,
        nombre: activeMetodo.nombre,
        esBase: activeMetodo.esBase,
        montoMoneda: montoFinalMoneda,
        montoUsd: montoFinalUsd,
        tasaCambio: activeMetodo.esBase ? 1 : tasaBcv,
        referencia: inputReferencia,
        bancoId: inputBanco,
        comprobanteUrl: inputComprobante || undefined
      }
    ]);

    setActiveMetodo(null);
  };

  const eliminarLinea = (idx: number) => {
    setLineas(prev => prev.filter((_, i) => i !== idx));
  };

  const confirmar = () => {
    if (lineas.length === 0) {
      toast.error('Debes registrar al menos un método de pago');
      return;
    }

    if (restanteUsd > 0.01) {
      toast.error(`Aún falta por cubrir $ ${restanteUsd.toFixed(2)}`);
      return;
    }

    onConfirmarCobro(lineas, {
      totalUsd: totalConIgtf,
      pagadoUsd,
      vueltoUsd,
      vueltoDestino,
      igtfUsd: igtfMonto
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-rajdhani text-gray-900 leading-tight">Procesar Cobro Multimoneda</h3>
              <p className="text-xs text-gray-400">
                {clienteNombre ? `Cliente: ${clienteNombre}` : 'Venta de Contado'} · Tasa: <b>Bs. {tasaBcv.toFixed(2)}</b>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Franja de Totales (Gloss Oscuro) */}
        <div 
          className="px-6 py-4 text-white flex items-center justify-between gap-4"
          style={{ background: 'linear-gradient(120deg, #080A0C, #1B1F23)' }}
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total a Pagar</div>
            <div className="text-3xl font-black font-rajdhani text-white leading-tight">
              $ {totalConIgtf.toFixed(2)}
            </div>
            <div className="text-sm font-bold text-electrico-500 font-rajdhani">
              Bs. {(totalConIgtf * tasaBcv).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.').replace('.', ',')}
            </div>
            {igtfMonto > 0 && (
              <div className="text-[10px] font-bold text-amber-400 mt-0.5">
                + IGTF (3% divisas): $ {igtfMonto.toFixed(2)}
              </div>
            )}
          </div>

          {/* Balance Restante / Vuelto */}
          <div className="text-right bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {restanteUsd > 0.01 ? 'Restante por Pagar' : (vueltoUsd > 0.01 ? 'Vuelto a Entregar' : 'Exacto')}
            </div>
            <div className={`text-2xl font-black font-rajdhani leading-tight ${
              restanteUsd > 0.01 ? 'text-red-400' : (vueltoUsd > 0.01 ? 'text-amber-400' : 'text-emerald-400')
            }`}>
              $ {restanteUsd > 0.01 ? restanteUsd.toFixed(2) : vueltoUsd.toFixed(2)}
            </div>
            <div className="text-xs font-semibold text-gray-300">
              Bs. {((restanteUsd > 0.01 ? restanteUsd : vueltoUsd) * tasaBcv).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Cuerpo: Métodos a la izquierda, Captura y Pagos a la derecha */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda: Botones 1-9 */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Seleccione Método (Teclas 1 - 9)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {metodos.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => seleccionarMetodo(m)}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all group ${
                    activeMetodo?.id === m.id
                      ? 'border-electrico-500 bg-electrico-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/70'
                  }`}
                >
                  <span className="w-7 h-7 rounded-lg bg-brand-900 text-white text-xs font-black flex items-center justify-center flex-shrink-0 group-hover:bg-brand-950">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-gray-800 truncate">{m.nombre}</span>
                    <span className={`block text-[10px] font-semibold ${m.esBase ? 'text-emerald-600' : 'text-brand-600'}`}>
                      {m.codigoMoneda === 'USD' ? 'Divisa $' : 'Bolívares'}
                    </span>
                  </div>
                </button>
              ))}

              {/* Botón Billetera si el cliente tiene saldo */}
              {clienteSaldoFavor > 0 && (
                <button
                  onClick={seleccionarBilletera}
                  className="col-span-2 flex items-center gap-2.5 p-3 rounded-2xl border-2 border-brand-200 bg-brand-50/40 hover:bg-brand-50 text-left transition-all"
                >
                  <span className="w-7 h-7 rounded-lg bg-brand-700 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                    B
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-brand-900">Billetera (Saldo a Favor)</span>
                    <span className="block text-[10px] font-bold text-brand-600">Disponible: $ {clienteSaldoFavor.toFixed(2)}</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Columna Derecha: Captura activa & Lista de Pagos */}
          <div className="space-y-4">
            {/* Formulario de Entrada */}
            {activeMetodo && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">
                    Ingresar {activeMetodo.nombre}
                  </span>
                  <button onClick={() => setActiveMetodo(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Monto $</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputMontoUsd || ''}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        setInputMontoUsd(v);
                        setInputMontoBs(Number((v * tasaBcv).toFixed(2)));
                      }}
                      className="w-full text-sm font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-500 text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Monto Bs</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputMontoBs || ''}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        setInputMontoBs(v);
                        setInputMontoUsd(Number((v / tasaBcv).toFixed(2)));
                      }}
                      className="w-full text-sm font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-500 text-right"
                    />
                  </div>
                </div>

                {activeMetodo.requiereBanco && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Banco Destino</label>
                    <select
                      value={inputBanco}
                      onChange={(e) => setInputBanco(e.target.value)}
                      className="w-full text-xs font-medium border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="">Selecciona cuenta bancaria...</option>
                      {bancos
                        .filter(b => (activeMetodo.esBase ? b.moneda === 'USD' : b.moneda === 'BS'))
                        .map(b => (
                          <option key={b.id} value={b.id}>{b.nombre}</option>
                        ))}
                    </select>
                  </div>
                )}

                {activeMetodo.requiereReferencia && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">N° de Referencia</label>
                    <input
                      type="text"
                      placeholder="Últimos dígitos o voucher..."
                      value={inputReferencia}
                      onChange={(e) => setInputReferencia(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                )}

                {/* Comprobante con Ctrl+V */}
                {activeMetodo.requiereComprobante && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Comprobante (Puedes presionar Ctrl+V para pegar captura)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setInputComprobante(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-gray-700"
                      />
                    </div>
                    {inputComprobante && (
                      <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Comprobante adjuntado
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setActiveMetodo(null)}
                    className="flex-1 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={agregarLinea}
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-brand-900 text-white hover:bg-brand-950"
                  >
                    Agregar Pago (Enter)
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Pagos Agregados */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Pagos Registrados ({lineas.length})
              </div>
              {lineas.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                  Selecciona un método de la izquierda para registrar el pago.
                </div>
              ) : (
                <div className="space-y-2">
                  {lineas.map((l, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-gray-900">{l.nombre}</div>
                        {l.referencia && <div className="text-[10px] text-gray-400 font-mono">Ref: #{l.referencia}</div>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 font-rajdhani">$ {l.montoUsd.toFixed(2)}</div>
                          {!l.esBase && <div className="text-[10px] text-gray-400">Bs. {l.montoMoneda.toFixed(2)}</div>}
                        </div>
                        <button onClick={() => eliminarLinea(i)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer con Selector de Vuelto y Confirmar */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
          {/* Opciones de Vuelto si sobra dinero */}
          {vueltoUsd > 0.01 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-bold text-amber-800">
                Vuelto de $ {vueltoUsd.toFixed(2)} (Bs. {(vueltoUsd * tasaBcv).toFixed(2)}) entregar en:
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVueltoDestino('EFECTIVO_USD')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    vueltoDestino === 'EFECTIVO_USD' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  Dólares ($)
                </button>
                <button
                  type="button"
                  onClick={() => setVueltoDestino('EFECTIVO_BS')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    vueltoDestino === 'EFECTIVO_BS' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  Bolívares (Bs)
                </button>
                <button
                  type="button"
                  onClick={() => setVueltoDestino('A_FAVOR')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    vueltoDestino === 'A_FAVOR' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  Saldo a Favor
                </button>
                <button
                  type="button"
                  onClick={() => setVueltoDestino('SOBRANTE')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    vueltoDestino === 'SOBRANTE' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  Sobrante en Caja
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancelar (Esc)
            </button>

            <button
              disabled={restanteUsd > 0.01 || lineas.length === 0}
              onClick={confirmar}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-extrabold font-rajdhani tracking-wider transition-all shadow-md shadow-emerald-600/20"
            >
              Confirmar Cobro e Imprimir (Enter)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
