import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  back,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  back?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="relative mb-[34px] border-b border-[var(--pj-border)] pt-1 pb-8 after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-[42px] after:bg-[var(--pj-lime)] after:content-['']">
      {back ? <div className="mb-5">{back}</div> : null}
      <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
        <div>
          {eyebrow ? (
            <p className="font-[var(--font-mono)] text-[9px] font-medium tracking-[.22em] text-[var(--pj-muted)] uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 font-[var(--font-serif)] text-[clamp(44px,5.3vw,74px)] leading-[.92] font-normal tracking-[-.02em] text-[var(--pj-text)] max-[1023px]:text-[clamp(40px,12vw,58px)] max-[680px]:text-[46px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-[13px] max-w-3xl text-[13px] leading-[1.8] text-[var(--pj-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
