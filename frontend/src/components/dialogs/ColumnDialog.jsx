import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const defaultValues = {
  name: '',
  color: '#6366f1'
};

export function ColumnDialog({ open, mode, initialValues, onClose, onSubmit }) {
  const [formState, setFormState] = useState(() => ({ ...defaultValues }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setFormState({
        name: initialValues.name ?? defaultValues.name,
        color: initialValues.color ?? defaultValues.color
      });
    } else {
      setFormState({ ...defaultValues });
    }
  }, [initialValues, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await onSubmit(formState);
      if (result !== false) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="fixed inset-0 z-50 m-auto flex h-fit max-h-[90vh] w-full max-w-md flex-col gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="space-y-1">
              <Dialog.Title className="text-xl font-semibold text-slate-900 dark:text-white">
                {mode === 'create' ? 'Nova coluna' : 'Editar coluna'}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500 dark:text-slate-300">
                Organize o funil com nomes e cores personalizados.
              </Dialog.Description>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Nome da coluna
                <input
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="Ex.: Qualificando"
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Cor da coluna
                <input
                  name="color"
                  value={formState.color}
                  onChange={handleChange}
                  type="color"
                  className="h-12 w-full cursor-pointer rounded-2xl border border-slate-300 bg-white p-2 transition focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </label>
              <div className="flex items-center justify-end gap-3">
                <Dialog.Close
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
                >
                  Cancelar
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-80"
                >
                  {mode === 'create' ? 'Criar coluna' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

ColumnDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  initialValues: PropTypes.shape({
    name: PropTypes.string,
    color: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};
