import { useDroppable } from "@dnd-kit/core";
import { Check, Circle, Loader2 } from "lucide-react";

import IssueCard from "./IssueCard";
import type { Issue, IssueStatus } from "../types/issue";

interface Props {
  title: string;
  status: IssueStatus;
  issues: Issue[];
  allIssues: Record<IssueStatus, Issue[]>;
  onRefresh: () => void;
}

const columnConfig: Record<
  IssueStatus,
  {
    label: string;
    icon: typeof Circle;
    section: string;
  }
> = {
  TODO: {
    label: "To do",
    icon: Circle,
    section: "01",
  },
  IN_PROGRESS: {
    label: "In progress",
    icon: Loader2,
    section: "02",
  },
  DONE: {
    label: "Done",
    icon: Check,
    section: "03",
  },
};

export default function KanbanColumn({
  title,
  status,
  issues,
  allIssues,
  onRefresh,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const cfg = columnConfig[status];
  const Icon = cfg.icon;

  return (
    <section
      ref={setNodeRef}
      className={[
        "flex min-h-72 flex-col self-start border bg-transparent",
        "rounded-none font-['DM_Mono','Courier_New',monospace]",
        "transition-all duration-200",
        isOver
          ? "border-[#f0ede6] bg-[#111111]"
          : "border-[#4a4a4a] hover:border-[#8a8a8a] hover:bg-[#101010]",
      ].join(" ")}
    >
      {/* Header */}
      <div
        className={[
          "border-b px-4 py-4 transition-all duration-200",
          isOver ? "border-[#8a8a8a]" : "border-[#4a4a4a]",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          {/* Section Number */}
          <span
            className={[
              "text-[10px] uppercase tracking-[0.22em]",
              "text-[#9a9a9a]",
            ].join(" ")}
          >
            {cfg.section}
          </span>

          {/* Status Icon */}
          <Icon
            className={[
              "h-3.5 w-3.5 shrink-0 transition-colors duration-200",
              status === "IN_PROGRESS" ? "animate-spin" : "",
              isOver ? "text-[#ffffff]" : "text-[#b8b8b8]",
            ].join(" ")}
          />

          {/* Title */}
          <h3
            className={[
              "text-[11px] font-normal uppercase tracking-[0.22em]",
              "transition-colors duration-200",
              isOver ? "text-[#ffffff]" : "text-[#d8d5ce]",
            ].join(" ")}
          >
            {title || cfg.label}
          </h3>

          {/* Count */}
          <span
            className={[
              "ml-auto min-w-7 border px-2 py-1 text-center text-[10px]",
              "tabular-nums tracking-[0.08em]",
              "transition-all duration-200",
              isOver
                ? "border-[#d8d5ce] text-[#ffffff] bg-[#151515]"
                : "border-[#5a5a5a] text-[#b8b8b8]",
            ].join(" ")}
          >
            {issues.length}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-3">
        {issues.map((issue) => (
          <IssueCard
            allIssues={allIssues}
            issue={issue}
            key={issue.id}
            onRefresh={onRefresh}
          />
        ))}

        {/* Empty State */}
        {issues.length === 0 ? (
          <div
            className={[
              "flex min-h-32 flex-1 flex-col items-center justify-center gap-3",
              "border border-dashed p-4 text-center",
              "rounded-none bg-transparent",
              "transition-all duration-200",
              isOver
                ? "border-[#f0ede6] bg-[#111111]"
                : "border-[#5a5a5a] hover:border-[#8a8a8a]",
            ].join(" ")}
          >
            {/* Empty Icon */}
            <div
              className={[
                "flex h-8 w-8 items-center justify-center border",
                "rounded-none bg-transparent",
                "transition-all duration-200",
                isOver
                  ? "border-[#f0ede6] bg-[#151515]"
                  : "border-[#5a5a5a]",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-3.5 w-3.5 transition-colors duration-200",
                  status === "IN_PROGRESS" ? "animate-spin" : "",
                  isOver ? "text-[#ffffff]" : "text-[#b8b8b8]",
                ].join(" ")}
              />
            </div>

            {/* Empty Text */}
            <p
              className={[
                "text-[11px] uppercase tracking-[0.16em]",
                "transition-colors duration-200",
                isOver ? "text-[#ffffff]" : "text-[#b8b8b8]",
              ].join(" ")}
            >
              {isOver ? "Drop issue here" : "No issues"}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}