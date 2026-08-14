import {
    useEffect,
    useRef,
    useState,
    type FC,
    type ReactNode,
} from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { ProjectecLogo } from "../components/ui/ProjectecLogo";


const FEATURES = [
    {
        index: "01",
        eyebrow: "Planning",
        title: "Turn work into momentum.",
        description:
            "Tickets, priorities, ownership and milestones live in one calm workspace. Less coordination, more shipping.",
        visual: "issues",
    },
    {
        index: "02",
        eyebrow: "Execution",
        title: "See the work move.",
        description:
            "Move tickets through your delivery workflow — from To Do and In Progress to Testing, Done and Closed.",
        visual: "board",
    },
    {
        index: "03",
        eyebrow: "Collaboration",
        title: "Keep context with the work.",
        description:
            "Comments, mentions, members and ticket activity keep decisions attached to the work instead of scattered across tools.",
        visual: "collaboration",
    },
    {
        index: "04",
        eyebrow: "Visibility",
        title: "Know what matters.",
        description:
            "Dashboards, milestones and standups make progress, workload and delivery signals visible without extra reporting work.",
        visual: "metrics",
    },
];

const STEPS = [
    ["01", "Organise", "Create your organisation, projects and team structure."],
    ["02", "Plan", "Turn requirements into tickets, owners, priorities and milestones."],
    ["03", "Execute", "Move work through the board and keep delivery context together."],
    ["04", "Understand", "Use dashboards and standups to see what changed and what matters next."],
];

const AVAILABLE_FEATURES = [
    "Projects and project search",
    "Tickets with types, priorities and ownership",
    "Kanban workflow with six delivery states",
    "Milestones and progress tracking",
    "Project dashboard and delivery signals",
    "Daily standup summaries and Excel export",
    "Team members and project roles",
    "Comments, mentions and ticket activity",
];

const UPCOMING_FEATURES = [
    "AI project assistant",
    "Project-aware AI questions and summaries",
    "Standup and project knowledge",
    "Dedicated sprints and planning",
    "Automation, webhooks and integrations",
    "Enterprise security and governance",
];

const Arrow = () => (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 shrink-0">
        <path
            d="M3 10h13M11 5l5 5-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
        />
    </svg>
);

const Spark = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0">
        <path
            d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2Zm7 13 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"
            fill="currentColor"
        />
    </svg>
);

const Button: FC<{
    children: ReactNode;
    dark?: boolean;
    onClick?: () => void;
}> = ({ children, dark = true, onClick }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={[
                "inline-flex min-h-11 items-center gap-3 rounded-xl border",
                "px-5 text-xs font-semibold tracking-[-0.01em]",
                "transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
                dark
                    ? "border-[#11110f] bg-[#11110f] text-[#faf9f5] hover:bg-[#2a2a25]"
                    : "border-[#11110f] bg-[#f3f1ea] text-[#11110f]",
            ].join(" ")}
            style={{
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
            }}
        >
            <span>{children}</span>
            <Arrow />
        </button>
    );
};

const Reveal: FC<{
    children: ReactNode;
    className?: string;
    delay?: number;
}> = ({ children, className = "", delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;

                node.style.setProperty("--reveal-delay", `${delay}ms`);
                node.classList.add("is-visible");
                observer.disconnect();
            },
            { threshold: 0.08 }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [delay]);

    return (
        <div
            ref={ref}
            className={`fb-reveal ${className}`}
            style={
                {
                    "--reveal-delay": `${delay}ms`,
                } as React.CSSProperties
            }
        >
            {children}
        </div>
    );
};

const ProductWindow: FC<{ compact?: boolean }> = ({
    compact = false,
}) => (
    <div
        className={[
            "w-full overflow-hidden rounded-2xl border border-white/10",
            "bg-[#171815] text-[#ecece6]",
            compact
                ? "shadow-[0_30px_100px_rgba(17,17,15,.12)]"
                : "",
        ].join(" ")}
    >
        <div className="flex h-[42px] items-center gap-3.5 border-b border-white/[0.09] bg-[#1d1f1a] px-[15px] font-mono text-[9px] text-[#777a70]">
            <div className="flex gap-[5px]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#55584e]" />
                <span className="h-[7px] w-[7px] rounded-full bg-[#55584e]" />
                <span className="h-[7px] w-[7px] rounded-full bg-[#55584e]" />
            </div>

            <span className="flex-1">projectec / engineering</span>

            <span className="text-[#9dbd48]">LIVE</span>
        </div>

        <div
            className={[
                "grid min-h-[510px]",
                "grid-cols-[136px_minmax(0,1fr)_150px]",
                "max-[780px]:grid-cols-[74px_minmax(0,1fr)]",
                compact ? "min-h-[570px]" : "",
                "max-[780px]:min-h-[440px]",
            ].join(" ")}
        >
            <aside className="border-r border-white/[0.08] p-4 max-[780px]:px-1.5 max-[780px]:py-3">
                <div className="mb-6 ml-1.5 grid h-[27px] w-[27px] place-items-center rounded-lg border border-[#44483f] font-mono text-[10px] text-[#d8ff58] max-[780px]:mb-5">
                    FB
                </div>

                {["Overview", "Issues", "Board", "Milestones", "Standup"].map(
                    (item, index) => (
                        <div
                            key={item}
                            className={[
                                "mb-0.5 flex items-center gap-2 rounded-md px-2 py-2.5 font-mono text-[10px]",
                                "text-[#686b62]",
                                index === 2
                                    ? "bg-[#242720] text-[#efefe8]"
                                    : "",
                                "max-[780px]:gap-1 max-[780px]:px-1.5 max-[780px]:text-[8px]",
                            ].join(" ")}
                        >
                            <span className="w-3 text-center max-[780px]:hidden">
                                {["◌", "□", "▦", "◷", "≡", "◍"][index]}
                            </span>
                            {item}
                        </div>
                    )
                )}

                <div className="mt-7 border-t border-white/[0.08] px-2 pt-4 font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f524a]">
                    Workspace
                </div>
            </aside>

            <main className="min-w-0 px-[22px] py-[22px] max-[780px]:px-3 max-[780px]:py-4">
                <div className="mb-[18px] flex items-start justify-between">
                    <div>
                        <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-[#62665d]">
                            Project / Frontend
                        </span>

                        <h3 className="mt-1.5 text-[22px] font-medium tracking-[-0.04em]">
                            Issues
                        </h3>
                    </div>

                    <button
                        type="button"
                        className="rounded-md border border-[#4b5046] bg-[#242820] px-2.5 py-2 font-mono text-[9px] text-[#daddd3]"
                    >
                        + New ticket
                    </button>
                </div>

                <div className="rounded-lg border border-white/[0.09] bg-[#1d201b] p-[13px]">
                    <div className="mb-2.5 flex justify-between font-mono text-[8px]">
                        <span className="uppercase tracking-[0.12em] text-[#71756b]">
                            Milestone / Release 1.4
                        </span>

                        <strong className="font-normal text-[#b8c0ae]">
                            18 / 29 complete
                        </strong>
                    </div>

                    <div className="h-[3px] overflow-hidden rounded-full bg-[#30342d]">
                        <div className="h-full w-[65%] bg-[#d8ff58]" />
                    </div>

                    <span className="mt-2 block font-mono text-[8px] text-[#555a51]">
                        Delivery progress
                    </span>
                </div>

                <div className="mt-[17px]">
                    {[
                        [
                            "FE-42",
                            "Fix auth token refresh race condition",
                            "Review",
                            "high",
                        ],
                        [
                            "FE-38",
                            "Implement kanban drag-and-drop",
                            "Progress",
                            "green",
                        ],
                        [
                            "FE-35",
                            "Custom field renderer component",
                            "Progress",
                            "green",
                        ],
                        [
                            "BE-14",
                            "Webhook delivery retry queue",
                            "Blocked",
                            "red",
                        ],
                    ].map(([id, title, status, tone], index) => (
                        <div
                            key={id}
                            className="flex min-h-12 items-center gap-2 border-b border-white/[0.07] font-mono text-[9px] max-[780px]:gap-1.5 max-[780px]:text-[8px]"
                        >
                            <span
                                className={[
                                    "w-2.5",
                                    tone === "high"
                                        ? "text-[#b4a7ff]"
                                        : tone === "green"
                                            ? "text-[#9dbd48]"
                                            : tone === "red"
                                                ? "text-[#ff8b79]"
                                                : "text-[#888b82]",
                                ].join(" ")}
                            >
                                {index === 3 ? "!" : "↑"}
                            </span>

                            <span className="w-[38px] text-[#575b53]">{id}</span>

                            <span className="min-w-0 flex-1 truncate text-[#c9ccc4]">
                                {title}
                            </span>

                            <span
                                className={[
                                    "max-[780px]:hidden",
                                    tone === "green"
                                        ? "text-[#9dbd48]"
                                        : tone === "red"
                                            ? "text-[#e47f70]"
                                            : "text-[#656a61]",
                                ].join(" ")}
                            >
                                {status}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between pt-3.5 font-mono text-[8px] text-[#50544c]">
                    <span>29 open tickets</span>
                    <span>Updated 2m ago</span>
                </div>
            </main>

            <aside className="border-l border-white/[0.08] p-6 max-[780px]:hidden">
                <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-[#62665d]">
                    Delivery
                </span>

                <div className="my-3.5 flex h-[66px] items-end gap-1">
                    {[32, 48, 40, 67, 54, 80, 92].map((height, index) => (
                        <i
                            key={index}
                            className="block flex-1 rounded-t-[2px] bg-[#34382f]"
                            style={{
                                height: `${height}%`,
                                background:
                                    index === 6 ? "#d8ff58" : undefined,
                            }}
                        />
                    ))}
                </div>

                <div className="font-serif text-[32px]">42</div>
                <span className="font-mono text-[8px] text-[#656960]">
                    points / cycle
                </span>

                <div className="my-6 h-px bg-white/[0.08]" />

                <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-[#62665d]">
                    Workload
                </span>

                {[
                    ["AK", 72],
                    ["ML", 44],
                    ["JP", 86],
                ].map(([name, value]) => (
                    <div
                        key={name}
                        className="mt-3 flex items-center gap-2 font-mono text-[8px] text-[#686c63]"
                    >
                        <span>{name}</span>

                        <div className="h-[3px] flex-1 bg-[#30342d]">
                            <i
                                className="block h-full bg-[#767e69]"
                                style={{ width: `${value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </aside>
        </div>
    </div>
);

const Nav = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);

        window.addEventListener("scroll", onScroll, { passive: true });

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollTo = (id: string) => {
        document.querySelector(id)?.scrollIntoView({
            behavior: "smooth",
        });
    };

    return (
        <header
            className={[
                "fixed left-1/2 top-4 z-50 flex h-16 w-[min(1240px,calc(100%-32px))]",
                "-translate-x-1/2 items-center justify-between rounded-[18px]",
                "border border-black/10 bg-[#f3f1ea]/75 px-3.5 pl-5",
                "backdrop-blur-xl transition-all duration-300",
                "max-[780px]:top-2.5 max-[780px]:h-[58px] max-[780px]:w-[calc(100%-20px)] max-[780px]:rounded-[15px]",
                scrolled
                    ? "top-2.5 bg-[#faf9f5]/90 shadow-[0_18px_50px_rgba(17,17,15,.09)]"
                    : "",
            ].join(" ")}
        >
            <button
                type="button"
                onClick={() => scrollTo("#top")}
                aria-label="Projectec home"
                className="border-0 bg-transparent p-0"
            >
                <ProjectecLogo
                    size={27}
                    showWordmark
                    animate
                    enableHover
                />
            </button>

            <nav className="absolute left-1/2 flex -translate-x-1/2 gap-[34px] max-[780px]:hidden">
                {[
                    ["Product", "#product"],
                    ["Workflow", "#workflow"],
                    ["Roadmap", "#roadmap"],
                ].map(([label, href]) => (
                    <button
                        type="button"
                        key={label}
                        onClick={() => scrollTo(href)}
                        className="border-0 bg-transparent text-[13px] text-[#68675f] transition-colors hover:text-[#11110f]"
                    >
                        {label}
                    </button>
                ))}
            </nav>

            <div className="flex items-center gap-5 max-[780px]:gap-2.5">
                <a
                    href="/login"
                    className="text-[13px] text-[#68675f] no-underline transition-colors hover:text-[#11110f] max-[780px]:hidden"
                >
                    Sign in
                </a>

                <Button>Start free</Button>
            </div>
        </header>
    );
};

const Hero = () => (
    <section
        id="top"
        className={[
            "relative grid min-h-[900px] items-center gap-10 overflow-hidden",
            "grid-cols-[minmax(0,.88fr)_minmax(540px,1.12fr)]",
            "bg-[#f3f1ea]",
            "px-[max(32px,calc((100vw-1240px)/2))] pb-10 pt-[190px]",
            "max-[1050px]:grid-cols-1 max-[1050px]:min-h-0 max-[1050px]:pb-[100px] max-[1050px]:pt-[150px]",
            "max-[780px]:px-5 max-[780px]:pb-[70px] max-[780px]:pt-[130px]",
        ].join(" ")}
        style={{
            backgroundImage:
                "radial-gradient(circle at 73% 45%, rgba(216,255,88,.16), transparent 26%), radial-gradient(circle at 93% 12%, rgba(140,167,255,.13), transparent 24%)",
        }}
    >
        <div className="pointer-events-none absolute right-[8%] top-[25%] h-80 w-80 rounded-full bg-[#d8ff58]/15 blur-[60px]" />
        <div className="pointer-events-none absolute bottom-[10%] right-[34%] h-60 w-60 rounded-full bg-[#8ca7ff]/10 blur-[60px]" />

        <div className="relative z-10 pt-[30px]">
            <Reveal>
                <div className="mb-[30px] flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#77766f]">
                    <span className="h-[7px] w-[7px] rounded-full bg-[#83a61f] shadow-[0_0_0_5px_rgba(131,166,31,.12)]" />
                    The workspace for teams that ship
                </div>
            </Reveal>

            <Reveal delay={80}>
                <h1 className="max-w-[760px] text-[clamp(76px,9vw,136px)] font-semibold leading-[.77] tracking-[-.065em] max-[780px]:text-[clamp(65px,19vw,100px)]">
                    Your team,
                    <br />
                    <em className="font-serif font-normal not-italic tracking-[-.045em] text-[#6e6d65]">
                        in flow.
                    </em>
                </h1>
            </Reveal>

            <Reveal delay={150}>
                <p className="mt-[42px] max-w-[490px] text-base leading-[1.75] text-[#65645d] max-[780px]:mt-[30px] max-[780px]:text-sm">
                    Plan projects, move work and understand delivery from one beautifully
                    focused workspace. Projectec keeps engineering teams moving.
                </p>
            </Reveal>

            <Reveal delay={220}>
                <div className="mt-[34px] flex items-center gap-6 max-[780px]:flex-col max-[780px]:items-start max-[780px]:gap-[18px]">
                    <Button>Start for free</Button>

                    <button
                        type="button"
                        onClick={() =>
                            document
                                .querySelector("#product")
                                ?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="inline-flex items-center gap-2 border-0 bg-transparent text-[13px] text-[#5d5c56]"
                    >
                        Explore the product
                        <Arrow />
                    </button>
                </div>
            </Reveal>

            <Reveal delay={290}>
                <div className="mt-[58px] flex max-w-[500px] gap-9 border-t border-black/[0.12] pt-[22px] max-[780px]:mt-[42px] max-[780px]:gap-[18px]">
                    {[
                        ["8", "core areas"],
                        ["6", "workflow states"],
                        ["1", "shared workspace"],
                    ].map(([value, label]) => (
                        <div key={label} className="flex flex-col gap-1">
                            <strong className="font-serif text-[28px] font-normal max-[780px]:text-[23px]">
                                {value}
                            </strong>

                            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#77766f]">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </Reveal>
        </div>

        <Reveal
            className="relative z-10 min-w-0 [perspective:1600px] max-[1050px]:mt-[50px]"
            delay={180}
        >
            <div className="absolute -right-[30px] -top-[90px] h-[520px] w-[520px] rounded-full border border-black/[0.09] max-[780px]:hidden" />
            <div className="absolute -right-[100px] top-[120px] h-[280px] w-[700px] rotate-[-20deg] rounded-[50%] border border-black/[0.09] max-[780px]:hidden" />

            <div className="transition-transform duration-1000 ease-[cubic-bezier(.16,1,.3,1)] [transform:rotateY(-7deg)_rotateX(2deg)_rotateZ(1deg)] hover:[transform:rotateY(-2deg)_rotateX(0)_rotateZ(0)] max-[1050px]:[transform:none]">
                <ProductWindow />
            </div>
        </Reveal>

        <div className="absolute bottom-7 left-[max(32px,calc((100vw-1240px)/2))] right-[max(32px,calc((100vw-1240px)/2))] flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-[#85847d] max-[1050px]:hidden">
            <span>Built for modern product teams</span>

            <div className="flex items-center gap-3">
                <span>Scroll to explore</span>
                <span className="relative h-px w-20 bg-[#aaa8a0] after:absolute after:right-0 after:top-[-2px] after:h-[5px] after:w-[5px] after:rounded-full after:bg-[#11110f]" />
            </div>
        </div>
    </section>
);

const LogoRail = () => (
    <section className="flex min-h-[126px] items-center gap-[60px] border-y border-black/[0.12] bg-[#eeece5] px-[max(32px,calc((100vw-1240px)/2))] py-[30px] max-[780px]:block max-[780px]:px-5 max-[780px]:py-7">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#77766f]">
            One workspace for
        </span>

        <div className="flex flex-1 items-center justify-between gap-7 max-[780px]:mt-[22px] max-[780px]:flex-wrap max-[780px]:justify-start">
            {[
                "PROJECTS",
                "TICKETS",
                "KANBAN",
                "MILESTONES",
                "DASHBOARD",
                "STANDUP",
            ].map((label) => (
                <span
                    key={label}
                    className="font-mono text-[11px] font-medium tracking-[0.08em] text-[#8c8b84]"
                >
                    {label}
                </span>
            ))}
        </div>
    </section>
);

const ProductSection = () => (
    <section
        id="product"
        className="mx-auto max-w-[1240px] px-8 py-[150px] max-[780px]:px-5 max-[780px]:py-[100px]"
    >
        <Reveal>
            <div className="mb-[76px] grid grid-cols-[1.1fr_.7fr] items-end gap-20 max-[1050px]:grid-cols-1 max-[1050px]:gap-[30px]">
                <div>
                    <span className="mb-[25px] block font-mono text-[10px] uppercase tracking-[0.12em] text-[#77766f]">
                        01 / Product
                    </span>

                    <h2 className="text-[clamp(58px,7vw,96px)] font-semibold leading-[.82] tracking-[-.065em] max-[780px]:text-[clamp(53px,16vw,82px)]">
                        Less project
                        <br />
                        <em className="font-serif font-normal not-italic text-[#77766e]">
                            management.
                        </em>
                    </h2>
                </div>

                <p className="max-w-[390px] pb-1 text-[15px] leading-[1.8] text-[#727169]">
                    The best project management software disappears into the way your
                    team works. Projectec gives you structure without slowing you down.
                </p>
            </div>
        </Reveal>

        <Reveal delay={80} className="mt-[30px]">
            <ProductWindow compact />
        </Reveal>
    </section>
);

const FeatureVisual: FC<{ type: string }> = ({ type }) => {
    if (type === "issues") {
        return (
            <div className="absolute bottom-7 left-7 right-7 overflow-hidden rounded-xl border border-black/[0.12] bg-[#f7f5ee] p-[18px] shadow-[0_18px_40px_rgba(17,17,15,.06)]">
                <div className="flex justify-between pb-2.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#89877f]">
                    <span>Backlog</span>
                    <span>24 items</span>
                </div>

                {[
                    ["P0", "Auth refresh edge case"],
                    ["P1", "Keyboard navigation"],
                    ["P2", "Release notes"],
                    ["P1", "Webhook retries"],
                ].map(([priority, text]) => (
                    <div
                        key={text}
                        className="grid grid-cols-[28px_1fr_22px] items-center gap-2 border-t border-black/[0.12] py-3 text-[10px] text-[#5d5c55]"
                    >
                        <span
                            className={
                                priority === "P0"
                                    ? "font-mono text-[#e56e5c]"
                                    : "font-mono text-[#85847d]"
                            }
                        >
                            {priority}
                        </span>
                        <span>{text}</span>
                        <span>•••</span>
                    </div>
                ))}
            </div>
        );
    }

    if (type === "board") {
        return (
            <div className="absolute bottom-7 left-7 right-7 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-black/[0.12] bg-black/[0.12] p-px shadow-[0_18px_40px_rgba(17,17,15,.06)]">
                {["TODO", "BUILDING", "DONE"].map((column, ci) => (
                    <div
                        key={column}
                        className="min-h-[215px] bg-[#f7f5ee] p-3"
                    >
                        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#8d8b84]">
                            {column}
                        </span>

                        {[0, 1, 2]
                            .slice(0, ci === 1 ? 3 : 2)
                            .map((_, index) => (
                                <div
                                    key={index}
                                    className="mt-2.5 flex flex-col gap-1 rounded-[7px] border border-black/[0.12] p-[11px]"
                                >
                                    <i className="h-[5px] w-[5px] rounded-full bg-[#96af4e]" />

                                    <b className="font-mono text-[8px] text-[#77766e]">
                                        {["FE-38", "FE-41", "BE-14"][ci]}
                                    </b>

                                    <small className="text-[9px] leading-[1.3] text-[#44433e]">
                                        {
                                            [
                                                "Kanban interactions",
                                                "API response states",
                                                "Retry queue",
                                            ][ci]
                                        }
                                    </small>
                                </div>
                            ))}
                    </div>
                ))}
            </div>
        );
    }

    if (type === "collaboration") {
        return (
            <div className="absolute bottom-7 left-7 right-7 overflow-hidden rounded-xl border border-white/10 bg-[#171815] p-[18px] text-[#efefe9] shadow-[0_18px_40px_rgba(17,17,15,.06)]">
                <div className="flex items-center gap-2 font-mono text-[9px]">
                    <Spark />
                    <span>Projectec AI</span>

                    <small className="ml-auto text-[7px] text-[#6f7569]">
                        TICKET CONTEXT
                    </small>
                </div>

                <div className="my-7 text-[11px] text-[#b0b3aa]">
                    Ticket activity
                </div>

                <div className="rounded-lg border border-white/[0.09] bg-[#20221d] p-3.5">
                    <strong className="text-xs font-medium">
                        Recent activity
                    </strong>

                    <p className="my-2 text-[10px] leading-[1.6] text-[#7e8278]">
                        BE-14 is on the critical path and has no owner. FE-38 is waiting
                        on the dependency package.
                    </p>

                    <span className="font-mono text-[9px] text-[#d8ff58]">
                        → View ticket activity
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute bottom-7 left-7 right-7 grid min-h-[180px] grid-cols-[1fr_1.4fr] items-end gap-5 overflow-hidden rounded-xl border border-black/[0.12] bg-[#f7f5ee] p-5 shadow-[0_18px_40px_rgba(17,17,15,.06)]">
            <div>
                <span className="block font-mono text-[8px] uppercase tracking-[0.1em] text-[#8b8981]">
                    Delivery signal
                </span>

                <strong className="my-2 block font-serif text-[62px] font-normal leading-[.8]">
                    42
                </strong>

                <small className="font-mono text-[8px] text-[#78912f]">
                    milestone progress
                </small>
            </div>

            <div className="flex h-[130px] items-end gap-[5px]">
                {[30, 42, 35, 55, 48, 68, 74, 88].map((height, index) => (
                    <i
                        key={index}
                        className="block flex-1 rounded-t-[2px] bg-[#b5b5a9]"
                        style={{ height: `${height}%` }}
                    />
                ))}
            </div>
        </div>
    );
};

const Features = () => (
    <section className="mx-auto max-w-[1240px] px-8 pb-[150px] pt-[120px] max-[780px]:px-5 max-[780px]:py-[100px]">
        <Reveal>
            <div className="mb-[76px]">
                <span className="mb-[25px] block font-mono text-[10px] uppercase tracking-[0.12em] text-[#77766f]">
                    02 / Capabilities
                </span>

                <h2 className="text-[clamp(58px,7vw,96px)] font-semibold leading-[.82] tracking-[-.065em] max-[780px]:text-[clamp(53px,16vw,82px)]">
                    Everything you need.
                    <br />
                    <em className="font-serif font-normal not-italic text-[#77766e]">
                        Nothing in the way.
                    </em>
                </h2>
            </div>
        </Reveal>

        <div className="grid grid-cols-12 gap-3.5 max-[780px]:block">
            {FEATURES.map((feature, index) => (
                <Reveal
                    key={feature.index}
                    delay={index * 70}
                    className={[
                        "relative min-h-[500px] overflow-hidden rounded-[18px] border border-black/[0.12] bg-[#eeece5] p-7",
                        index === 0 || index === 3
                            ? "col-span-7"
                            : "col-span-5",
                        "max-[1050px]:min-h-[560px]",
                        "max-[780px]:mb-3",
                    ].join(" ")}
                >
                    <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-[#929088]">
                        <span>{feature.index}</span>
                        <span>{feature.eyebrow}</span>
                    </div>

                    <h3 className="mt-[70px] max-w-[470px] font-serif text-[clamp(38px,4vw,58px)] font-normal leading-[.9] tracking-[-.04em] max-[780px]:mt-[50px]">
                        {feature.title}
                    </h3>

                    <p className="mt-[17px] max-w-[420px] text-[13px] leading-[1.7] text-[#77766e]">
                        {feature.description}
                    </p>

                    <FeatureVisual type={feature.visual} />
                </Reveal>
            ))}
        </div>
    </section>
);

const WorkflowSection = () => (
    <section
        id="workflow"
        className="bg-[#11110f] px-[max(32px,calc((100vw-1240px)/2))] py-[150px] text-[#f3f1ea] max-[780px]:px-5 max-[780px]:py-[100px]"
    >
        <div className="grid grid-cols-2 gap-[110px] max-[1050px]:grid-cols-1 max-[1050px]:gap-[70px]">
            <Reveal>
                <div>
                    <span className="mb-[25px] block font-mono text-[10px] uppercase tracking-[0.12em] text-[#72756d]">
                        03 / Workflow
                    </span>

                    <h2 className="max-w-[600px] text-[clamp(58px,7vw,96px)] font-semibold leading-[.82] tracking-[-.065em] max-[780px]:text-[clamp(53px,16vw,82px)]">
                        Work moves
                        <br />
                        when{" "}
                        <em className="font-serif font-normal not-italic text-[#999a91]">
                            context
                        </em>
                        <br />
                        stays close.
                    </h2>

                    <p className="mt-[35px] max-w-[430px] text-sm leading-[1.8] text-[#777a72]">
                        From the first rough idea to the final release, every decision and
                        dependency stays connected to the work.
                    </p>
                </div>
            </Reveal>

            <div className="pt-[15px]">
                {STEPS.map(([number, title, description], index) => (
                    <Reveal key={number} delay={index * 100}>
                        <div className="grid min-h-[145px] grid-cols-[40px_1fr_20px] items-start gap-6 border-t border-white/[0.13] py-7 last:border-b">
                            <span className="font-mono text-[9px] text-[#686b63]">
                                {number}
                            </span>

                            <div>
                                <h3 className="font-serif text-[34px] font-normal tracking-[-.03em]">
                                    {title}
                                </h3>

                                <p className="mt-2 max-w-[320px] text-xs leading-[1.6] text-[#777a72]">
                                    {description}
                                </p>
                            </div>

                            <Arrow />
                        </div>
                    </Reveal>
                ))}
            </div>
        </div>

        <div className="mt-[140px] grid grid-cols-[1fr_2fr_1fr] items-center gap-5 border-t border-white/[0.13] pt-6 font-mono text-[9px] uppercase tracking-[0.13em] text-[#666960] max-[780px]:mt-[90px] max-[780px]:grid-cols-1 max-[780px]:gap-[18px]">
            <span>One workspace</span>

            <strong className="font-serif text-[clamp(22px,3vw,38px)] font-normal tracking-[-.03em] text-[#f3f1ea]">
                Organisation → projects → tickets → delivery.
            </strong>

            <span>Less friction</span>
        </div>
    </section>
);

const AISection = () => (
    <section className="relative grid min-h-[760px] grid-cols-[.8fr_1.2fr] items-center gap-[100px] overflow-hidden bg-[#deddd5] px-[max(32px,calc((100vw-1240px)/2))] py-[150px] max-[1050px]:grid-cols-1 max-[1050px]:gap-[60px] max-[1050px]:py-[110px] max-[780px]:px-5 max-[780px]:py-[100px]">
        <div className="pointer-events-none absolute right-[-160px] top-10 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(216,255,88,.34),transparent_62%)] blur-[12px]" />

        <Reveal>
            <div className="relative z-10">
                <span className="mb-[25px] block font-mono text-[10px] uppercase tracking-[0.12em] text-[#77766f]">
                    04 / Roadmap
                </span>

                <h2 className="text-[clamp(58px,6vw,88px)] font-semibold leading-[.82] tracking-[-.065em] max-[780px]:text-[clamp(53px,16vw,82px)]">
                    Your project
                    <br />
                    <em className="font-serif font-normal not-italic text-[#77766e]">
                        has answers.
                    </em>
                </h2>

                <p className="mt-8 max-w-[400px] text-sm leading-[1.8] text-[#68675f]">
                    Projectec AI works against your actual project data. Ask about
                    blockers, workload, releases or the next best action.
                </p>

                <div className="mt-[38px] border-t border-black/[0.12]">
                    {[
                        "Who is overloaded this week?",
                        "What blocked our last sprint?",
                        "Will we finish Milestone / Release 1.4 on time?",
                    ].map((query) => (
                        <div
                            key={query}
                            className="flex items-center gap-2.5 border-b border-black/[0.12] py-3.5 text-[11px] text-[#64635c]"
                        >
                            <Spark />
                            <span className="flex-1">{query}</span>
                            <Arrow />
                        </div>
                    ))}
                </div>
            </div>
        </Reveal>

        <Reveal
            delay={100}
            className="relative z-10"
        >
            <div className="absolute inset-x-0 top-[8%] rounded-full bg-black/10 blur-[55px]" />

            <div className="relative ml-auto max-w-[620px] overflow-hidden rounded-[18px] border border-black/[0.16] bg-[#151714] text-[#efefe9] shadow-[0_45px_100px_rgba(17,17,15,.2)]">
                <div className="flex justify-between border-b border-white/[0.08] px-[18px] py-[15px] font-mono text-[8px] uppercase tracking-[0.1em] text-[#73776e]">
                    <span>Projectec AI</span>

                    <span className="text-[#8da23b]">
                        <i className="mr-1 inline-block h-[5px] w-[5px] rounded-full bg-[#a1c53d]" />
                        COMING SOON
                    </span>
                </div>

                <div className="flex min-h-[400px] flex-col gap-8 p-[45px] max-[780px]:min-h-[350px] max-[780px]:px-5 max-[780px]:py-7">
                    <div className="max-w-[78%] self-end">
                        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#555a51]">
                            You
                        </span>

                        <p className="mt-2 rounded-lg bg-[#22251f] px-3.5 py-3 font-mono text-[11px] text-[#9b9e96]">
                            What is blocking this milestone?
                        </p>
                    </div>

                    <div className="max-w-[78%] self-start">
                        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#555a51]">
                            Projectec AI
                        </span>

                        <h4 className="mt-2.5 font-serif text-[30px] font-normal leading-[.95] max-[780px]:text-[26px]">
                            Milestone / Release 1.4 is 65% complete.
                        </h4>

                        <p className="mt-3 text-[11px] leading-[1.7] text-[#7b8076]">
                            3 blockers remain. BE-14 is the critical path. ML has the
                            highest workload at 86%. You have 6 days left.
                        </p>

                        <button
                            type="button"
                            className="mt-5 inline-flex items-center gap-2 border-0 bg-transparent p-0 font-mono text-[10px] text-[#d8ff58]"
                        >
                            AI project assistant
                            <Arrow />
                        </button>
                    </div>
                </div>

                <div className="flex justify-between border-t border-white/[0.08] px-5 py-[17px] font-mono text-[10px] text-[#4f544c]">
                    <span>Ask about this project...</span>
                    <span className="text-[#969a91]">↵</span>
                </div>
            </div>
        </Reveal>
    </section>
);

const ProductStatus = () => (
    <section
        id="roadmap"
        className="mx-auto max-w-[1240px] px-8 pb-[170px] pt-[150px] max-[780px]:px-5 max-[780px]:py-[100px]"
    >
        <Reveal>
            <div className="mb-[76px] grid grid-cols-2 items-end max-[780px]:block">
                <div>
                    <span className="mb-[25px] block font-mono text-[10px] uppercase tracking-[0.12em] text-[#77766f]">
                        05 / Product status
                    </span>

                    <h2 className="text-[clamp(58px,7vw,96px)] font-semibold leading-[.82] tracking-[-.065em] max-[780px]:text-[clamp(53px,16vw,82px)]">
                        Built first.
                        <br />
                        <em className="font-serif font-normal not-italic text-[#77766e]">
                            Promised second.
                        </em>
                    </h2>
                </div>

                <p className="max-w-[390px] justify-self-end pb-1 text-[15px] leading-[1.8] text-[#727169] max-[780px]:mt-6">
                    See what is available in Projectec today and what is being built
                    next. No roadmap item is presented as a current feature.
                </p>
            </div>
        </Reveal>

        <div className="grid grid-cols-2 overflow-hidden rounded-[18px] border border-black/[0.12] max-[780px]:grid-cols-1">
            <Reveal className="border-r border-black/[0.12] bg-[#eeece5] p-8 max-[780px]:border-r-0 max-[780px]:border-b">
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#647735]">
                    Available now
                </div>

                <div className="mt-8 border-t border-black/[0.12]">
                    {AVAILABLE_FEATURES.map((feature) => (
                        <div
                            key={feature}
                            className="flex items-center gap-3 border-b border-black/[0.1] py-3.5 text-[11px] text-[#626159]"
                        >
                            <span className="text-[#7e9837]">✓</span>
                            {feature}
                        </div>
                    ))}
                </div>
            </Reveal>

            <Reveal delay={100} className="bg-[#11110f] p-8 text-[#f3f1ea]">
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#929a7c]">
                    Coming next
                </div>

                <div className="mt-8 border-t border-white/[0.12]">
                    {UPCOMING_FEATURES.map((feature) => (
                        <div
                            key={feature}
                            className="flex items-center gap-3 border-b border-white/[0.1] py-3.5 text-[11px] text-[#8b8e85]"
                        >
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6e754f]" />
                            {feature}
                        </div>
                    ))}
                </div>
            </Reveal>
        </div>
    </section>
);

const FinalCTA = () => (
    <section className="relative grid min-h-[720px] place-items-center overflow-hidden bg-[#11110f] text-center text-[#f3f1ea]">
        <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
                backgroundSize: "72px 72px",
                maskImage:
                    "radial-gradient(circle at center, black 0, transparent 70%)",
            }}
        />

        <div className="pointer-events-none absolute h-[480px] w-[480px] rounded-full bg-[#d8ff58]/10 blur-[90px]" />

        <Reveal className="relative z-10">
            <span className="mb-[25px] block font-mono text-[10px] uppercase tracking-[0.12em] text-[#71756d]">
                06 / Get started
            </span>

            <h2 className="text-[clamp(80px,12vw,170px)] font-semibold leading-[.82] tracking-[-.065em]">
                Make work
                <br />
                <em className="font-serif font-normal not-italic text-[#777a72]">
                    flow.
                </em>
            </h2>

            <p className="my-[35px] text-xs text-[#777a72]">
                Start with the workflow you have today.
            </p>

            <Button>Start for free</Button>
        </Reveal>
    </section>
);

const Footer = () => (
    <footer className="mx-auto max-w-[1240px] px-8 pb-[30px] pt-20 max-[780px]:px-5 max-[780px]:pb-6 max-[780px]:pt-[60px]">
        <div className="grid grid-cols-[2fr_repeat(3,1fr)] gap-[50px] pb-[70px] max-[780px]:grid-cols-2 max-[780px]:gap-[40px_25px]">
            <div className="max-[780px]:col-span-full">
                <ProjectecLogo
                    size={27}
                    showWordmark
                    animate={false}
                    enableHover
                />

                <p className="mt-[18px] max-w-[230px] text-xs leading-[1.7] text-[#7c7b74]">
                    Project management for teams who ship.
                </p>
            </div>

            {[
                ["Product", "Issues", "Boards", "Milestones", "AI Assistant"],
                ["Resources", "Documentation", "API", "Changelog", "Status"],
                ["Company", "About", "Security", "Contact", "Privacy"],
            ].map(([title, ...links]) => (
                <div key={title} className="flex flex-col gap-3">
                    <span className="mb-2 font-mono text-[9px] uppercase tracking-[0.13em] text-[#8b8981]">
                        {title}
                    </span>

                    {links.map((link) => (
                        <a
                            href="#"
                            key={link}
                            className="text-xs text-[#64635c] no-underline transition-colors hover:text-[#11110f]"
                        >
                            {link}
                        </a>
                    ))}
                </div>
            ))}
        </div>

        <div className="flex justify-between border-t border-black/[0.12] pt-[25px] font-mono text-[9px] text-[#99978f] max-[780px]:flex-col max-[780px]:gap-2.5">
            <span>© 2026 Projectec, Inc.</span>
            <span>React · FastAPI · PostgreSQL</span>
        </div>
    </footer>
);

export default function LandingPage() {
    useEffect(() => {
        const lenis = new Lenis({
            autoRaf: true,
            anchors: true,
            smoothWheel: true,
            lerp: 0.085,
            syncTouch: false,
        });

        return () => {
            lenis.destroy();
        };
    }, []);

    return (
        <div className="min-h-screen overflow-x-clip bg-[#f3f1ea] text-[#11110f]">
            <Nav />

            <main>
                <Hero />
                <LogoRail />
                <ProductSection />
                <Features />
                <WorkflowSection />
                <AISection />
                <ProductStatus />
                <FinalCTA />
            </main>

            <Footer />

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

        :root {
          --fb-serif: "Instrument Serif", Georgia, serif;
          --fb-sans: "DM Sans", Arial, sans-serif;
          --fb-mono: "DM Mono", monospace;
        }

        html {
          scroll-behavior: auto;
        }

        body {
          margin: 0;
          font-family: var(--fb-sans);
          overflow-x: hidden;
        }

        button,
        a {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        ::selection {
          background: #11110f;
          color: #d8ff58;
        }

        .fb-reveal {
          opacity: 0;
          transform: translateY(35px);
          transition:
            opacity 0.9s cubic-bezier(.16,1,.3,1) var(--reveal-delay, 0ms),
            transform 0.9s cubic-bezier(.16,1,.3,1) var(--reveal-delay, 0ms);
        }

        .fb-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
            scroll-behavior: auto !important;
          }

          .fb-reveal {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
        </div>
    );
}
