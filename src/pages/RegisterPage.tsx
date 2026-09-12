import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { getErrorMessage } from "../api/client";
import { AuthLayout } from "../components/Layout/AuthLayout";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
    <AuthLayout
      sectionLabel="01 — Operations"
      headline={
        <>
          Start
          <br />
          <em className="font-normal italic text-[var(--pj-muted)]">building</em>
          <br />
          better work.
        </>
      }
      description="Create your workspace, track delivery, and bring every project into a single operating rhythm."
    >
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
    </AuthLayout>
  );
}
