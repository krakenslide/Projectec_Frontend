import { useEffect, useState } from "react";

interface LogoMarkProps {
    size?: number;
    delay?: number;
    className?: string;
    animate?: boolean;
    enableHover?: boolean;
}

const fills = ["#9a9a9a", "#9a9a9a", "#9a9a9a", "#5a5a5a"];

export function LogoMark({
    size = 26,
    delay = 0,
    className = "",
    animate = true,
    enableHover = true,
}: LogoMarkProps) {
    const [steps, setSteps] = useState<boolean[]>([
        !animate,
        !animate,
        !animate,
        !animate,
    ]);

    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (!animate) {
            setSteps([true, true, true, true]);
            return;
        }

        const timers: number[] = [];

        setSteps([false, false, false, false]);

        [0, 1, 2, 3].forEach((index) => {
            const timer = window.setTimeout(() => {
                setSteps((prev) => {
                    const next = [...prev];
                    next[index] = true;
                    return next;
                });
            }, delay + 220 + index * 260);

            timers.push(timer);
        });

        return () => {
            timers.forEach(window.clearTimeout);
        };
    }, [animate, delay]);

    return (
        <div
            aria-hidden="true"
            className={[
                "grid grid-cols-2 grid-rows-2 gap-[1px] border border-[#4a4a4a] p-[1px]",
                "transition-colors duration-200",
                enableHover ? "hover:border-[#8a8a8a]" : "",
                className,
            ].join(" ")}
            onMouseEnter={() => {
                if (enableHover) setHovered(true);
            }}
            onMouseLeave={() => {
                if (enableHover) setHovered(false);
            }}
            style={{ width: size, height: size }}
        >
            {fills.map((fill, index) => {
                const visible = steps[index];

                return (
                    <div
                        key={index}
                        style={{
                            backgroundColor: fill,
                            opacity: visible ? (hovered ? 0.92 : 1) : 0,
                            transform: visible
                                ? hovered
                                    ? "scale(0.9)"
                                    : "scale(1)"
                                : "scale(0.25)",
                            transitionProperty: "opacity, transform, background-color",
                            transitionDuration: visible ? "0.52s" : "0.22s",
                            transitionTimingFunction:
                                "cubic-bezier(0.34, 1.56, 0.64, 1)",
                            boxShadow: visible
                                ? hovered
                                    ? "0 0 12px rgba(240,240,240,0.12)"
                                    : "0 0 8px rgba(240,240,240,0.06)"
                                : "none",
                        }}
                    />
                );
            })}
        </div>
    );
}