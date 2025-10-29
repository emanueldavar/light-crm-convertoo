import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

type RouterContextValue = {
  path: string;
  navigate: (path: string) => void;
};

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const handler = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = (to: string) => {
    if (to !== path) {
      window.history.pushState({}, '', to);
      setPath(to);
    }
  };

  const value = useMemo(() => ({ path, navigate }), [path]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter deve ser usado dentro de RouterProvider');
  }
  return context;
}

export function RouterView({ routes }: { routes: Record<string, ReactNode> }) {
  const { path } = useRouter();
  const element = routes[path] ?? routes['/'] ?? null;
  return <>{element}</>;
}

export function Link({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  const { navigate } = useRouter();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={['bg-transparent p-0 text-left', className].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  );
}

export function NavLink({ to, className, activeClassName, children }: { to: string; className?: string; activeClassName?: string; children: ReactNode }) {
  const { navigate, path } = useRouter();
  const isActive = path === to;
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={['bg-transparent p-0 text-left', className, isActive ? activeClassName : undefined].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  );
}
