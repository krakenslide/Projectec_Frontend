import { MailWarning } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthErrorStore } from "../store/authErrorStore";
import { useOrgStore } from "../store/orgStore";
import { ProjectecLogo } from "./ui/ProjectecLogo";

/**
 * Full-page notice shown whenever any API call returns a 401.
 * Most 401s here mean the signed-in account's email hasn't been verified
 * yet, so this explains that instead of leaving the user looking at a
 * silently-failed page.
 */
export default function AuthErrorOverlay() {
  const active = useAuthErrorStore((s) => s.active);
  const dismiss = useAuthErrorStore((s) => s.dismiss);
  const activeOrg = useOrgStore((s) => s.activeOrg);
  const navigate = useNavigate();

  if (!active) return null;

  const projectName = activeOrg?.name ?? "Projectec";

  const handleBackToLogin = () => {
    localStorage.removeItem("access_token");
    dismiss();
    navigate("/login");
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="auth-error-title"
      aria-describedby="auth-error-desc"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-black/85 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-panel border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 text-center shadow-popover">
        <div className="mb-5 flex justify-center">
          <ProjectecLogo size={30} animate={false} showWordmark={false} />
        </div>

        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-warning-soft text-warning">
          <MailWarning className="h-6 w-6" aria-hidden="true" />
        </div>

        <h1 id="auth-error-title" className="font-['Instrument_Serif',Georgia,serif] text-3xl text-zinc-900 dark:text-white">
          {projectName}: verify your email
        </h1>

        <p id="auth-error-desc" className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          We couldn't authorize that request for <span className="font-medium text-zinc-800 dark:text-zinc-200">{projectName}</span>.
          This usually means your email address hasn't been verified yet, or your
          session has expired. Please check your inbox for a verification link,
          then sign in again.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="inline-flex min-h-10 items-center justify-center rounded-control border border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white px-5 text-[11px] font-medium uppercase tracking-[.14em] text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-200"
          >
            Back to login
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-10 items-center justify-center rounded-control border border-zinc-300 dark:border-zinc-700 px-5 text-[11px] uppercase tracking-[.14em] text-zinc-700 dark:text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
