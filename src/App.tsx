import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
      <AuthErrorOverlay />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/organisations" element={<OrganisationPage />} />
          <Route path="/organisations/:organizationId/members" element={<OrganisationMembersPage />} />
          <Route path="/organisations/:organizationId/projects" element={<ProjectsPage />} />
          <Route path="/organisations/:organizationId/projects/:projectId/tickets" element={<TicketsPage />} />
          <Route path="/organisations/:organizationId/projects/:projectId/settings" element={<ProjectSettingsPage />} />
          <Route path="/organisations/:organizationId/projects/:projectId/members" element={<ProjectMembersPage />} />
          <Route path="/organisations/:organizationId/projects/:projectId/dashboard" element={<ProjectInsightsPage mode="dashboard" />} />
          <Route path="/organisations/:organizationId/projects/:projectId/standup" element={<StandupPage />} />
          <Route path="/organisations/:organizationId/projects/:projectId/board" element={<ProjectInsightsPage mode="board" />} />
          <Route path="/organisations/:organizationId/projects/:projectId/tickets/:ticketId" element={<TicketDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}
