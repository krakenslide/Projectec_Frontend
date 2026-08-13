import { useEffect, useState } from "react";
import { LogoMark } from "./LogoMark";

interface ProjectecLogoProps {
    size?: number;
    delay?: number;
    showWordmark?: boolean;
    className?: string;
    animate?: boolean;
    enableHover?: boolean;
    loader?: boolean;
}

const WORD = "PROJECTEC";

export function ProjectecLogo({
    size = 26,
    delay = 0,
    showWordmark = true,
    className = "",
    animate = true,
    enableHover = true,
    loader = false,
}: ProjectecLogoProps) {
    const [revealedCount, setRevealedCount] = useState(
        animate ? 0 : WORD.length
    );

    useEffect(() => {
        if (!animate) {
            setRevealedCount(WORD.length);
            return;
        }

        const timers: number[] = [];

        setRevealedCount(0);

        for (let index = 0; index < WORD.length; index += 1) {
            const timer = window.setTimeout(() => {
                setRevealedCount((value) => Math.min(value + 1, WORD.length));
            }, delay + 520 + index * 52);

            timers.push(timer);
        }

        return () => {
            timers.forEach(window.clearTimeout);
        };
    }, [animate, delay]);

    return (
        <div
            className={[
                "group flex items-center gap-2.5",
                className,
            ].join(" ")}
        >
            <LogoMark
                size={size}
                delay={delay}
                animate={animate}
                enableHover={enableHover}
                loader={loader}
            />

            {showWordmark ? (
                <span
                    className={[
                        "flex select-none font-['Inter',ui-sans-serif,sans-serif]",
                        "text-[11px] uppercase tracking-[0.2em]",
                    ].join(" ")}
                >
                    {WORD.split("").map((char, index) => (
                        <span
                            key={`${char}-${index}`}
                            className={[
                                "inline-block w-[0.74em] transition-colors duration-200",
                                index < revealedCount
                                    ? "text-[#52525b] dark:text-[#c2c2c2] group-hover:text-[#171717] dark:group-hover:text-[#f5f3ee]"
                                    : "text-[#a1a1aa] dark:text-[#71717a]",
                            ].join(" ")}
                        >
                            {char}
                        </span>
                    ))}
                </span>
            ) : null}
        </div>
    );
}