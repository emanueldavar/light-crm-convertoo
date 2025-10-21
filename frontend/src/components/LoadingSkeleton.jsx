import { motion } from 'framer-motion';

const shimmer = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export function LoadingSkeleton() {
  return (
    <div className="flex gap-6 overflow-hidden">
      {Array.from({ length: 3 }).map((_, columnIndex) => (
        <div
          key={columnIndex}
          className="flex min-w-[280px] flex-1 flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
        >
          <motion.div
            className="h-6 w-1/2 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800"
            variants={shimmer}
            animate="animate"
          />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((__, cardIndex) => (
              <motion.div
                key={cardIndex}
                className="h-24 rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 shadow-sm dark:from-slate-800 dark:via-slate-700 dark:to-slate-800"
                variants={shimmer}
                animate="animate"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
