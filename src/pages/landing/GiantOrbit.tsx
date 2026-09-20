import { useEffect, useRef, useState, type CSSProperties } from "react";

/* --------------------------------------------------------------------------
   The centrepiece the brand name earns: the seven project tabs, orbiting a
   core, on two rings turning in opposite directions. Nothing here needs
   trigonometry — `rotate(angle) translate(radius)` places a node, and a
   child animated the same duration in the opposite direction keeps its
   label upright while the ring underneath keeps turning.
   -------------------------------------------------------------------------- */

const RING_1: { label: string; angle: number }[] = [
    { label: "Dashboard", angle: 0 },
    { label: "Tickets", angle: 90 },
    { label: "Board", angle: 180 },
    { label: "Milestones", angle: 270 },
];

const RING_2: { label: string; angle: number }[] = [
    { label: "Standup", angle: 40 },
    { label: "Members", angle: 160 },
    { label: "Settings", angle: 280 },
];

const RING_1_DURATION = 46; // seconds, clockwise
const RING_2_DURATION = 34; // seconds, counter-clockwise

function OrbitNode({
    angle,
    radius,
    label,
    ringDuration,
    reverse,
}: {
    angle: number;
    radius: number;
    label: string;
    ringDuration: number;
    reverse: boolean;
}) {
    // Both this wrapper and the counter-rotating child below are zero-size,
    // so rotating either one pivots exactly on this anchor point rather
    // than wobbling around some larger box's center. Only the innermost
    // visible chip has real dimensions, and it centers itself on the
    // (rotating) anchor with a self-referencing translate(-50%, -50%).
    const wrapperStyle: CSSProperties = {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 0,
        height: 0,
        transform: `rotate(${angle}deg) translate(${radius}px)`,
    };

    // Cancels the ring's own rotation so the label stays upright while it
    // still travels around the circle with everything else on the ring.
    const counterStyle: CSSProperties = {
        width: 0,
        height: 0,
        animation: `${reverse ? "pj-orbit-spin" : "pj-orbit-spin-reverse"} ${ringDuration}s linear infinite`,
    };

    return (
        <div style={wrapperStyle}>
            <div style={counterStyle}>
                <div className="orbit-node">
                    <span className="orbit-node-dot" />
                    <span className="orbit-node-label">{label}</span>
                </div>
            </div>
        </div>
    );
}

export function GiantOrbit() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = sectionRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            className="relative overflow-hidden bg-[#0c0d0a] py-[150px] max-[780px]:py-[100px]"
            id="orbit"
            ref={sectionRef}
        >
            {/* Faint starfield-style grid, same technique as the final CTA */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[.35]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,.09) 1px, transparent 1px)",
                    backgroundSize: "34px 34px",
                    maskImage: "radial-gradient(circle at center, black 0, transparent 72%)",
                }}
            />

            <div className="relative mx-auto max-w-[1240px] px-8 max-[780px]:px-5">
                <div
                    className="text-center transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
                    style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)" }}
                >
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#72756d]">
                        01 / WorkOrbit
                    </span>
                    <h2 className="mx-auto mt-5 max-w-[760px] text-[clamp(44px,6vw,78px)] font-semibold leading-[.9] tracking-[-.045em] text-[#f3f1ea]">
                        Everything orbits
                        <br />
                        <em className="font-serif font-normal not-italic text-[#7c7f75]">the work.</em>
                    </h2>
                    <p className="mx-auto mt-6 max-w-[480px] text-[13px] leading-[1.8] text-[#8b8e85]">
                        Seven tabs, one gravity well. Dashboard, tickets, board, milestones,
                        standup, members and settings all stay in orbit around the same
                        record of work, instead of drifting off into separate tools.
                    </p>
                </div>

                {/* The orbit itself */}
                <div
                    className="relative mx-auto mt-[70px] flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(.16,1,.3,1)] max-[780px]:mt-[50px]"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "scale(1)" : "scale(.82)",
                        transitionDelay: visible ? "120ms" : "0ms",
                    }}
                >
                    <div className="orbit-stage">
                        {/* faint outer boundary rings, purely decorative, for scale */}
                        <div className="orbit-guide orbit-guide-1" />
                        <div className="orbit-guide orbit-guide-2" />

                        {/* ring 1 — clockwise */}
                        <div
                            className="orbit-ring"
                            style={{ animation: `pj-orbit-spin ${RING_1_DURATION}s linear infinite` }}
                        >
                            {RING_1.map((node) => (
                                <OrbitNode
                                    key={node.label}
                                    angle={node.angle}
                                    label={node.label}
                                    radius={230}
                                    reverse={false}
                                    ringDuration={RING_1_DURATION}
                                />
                            ))}
                        </div>

                        {/* ring 2 — counter-clockwise, tighter radius */}
                        <div
                            className="orbit-ring"
                            style={{ animation: `pj-orbit-spin-reverse ${RING_2_DURATION}s linear infinite` }}
                        >
                            {RING_2.map((node) => (
                                <OrbitNode
                                    key={node.label}
                                    angle={node.angle}
                                    label={node.label}
                                    radius={140}
                                    reverse
                                    ringDuration={RING_2_DURATION}
                                />
                            ))}
                        </div>

                        {/* the core */}
                        <div className="orbit-core">
                            <span className="orbit-core-mark">WO</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .orbit-stage {
          position: relative;
          width: 560px;
          height: 560px;
          max-width: 92vw;
          max-height: 92vw;
        }
        .orbit-guide {
          position: absolute;
          inset: 0;
          margin: auto;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 999px;
        }
        .orbit-guide-1 { width: 460px; height: 460px; }
        .orbit-guide-2 { width: 280px; height: 280px; }
        @media (max-width: 780px) {
          .orbit-guide-1 { width: 78%; height: 78%; }
          .orbit-guide-2 { width: 48%; height: 48%; }
        }
        .orbit-ring {
          position: absolute;
          inset: 0;
          transform-origin: 50% 50%;
        }
        .orbit-node {
          display: inline-flex;
          transform: translate(-50%, -50%);
          align-items: center;
          gap: 8px;
          padding: 7px 13px 7px 10px;
          border: 1px solid rgba(216,255,88,.28);
          background: rgba(18,20,15,.9);
          backdrop-filter: blur(6px);
          white-space: nowrap;
          box-shadow: 0 8px 24px rgba(0,0,0,.35);
        }
        .orbit-node-dot {
          width: 5px;
          height: 5px;
          flex-shrink: 0;
          background: #d8ff58;
          box-shadow: 0 0 0 4px rgba(216,255,88,.14);
        }
        .orbit-node-label {
          font-family: var(--font-mono, "DM Mono", monospace);
          font-size: 10px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #eceee5;
        }
        .orbit-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 96px;
          height: 96px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at 35% 30%, rgba(216,255,88,.22), rgba(18,20,15,1) 70%);
          border: 1px solid rgba(216,255,88,.4);
          box-shadow: 0 0 0 14px rgba(216,255,88,.05), 0 0 60px rgba(216,255,88,.18);
        }
        .orbit-core-mark {
          font-family: var(--font-mono, "DM Mono", monospace);
          font-size: 15px;
          font-weight: 500;
          letter-spacing: .1em;
          color: #d8ff58;
        }
        @media (max-width: 640px) {
          .orbit-node { padding: 5px 10px 5px 8px; }
          .orbit-node-label { font-size: 8.5px; }
          .orbit-core { width: 74px; height: 74px; }
          .orbit-core-mark { font-size: 12px; }
        }
      `}</style>
        </section>
    );
}
