import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert, Ban } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  confirmText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: 'delete' | 'warning' | 'cancel' | 'shield';
}

const iconMap = {
  delete: Trash2,
  warning: AlertTriangle,
  cancel: Ban,
  shield: ShieldAlert,
};

const variantStyles = {
  danger: {
    iconBg: 'bg-gradient-to-br from-red-500/20 to-red-600/10',
    iconColor: 'text-red-400',
    ringColor: 'ring-red-500/20',
    btnBg: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25',
    glowColor: 'shadow-red-500/30',
    accentLine: 'from-red-500 to-red-600',
  },
  warning: {
    iconBg: 'bg-gradient-to-br from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-400',
    ringColor: 'ring-amber-500/20',
    btnBg: 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-500/25',
    glowColor: 'shadow-amber-500/30',
    accentLine: 'from-amber-500 to-orange-500',
  },
  info: {
    iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10',
    iconColor: 'text-blue-400',
    ringColor: 'ring-blue-500/20',
    btnBg: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25',
    glowColor: 'shadow-blue-500/30',
    accentLine: 'from-blue-500 to-cyan-500',
  },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'This action cannot be undone. Are you sure you want to proceed?',
  confirmText = 'Confirm',
  variant = 'danger',
  icon = 'delete',
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const Icon = iconMap[icon];
  const style = variantStyles[variant];

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90vw] max-w-[420px]"
          >
            <div className={`relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-b from-card/95 to-card shadow-2xl ${style.glowColor}`}>
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${style.accentLine}`} />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-secondary/60 hover:bg-secondary flex items-center justify-center transition-colors group z-10"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              {/* Content */}
              <div className="p-6 pt-8">
                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    className="relative"
                  >
                    <div className={`w-16 h-16 rounded-2xl ${style.iconBg} ring-1 ${style.ringColor} flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 ${style.iconColor}`} />
                    </div>
                    {/* Pulse ring */}
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      className={`absolute inset-0 rounded-2xl ${style.iconBg} -z-10`}
                    />
                  </motion.div>
                </div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="font-display text-lg font-bold text-center mb-2"
                >
                  {title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-muted-foreground text-center leading-relaxed max-w-[320px] mx-auto"
                >
                  {description}
                </motion.p>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="px-6 pb-6 flex gap-3"
              >
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/40 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`flex-1 h-11 rounded-xl ${style.btnBg} text-white text-sm font-semibold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Icon className="w-4 h-4" />
                      {confirmText}
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for easy usage
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    onConfirm: () => Promise<void> | void;
    title: string;
    description: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'info';
    icon: 'delete' | 'warning' | 'cancel' | 'shield';
  }>({
    open: false,
    onConfirm: () => {},
    title: '',
    description: '',
    confirmText: 'Confirm',
    variant: 'danger',
    icon: 'delete',
  });

  const confirm = (opts: {
    title: string;
    description: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'info';
    icon?: 'delete' | 'warning' | 'cancel' | 'shield';
    onConfirm: () => Promise<void> | void;
  }) => {
    setState({
      open: true,
      title: opts.title,
      description: opts.description,
      confirmText: opts.confirmText || 'Confirm',
      variant: opts.variant || 'danger',
      icon: opts.icon || 'delete',
      onConfirm: opts.onConfirm,
    });
  };

  const close = () => setState(prev => ({ ...prev, open: false }));

  const DialogComponent = (
    <ConfirmDialog
      open={state.open}
      onClose={close}
      onConfirm={state.onConfirm}
      title={state.title}
      description={state.description}
      confirmText={state.confirmText}
      variant={state.variant}
      icon={state.icon}
    />
  );

  return { confirm, DialogComponent };
}
