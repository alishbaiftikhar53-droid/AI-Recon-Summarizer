import { ScanSearch } from 'lucide-react';
import { EmptyState } from '@/components/ui/StateViews';
import Button from '@/components/ui/Button';
import AppShell from '@/components/layout/AppShell';
import { useRoute, navigate } from '@/hooks/useRoute';
import AnalysisPage from '@/pages/AnalysisPage';
import AssistantPage from '@/pages/AssistantPage';
import DashboardPage from '@/pages/DashboardPage';
import ReportsPage from '@/pages/ReportsPage';
import RiskPage from '@/pages/RiskPage';
import ScanHistoryPage from '@/pages/ScanHistoryPage';
import ScanManagementPage from '@/pages/ScanManagementPage';
import ScanResultsPage from '@/pages/ScanResultsPage';
import SettingsPage from '@/pages/SettingsPage';
import VulnerabilityIntelPage from '@/pages/VulnerabilityIntelPage';

function renderPage(page: string, id: string | undefined) {
  switch (page) {
    case 'dashboard':
      return <DashboardPage />;
    case 'scans':
      return id ? <ScanResultsPage scanId={id} /> : <ScanManagementPage />;
    case 'history':
      return <ScanHistoryPage />;
    case 'analysis':
      return <AnalysisPage scanId={id} />;
    case 'risk':
      return <RiskPage scanId={id} />;
    case 'vulnerabilities':
      return <VulnerabilityIntelPage />;
    case 'assistant':
      return <AssistantPage scanId={id} />;
    case 'reports':
      return <ReportsPage scanId={id} />;
    case 'settings':
      return <SettingsPage />;
    default:
      return (
        <EmptyState
          icon={ScanSearch}
          title="Page not found"
          description="The page you opened does not exist. Use the navigation to choose a section."
          action={
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Back to dashboard
            </Button>
          }
        />
      );
  }
}

export default function App() {
  const [page = 'dashboard', scanId] = useRoute();
  return <AppShell>{renderPage(page, scanId)}</AppShell>;
}
