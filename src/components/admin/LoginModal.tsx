import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import LoginForm from "./LoginForm";
import { useEffect, useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primary-950/40 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4 md:p-6 text-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden relative border border-white/20 dark:border-slate-800 text-left"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-smooth text-slate-400 hover:text-primary-950 dark:hover:text-white z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col">
                {/* Header Decoration */}
                <div className="bg-primary-950 p-6 md:p-8 text-center flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-primary-950 font-black text-xl">D</span>
                  </div>
                  <h3 className="text-white text-lg font-black uppercase tracking-tighter">Acceso Admin</h3>
                  <p className="text-slate-400 text-[7px] font-black uppercase tracking-[0.2em]">Portal de Seguridad Dobell</p>
                </div>

                <div className="flex-1 overflow-hidden">
                  <LoginForm onSuccess={onClose} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
