import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { getErrorMessage } from "../api/client";
import { ProjectecLogo } from "../components/ui/ProjectecLogo";
import ThemeToggle from "../components/ui/ThemeToggle";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register(name, email, password);
      localStorage.setItem("access_token", data.access_token);
      navigate("/organisations");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

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
      <aside className="hidden min-h-screen w-[44%] flex-col justify-between border-r border-[var(--pj-border)] px-[52px] py-[44px] min-[681px]:flex">
        {/* Brand lockup */}
        <div className="flex items-center gap-[11px]">
          <ProjectecLogo
            size={26}
            delay={100}
            animate
            enableHover
          />
        </div>

        {/* Editorial headline */}
        <div>
          <p className="mb-8 text-[10px] uppercase tracking-[0.22em] text-[var(--pj-muted)]">
            01 — Operations
          </p>

          <h1 className="mb-11 font-['Instrument_Serif',Georgia,serif] text-[clamp(52px,5.5vw,84px)] font-normal leading-[0.92] tracking-[-0.01em]">
            Start
            <br />
            <em className="font-normal italic text-[var(--pj-muted)]">building</em>
            <br />
            better work.
          </h1>

          <div className="border-t border-[var(--pj-border)] pt-8">
            <p className="m-0 max-w-[270px] text-[12px] leading-[1.85] text-[var(--pj-muted)]">
              Create your workspace, track delivery, and bring every project
              into a single operating rhythm.
            </p>
          </div>
        </div>

        {/* Footer */}
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
      <section className="flex flex-1 items-center justify-center px-6 py-8 min-[681px]:px-14 min-[681px]:py-11">
        <div className="w-full max-w-[352px]">
          {/* Back link */}
          <div className="mb-9">
            <Link
              to="/login"
              className={[
                "border-b border-[var(--pj-dim)] pb-0.5",
                "text-[11px] uppercase tracking-[0.14em]",
                "text-[var(--pj-text)] no-underline transition-colors duration-200",
                "hover:border-[var(--pj-muted)]",
              ].join(" ")}
            >
              ← Back to login
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-[52px]">
            <p className="mb-[18px] text-[10px] uppercase tracking-[0.22em] text-[var(--pj-muted)]">
              Register
            </p>

            <h2 className="m-0 font-['Instrument_Serif',Georgia,serif] text-[36px] font-normal leading-[1.05]">
              Create
              <br />
              <em className="font-normal italic text-[var(--pj-muted)]">account.</em>
            </h2>
          </div>

          {/* Error */}
          {error ? (
            <div className="mb-8 border-y border-[var(--pj-error)] py-3">
              <p className="m-0 font-['Inter',ui-sans-serif,sans-serif] text-[11px] leading-[1.6] tracking-[0.05em] text-[var(--pj-error)]">
                {error}
              </p>
            </div>
          ) : null}

          <form className="flex flex-col gap-9" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-[11px] block text-[10px] uppercase tracking-[0.22em] text-[var(--pj-muted)]"
              >
                Name
              </label>

              <input
                id="name"
                autoComplete="Name"
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder="you@example.com"
                required
                type="name"
                value={name}
                className={[
                  "w-full border-0 border-b border-[var(--pj-input-border)] bg-transparent px-0 py-[11px]",
                  "font-['Inter',ui-sans-serif,sans-serif] text-[14px] text-[var(--pj-text)]",
                  "rounded-none outline-none transition-colors duration-200",
                  "placeholder:text-[var(--pj-placeholder)]",
                  "focus:border-[var(--pj-text)]",
                ].join(" ")}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-[11px] block text-[10px] uppercase tracking-[0.22em] text-[var(--pj-muted)]"
              >
                Email address
              </label>

              <input
                id="email"
                autoComplete="email"
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
                className={[
                  "w-full border-0 border-b border-[var(--pj-input-border)] bg-transparent px-0 py-[11px]",
                  "font-['Inter',ui-sans-serif,sans-serif] text-[14px] text-[var(--pj-text)]",
                  "rounded-none outline-none transition-colors duration-200",
                  "placeholder:text-[var(--pj-placeholder)]",
                  "focus:border-[var(--pj-text)]",
                ].join(" ")}
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-[11px] flex items-baseline justify-between">
                <label
                  htmlFor="password"
                  className="block text-[10px] uppercase tracking-[0.22em] text-[var(--pj-muted)]"
                >
                  Password
                </label>

                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                  className={[
                    "border-0 bg-transparent p-0",
                    "font-['Inter',ui-sans-serif,sans-serif]",
                    "text-[10px] uppercase tracking-[0.14em] text-[var(--pj-muted)]",
                    "cursor-pointer transition-colors duration-200 hover:text-[var(--pj-text)]",
                  ].join(" ")}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <input
                id="password"
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                className={[
                  "w-full border-0 border-b border-[var(--pj-input-border)] bg-transparent px-0 py-[11px]",
                  "font-['Inter',ui-sans-serif,sans-serif] text-[14px] text-[var(--pj-text)]",
                  "rounded-none outline-none transition-colors duration-200",
                  "placeholder:text-[var(--pj-placeholder)]",
                  "focus:border-[var(--pj-text)]",
                ].join(" ")}
              />
            </div>

            {/* Submit */}
            <button
              disabled={loading}
              type="submit"
              className={[
                "flex w-full items-center justify-center gap-[14px] border px-6 py-4",
                "rounded-none font-['Inter',ui-sans-serif,sans-serif]",
                "text-[11px] uppercase tracking-[0.22em]",
                "transition-all duration-200",
                loading
                  ? "cursor-wait border-[var(--pj-dim)] bg-[var(--pj-disabled-bg)] text-[var(--pj-muted)]"
                  : "cursor-pointer border-[var(--pj-text)] bg-[var(--pj-text)] text-[var(--pj-bg)] hover:bg-[var(--pj-button-hover)]",
              ].join(" ")}
            >
              {loading ? (
                <>
                  <span className="inline-block h-[10px] w-[10px] animate-spin rounded-full border border-[var(--pj-input-border)] border-t-[var(--pj-muted)]" />
                  Creating account
                </>
              ) : (
                "Create account →"
              )}
            </button>
          </form>

          {/* Login */}
          <div className="mt-[52px] flex items-center justify-between gap-[18px] border-t border-[var(--pj-border)] pt-8">
            <span className="text-[11px] text-[var(--pj-muted)]">
              Already have an account?
            </span>

            <Link
              to="/login"
              className={[
                "border-b border-[var(--pj-dim)] pb-0.5 text-[11px] uppercase tracking-[0.14em]",
                "text-[var(--pj-text)] no-underline transition-colors duration-200",
                "hover:border-[var(--pj-muted)]",
                "whitespace-nowrap",
              ].join(" ")}
            >
              Sign in →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
