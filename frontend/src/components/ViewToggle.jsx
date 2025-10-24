import PropTypes from 'prop-types';
import { LayoutGroup, motion } from 'framer-motion';

const options = [
  { value: 'kanban', label: 'Kanban' },
  { value: 'list', label: 'Lista' }
];

export function ViewToggle({ value, onChange }) {
  return (
    <LayoutGroup>
      <div className="flex gap-2 rounded-full bg-slate-200 p-1 dark:bg-slate-800">
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className="relative rounded-full px-4 py-1 text-sm font-medium text-slate-600 transition focus:outline-none dark:text-slate-200"
              type="button"
            >
              {isActive ? (
                <motion.span
                  layoutId="view-toggle"
                  className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-slate-700"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              ) : null}
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

ViewToggle.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};
