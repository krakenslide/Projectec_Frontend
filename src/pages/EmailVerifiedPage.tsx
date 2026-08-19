
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProjectecLogo } from "../components/ui/ProjectecLogo";
import ThemeToggle from "../components/ui/ThemeToggle";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap";

export default function EmailVerifiedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!document.querySelector("[data-pjc-fonts]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONTS;
      link.setAttribute("data-pjc-fonts", "1");
      document.head.appendChild(link);
    }

    const t = window.setTimeout(() => setVisible(true), 40);

    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setLoading(false);
      setError("Invalid or missing verification token.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `/v1/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          let message = "Unable to verify your email.";

          try {
            const data = await response.json();
            message = data.detail || data.message || message;
          } catch {
            // Ignore JSON parsing errors
          }

          throw new Error(message);
        }

        setVerified(true);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify your email."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  useEffect(() => {
    if (!verified) {
      return;
    }

    if (countdown <= 0) {
      navigate("/login", { replace: true });
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [verified, countdown, navigate]);

  return (
    <main
      className={[
        "flex min-h-screen bg-[var(--pj-bg)] text-[var(--pj-text)]",
        "font-['Inter',ui-sans-serif,sans-serif]",
        "transition-opacity duration-[550ms] ease-in",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div className="fixed right-5 top-5 z-10">
        <ThemeToggle />
      </div>

      {/* LEFT PANEL */}
      <aside className="hidden min-h-screen w-[44%] flex-col justify-between border-r border-[var(--pj-border)] px-[52px] py-[44px] md:flex">
        <div className="flex items-center gap-[11px]">
          <ProjectecLogo
            size={26}
            delay={100}
            animate
            enableHover
          />
        </div>

        <div>
          <p className="mb-8 text-[10px] uppercase tracking-[0.22em] text-[var(--pj-muted)]">
            02 — Verification
          </p>

          <h1 className="mb-11 font-['Instrument_Serif',Georgia,serif] text-[clamp(52px,5.5vw,84px)] font-normal leading-[0.92] tracking-[-0.01em]">
            Your
            <br />
            <em className="font-normal italic text-[var(--pj-muted)]">
              account.
            </em>
            <br />
            verified.
          </h1>

          <div className="border-t border-[var(--pj-border)] pt-8">
            <p className="m-0 max-w-[270px] text-[12px] leading-[1.85] text-[var(--pj-muted)]">
              Your email verification is complete. You're ready to get
              started with WorkOrbit.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[0.06em] text-[var(--pj-dim)]">
            v2.4.1
          </span>

          <span className="text-[11px] tracking-[0.06em] text-[var(--pj-dim)]">
            © 2025
          </span>
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <section className="flex flex-1 items-center justify-center px-6 py-8 md:px-14 md:py-11">
        <div className="w-full max-w-[352px]">
          {loading ? (
            <>
              <div className="mb-[52px]">
                <p className="mb-[18px] text-[10px] uppercase tracking-[0.22em] text-[var(--pj-muted)]">
                  Verification
                </p>

                <h2 className="m-0 font-['Instrument_Serif',Georgia,serif] text-[36px] font-normal leading-[1.05]">
                  Verifying
                  <br />
                  <em className="font-normal italic text-[var(--pj-muted)]">
                    your email.
                  </em>
                </h2>
              </div>

              <div className="flex items-center gap-3 border-y border-[var(--pj-border)] py-4">
                <span className="inline-block h-[10px] w-[10px] animate-spin rounded-full border border-[var(--pj-input-border)] border-t-[var(--pj-muted)]" />

                <p className="m-0 text-[11px] uppercase tracking-[0.16em] text-[var(--pj-muted)]">
                  Please wait
                </p>
              </div>
            </>
          ) : verified ? (
            <>
              <div className="mb-[52px]">
                <p className="mb-[18px] text-[10px] uppercase tracking-[0.22em] text-[var(--pj-muted)]">
                  Verification complete
                </p>

                <h2 className="m-0 font-['Instrument_Serif',Georgia,serif] text-[36px] font-normal leading-[1.05]">
                  Email
                  <br />
                  <em className="font-normal italic text-[var(--pj-muted)]">
                    verified.
                  </em>
                </h2>
              </div>

              <div className="border-y border-[var(--pj-border)] py-5">
                <p className="m-0 text-[12px] leading-[1.8] text-[var(--pj-muted)]">
                  Your email address has been successfully verified.
                </p>

                <p className="mt-4 mb-0 text-[11px] uppercase tracking-[0.16em] text-[var(--pj-muted)]">
                  Redirecting to login in{" "}
                  <span className="text-[var(--pj-text)]">
                    {countdown}
                  </span>{" "}
                  seconds
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login", { replace: true })}
                className={[
                  "mt-9 flex w-full items-center justify-center border px-6 py-4",
                  "rounded-none border-[var(--pj-text)] bg-[var(--pj-text)]",
                  "font-['Inter',ui-sans-serif,sans-serif]",
                  "text-[11px] uppercase tracking-[0.22em]",
                  "text-[var(--pj-bg)] transition-all duration-200",
                  "hover:bg-[var(--pj-button-hover)]",
                  "cursor-pointer",
                ].join(" ")}
              >
                Go to login →
              </button>
            </>
          ) : (
            <>
              <div className="mb-[52px]">
                <p className="mb-[18px] text-[10px] uppercase tracking-[0.22em] text-[var(--pj-error)]">
                  Verification failed
                </p>

                <h2 className="m-0 font-['Instrument_Serif',Georgia,serif] text-[36px] font-normal leading-[1.05]">
                  Unable to
                  <br />
                  <em className="font-normal italic text-[var(--pj-muted)]">
                    verify.
                  </em>
                </h2>
              </div>

              <div className="border-y border-[var(--pj-error)] py-4">
                <p className="m-0 text-[12px] leading-[1.8] text-[var(--pj-error)]">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login", { replace: true })}
                className={[
                  "mt-9 flex w-full items-center justify-center border px-6 py-4",
                  "rounded-none border-[var(--pj-text)] bg-[var(--pj-text)]",
                  "font-['Inter',ui-sans-serif,sans-serif]",
                  "text-[11px] uppercase tracking-[0.22em]",
                  "text-[var(--pj-bg)] transition-all duration-200",
                  "hover:bg-[var(--pj-button-hover)]",
                  "cursor-pointer",
                ].join(" ")}
              >
                Go to login →
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

