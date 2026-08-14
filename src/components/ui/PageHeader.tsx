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
    <header className="pj-page-header">
      {back ? <div className="mb-5">{back}</div> : null}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          {eyebrow ? <p className="pj-kicker">{eyebrow}</p> : null}
          <h1 className="pj-page-title">{title}</h1>
          {description ? <p className="pj-page-copy">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
