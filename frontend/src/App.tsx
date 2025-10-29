import { AppShell } from '@/components/layout/AppShell';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SnapshotsPage } from '@/pages/SnapshotsPage';
import { RouterView } from '@/lib/router';

function App() {
  return (
    <AppShell>
      <RouterView
        routes={{
          '/': <CalculatorPage />,
          '/dashboard': <DashboardPage />,
          '/snapshots': <SnapshotsPage />
        }}
      />
    </AppShell>
  );
}

export default App;
