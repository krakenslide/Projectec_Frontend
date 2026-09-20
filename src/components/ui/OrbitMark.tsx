import { useEffect, useState } from "react";

interface OrbitMarkProps {
    size?: number;
    delay?: number;
    className?: string;
    animate?: boolean;
    enableHover?: boolean;
    loader?: boolean;
}

/**
 * The WorkOrbit mark: a fixed core with two rings and a satellite that
 * travels the outer ring. The core lights up first, then the rings draw
 * themselves in, then the satellite starts orbiting.
 */
export function OrbitMark({
    size = 26,
    delay = 0,
    className = "",
    animate = true,
    enableHover = true,
    loader = false,
}: OrbitMarkProps) {
    const [steps, setSteps] = useState<boolean[]>([!animate, !animate, !animate]);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (!animate) {
            setSteps([true, true, true]);
            return;
        }

        const timers: number[] = [];
        setSteps([false, false, false]);

        [0, 1, 2].forEach((index) => {
            const timer = window.setTimeout(() => {
                setSteps((prev) => {
                    const next = [...prev];
                    next[index] = true;
                    return next;
                });
            }, delay + 200 + index * 260);
            timers.push(timer);
        });

        return () => timers.forEach(window.clearTimeout);
    }, [animate, delay]);

    const [coreIn, ringsIn, satelliteIn] = steps;
    const vb = 40;
    const cx = vb / 2;
    const cy = vb / 2;

    return (
        <div
            aria-hidden="true"
            className={["relative inline-flex shrink-0 items-center justify-center", className].join(" ")}
            onMouseEnter={() => enableHover && setHovered(true)}
            onMouseLeave={() => enableHover && setHovered(false)}
            style={{ width: size, height: size }}
        >
            <svg
                viewBox={`0 0 ${vb} ${vb}`}
                width="100%"
                height="100%"
                style={{
                    transform: hovered ? "scale(1.08)" : "scale(1)",
                    transition: "transform .3s cubic-bezier(.34,1.56,.64,1)",
                }}
            >
                <circle
                    cx={cx}
                    cy={cy}
                    r={17.5}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    className="text-[#a1a1aa] dark:text-[#71717a]"
                    style={{
                        opacity: ringsIn ? 1 : 0,
                        transformOrigin: "50% 50%",
                        transform: ringsIn ? "scale(1)" : "scale(.55)",
                        transition: "opacity .5s cubic-bezier(.34,1.56,.64,1), transform .5s cubic-bezier(.34,1.56,.64,1)",
                    }}
                />
                <ellipse
                    cx={cx}
                    cy={cy}
                    rx={11.5}
                    ry={6.4}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    className="text-[#a1a1aa] dark:text-[#71717a]"
                    transform={`rotate(-28 ${cx} ${cy})`}
                    style={{
                        opacity: ringsIn ? 1 : 0,
                        transformOrigin: "50% 50%",
                        transition: "opacity .5s ease .08s",
                    }}
                />
                <circle
                    cx={cx}
                    cy={cy}
                    r={3.6}
                    fill="currentColor"
                    className="text-[#5a5a5a] dark:text-[#c2c2c2]"
                    style={{
                        opacity: coreIn ? 1 : 0,
                        transform: coreIn ? "scale(1)" : "scale(0.3)",
                        transformOrigin: "50% 50%",
                        transition: "opacity .4s cubic-bezier(.34,1.56,.64,1), transform .4s cubic-bezier(.34,1.56,.64,1)",
                    }}
                />
                <g
                    style={{
                        opacity: satelliteIn ? 1 : 0,
                        transformOrigin: "50% 50%",
                        transition: "opacity .35s ease",
                        animation: satelliteIn
                            ? `${loader ? "pj-orbit-spin-fast" : "pj-orbit-spin"} ${loader ? "1.35s" : "5.5s"} linear infinite`
                            : undefined,
                    }}
                >
                    <circle
                        cx={cx + 11.5}
                        cy={cy}
                        r={2.1}
                        fill="#D8FF58"
                        transform={`rotate(-28 ${cx} ${cy})`}
                        style={{
                            filter: hovered
                                ? "drop-shadow(0 0 5px rgba(216,255,88,.55))"
                                : "drop-shadow(0 0 3px rgba(216,255,88,.35))",
                            transition: "filter .3s ease",
                        }}
                    />
                </g>
            </svg>
        </div>
    );
}
