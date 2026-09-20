import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import LandingPage from "./pages/LandingPage";
import OrganisationPage from "./pages/OrganisationPage";
import TicketsPage from "./pages/TicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import ProjectSettingsPage from "./pages/ProjectSettingsPage";
import OrganisationMembersPage from "./pages/OrganisationMembersPage";
import ProjectInsightsPage from "./pages/ProjectInsightsPage";
import ProjectMembersPage from "./pages/ProjectMembersPage";
import AuthErrorOverlay from "./components/AuthErrorOverlay";
import { NotificationProvider } from "./context/NotificationContext";
import StandupPage from "./pages/StandupPage";
import MilestonesPage from "./pages/MilestonesPage";
import EmailVerifiedPage from "./pages/EmailVerifiedPage";

function RedirectToOrgStandup() {
  const { organizationId } = useParams();
  return <Navigate to={`/organisations/${organizationId}/standup`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
      <AuthErrorOverlay />
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<EmailVerifiedPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/organisations" element={<OrganisationPage />} />
          <Route path="/organisations/:organizationId/members" element={<OrganisationMembersPage />} />
          <Route path="/organisations/:organizationId/standup" element={<StandupPage />} />
          <Route path="/organisations/:organizationId/projects" element={<ProjectsPage />} />
          <Route path="/organisations/:organizationId/projects/:projectId/tickets" element={<TicketsPage />} />
          <Route path="/organisations/:organizationId/projects/:projectId/settings" element={<ProjectSettingsPage />} />
          <Route path="/organisations/:organizationId/projects/:projectId/members" element={<ProjectMembersPage />} />
          <Route path="/organisations/:organizationId/projects/:projectId/dashboard" element={<ProjectInsightsPage mode="dashboard" />} />
          {/* Standup moved to the organisation level (it was never actually
              project-scoped — see StandupPage, which only ever reads
              organizationId). This keeps old bookmarked/linked project-level
              URLs working by redirecting to the new org-level route. */}
          <Route
            path="/organisations/:organizationId/projects/:projectId/standup"
            element={<RedirectToOrgStandup />}
          />
          <Route path="/organisations/:organizationId/projects/:projectId/board" element={<ProjectInsightsPage mode="board" />} />
          <Route path="/organisations/:organizationId/projects/:projectId/milestones" element={<MilestonesPage />} />
          <Route path="/organisations/:organizationId/projects/:projectId/tickets/:ticketId" element={<TicketDetailPage />} />
        </Route>
<Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}
