import type { ReactNode } from "react";

/** Aceternity-style radial spotlight glow, absolutely positioned within a relative parent. */
export function Spotlight({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`aet-spotlight ${className}`} />;
}

/** Subtle animated grid, fading toward the edges. Drop inside a `relative` container. */
export function GridBackground({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`absolute inset-0 aet-grid-bg ${className}`} />;
}

/** Diagonal shooting-star particles for hero/empty-state backdrops. */
export function Meteors({ count = 14 }: { count?: number }) {
  const meteors = Array.from({ length: count });
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      {meteors.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 6;
        const duration = 4 + Math.random() * 4;
        return (
          <span
            key={i}
            className="aet-meteor"
            style={{
              top: `${-10 - Math.random() * 20}%`,
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/** Card whose border traces a rotating gradient on hover. */
export function GlowCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`aet-glow-border ${className}`}>{children}</div>;
}

/** Bento-grid wrapper: pass any grid-template via className (e.g. grid-cols-3). */
export function BentoGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`grid gap-4 ${className}`}>{children}</div>;
}

export function BentoItem({
  children,
  className = "",
  span = "",
}: {
  children: ReactNode;
  className?: string;
  span?: string;
}) {
  return <div className={`aet-bento ${span} ${className}`}>{children}</div>;
}

/** Gradient / shimmer headline text. */
export function GradientText({
  children,
  className = "",
  shimmer = false,
}: {
  children: ReactNode;
  className?: string;
  shimmer?: boolean;
}) {
  return (
    <span className={`${shimmer ? "aet-shimmer-text" : "aet-gradient-text"} ${className}`}>
      {children}
    </span>
  );
}
