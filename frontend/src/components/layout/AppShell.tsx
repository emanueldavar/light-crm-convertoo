import { Link, NavLink } from '@/lib/router';
import { useRouter } from '@/lib/router';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

const navItems = [
  { to: '/', label: 'Calculadora' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/snapshots', label: 'Snapshots' }
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [theme, toggleTheme] = useTheme();
  const { path } = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">⚡</span>
            SaaS Pricing Lab
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className='rounded-full px-4 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground'
                activeClassName='bg-primary text-primary-foreground shadow card-shadow'
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Alternar tema"
              title={`Alternar tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-10 sm:px-6 lg:px-8">{children}</main>
      <footer className="border-t border-border/60 bg-background/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} SaaS Pricing Lab. Cálculos em tempo real para SaaS e projetos.</p>
          <p>Local atual: {path}</p>
        </div>
      </footer>
    </div>
  );
}
