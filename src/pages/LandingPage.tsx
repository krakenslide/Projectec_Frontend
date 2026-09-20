import {
    useEffect,
    useRef,
    useState,
    type FC,
    type ReactNode,
} from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { Link } from "react-router-dom";
import { WorkOrbitLogo } from "../components/ui/WorkOrbitLogo";
import {
    APP,
    AppFrame,
    BoardScreen,
    DashboardScreen,
    INK,
    LIME,
    MembersScreen,
    MilestonesScreen,
    PAPER_DEEP,
    SettingsScreen,
    StandupScreen,
    TicketsScreen,
    type TabId,
} from "./landing/AppFrame";
import { GiantOrbit } from "./landing/GiantOrbit";

/* Structural accent for anything sitting directly on the page's paper/cream
   background — matches the app's light-theme --pj-lime exactly. LIME
   (imported above) stays neon and is reserved for the dark-ink sections
   below (Workflow, Intelligence, the giant orbit, the final CTA), where a
   dark surface is what makes it read as an accent rather than as noise. */
const CYPRESS = "#064e3b"; // Tailwind emerald-900
const CYPRESS_VIVID = "#047857"; // Tailwind emerald-700

const WORKFLOW_STATES: [string, string][] = [
    ["To Do", "Ready to start"],
    ["In Progress", "Currently moving"],
    ["In Review", "Waiting for validation"],
    ["Testing", "Being verified"],
    ["Done", "Delivered"],
    ["Closed", "Archived"],
];

const STEPS: [string, string, string][] = [
    ["01", "Organise", "Create your organisation, invite people, and open a project for each stream of work."],
    ["02", "Plan", "Turn requirements into tickets with a type, a priority, an owner and a milestone."],
    ["03", "Execute", "Drag work across six delivery states. Comments and mentions keep the decisions attached."],
    ["04", "Understand", "Dashboard, milestones and standup answer what moved, what is stuck, and what ships next."],
];

/* --------------------------------------------------------------------------
   Shared UI
   -------------------------------------------------------------------------- */
const Arrow = () => (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 shrink-0">
        <path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const Button: FC<{ children: ReactNode }> = ({ children }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            type="button"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={[
                "inline-flex min-h-11 items-center gap-3 rounded-none border",
                "border-[#11110f] bg-[#11110f] px-5 text-xs font-semibold tracking-[-0.01em] text-[#faf9f5]",
                "transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-[#2a2a25]",
            ].join(" ")}
            style={{ transform: hovered ? "translateY(-2px)" : "translateY(0)" }}
        >
            <span>{children}</span>
            <Arrow />
        </button>
    );
};

const Reveal: FC<{ children: ReactNode; className?: string; delay?: number }> = ({
    children,
    className = "",
    delay = 0,
}) => {
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
            style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
        >
            {children}
        </div>
    );
};

const SectionHead: FC<{
    number: string;
    kicker: string;
    lead: string;
    emphasis: string;
    copy?: string;
}> = ({ number, kicker, lead, emphasis, copy }) => (
    <Reveal>
        <div className="mb-[70px] grid grid-cols-2 items-end gap-[80px] max-[780px]:block">
            <div>
                <span className="mb-[25px] block font-mono text-[10px] uppercase tracking-[0.12em] text-[#77766f]">
                    {number} / {kicker}
                </span>

                <h2 className="text-[clamp(52px,6.4vw,88px)] font-semibold leading-[.82] tracking-[-.065em] max-[780px]:text-[clamp(48px,15vw,76px)]">
                    {lead}
                    <br />
                    <em className="font-serif font-normal not-italic text-[#77766e]">{emphasis}</em>
                </h2>
            </div>

            {copy && (
                <p className="max-w-[400px] pb-1 text-[15px] leading-[1.8] text-[#727169] max-[780px]:mt-8">
                    {copy}
                </p>
            )}
        </div>
    </Reveal>
);

/* ==========================================================================
   02 / THE WORKSPACE TOUR
   Every tab in a project, with the real screen, what it does today, and
   what is coming to it next.
   ========================================================================== */
const TABS: {
    id: TabId;
    label: string;
    breadcrumb: string;
    eyebrow: string;
    title: string;
    description: string;
    today: string[];
    next: string[];
    screen: ReactNode;
}[] = [
        {
            id: "dashboard",
            label: "Dashboard",
            breadcrumb: "Dashboard",
            eyebrow: "Project / Dashboard",
            title: "The first screen of the day.",
            description:
                "One view that answers three questions before standup: how much is open, what is actually moving, and what is about to go wrong. Every number links straight through to the filtered queue behind it.",
            today: [
                "Open, active, in-review and attention counts across the project",
                "Status distribution across all six delivery states",
                "Attention list surfacing unowned P0 / P1 work",
                "Closed-per-week trend and workload split by assignee",
                "Click any figure to jump into the matching ticket filter",
            ],
            next: ["Cycle-time and throughput charts", "Saved dashboard views per role"],
            screen: <DashboardScreen />,
        },
        {
            id: "tickets",
            label: "Tickets",
            breadcrumb: "Tickets",
            eyebrow: "Project / Tickets",
            title: "The queue, and nothing but the queue.",
            description:
                "A dense, readable list rather than a wall of cards. Filter by priority, status or ownership, and open any row into a full ticket with description, work details, comments, mentions and a complete activity trail.",
            today: [
                "Ticket types, P0–P4 priorities, assignee and milestone on every item",
                "Stacked filters for priority, status and unassigned work",
                "Full ticket detail with editable description and work details",
                "Comments with @mentions that notify the person immediately",
                "Activity history recording every field change and status move",
                "Demo links so reviewers can see the result, not just the ticket",
            ],
            next: [
                "Saved filters and shared views",
                "Bulk edit across a selection",
                "Sub-tasks and blocking relationships",
            ],
            screen: <TicketsScreen />,
        },
        {
            id: "board",
            label: "Board",
            breadcrumb: "Kanban board",
            eyebrow: "Project / Board",
            title: "Six columns, one honest picture.",
            description:
                "Drag a ticket and its status updates everywhere at once. WIP limits on the middle columns turn yellow the moment a stage carries more than it should, so overload is visible before it becomes a delay.",
            today: [
                "Six delivery states: To Do, In Progress, In Review, Testing, Done, Closed",
                "Drag and drop with an optimistic update and rollback if the save fails",
                "WIP limits on In Progress, In Review and Testing",
                "The drop target lights up so you always know where a card lands",
                "Quick chips for all work, my work, P1 / P2 and unassigned",
            ],
            next: ["Swimlanes by assignee or milestone", "Column-level automation rules"],
            screen: <BoardScreen />,
        },
        {
            id: "milestones",
            label: "Milestones",
            breadcrumb: "Milestones",
            eyebrow: "Project / Milestones",
            title: "Delivery, not vibes.",
            description:
                "Group tickets into what you are actually shipping. Each milestone tracks completion against its own expected curve, so a slip shows up as a widening gap days before the date is missed.",
            today: [
                "Milestones with target dates and ticket assignment",
                "Live completion percentage and delivered / total ratio",
                "On track, at risk and delivered health signals",
                "Expected vs actual progress charted over time",
                "Attention list of P0 / P1 tickets blocking the milestone",
                "Drag tickets between milestones to rescope",
            ],
            next: [
                "Dedicated sprints with capacity planning",
                "Release notes generated from delivered tickets",
            ],
            screen: <MilestonesScreen />,
        },
        {
            id: "standup",
            label: "Standup",
            breadcrumb: "Standup",
            eyebrow: "Project / Standup",
            title: "The meeting, already written.",
            description:
                "Standup reads the activity log instead of asking people to remember. Pick a teammate and see exactly what they touched, what changed state and what finished — then export the whole thing for whoever is not in the room.",
            today: [
                "Per-person view of assigned, moved, finished and attention work",
                "Every status transition shown as the actual movement between states",
                "Filter down to only what changed today",
                "Project-wide summary across the whole team",
                "One-click export to Excel for reporting",
            ],
            next: [
                "Scheduled standup digests to Slack and email",
                "AI-written summary of the day in plain prose",
            ],
            screen: <StandupScreen />,
        },
        {
            id: "members",
            label: "Members",
            breadcrumb: "Members",
            eyebrow: "Administration / Members",
            title: "People, and what they can do.",
            description:
                "Members exist at two levels. The organisation holds everyone you work with; each project draws from that pool with its own roles, so a contractor on one project is not automatically on the rest.",
            today: [
                "Organisation directory with active and invited states",
                "Per-project membership drawn from the organisation",
                "Roles controlling who can edit, administer and delete",
                "Assignee picker everywhere, scoped to project members",
                "Invite by email with a verification flow",
            ],
            next: [
                "Custom roles and granular permissions",
                "SSO and SCIM provisioning",
                "Guest access for clients and contractors",
            ],
            screen: <MembersScreen />,
        },
        {
            id: "settings",
            label: "Settings",
            breadcrumb: "Project settings",
            eyebrow: "Administration / Settings",
            title: "Short, and deliberately boring.",
            description:
                "Settings should be somewhere you visit twice and then forget. Name, description, the ticket key prefix, and a clearly fenced destructive zone that always asks twice.",
            today: [
                "Rename a project and edit its description inline",
                "Ticket key prefix driving every ticket number",
                "Validation before anything is written",
                "Isolated danger zone with a confirmation step for deletion",
            ],
            next: [
                "Custom fields and ticket templates",
                "Per-project workflow configuration",
                "Webhooks and outbound integrations",
            ],
            screen: <SettingsScreen />,
        },
    ];

const WorkspaceTour = () => {
    const [active, setActive] = useState<TabId>("dashboard");
    const tab = TABS.find((item) => item.id === active) ?? TABS[0];

    return (
        <section
            id="tour"
            className="mx-auto max-w-[1240px] px-8 pb-[150px] pt-[120px] max-[780px]:px-5 max-[780px]:py-[90px]"
        >
            <SectionHead
                number="03"
                kicker="Inside a project"
                lead="Seven tabs."
                emphasis="No dead ends."
                copy="Every project opens with the same navigation. Pick a tab below to see the real screen, what it does today, and what is coming to it next."
            />

            {/* Tab bar — the product's own active-tab language */}
            <Reveal>
                <div className="flex flex-wrap border-b" style={{ borderColor: "rgba(17,17,15,.14)" }}>
                    {TABS.map((item) => {
                        const isActive = item.id === active;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActive(item.id)}
                                className="relative min-h-[46px] border-0 bg-transparent px-4 font-mono text-[10px] uppercase tracking-[.14em] transition-colors duration-200"
                                style={{ color: isActive ? INK : "#85847d" }}
                            >
                                {item.label}
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)]"
                                    style={{
                                        background: isActive ? INK : CYPRESS,
                                        transform: isActive ? "scaleX(1)" : "scaleX(0)",
                                    }}
                                />
                            </button>
                        );
                    })}
                </div>
            </Reveal>

            <div className="mt-10 grid grid-cols-[minmax(0,1.55fr)_minmax(300px,.95fr)] gap-10 max-[1050px]:grid-cols-1">
                <div key={`${tab.id}-screen`} className="fb-reveal is-visible min-w-0">
                    <AppFrame active={tab.id} breadcrumb={tab.breadcrumb} onNavigate={setActive}>
                        {tab.screen}
                    </AppFrame>
                </div>

                <div key={`${tab.id}-copy`} className="fb-reveal is-visible">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#77766f]">
                        {tab.eyebrow}
                    </span>

                    <h3 className="mt-4 font-serif text-[clamp(34px,3.4vw,46px)] font-normal leading-[.95] tracking-[-.035em]">
                        {tab.title}
                    </h3>

                    <p className="mt-5 text-[14px] leading-[1.8] text-[#6a6961]">{tab.description}</p>

                    <div className="mt-8">
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8b8981]">
                            In the product today
                        </span>

                        <div className="mt-3">
                            {tab.today.map((entry) => (
                                <div
                                    key={entry}
                                    className="flex items-start gap-3 border-t py-3 text-[12px] leading-[1.6] text-[#55544e]"
                                    style={{ borderColor: "rgba(17,17,15,.1)" }}
                                >
                                    <span className="mt-[6px] h-[5px] w-[5px] shrink-0" style={{ background: "#8ba62a" }} />
                                    {entry}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 p-5" style={{ background: INK }}>
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#71756d]">
                            Coming to this tab
                        </span>

                        <div className="mt-3">
                            {tab.next.map((entry, index) => (
                                <div
                                    key={entry}
                                    className="flex items-start gap-3 py-2.5 text-[12px] leading-[1.6] text-[#9a9d93]"
                                    style={{
                                        borderTop: index === 0 ? "0" : "1px solid rgba(255,255,255,.1)",
                                    }}
                                >
                                    <span className="mt-[6px] h-[5px] w-[5px] shrink-0" style={{ background: "#6e754f" }} />
                                    {entry}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ==========================================================================
   PAGE SECTIONS
   ========================================================================== */
const Nav = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollTo = (id: string) => {
        document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <header
            className={[
                "fixed left-1/2 top-4 z-50 flex h-16 w-[min(1240px,calc(100%-32px))]",
                "-translate-x-1/2 items-center justify-between rounded-[18px]",
                "border border-black/10 bg-[#f3f1ea]/75 px-3.5 pl-5",
                "backdrop-blur-xl transition-all duration-300",
                "max-[780px]:top-2.5 max-[780px]:h-[58px] max-[780px]:w-[calc(100%-20px)] max-[780px]:rounded-[15px]",
                scrolled ? "top-2.5 bg-[#faf9f5]/90 shadow-[0_18px_50px_rgba(17,17,15,.09)]" : "",
            ].join(" ")}
        >
            <button
                type="button"
                onClick={() => scrollTo("#top")}
                aria-label="WorkOrbit home"
                className="border-0 bg-transparent p-0"
            >
                <WorkOrbitLogo size={27} showWordmark animate enableHover />
            </button>

            <nav className="absolute left-1/2 flex -translate-x-1/2 gap-[30px] max-[900px]:hidden">
                {[
                    ["Product", "#product"],
                    ["Tour", "#tour"],
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
                <Link
                    to="/login"
                    className="text-[13px] text-[#68675f] no-underline transition-colors hover:text-[#11110f] max-[780px]:hidden"
                >
                    Sign in
                </Link>

                <Link to="/register" className="inline-flex no-underline">
                    <Button>Start free</Button>
                </Link>
            </div>
        </header>
    );
};

const Hero = () => (
    <section
        id="top"
        className={[
            "relative grid min-h-[900px] items-center gap-5 overflow-hidden sm:gap-10",
            "grid-cols-[minmax(0,.88fr)_minmax(540px,1.12fr)]",
            "bg-[#f3f1ea] px-[max(32px,calc((100vw-1240px)/2))] pb-10 pt-[190px]",
            "max-[1050px]:min-h-0 max-[1050px]:grid-cols-1 max-[1050px]:pb-[100px] max-[1050px]:pt-[150px]",
            "max-[780px]:px-5 max-[780px]:pb-[70px] max-[780px]:pt-[130px]",
        ].join(" ")}
        style={{
            backgroundImage:
                "radial-gradient(circle at 73% 45%, rgba(6,78,59,.13), transparent 26%), radial-gradient(circle at 93% 12%, rgba(140,167,255,.13), transparent 24%)",
        }}
    >
        <div className="pointer-events-none absolute right-[8%] top-[25%] h-80 w-80 rounded-full bg-[#064e3b]/12 blur-[60px]" />
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
                    Organisations, projects, tickets, a six-state board, milestones and an
                    automatic standup. One workspace that holds the whole delivery story
                    instead of five tools that each hold a third of it.
                </p>
            </Reveal>

            <Reveal delay={220}>
                <div className="mt-[34px] flex items-center gap-4 sm:gap-6 max-[780px]:flex-col max-[780px]:items-start max-[780px]:gap-[18px]">
                    <Link to="/register" className="inline-flex no-underline">
                        <Button>Start for free</Button>
                    </Link>

                    <button
                        type="button"
                        onClick={() => document.querySelector("#tour")?.scrollIntoView({ behavior: "smooth" })}
                        className="inline-flex items-center gap-2 border-0 bg-transparent text-[13px] text-[#5d5c56]"
                    >
                        Take the tour
                        <Arrow />
                    </button>
                </div>
            </Reveal>

            <Reveal delay={290}>
                <div className="mt-[58px] flex max-w-[520px] gap-9 border-t border-black/[0.12] pt-[22px] max-[780px]:mt-[42px] max-[780px]:gap-[18px]">
                    {[
                        ["7", "project tabs"],
                        ["6", "workflow states"],
                        ["5", "priority levels"],
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

        <Reveal className="relative z-10 min-w-0 [perspective:1600px] max-[1050px]:mt-[50px]" delay={180}>
            <div className="absolute -right-[30px] -top-[90px] h-[520px] w-[520px] rounded-full border border-black/[0.09] max-[780px]:hidden" />
            <div className="absolute -right-[100px] top-[120px] h-[280px] w-full max-w-[700px] rotate-[-20deg] rounded-[50%] border border-black/[0.09] max-[780px]:hidden" />

            <div className="transition-transform duration-1000 ease-[cubic-bezier(.16,1,.3,1)] [transform:rotateY(-7deg)_rotateX(2deg)_rotateZ(1deg)] hover:[transform:rotateY(-2deg)_rotateX(0)_rotateZ(0)] max-[1050px]:[transform:none]">
                <AppFrame active="dashboard" breadcrumb="Dashboard" minHeight={520}>
                    <DashboardScreen />
                </AppFrame>
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
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[#77766f]">
            One workspace for
        </span>

        <div className="flex flex-1 items-center justify-between gap-7 max-[780px]:mt-[22px] max-[780px]:flex-wrap max-[780px]:justify-start">
            {["ORGANISATIONS", "PROJECTS", "TICKETS", "BOARD", "MILESTONES", "STANDUP", "MEMBERS"].map((label) => (
                <span key={label} className="font-mono text-[11px] font-medium tracking-[0.08em] text-[#8c8b84]">
                    {label}
                </span>
            ))}
        </div>
    </section>
);

const ProductSection = () => (
    <section
        id="product"
        className="mx-auto max-w-[1240px] px-8 pb-[130px] pt-[150px] max-[780px]:px-5 max-[780px]:py-[100px]"
    >
        <SectionHead
            number="02"
            kicker="The workspace"
            lead="Less project"
            emphasis="management."
            copy="The best project management software disappears into the way your team works. WorkOrbit gives you structure without asking for a full-time administrator to maintain it."
        />

        <Reveal delay={80}>
            <AppFrame active="tickets" breadcrumb="Tickets" minHeight={580}>
                <TicketsScreen />
            </AppFrame>
        </Reveal>

        <Reveal delay={140}>
            <div className="mt-4 grid grid-cols-3 gap-px bg-black/[0.1] max-[780px]:grid-cols-1">
                {[
                    ["Structure you already have", "Organisation, project, ticket, milestone. Nothing invented, nothing to learn."],
                    ["One place for context", "Comments, mentions and a full activity trail live on the ticket, not in a thread somewhere else."],
                    ["Reporting that writes itself", "Dashboard, milestone health and standup are generated from the work, not from status updates."],
                ].map(([title, copy]) => (
                    <div key={title} className="bg-[#f3f1ea] p-6">
                        <h3 className="font-serif text-[22px] font-normal leading-tight">{title}</h3>
                        <p className="mt-2.5 text-[12px] leading-[1.7] text-[#77766e]">{copy}</p>
                    </div>
                ))}
            </div>
        </Reveal>
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
                        04 / Workflow
                    </span>

                    <h2 className="max-w-[600px] text-[clamp(56px,6.6vw,92px)] font-semibold leading-[.82] tracking-[-.065em] max-[780px]:text-[clamp(50px,15vw,78px)]">
                        From idea
                        <br />
                        <em className="font-serif font-normal not-italic text-[#777a72]">to shipped.</em>
                    </h2>

                    <p className="mt-[35px] max-w-[450px] text-[14px] leading-[1.8] text-[#8b8e85]">
                        Four movements, and six states a ticket can be in. That is the
                        entire model — small enough to hold in your head on day one.
                    </p>

                    <div className="mt-10">
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#72756d]">
                            The six states
                        </span>

                        <div className="mt-4 grid grid-cols-2 gap-x-6 max-[780px]:grid-cols-1">
                            {WORKFLOW_STATES.map(([state, meaning], index) => (
                                <div key={state} className="flex items-baseline gap-3 border-t border-white/[0.1] py-3">
                                    <span className="font-mono text-[9px] text-[#656960]">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span
                                        className="text-[12px] font-medium"
                                        style={{ color: index === 4 ? LIME : "#c9ccc4" }}
                                    >
                                        {state}
                                    </span>
                                    <span className="ml-auto font-mono text-[9px] text-[#6d7168]">{meaning}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Reveal>

            <Reveal delay={100}>
                <div>
                    {STEPS.map(([number, title, description]) => (
                        <div key={number} className="grid grid-cols-[45px_1fr] gap-5 border-t border-white/[0.1] py-6">
                            <span className="font-mono text-[9px] text-[#656960]">{number}</span>

                            <div>
                                <h3 className="font-serif text-[30px] font-normal">{title}</h3>
                                <p className="mt-2 text-[11px] leading-[1.7] text-[#777a72]">{description}</p>
                            </div>
                        </div>
                    ))}

                    <div className="mt-8 border border-white/[0.12] p-5">
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#72756d]">
                            Priority scale
                        </span>

                        <div className="mt-3.5 flex flex-wrap gap-2">
                            {([
                                ["P0", "Critical", APP.red],
                                ["P1", "High", APP.yellow],
                                ["P2", "Medium", APP.yellow],
                                ["P3", "Low", LIME],
                                ["P4", "Trivial", "#8b8e85"],
                            ] as [string, string, string][]).map(([code, label, tone]) => (
                                <span
                                    key={code}
                                    className="inline-flex items-center gap-2 border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[.12em]"
                                    style={{ borderColor: "rgba(255,255,255,.14)", color: tone }}
                                >
                                    <i className="h-[4px] w-[4px]" style={{ background: tone }} />
                                    {code} {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </Reveal>
        </div>
    </section>
);

const AISection = () => (
    <section className="mx-auto max-w-[1240px] px-8 py-[150px] max-[780px]:px-5 max-[780px]:py-[100px]">
        <Reveal>
            <div className="grid grid-cols-2 gap-[100px] max-[1050px]:grid-cols-1 max-[1050px]:gap-[60px]">
                <div>
                    <span className="mb-[25px] block font-mono text-[10px] uppercase tracking-[0.12em] text-[#77766f]">
                        05 / Intelligence
                    </span>

                    <h2 className="text-[clamp(56px,6.6vw,92px)] font-semibold leading-[.82] tracking-[-.065em] max-[780px]:text-[clamp(50px,15vw,78px)]">
                        Context that
                        <br />
                        <em className="font-serif font-normal not-italic text-[#77766e]">stays with work.</em>
                    </h2>

                    <p className="mt-[35px] max-w-[450px] text-[14px] leading-[1.8] text-[#727169]">
                        WorkOrbit already holds the structured history of every project: who
                        changed what, when a ticket stalled, which milestone slipped. The
                        assistant is being built on top of that record, so it answers from
                        your actual delivery data rather than from a chat transcript.
                    </p>

                    <div className="mt-8 border-t border-black/[0.12] pt-5">
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8b8981]">
                            Planned capabilities
                        </span>

                        {[
                            "Ask questions about a project in plain language",
                            "Milestone risk explained with the tickets causing it",
                            "Standup and weekly summaries written automatically",
                            "Draft tickets from a paragraph of requirements",
                        ].map((entry) => (
                            <div
                                key={entry}
                                className="flex items-start gap-3 border-b border-black/[0.1] py-3 text-[12px] leading-[1.6] text-[#5d5c55]"
                            >
                                <span className="mt-[6px] h-[5px] w-[5px] shrink-0 bg-[#6e754f]" />
                                {entry}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden" style={{ background: APP.raised, color: "#ecece6" }}>
                    <div
                        className="flex justify-between border-b px-[18px] py-[15px] font-mono text-[8px] uppercase tracking-[0.1em]"
                        style={{ borderColor: "rgba(255,255,255,.08)", color: "#73776e" }}
                    >
                        <span>WorkOrbit AI</span>
                        <span style={{ color: "#8da23b" }}>
                            <i
                                className="mr-1 inline-block h-[5px] w-[5px] rounded-full"
                                style={{ background: "#a1c53d" }}
                            />
                            COMING SOON
                        </span>
                    </div>

                    <div className="flex min-h-[400px] flex-col gap-5 p-[45px] max-[780px]:min-h-[350px] max-[780px]:px-5 max-[780px]:py-7">
                        <div className="max-w-[78%] self-end">
                            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#555a51]">
                                You
                            </span>
                            <p
                                className="mt-2 px-3.5 py-3 font-mono text-[11px] text-[#9b9e96]"
                                style={{ background: "#22251f" }}
                            >
                                What is blocking Release 1.4?
                            </p>
                        </div>

                        <div className="max-w-[80%] self-start">
                            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#555a51]">
                                WorkOrbit AI
                            </span>

                            <h4 className="mt-2.5 font-serif text-[28px] font-normal leading-[.95] max-[780px]:text-[24px]">
                                18 of 29 done. Two blockers, one unowned.
                            </h4>

                            <p className="mt-3 text-[11px] leading-[1.7] text-[#7b8076]">
                                BE-14 is P0, sitting In Progress for nine days with no assignee
                                — it is on the critical path. FE-42 has been In Review for four
                                days. JP is at 86% workload. Six days left.
                            </p>

                            <span className="mt-5 inline-flex items-center gap-2 font-mono text-[10px]" style={{ color: LIME }}>
                                Open the attention list
                                <Arrow />
                            </span>
                        </div>
                    </div>

                    <div
                        className="flex justify-between border-t px-5 py-[17px] font-mono text-[10px]"
                        style={{ borderColor: "rgba(255,255,255,.08)", color: "#4f544c" }}
                    >
                        <span>Ask about this project...</span>
                        <span style={{ color: "#969a91" }}>↵</span>
                    </div>
                </div>
            </div>
        </Reveal>
    </section>
);

const ROADMAP: {
    heading: string;
    note: string;
    tone: "now" | "next" | "later";
    items: [string, string][];
}[] = [
        {
            heading: "Available now",
            note: "Shipped and in daily use.",
            tone: "now",
            items: [
                ["Organisations & projects", "Multi-org workspaces with per-project membership"],
                ["Tickets", "Types, P0–P4 priorities, owners, milestones, demo links"],
                ["Kanban board", "Six states, drag and drop, WIP limits"],
                ["Milestones", "Target dates, health signals, expected vs actual progress"],
                ["Project dashboard", "Counts, distribution, attention list, workload"],
                ["Standup", "Per-person daily movement with Excel export"],
                ["Collaboration", "Comments, @mentions, notifications, activity history"],
                ["Accounts", "Email verification, roles, light and dark themes"],
            ],
        },
        {
            heading: "Building next",
            note: "In progress or scheduled.",
            tone: "next",
            items: [
                ["Sprints", "Time-boxed iterations with capacity and burndown"],
                ["Saved views", "Shareable filter sets per person and per team"],
                ["Search", "Cross-project search across tickets, comments and activity"],
                ["Bulk actions", "Edit priority, owner or milestone across a selection"],
                ["Sub-tasks & blockers", "Ticket relationships and dependency warnings"],
                ["Digests", "Scheduled standup and milestone summaries to Slack and email"],
            ],
        },
        {
            heading: "On the horizon",
            note: "Designed, not yet started.",
            tone: "later",
            items: [
                ["WorkOrbit AI", "Project-aware questions, summaries and drafted tickets"],
                ["Automation", "Rules, triggers and webhooks on status transitions"],
                ["Integrations", "GitHub, GitLab, Slack and calendar sync"],
                ["Custom fields", "Per-project ticket schemas and templates"],
                ["Time & capacity", "Estimates, logged effort and forecasting"],
                ["Enterprise", "SSO, SCIM, audit logs and data residency"],
            ],
        },
    ];

const ProductStatus = () => (
    <section
        id="roadmap"
        className="mx-auto max-w-[1240px] px-8 pb-[170px] pt-[130px] max-[780px]:px-5 max-[780px]:py-[100px]"
    >
        <SectionHead
            number="06"
            kicker="Product status"
            lead="Built now."
            emphasis="More ahead."
            copy="An honest list. Everything in the first column is in the product you can sign up for today; the rest is where the next releases are going."
        />

        <div className="grid grid-cols-3 gap-3.5 max-[1050px]:grid-cols-1">
            {ROADMAP.map((column, index) => {
                const dark = column.tone !== "now";

                return (
                    <Reveal key={column.heading} delay={index * 80}>
                        <div
                            className="h-full border p-7 max-[780px]:p-5"
                            style={
                                dark
                                    ? { background: INK, borderColor: INK, color: "#f3f1ea" }
                                    : { background: PAPER_DEEP, borderColor: "rgba(17,17,15,.12)" }
                            }
                        >
                            <div className="flex items-baseline justify-between gap-3">
                                <span
                                    className="font-mono text-[9px] uppercase tracking-[0.13em]"
                                    style={{ color: dark ? "#71756d" : "#77766f" }}
                                >
                                    {column.heading}
                                </span>
                                <span
                                    className="font-mono text-[9px]"
                                    style={{ color: column.tone === "now" ? "#6f8c1c" : "#6e754f" }}
                                >
                                    {column.items.length}
                                </span>
                            </div>

                            <p
                                className="mt-2 text-[11px] leading-[1.6]"
                                style={{ color: dark ? "#8b8e85" : "#77766e" }}
                            >
                                {column.note}
                            </p>

                            <div className="mt-5">
                                {column.items.map(([title, copy]) => (
                                    <div
                                        key={title}
                                        className="border-b py-3.5"
                                        style={{ borderColor: dark ? "rgba(255,255,255,.1)" : "rgba(17,17,15,.1)" }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span
                                                className="mt-[6px] h-[5px] w-[5px] shrink-0"
                                                style={{
                                                    background:
                                                        column.tone === "now"
                                                            ? "#8ba62a"
                                                            : column.tone === "next"
                                                                ? "#6e754f"
                                                                : "#4e5340",
                                                }}
                                            />

                                            <div className="min-w-0">
                                                <p
                                                    className="text-[12px] font-medium"
                                                    style={{ color: dark ? "#e2e3dc" : "#3f3e39" }}
                                                >
                                                    {title}
                                                </p>
                                                <p
                                                    className="mt-1 text-[11px] leading-[1.6]"
                                                    style={{ color: dark ? "#8b8e85" : "#77766e" }}
                                                >
                                                    {copy}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                );
            })}
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
                maskImage: "radial-gradient(circle at center, black 0, transparent 70%)",
            }}
        />

        <div className="pointer-events-none absolute h-[480px] w-[480px] rounded-full bg-[#d8ff58]/10 blur-[90px]" />

        <Reveal className="relative z-10">
            <span className="mb-[25px] block font-mono text-[10px] uppercase tracking-[0.12em] text-[#71756d]">
                07 / Get started
            </span>

            <h2 className="text-[clamp(80px,12vw,170px)] font-semibold leading-[.82] tracking-[-.065em]">
                Make work
                <br />
                <em className="font-serif font-normal not-italic text-[#777a72]">flow.</em>
            </h2>

            <p className="my-[35px] text-xs text-[#777a72]">Start with the workflow you have today.</p>

            <Link to="/register" className="inline-flex no-underline">
                <Button>Start for free</Button>
            </Link>
        </Reveal>
    </section>
);

const Footer = () => (
    <footer className="mx-auto max-w-[1240px] px-8 pb-[30px] pt-20 max-[780px]:px-5 max-[780px]:pb-6 max-[780px]:pt-[60px]">
        <div className="grid grid-cols-[2fr_repeat(3,1fr)] gap-[50px] pb-[70px] max-[780px]:grid-cols-2 max-[780px]:gap-[40px_25px]">
            <div className="max-[780px]:col-span-full">
                <WorkOrbitLogo size={27} showWordmark animate={false} enableHover />

                <p className="mt-[18px] max-w-[230px] text-xs leading-[1.7] text-[#7c7b74]">
                    Project management for teams who ship.
                </p>
            </div>

            {[
                ["Product", "Tickets", "Board", "Milestones", "Standup"],
                ["Resources", "Documentation", "API", "Changelog", "Status"],
                ["Company", "About", "Security", "Contact", "Privacy"],
            ].map(([title, ...links]) => (
                <div key={title} className="flex flex-col gap-3">
                    <span className="mb-2 font-mono text-[9px] uppercase tracking-[0.13em] text-[#8b8981]">
                        {title}
                    </span>

                    {links.map((link) => (
                        <a
                            href="#tour"
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
            <span>© 2026 WorkOrbit, Inc.</span>
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
        <div className="pj-landing min-h-screen overflow-x-clip bg-[#f3f1ea] text-[#11110f]">
            <Nav />

            <main>
                <Hero />
                <LogoRail />
                <GiantOrbit />
                <ProductSection />
                <WorkspaceTour />
                <WorkflowSection />
                <AISection />
                <ProductStatus />
                <FinalCTA />
            </main>

            <Footer />

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

        .pj-landing {
          --fb-serif: "Instrument Serif", Georgia, serif;
          --fb-sans: "DM Sans", Arial, sans-serif;
          --fb-mono: "DM Mono", monospace;
          font-family: var(--fb-sans);
        }

        .pj-landing .font-serif { font-family: var(--fb-serif); }
        .pj-landing .font-mono { font-family: var(--fb-mono); }

        .pj-landing button,
        .pj-landing a { font: inherit; }

        .pj-landing button { cursor: pointer; }

        .pj-landing ::selection {
          background: ${CYPRESS_VIVID};
          color: #f5f4ec;
        }
      `}</style>
        </div>
    );
}
