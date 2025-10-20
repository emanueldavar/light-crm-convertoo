import { motion } from 'framer-motion';
import clsx from 'clsx';

function ViewToggle({ options, value, onChange }) {
  return (
    <div className="relative flex rounded-full border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800/70">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={clsx(
              'relative flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition focus:outline-none',
              isActive
                ? 'text-primary-600 dark:text-primary-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="view-toggle"
                className="absolute inset-0 rounded-full bg-white shadow-soft dark:bg-slate-700/60"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Icon className="h-4 w-4" />
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ViewToggle;
