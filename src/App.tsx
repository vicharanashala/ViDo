import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth';
import { ThemeProvider } from './lib/theme';
import { LandingPage } from './features/landing/LandingPage';
import { StyleLab } from './features/style-lab/StyleLab';
import { WorkspaceLayout } from './features/workspace/WorkspaceLayout';
import { NotFoundView } from './features/workspace/views/NotFoundView';
import { ErrorBoundary, CelestialCanvas } from './components/ui';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CelestialCanvas />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/style-lab" element={<StyleLab />} />
              <Route path="/preview/*" element={<WorkspaceLayout isPreview={true} />} />
              <Route path="/workspace/*" element={<WorkspaceLayout isPreview={false} />} />
              <Route path="/dashboard" element={<Navigate to="/workspace" replace />} />
              <Route path="*" element={<NotFoundView />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
