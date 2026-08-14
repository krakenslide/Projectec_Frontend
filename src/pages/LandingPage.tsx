import { useState, useEffect, useRef, type ReactNode, type FC } from "react";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: "#080808",
    surface: "#0e0e0e",
    surface2: "#131313",
    text: "#f0ede6",
    muted: "#555555",
    dim: "#252525",
    border: "#1e1e1e",
    green: "#3d6b3d",
    blue: "#3a4f7a",
    red: "#7a3a3a",
    mono: "'DM Mono', 'Courier New', monospace",
    serif: "'Instrument Serif', Georgia, serif",
} as const;

// Hallmark motion rule: exponential ease-out on every entrance
const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";

// ─── Hooks ─────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.08) {
    const ref = useRef<any>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

// Expo-ease-out counter — starts when `started` flips true
function useCounter(target: number, started: boolean, duration = 1200, decimals = 0) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!started) return;
        let t0: number | null = null;
        const tick = (ts: number) => {
            if (!t0) t0 = ts;
            const p = Math.min((ts - t0) / duration, 1);
            const ease = p < 1 ? 1 - Math.pow(2, -10 * p) : 1;
            setVal(parseFloat((ease * target).toFixed(decimals)));
            if (p < 1) requestAnimationFrame(tick);
            else setVal(target);
        };
        requestAnimationFrame(tick);
    }, [started, target, duration, decimals]);
    return val;
}

// ─── FadeSection: opacity + translateY, expo ease ─────────────────────────────
const FadeSection: FC<{
    children: ReactNode; id?: string; style?: React.CSSProperties; delay?: number;
}> = ({ children, id, style = {}, delay = 0 }) => {
    const { ref, inView } = useInView();
    return (
        <section
            id={id}
            ref={ref}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(36px)",
                transition: `opacity 0.8s ${EXPO} ${delay}ms, transform 0.8s ${EXPO} ${delay}ms`,
                ...style,
            }}
        >
            {children}
        </section>
    );
};

// ─── Primitives ────────────────────────────────────────────────────────────────
const SectionLabel: FC<{ children: ReactNode }> = ({ children }) => (
    <p style={{ fontFamily: C.mono, fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.muted, margin: "0 0 20px" }}>
        {children}
    </p>
);

const DisplayHeading: FC<{ children: ReactNode; size?: "sm" | "md" | "lg" | "xl" }> = ({ children, size = "lg" }) => {
    const sizes = { sm: "clamp(24px,2.8vw,38px)", md: "clamp(30px,3.5vw,50px)", lg: "clamp(38px,4.5vw,64px)", xl: "clamp(52px,6vw,92px)" };
    return (
        <h2 style={{ fontFamily: C.serif, fontSize: sizes[size], fontWeight: 400, lineHeight: 0.92, color: C.text, letterSpacing: "-0.01em", margin: 0 }}>
            {children}
        </h2>
    );
};

const LogoMark: FC<{ size?: number }> = ({ size = 22 }) => (
    <div style={{ width: size, height: size, border: `1px solid ${C.dim}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={size * 0.46} height={size * 0.46} viewBox="0 0 10 10" fill="none">
            <rect x="0.5" y="0.5" width="3.5" height="3.5" fill="#3a3a3a" />
            <rect x="6" y="0.5" width="3.5" height="3.5" fill="#3a3a3a" />
            <rect x="0.5" y="6" width="3.5" height="3.5" fill="#3a3a3a" />
            <rect x="6" y="6" width="3.5" height="3.5" fill="#222222" />
        </svg>
    </div>
);

const PrimaryBtn: FC<{ children: ReactNode; large?: boolean; onClick?: () => void }> = ({ children, large = false, onClick }) => {
    const [h, setH] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setH(true)}
            onMouseLeave={() => setH(false)}
            style={{
                background: h ? "#d8d5ce" : C.text, color: C.bg,
                border: `1px solid ${C.text}`, borderRadius: 0,
                padding: large ? "18px 52px" : "14px 32px",
                fontFamily: C.mono, fontSize: "11px",
                letterSpacing: "0.22em", textTransform: "uppercase",
                cursor: "pointer",
                transition: `background 0.2s, transform 0.18s ${EXPO}`,
                transform: h ? "translateY(-2px)" : "translateY(0)",
            }}
        >
            {children}
        </button>
    );
};

const GhostBtn: FC<{ children: ReactNode; large?: boolean; onClick?: () => void }> = ({ children, large = false, onClick }) => {
    const [h, setH] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setH(true)}
            onMouseLeave={() => setH(false)}
            style={{
                background: "transparent",
                color: h ? C.text : C.muted,
                border: `1px solid ${h ? C.muted : C.dim}`, borderRadius: 0,
                padding: large ? "18px 52px" : "14px 32px",
                fontFamily: C.mono, fontSize: "11px",
                letterSpacing: "0.22em", textTransform: "uppercase",
                cursor: "pointer",
                transition: `color 0.2s, border-color 0.2s, transform 0.18s ${EXPO}`,
                transform: h ? "translateY(-2px)" : "translateY(0)",
            }}
        >
            {children}
        </button>
    );
};

// ─── Marquee Strip ─────────────────────────────────────────────────────────────
// Hallmark's horizontal ticker — editorial rhythm, no stops
const MarqueeStrip: FC<{ items: string[]; speed?: number }> = ({ items, speed = 40 }) => {
    const doubled = [...items, ...items];
    return (
        <div style={{ overflow: "hidden", borderBottom: `1px solid ${C.border}`, padding: "15px 0", background: C.surface }}>
            <div style={{ display: "flex", animation: `marqueeScroll ${speed}s linear infinite`, width: "max-content", willChange: "transform" }}>
                {doubled.map((item, i) => (
                    <span key={i} style={{ fontFamily: C.mono, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, whiteSpace: "nowrap", padding: "0 28px" }}>
                        {item}
                        <span style={{ color: C.dim, marginLeft: "28px" }}>·</span>
                    </span>
                ))}
            </div>
        </div>
    );
};

// ─── Nav ───────────────────────────────────────────────────────────────────────
const NavLink: FC<{ label: string; href: string }> = ({ label, href }) => {
    const [h, setH] = useState(false);
    return (
        <a href={href} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
            style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: h ? C.text : C.muted, textDecoration: "none", transition: "color 0.2s", fontFamily: C.mono }}
        >
            {label}
        </a>
    );
};

const Nav: FC = () => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);
    return (
        <nav style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            height: "56px", padding: "0 52px",
            background: `${C.bg}ee`, backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            transition: "border-color 0.3s ease",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <LogoMark size={24} />
                <span style={{ fontFamily: C.mono, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.text }}>
                    FlowBase
                </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
                {[["Features", "#features"], ["Workflow", "#workflow"], ["Pricing", "#pricing"], ["Changelog", "#"]].map(([l, h]) => (
                    <NavLink key={l} label={l} href={h} />
                ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <a href="/login" style={{ fontFamily: C.mono, fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted, textDecoration: "none" }}>
                    Sign in
                </a>
                <PrimaryBtn>Get started</PrimaryBtn>
            </div>
        </nav>
    );
};

// ─── Hero dashboard mockup ─────────────────────────────────────────────────────
const MOCK_ISSUES = [
    { id: "FE-42", title: "Fix auth token refresh race condition", prio: "▲", status: "In Review", dot: C.blue },
    { id: "FE-38", title: "Implement kanban drag-and-drop", prio: "▲", status: "In Progress", dot: C.green },
    { id: "FE-35", title: "Custom field renderer component", prio: "●", status: "In Progress", dot: C.green },
    { id: "FE-31", title: "Sprint burndown chart", prio: "▼", status: "Todo", dot: C.dim },
    { id: "BE-14", title: "Webhook delivery retry queue", prio: "▲", status: "Blocked", dot: C.red },
];

const HeroDashboard: FC<{ animateIn?: boolean }> = ({ animateIn = false }) => (
    <div style={{ width: "100%", maxWidth: "560px", border: `1px solid ${C.border}`, background: C.surface, fontFamily: C.mono, fontSize: "11px" }}>
        {/* Window chrome */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: "6px" }}>
                {["#3a3a3a", "#2e2e2e", "#222"].map((c, i) => <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />)}
            </div>
            <span style={{ fontSize: "10px", color: C.muted, letterSpacing: "0.08em" }}>flowbase — acme-corp / frontend-platform</span>
        </div>

        <div style={{ display: "flex", height: "480px" }}>
            {/* Sidebar — slides in from left */}
            <div style={{ width: "136px", borderRight: `1px solid ${C.border}`, paddingTop: "12px", flexShrink: 0 }}>
                {["Dashboard", "Issues", "Board", "Sprints", "Docs", "Reports"].map((item, i) => (
                    <div key={item} style={{
                        padding: "7px 14px", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
                        color: i === 1 ? C.text : C.muted,
                        background: i === 1 ? "#161616" : "transparent",
                        borderLeft: i === 1 ? `1px solid ${C.text}` : "1px solid transparent",
                        opacity: animateIn ? 1 : 0,
                        transform: animateIn ? "translateX(0)" : "translateX(-12px)",
                        transition: `opacity 0.5s ${EXPO} ${180 + i * 55}ms, transform 0.5s ${EXPO} ${180 + i * 55}ms`,
                    }}>
                        {item}
                    </div>
                ))}
                <div style={{ margin: "20px 0", borderTop: `1px solid ${C.border}` }} />
                {["My Issues", "Standup", "Roadmap"].map((item, i) => (
                    <div key={item} style={{
                        padding: "7px 14px", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.dim,
                        opacity: animateIn ? 1 : 0,
                        transition: `opacity 0.4s ${EXPO} ${500 + i * 50}ms`,
                    }}>
                        {item}
                    </div>
                ))}
            </div>

            {/* Main */}
            <div style={{ flex: 1, padding: "16px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* Sprint banner with animated progress bar */}
                <div style={{
                    border: `1px solid ${C.border}`, padding: "12px 14px", marginBottom: "16px",
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn ? "translateY(0)" : "translateY(10px)",
                    transition: `opacity 0.5s ${EXPO} 320ms, transform 0.5s ${EXPO} 320ms`,
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.muted }}>Sprint 12 — Active</span>
                        <span style={{ fontSize: "9px", color: C.dim }}>6 days remaining</span>
                    </div>
                    <div style={{ background: C.dim, height: "2px", marginBottom: "10px" }}>
                        <div style={{
                            background: "#3d6b3d", height: "100%",
                            width: animateIn ? "65%" : "0%",
                            transition: `width 1.4s ${EXPO} 700ms`,
                        }} />
                    </div>
                    <div style={{ display: "flex", gap: "20px" }}>
                        {[["18", "Done"], ["7", "In Progress"], ["4", "Todo"]].map(([n, l]) => (
                            <span key={l} style={{ fontSize: "9px", color: C.muted }}><span style={{ color: C.text }}>{n}</span> {l}</span>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.dim }}>Issues</span>
                    <span style={{ fontSize: "9px", color: C.dim }}>29 open</span>
                </div>

                {/* Issues — stagger slide in from right */}
                {MOCK_ISSUES.map((issue, i) => (
                    <div key={issue.id} style={{
                        display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", borderBottom: `1px solid ${C.border}`,
                        opacity: animateIn ? 1 : 0,
                        transform: animateIn ? "translateX(0)" : "translateX(10px)",
                        transition: `opacity 0.45s ${EXPO} ${460 + i * 70}ms, transform 0.45s ${EXPO} ${460 + i * 70}ms`,
                    }}>
                        <span style={{ color: C.muted, fontSize: "9px", minWidth: "10px" }}>{issue.prio}</span>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: issue.dot, flexShrink: 0 }} />
                        <span style={{ color: "#363636", fontSize: "9px", minWidth: "36px" }}>{issue.id}</span>
                        <span style={{ color: C.text, flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", fontSize: "10px" }}>{issue.title}</span>
                        <span style={{
                            fontSize: "9px", minWidth: "60px", textAlign: "right",
                            color: issue.status === "In Progress" ? "#5a8a5a" : issue.status === "In Review" ? "#5a6a8a" : issue.status === "Blocked" ? "#8a4a4a" : C.dim,
                        }}>
                            {issue.status}
                        </span>
                    </div>
                ))}
            </div>

            {/* Right panel */}
            <div style={{ width: "128px", borderLeft: `1px solid ${C.border}`, padding: "16px 14px", flexShrink: 0 }}>
                {/* Velocity bars grow from bottom */}
                <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.dim, marginBottom: "10px" }}>Velocity</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "44px" }}>
                        {[55, 70, 48, 80, 65, 88].map((h, i) => (
                            <div key={i} style={{
                                flex: 1, background: i === 5 ? "#3d6b3d" : C.dim, minWidth: "8px",
                                height: animateIn ? `${h}%` : "0%",
                                transition: `height 0.7s ${EXPO} ${680 + i * 80}ms`,
                            }} />
                        ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                        <span style={{ fontSize: "8px", color: C.dim }}>S7</span>
                        <span style={{ fontSize: "8px", color: "#3d6b3d" }}>S12</span>
                    </div>
                </div>

                {/* Workload bars fill left-to-right */}
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "16px", marginBottom: "20px" }}>
                    <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.dim, marginBottom: "10px" }}>Workload</div>
                    {[["AK", 72], ["ML", 45], ["JP", 88], ["SR", 33]].map(([initials, pct], wi) => (
                        <div key={initials as string} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                            <div style={{ width: "18px", height: "18px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: C.muted, flexShrink: 0 }}>
                                {initials}
                            </div>
                            <div style={{ flex: 1, background: C.dim, height: "2px" }}>
                                <div style={{
                                    background: (pct as number) > 80 ? "#6b3d3d" : "#3d4a3d",
                                    width: animateIn ? `${pct}%` : "0%", height: "100%",
                                    transition: `width 0.9s ${EXPO} ${900 + wi * 100}ms`,
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "16px" }}>
                    <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.dim, marginBottom: "8px" }}>Blockers</div>
                    <div style={{ fontSize: "9px", color: "#8a4a4a", lineHeight: 1.7 }}>3 active<br />2 unassigned</div>
                </div>
            </div>
        </div>
    </div>
);

// ─── Hero ──────────────────────────────────────────────────────────────────────
const Hero: FC = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

    // Animated counters for stats
    const stat12k = useCounter(12, mounted, 1100);
    const stat98 = useCounter(98.9, mounted, 1300, 1);
    const stat180 = useCounter(180, mounted, 1000);

    const cs = (delay: number): React.CSSProperties => ({
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.75s ${EXPO} ${delay}ms, transform 0.75s ${EXPO} ${delay}ms`,
    });

    return (
        <div style={{ display: "flex", minHeight: "100vh", paddingTop: "56px", borderBottom: `1px solid ${C.border}` }}>
            {/* Left */}
            <div style={{ width: "50%", padding: "88px 52px", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", justifyContent: "center" }}>

                {/* Live badge */}
                <div style={{ ...cs(60), display: "flex", alignItems: "center", gap: "8px", fontFamily: C.mono, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, marginBottom: "20px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3d6b3d", animation: "livePulse 2.2s ease-in-out infinite" }} />
                    Sprint 12 · Active · 6 days remaining
                </div>

                <div style={cs(120)}>
                    <SectionLabel>00 — Project Management</SectionLabel>
                </div>

                <div style={cs(200)}>
                    <DisplayHeading size="xl">
                        Ship projects.<br />
                        Not <em style={{ fontStyle: "italic", color: C.muted }}>spreadsheets.</em>
                    </DisplayHeading>
                </div>

                <p style={{ fontFamily: C.mono, fontSize: "12px", lineHeight: 1.9, color: C.muted, maxWidth: "400px", margin: "36px 0 44px", ...cs(290) }}>
                    FlowBase gives engineering teams a single workspace for issues, sprints, docs, and AI-powered delivery insights. Built for teams who ship with precision.
                </p>

                <div style={{ display: "flex", gap: "16px", ...cs(370) }}>
                    <PrimaryBtn>Start for free →</PrimaryBtn>
                    <GhostBtn>View demo</GhostBtn>
                </div>

                {/* Animated stats */}
                <div style={{ display: "flex", gap: "40px", marginTop: "52px", paddingTop: "32px", borderTop: `1px solid ${C.border}`, ...cs(450) }}>
                    {[
                        { val: `${stat12k}k+`, label: "Teams" },
                        { val: `${stat98}%`, label: "Uptime" },
                        { val: `< ${stat180}ms`, label: "P99 latency" },
                    ].map(({ val, label }) => (
                        <div key={label}>
                            <div style={{ fontFamily: C.serif, fontSize: "26px", color: C.text, fontWeight: 400, lineHeight: 1 }}>{val}</div>
                            <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.18em", marginTop: "6px" }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right — slides in from right */}
            <div style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "88px 52px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateX(0)" : "translateX(28px)",
                transition: `opacity 0.9s ${EXPO} 240ms, transform 0.9s ${EXPO} 240ms`,
            }}>
                <HeroDashboard animateIn={mounted} />
            </div>
        </div>
    );
};

// ─── Trust strip → marquee ─────────────────────────────────────────────────────
const TrustStrip: FC = () => (
    <MarqueeStrip
        items={["Vercel", "Supabase", "Planetscale", "Render", "Railway", "Fly.io", "Neon", "Loom", "Linear", "Sourcegraph"]}
        speed={38}
    />
);

// ─── Features ─────────────────────────────────────────────────────────────────
interface Feature { num: string; tag: string; name: string; desc: string; }

const FEATURES: Feature[] = [
    { num: "01", tag: "Work items", name: "Issues", desc: "One unified table for epics, stories, tasks, and bugs. Filter by anything, link to everything, move fast." },
    { num: "02", tag: "Visual flow", name: "Kanban Boards", desc: "Drag-and-drop columns that map to your workflow. Per-project or cross-project. Real-time updates." },
    { num: "03", tag: "Delivery", name: "Sprints", desc: "Plan, start, and close sprints with a single action. Burndown and velocity tracking included." },
    { num: "04", tag: "Knowledge", name: "Docs", desc: "Rich text editor with version history, nested trees, and deep links from issues to the relevant doc page." },
    { num: "05", tag: "Intelligence", name: "AI Assistant", desc: "Project-aware AI that reads your live data. Ask questions, create issues, surface blockers automatically." },
    { num: "06", tag: "Insights", name: "Reports", desc: "Velocity charts, burndown, cumulative flow, team workload. Export anything via API or webhook." },
];

const Features: FC = () => {
    const { ref: gridRef, inView: gridIn } = useInView(0.05);
    return (
        <FadeSection id="features" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div style={{ padding: "80px 52px 0" }}>
                <SectionLabel>01 — Features</SectionLabel>
                <DisplayHeading size="lg">Everything a team needs<br />to <em style={{ fontStyle: "italic", color: C.muted }}>ship.</em></DisplayHeading>
            </div>

            {/* Staggered grid reveal */}
            <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", marginTop: "64px", borderTop: `1px solid ${C.border}` }}>
                {FEATURES.map((f, i) => (
                    <div key={f.num} style={{
                        padding: "40px 52px",
                        borderRight: i % 3 !== 2 ? `1px solid ${C.border}` : "none",
                        borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                        opacity: gridIn ? 1 : 0,
                        transform: gridIn ? "translateY(0)" : "translateY(28px)",
                        transition: `opacity 0.6s ${EXPO} ${i * 90}ms, transform 0.6s ${EXPO} ${i * 90}ms`,
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                            <span style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.dim }}>{f.num}</span>
                            <span style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted }}>{f.tag}</span>
                        </div>
                        <h3 style={{ fontFamily: C.serif, fontSize: "28px", fontWeight: 400, color: C.text, lineHeight: 1.05, marginBottom: "16px" }}>{f.name}</h3>
                        <p style={{ fontFamily: C.mono, fontSize: "11px", lineHeight: 1.85, color: C.muted, margin: 0 }}>{f.desc}</p>
                    </div>
                ))}
            </div>
        </FadeSection>
    );
};

// ─── Marquee between sections ──────────────────────────────────────────────────
const FeatureMarquee: FC = () => (
    <MarqueeStrip
        items={["Issues", "Kanban Boards", "Sprints", "Docs", "AI Assistant", "Reports", "Webhooks", "Public API", "Custom Fields", "SSO"]}
        speed={28}
    />
);

// ─── Workflow ─────────────────────────────────────────────────────────────────
interface Step { num: string; title: string; sub: string; desc: string; }

const STEPS: Step[] = [
    { num: "01", title: "Capture", sub: "the idea", desc: "Drop anything into the backlog — a bug report, a spike, a feature. Type, priority, and description done in seconds." },
    { num: "02", title: "Refine", sub: "& assign", desc: "Add story points, link dependencies, assign ownership. Custom fields handle whatever your workflow demands." },
    { num: "03", title: "Sprint", sub: "& execute", desc: "Drag issues into the sprint. Kanban tracks progress. Burndown tracks pace. AI watches for blockers silently." },
    { num: "04", title: "Ship", sub: "& review", desc: "Close the sprint, review velocity, deploy the release. AI surfaces patterns so the next sprint starts smarter." },
];

const Workflow: FC = () => {
    const { ref: stepsRef, inView: stepsIn } = useInView(0.05);
    return (
        <FadeSection id="workflow" style={{ padding: "80px 52px", borderBottom: `1px solid ${C.border}` }}>
            <SectionLabel>02 — Workflow</SectionLabel>
            <DisplayHeading size="lg">From <em style={{ fontStyle: "italic", color: C.muted }}>idea</em> to shipped.</DisplayHeading>

            <div ref={stepsRef} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", marginTop: "64px" }}>
                {STEPS.map((s, i) => (
                    <div key={s.num} style={{
                        paddingRight: "44px", paddingLeft: i === 0 ? 0 : "44px",
                        borderLeft: i > 0 ? `1px solid ${C.border}` : "none",
                        opacity: stepsIn ? 1 : 0,
                        transform: stepsIn ? "translateY(0)" : "translateY(24px)",
                        transition: `opacity 0.65s ${EXPO} ${i * 110}ms, transform 0.65s ${EXPO} ${i * 110}ms`,
                    }}>
                        <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.dim, marginBottom: "24px" }}>{s.num}</div>
                        <h3 style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 400, color: C.text, lineHeight: 1.05, margin: "0 0 2px" }}>{s.title}</h3>
                        <h3 style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 400, color: C.muted, fontStyle: "italic", lineHeight: 1.05, margin: "0 0 20px" }}>{s.sub}</h3>
                        <p style={{ fontFamily: C.mono, fontSize: "11px", lineHeight: 1.85, color: C.muted, margin: 0 }}>{s.desc}</p>
                    </div>
                ))}
            </div>
        </FadeSection>
    );
};

// ─── AI chat mockup ────────────────────────────────────────────────────────────
const AIChatMockup: FC<{ animate?: boolean }> = ({ animate = false }) => {
    const msgs = [
        { who: "You", delay: 100, text: <span style={{ color: C.muted }}>Summarize the current sprint blockers.</span> },
        {
            who: "FlowBase AI", delay: 400, text: (
                <>
                    <p style={{ margin: "0 0 12px" }}>Sprint 12 has <span style={{ color: C.text }}>3 active blockers:</span></p>
                    <p style={{ margin: "0 0 7px", color: C.muted }}>— FE-38 missing @dnd-kit types package. Assigned to ML.</p>
                    <p style={{ margin: "0 0 7px", color: C.muted }}>— BE-14 blocks FE-42 on auth refresh. No assignee on BE-14.</p>
                    <p style={{ margin: "0 0 16px", color: C.muted }}>— BE-19 stalled 8 days with no activity log entries.</p>
                    <p style={{ margin: 0, color: "#5a7a5a" }}>→ Unblocking BE-14 is the critical path. Want me to assign it?</p>
                </>
            )
        },
    ];

    return (
        <div style={{ width: "100%", maxWidth: "460px", border: `1px solid ${C.border}`, background: C.surface, fontFamily: C.mono }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted }}>AI Assistant</span>
                <span style={{ fontSize: "9px", color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sprint 12 · FE project</span>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {msgs.map((m, i) => (
                    <div key={i} style={{
                        alignSelf: m.who === "You" ? "flex-end" : "flex-start",
                        maxWidth: m.who === "You" ? "88%" : "92%",
                        opacity: animate ? 1 : 0,
                        transform: animate ? "translateY(0)" : `translateY(${m.who === "You" ? "10px" : "14px"})`,
                        transition: `opacity 0.5s ${EXPO} ${m.delay}ms, transform 0.5s ${EXPO} ${m.delay}ms`,
                    }}>
                        <div style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: C.dim, marginBottom: "6px", textAlign: m.who === "You" ? "right" : "left" }}>
                            {m.who}
                        </div>
                        <div style={{ background: m.who === "You" ? "#181818" : "#111", border: `1px solid ${C.border}`, padding: m.who === "You" ? "11px 14px" : "14px 16px", fontSize: "11px", lineHeight: 1.85, color: C.text }}>
                            {m.text}
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                <div style={{ display: "flex", gap: "5px", paddingLeft: "2px", opacity: animate ? 1 : 0, transition: `opacity 0.3s ${EXPO} 800ms` }}>
                    {[0, 1, 2].map((i) => (
                        <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.muted, animation: `aiDot 1.4s ${i * 0.22}s ease-in-out infinite` }} />
                    ))}
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: `1px solid ${C.border}`, padding: "12px 16px" }}>
                <span style={{ flex: 1, fontSize: "11px", color: C.dim, letterSpacing: "0.06em" }}>Ask about your project...</span>
                <span style={{ fontSize: "11px", color: C.dim, animation: "cursorBlink 1.1s step-end infinite" }}>|</span>
            </div>
        </div>
    );
};

// ─── AI section ───────────────────────────────────────────────────────────────
const AISection: FC = () => {
    const { ref: aiRef, inView: aiIn } = useInView(0.1);
    return (
        <FadeSection id="ai" style={{ display: "flex", minHeight: "640px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: "44%", padding: "80px 52px", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <SectionLabel>03 — AI Assistant</SectionLabel>
                <DisplayHeading size="md">Your project data.<br /><em style={{ fontStyle: "italic", color: C.muted }}>Understood.</em></DisplayHeading>
                <p style={{ fontFamily: C.mono, fontSize: "12px", lineHeight: 1.9, color: C.muted, maxWidth: "320px", margin: "32px 0 36px" }}>
                    FlowBase's AI reads your live issue data, sprint state, and team docs — then gives answers that are actually useful. No hallucinations about your backlog.
                </p>

                {/* Staggered example queries */}
                <div ref={aiRef} style={{ borderTop: `1px solid ${C.border}`, paddingTop: "32px" }}>
                    {[
                        "Who's overloaded this week?",
                        "What blocked us last sprint?",
                        "Draft a bug for the auth edge case",
                        "Will we finish Sprint 12 on time?",
                        "What shipped in the last release?",
                    ].map((q, i) => (
                        <div key={q} style={{
                            fontFamily: C.mono, fontSize: "11px", color: C.muted, padding: "10px 0",
                            borderBottom: `1px solid ${C.border}`, letterSpacing: "0.04em",
                            opacity: aiIn ? 1 : 0,
                            transform: aiIn ? "translateX(0)" : "translateX(-12px)",
                            transition: `opacity 0.5s ${EXPO} ${i * 80}ms, transform 0.5s ${EXPO} ${i * 80}ms`,
                        }}>
                            "{q}"
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 52px" }}>
                <AIChatMockup animate={aiIn} />
            </div>
        </FadeSection>
    );
};

// ─── Dashboard / metrics ──────────────────────────────────────────────────────
const DashboardPreview: FC = () => {
    const { ref: metricsRef, inView: metricsIn } = useInView(0.1);
    const { ref: actRef, inView: actIn } = useInView(0.05);

    const c247 = useCounter(247, metricsIn, 1200);
    const c65 = useCounter(65, metricsIn, 1000);
    const c42 = useCounter(42, metricsIn, 900);
    const c3 = useCounter(3, metricsIn, 700);

    const activity = [
        { time: "2m ago", actor: "AK", action: "moved", subject: "FE-42 Fix auth token refresh", note: "→ In Review" },
        { time: "14m ago", actor: "ML", action: "commented on", subject: "FE-38 Implement kanban DnD", note: "" },
        { time: "1h ago", actor: "JP", action: "completed", subject: "Sprint 11 — 29 issues shipped", note: "✓ shipped" },
        { time: "2h ago", actor: "SR", action: "created", subject: "BE-22 Rate limiting middleware", note: "High priority" },
        { time: "3h ago", actor: "AI", action: "flagged blocker", subject: "FE-38 → BE-14 dependency chain", note: "auto-detected" },
    ];

    return (
        <FadeSection style={{ borderBottom: `1px solid ${C.border}` }}>
            <div style={{ padding: "80px 52px 0" }}>
                <SectionLabel>04 — Product</SectionLabel>
                <DisplayHeading size="lg">Total visibility.<br /><em style={{ fontStyle: "italic", color: C.muted }}>At all times.</em></DisplayHeading>
            </div>

            {/* Metric cards with counter animations */}
            <div ref={metricsRef} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", marginTop: "64px", borderTop: `1px solid ${C.border}` }}>
                {[
                    { label: "Active issues", val: String(c247), sub: "+12 this week" },
                    { label: "Sprint completion", val: `${c65}%`, sub: "18 / 29 done" },
                    { label: "Team velocity", val: `${c42} pts`, sub: "↑ 8% vs last sprint" },
                    { label: "Blocked issues", val: String(c3), sub: "2 without assignee" },
                ].map((s, i) => (
                    <div key={s.label} style={{
                        padding: "36px 40px",
                        borderRight: i < 3 ? `1px solid ${C.border}` : "none",
                        opacity: metricsIn ? 1 : 0,
                        transform: metricsIn ? "translateY(0)" : "translateY(20px)",
                        transition: `opacity 0.6s ${EXPO} ${i * 80}ms, transform 0.6s ${EXPO} ${i * 80}ms`,
                    }}>
                        <div style={{ fontFamily: C.mono, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.2em", color: C.muted, marginBottom: "12px" }}>{s.label}</div>
                        <div style={{ fontFamily: C.serif, fontSize: "40px", fontWeight: 400, color: C.text, lineHeight: 1, marginBottom: "8px" }}>{s.val}</div>
                        <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.dim, letterSpacing: "0.06em" }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Activity feed stagger */}
            <div ref={actRef} style={{ padding: "0 52px 80px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: C.mono, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.2em", color: C.dim, padding: "28px 0 16px" }}>Recent activity</div>
                {activity.map((a, i) => (
                    <div key={i} style={{
                        display: "flex", alignItems: "baseline", gap: "20px", padding: "11px 0",
                        borderBottom: `1px solid ${C.border}`, fontFamily: C.mono, fontSize: "11px",
                        opacity: actIn ? 1 : 0,
                        transform: actIn ? "translateX(0)" : "translateX(-14px)",
                        transition: `opacity 0.5s ${EXPO} ${i * 75}ms, transform 0.5s ${EXPO} ${i * 75}ms`,
                    }}>
                        <span style={{ color: C.dim, minWidth: "52px", flexShrink: 0 }}>{a.time}</span>
                        <span style={{ color: a.actor === "AI" ? "#4a5a6a" : "#3d6b5a", minWidth: "24px", textAlign: "center", flexShrink: 0 }}>{a.actor}</span>
                        <span style={{ color: C.muted, minWidth: "90px", flexShrink: 0 }}>{a.action}</span>
                        <span style={{ color: C.text, flex: 1 }}>{a.subject}</span>
                        {a.note && <span style={{ color: C.dim, fontSize: "10px", flexShrink: 0 }}>{a.note}</span>}
                    </div>
                ))}
            </div>
        </FadeSection>
    );
};

// ─── Pricing ──────────────────────────────────────────────────────────────────
interface Plan { name: string; price: string; period: string; desc: string; features: string[]; cta: string; highlight: boolean; }

const PLANS: Plan[] = [
    {
        name: "Free", price: "$0", period: "forever", desc: "For small teams just getting started.",
        features: ["Up to 5 members", "3 active projects", "Kanban boards & issues", "Basic activity log", "1,000 AI queries / month"], cta: "Start free", highlight: false
    },
    {
        name: "Pro", price: "$12", period: "per seat / month", desc: "For teams that ship on a weekly cadence.",
        features: ["Unlimited members", "Unlimited projects", "Sprints & burndown charts", "AI assistant (unlimited)", "Custom fields & labels", "Webhooks + public API", "Docs with version history", "Priority support"], cta: "Start Pro trial", highlight: true
    },
    {
        name: "Enterprise", price: "Custom", period: "annual contract", desc: "For organisations with compliance requirements.",
        features: ["SSO / SAML / LDAP", "Full audit log export", "Data residency options", "99.9% uptime SLA", "Dedicated support channel", "Custom plugin SDK", "White-labeling"], cta: "Talk to sales", highlight: false
    },
];

const PlanCard: FC<{ plan: Plan; borderRight: boolean; animDelay: number; visible: boolean }> = ({ plan, borderRight, animDelay, visible }) => {
    const [h, setH] = useState(false);
    return (
        <div style={{
            padding: "40px", display: "flex", flexDirection: "column",
            borderRight: borderRight ? `1px solid ${C.border}` : "none",
            background: plan.highlight ? C.surface : "transparent",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 0.65s ${EXPO} ${animDelay}ms, transform 0.65s ${EXPO} ${animDelay}ms`,
        }}>
            <div style={{ marginBottom: "32px" }}>
                <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.muted, marginBottom: "16px" }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "10px" }}>
                    <span style={{ fontFamily: C.serif, fontSize: "44px", fontWeight: 400, color: C.text, lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontFamily: C.mono, fontSize: "10px", color: C.muted }}>{plan.period}</span>
                </div>
                <p style={{ fontFamily: C.mono, fontSize: "11px", color: C.muted, margin: 0 }}>{plan.desc}</p>
            </div>
            <div style={{ flex: 1, marginBottom: "32px" }}>
                {plan.features.map((f) => (
                    <div key={f} style={{ fontFamily: C.mono, fontSize: "11px", color: C.muted, padding: "9px 0", borderBottom: `1px solid ${C.border}`, letterSpacing: "0.03em" }}>
                        → {f}
                    </div>
                ))}
            </div>
            <button
                onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                style={{
                    width: "100%", padding: "14px 24px",
                    background: plan.highlight ? (h ? "#d8d5ce" : C.text) : "transparent",
                    color: plan.highlight ? C.bg : (h ? C.text : C.muted),
                    border: `1px solid ${plan.highlight ? C.text : (h ? C.muted : C.dim)}`,
                    borderRadius: 0, fontFamily: C.mono, fontSize: "11px",
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    cursor: "pointer",
                    transition: `all 0.2s, transform 0.18s ${EXPO}`,
                    transform: h ? "translateY(-2px)" : "translateY(0)",
                }}
            >
                {plan.cta} →
            </button>
        </div>
    );
};

const Pricing: FC = () => {
    const { ref: plansRef, inView: plansIn } = useInView(0.1);
    return (
        <FadeSection id="pricing" style={{ padding: "80px 52px", borderBottom: `1px solid ${C.border}` }}>
            <SectionLabel>05 — Pricing</SectionLabel>
            <DisplayHeading size="lg">Simple, <em style={{ fontStyle: "italic", color: C.muted }}>honest</em> pricing.</DisplayHeading>
            <div ref={plansRef} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", marginTop: "64px", border: `1px solid ${C.border}` }}>
                {PLANS.map((plan, i) => (
                    <PlanCard key={plan.name} plan={plan} borderRight={i < 2} animDelay={i * 110} visible={plansIn} />
                ))}
            </div>
            <p style={{ fontFamily: C.mono, fontSize: "10px", color: C.dim, textAlign: "center", marginTop: "28px", letterSpacing: "0.1em" }}>
                All plans include a 14-day Pro trial. No credit card required to start.
            </p>
        </FadeSection>
    );
};

// ─── Final CTA ────────────────────────────────────────────────────────────────
const FinalCTA: FC = () => (
    <FadeSection style={{ padding: "128px 52px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
        <SectionLabel>06 — Get started</SectionLabel>
        <DisplayHeading size="xl">Ready to ship<br /><em style={{ fontStyle: "italic", color: C.muted }}>faster?</em></DisplayHeading>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "52px" }}>
            <PrimaryBtn large>Start for free →</PrimaryBtn>
            <GhostBtn large>Book a demo</GhostBtn>
        </div>
        <p style={{ fontFamily: C.mono, fontSize: "10px", color: C.muted, marginTop: "28px", letterSpacing: "0.12em" }}>
            Free forever. No credit card. 14-day Pro trial on signup.
        </p>
    </FadeSection>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const FOOTER_COLS: Record<string, string[]> = {
    Product: ["Issues", "Kanban Boards", "Sprints", "Docs", "AI Assistant", "Reports", "Webhooks"],
    Developers: ["API Reference", "Plugin SDK", "Changelog", "Status page", "OpenAPI spec"],
    Company: ["About", "Blog", "Careers", "Security", "Terms", "Privacy"],
    Support: ["Documentation", "Community", "Contact us", "Enterprise"],
};

const FooterLink: FC<{ label: string }> = ({ label }) => {
    const [h, setH] = useState(false);
    return (
        <a href="#" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
            style={{ display: "block", fontSize: "11px", color: h ? C.text : C.muted, textDecoration: "none", marginBottom: "11px", letterSpacing: "0.04em", transition: "color 0.15s", fontFamily: C.mono }}
        >
            {label}
        </a>
    );
};

const Footer: FC = () => (
    <footer style={{ padding: "64px 52px 48px", fontFamily: C.mono }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "48px", marginBottom: "64px" }}>
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                    <LogoMark size={24} />
                    <span style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.text }}>FlowBase</span>
                </div>
                <p style={{ fontSize: "11px", lineHeight: 1.85, color: C.muted, maxWidth: "220px", margin: "0 0 24px" }}>
                    Project management for engineering teams who ship without friction.
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                    {["X", "GH", "LI"].map((s) => (
                        <div key={s} style={{ width: "28px", height: "28px", border: `1px solid ${C.dim}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: C.muted, cursor: "pointer", letterSpacing: "0.06em", transition: `border-color 0.2s, color 0.2s` }}>
                            {s}
                        </div>
                    ))}
                </div>
            </div>
            {Object.entries(FOOTER_COLS).map(([col, links]) => (
                <div key={col}>
                    <div style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.dim, marginBottom: "18px" }}>{col}</div>
                    {links.map((link) => <FooterLink key={link} label={link} />)}
                </div>
            ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "32px", borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: "10px", color: C.dim, letterSpacing: "0.08em" }}>© 2025 FlowBase, Inc.</span>
            <span style={{ fontSize: "10px", color: C.dim, letterSpacing: "0.08em" }}>FastAPI · React · PostgreSQL · pgvector</span>
        </div>
    </footer>
);

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
    useEffect(() => {
        if (!document.querySelector("[data-pjc-fonts]")) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap";
            link.setAttribute("data-pjc-fonts", "1");
            document.head.appendChild(link);
        }
    }, []);

    return (
        <div style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
            <Nav />
            <Hero />
            <TrustStrip />
            <Features />
            <FeatureMarquee />
            <Workflow />
            <AISection />
            <DashboardPreview />
            <Pricing />
            <FinalCTA />
            <Footer />

            <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }
        html { scroll-behavior: smooth; }
        body { background: #080808; overflow-x: hidden; }
        ::selection { background: #2a2a2a; color: #f0ede6; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #252525; }

        /* ── Marquee ── */
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── Live status pulse ── */
        @keyframes livePulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.35); box-shadow: 0 0 6px #3d6b3d88; }
        }

        /* ── AI typing dots ── */
        @keyframes aiDot {
          0%, 100% { opacity: 0.15; transform: translateY(0); }
          50%       { opacity: 0.75; transform: translateY(-3px); }
        }

        /* ── Cursor blink ── */
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        /* ── Hallmark rule: every animation gets a reduced-motion fallback ── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
        </div>
    );
}