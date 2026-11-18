import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LandingPage } from './features/landing/LandingPage';
import { StyleLab } from './features/style-lab/StyleLab';
import { WorkspaceLayout } from './features/workspace/WorkspaceLayout';
import { AuthView } from './features/workspace/views/AuthView';

function LegacyRedirect({ from }: { from: string }) {
  const location = useLocation();
  const suffix = location.pathname.replace(new RegExp(`^/${from}`), '');
  return <Navigate to={`/app${suffix || ''}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/style-lab" element={<StyleLab />} />
        <Route path="/auth" element={<AuthView />} />
        <Route path="/app/*" element={<WorkspaceLayout />} />
        <Route path="/preview/*" element={<LegacyRedirect from="preview" />} />
        <Route path="/workspace/*" element={<LegacyRedirect from="workspace" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
