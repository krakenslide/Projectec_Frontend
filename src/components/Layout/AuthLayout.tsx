import { useEffect, useState, type ReactNode } from "react";
import { ProjectecLogo } from "../ui/ProjectecLogo";
import ThemeToggle from "../ui/ThemeToggle";

const FONTS =
    "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap";

type AuthLayoutProps = {
    sectionLabel: string;
    headline: ReactNode;
    description: string;
    children: ReactNode;
};

export function AuthLayout({
    sectionLabel,
    headline,
    description,
    children,
}: AuthLayoutProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!document.querySelector("[data-pjc-fonts]")) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = FONTS;
            link.setAttribute("data-pjc-fonts", "1");
            document.head.appendChild(link);
        }

        const timer = window.setTimeout(() => setVisible(true), 40);

        return () => window.clearTimeout(timer);
    }, []);

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

            <div className="flex items-center gap-[11px] px-5 pt-7 min-[681px]:hidden">
                <ProjectecLogo size={26} delay={100} animate enableHover />
            </div>

            <aside className="hidden min-h-screen w-[44%] flex-col justify-between border-r border-[var(--pj-border)] px-5 py-[44px] min-[681px]:flex min-[681px]:px-[52px]">
                <div className="flex items-center gap-[11px]">
                    <ProjectecLogo size={26} delay={100} animate enableHover />
                </div>

                <div>
                    <p className="mb-8 text-[10px] uppercase tracking-[0.22em] text-[var(--pj-muted)]">
                        {sectionLabel}
                    </p>

                    <h1 className="mb-11 font-['Instrument_Serif',Georgia,serif] text-[clamp(52px,5.5vw,84px)] font-normal leading-[0.92] tracking-[-0.01em]">
                        {headline}
                    </h1>

                    <div className="border-t border-[var(--pj-border)] pt-8">
                        <p className="m-0 max-w-[270px] text-[12px] leading-[1.85] text-[var(--pj-muted)]">
                            {description}
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

            <section className="flex flex-1 items-center justify-center px-6 py-8 min-[681px]:px-14 min-[681px]:py-11">
                <div className="w-full max-w-[352px]">{children}</div>
            </section>
        </main>
    );
}
