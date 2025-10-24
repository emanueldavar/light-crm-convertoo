import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onConfirm,
  onClose
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const result = await onConfirm();
      if (result !== false) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmClasses =
    tone === 'danger'
      ? 'bg-rose-500 hover:bg-rose-500/90'
      : 'bg-primary hover:bg-primary/90';

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed inset-0 z-50 m-auto flex h-fit max-h-[80vh] w-full max-w-md flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="space-y-2">
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="text-sm text-slate-500 dark:text-slate-300">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-3">
              <Dialog.Close
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
              >
                {cancelLabel}
              </Dialog.Close>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow transition disabled:cursor-wait disabled:opacity-70 ${confirmClasses}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  tone: PropTypes.oneOf(['danger', 'primary']),
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
