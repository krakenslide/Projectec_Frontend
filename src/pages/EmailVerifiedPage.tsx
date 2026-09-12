
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/Layout/AuthLayout";

export default function EmailVerifiedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(Boolean(token));
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(
    token ? "" : "Invalid or missing verification token."
  );
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) {
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
  }, [token]);

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
    <AuthLayout
      sectionLabel="02 — Verification"
      headline={
        <>
          Your
          <br />
          <em className="font-normal italic text-[var(--pj-muted)]">
            account.
          </em>
          <br />
          verified.
        </>
      }
      description="Your email verification is complete. You're ready to get started with WorkOrbit."
    >
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
    </AuthLayout>
  );
}

