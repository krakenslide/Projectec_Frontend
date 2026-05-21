import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function getPageLabel(pathname: string) {
  if (pathname === "/projects") return "Projects";
  if (pathname.startsWith("/projects/")) return "Board";
  return "Workspace";
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkViewport();

    const t = window.setTimeout(() => setVisible(true), 40);

    window.addEventListener("resize", checkViewport);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", checkViewport);
    };
  }, []);

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
    navigate("/projects");
  };

  const pageLabel = getPageLabel(location.pathname);

  return (
    <div
      className={[
        "min-h-screen bg-[#080808] text-[#f0ede6]",
        "font-['DM_Mono','Courier_New',monospace]",
        "transition-opacity duration-[550ms] ease-in",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {sidebarOpen && isMobile ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 cursor-default bg-black/70 transition-opacity duration-200"
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
            isMobile={isMobile}
            onLogout={logout}
            onToggleSidebar={toggleSidebar}
            pageLabel={pageLabel}
            sidebarOpen={sidebarOpen}
          />

          <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}