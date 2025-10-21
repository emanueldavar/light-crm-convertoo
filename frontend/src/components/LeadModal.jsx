import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export function LeadModal({ lead, onClose }) {
  return (
    <Dialog.Root open={!!lead} onOpenChange={(open) => (!open ? onClose() : null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-8 shadow-xl dark:bg-slate-900"
          >
            {lead ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {lead.name}
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-slate-500 dark:text-slate-300">
                      {lead.company || 'Sem empresa informada'}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
                    Fechar
                  </Dialog.Close>
                </div>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-200">
                  <p>
                    <span className="font-medium">E-mail:</span> {lead.email}
                  </p>
                  <p>
                    <span className="font-medium">Telefone:</span> {lead.phone || '—'}
                  </p>
                  <p>
                    <span className="font-medium">Valor potencial:</span>{' '}
                    {lead.value ? `R$ ${lead.value.toLocaleString('pt-BR')}` : '—'}
                  </p>
                  <p>
                    <span className="font-medium">Observações:</span>
                  </p>
                  <p className="rounded-lg bg-slate-100 p-3 text-xs leading-relaxed dark:bg-slate-800">
                    {lead.notes || 'Nenhuma observação registrada.'}
                  </p>
                  {lead.tags?.length ? (
                    <div className="space-y-2">
                      <p className="font-medium">Etiquetas</p>
                      <div className="flex flex-wrap gap-2">
                        {lead.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-full px-2 py-1 text-xs font-semibold"
                            style={{ backgroundColor: `${tag.color}33`, color: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

LeadModal.propTypes = {
  lead: PropTypes.object,
  onClose: PropTypes.func.isRequired
};
