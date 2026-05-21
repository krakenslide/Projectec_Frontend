import type { IssuePriority } from "../types/issue";

export type PriorityTone = {
    label: string;
    dotClass: string;
    textClass: string;
    borderClass: string;
    hoverBorderClass: string;
    hoverTextClass: string;
    bgClass: string;
};

export const issuePriorityTone: Record<IssuePriority, PriorityTone> = {
    LOW: {
        label: "Low",
        dotClass: "bg-[#5f6f5a]",
        textClass: "text-[#8f9f88]",
        borderClass: "border-[#2f3a2d]",
        hoverBorderClass: "hover:border-[#5f6f5a]",
        hoverTextClass: "hover:text-[#aebaa8]",
        bgClass: "bg-[#0b100b]",
    },
    MEDIUM: {
        label: "Medium",
        dotClass: "bg-[#8a7651]",
        textClass: "text-[#b8a06d]",
        borderClass: "border-[#3d3322]",
        hoverBorderClass: "hover:border-[#8a7651]",
        hoverTextClass: "hover:text-[#d1bc89]",
        bgClass: "bg-[#120f09]",
    },
    HIGH: {
        label: "High",
        dotClass: "bg-[#8a4d4d]",
        textClass: "text-[#c27a7a]",
        borderClass: "border-[#402323]",
        hoverBorderClass: "hover:border-[#8a4d4d]",
        hoverTextClass: "hover:text-[#dfa0a0]",
        bgClass: "bg-[#120909]",
    },
};

export function getIssuePriorityTone(priority: IssuePriority) {
    return issuePriorityTone[priority];
}

export function getIssuePriorityLabel(priority: IssuePriority) {
    return issuePriorityTone[priority].label;
}