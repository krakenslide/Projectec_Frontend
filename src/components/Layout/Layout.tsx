import { MobileDock } from "./MobileDock";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ToastProvider } from "../ui/Toast";

function getPageLabel(pathname: string) {
  if (pathname === "/organisations") return "Organisations";
  if (pathname.includes("/dashboard")) return "Dashboard";
  if (pathname.includes("/standup")) return "Standup";
  if (pathname.includes("/board")) return "Kanban board";
  if (pathname.includes("/settings")) return "Project settings";
  if (pathname.includes("/members")) return "Members";
  if (pathname.includes("/tickets")) return "Tickets";
  if (pathname.includes("/projects")) return "Projects";
  return "Workspace";
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkViewport();

    window.addEventListener("resize", checkViewport);

    return () => {
      window.removeEventListener("resize", checkViewport);
    };
  }, []);

  useEffect(() => {
    setPageLoading(true);
    const timer = window.setTimeout(() => setPageLoading(false), 360);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const goHome = () => {
    navigate("/organisations");
  };

  const pageLabel = getPageLabel(location.pathname);
  const designPage = location.pathname.includes("/board")
    ? "board"
    : location.pathname.includes("/tickets/")
      ? "ticket-detail"
      : location.pathname.includes("/tickets")
        ? "tickets"
        : location.pathname.includes("/dashboard")
          ? "dashboard"
          : location.pathname.includes("/milestones")
            ? "milestones"
            : location.pathname.includes("/standup")
              ? "standup"
              : location.pathname.includes("/settings")
                ? "settings"
                : location.pathname.includes("/members")
                  ? "members"
                  : location.pathname.includes("/projects")
                    ? "projects"
                    : location.pathname === "/organisations"
                      ? "organisations"
                      : "workspace";

  return (
    <ToastProvider>
      <div
        className={[
          "pj-shell min-h-screen bg-white text-zinc-900 dark:bg-[#080808] dark:text-[#f5f3ee]",
          "font-['Inter',ui-sans-serif,sans-serif]",
          "animate-[pj-fade-in_220ms_ease_both]",
        ].join(" ")}
      >
        {sidebarOpen && isMobile ? (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-40 cursor-default bg-black/45 backdrop-blur-sm transition-opacity duration-200 dark:bg-black/70"
            onClick={closeSidebar}
            type="button"
          />
        ) : null}

        <div className="flex min-h-screen">
          <Sidebar
            isMobile={isMobile}
            onCloseSidebar={closeSidebar}
            onGoHome={goHome}
            onLogout={logout}
            onToggleSidebar={toggleSidebar}
            pathname={location.pathname}
            sidebarOpen={sidebarOpen}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header
              onLogout={logout}
              pageLabel={pageLabel}
              loading={pageLoading}
            />

            <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <div
                className={`pj-route-content mx-auto w-full ${location.pathname.includes("/standup") ? "max-w-none" : "max-w-7xl"}`}
                data-page={designPage}
              >
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
          <MobileDock />
    </ToastProvider>
  );
}
