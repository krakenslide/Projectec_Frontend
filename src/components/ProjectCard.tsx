import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  Edit3,
  FolderKanban,
  Trash2,
} from "lucide-react";

import type { Project } from "../types/project";

interface Props {
  project: Project;
  onDelete?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  viewMode?: "grid" | "list";
}

const iconClass = "h-3.5 w-3.5 shrink-0";

function IconButton({
  label,
  children,
  onClick,
  danger = false,
}: {
  label: string;
  children: React.ReactNode;
  onClick: (event: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className={[
        "inline-flex h-8 w-8 items-center justify-center border border-transparent",
        "rounded-none bg-transparent transition-all duration-200",
        danger
          ? "text-[#b8b8b8] hover:border-[#d36b6b] hover:bg-[#1a0d0d] hover:text-[#ffb3b3]"
          : "text-[#c2c2c2] hover:border-[#8a8a8a] hover:bg-[#111111] hover:text-[#ffffff]",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export default function ProjectCard({
  project,
  onDelete,
  onEdit,
  viewMode = "grid",
}: Props) {
  const navigate = useNavigate();

  const date = new Date(project.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit?.(project);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete?.(project);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  const initials = project.name.charAt(0).toUpperCase();

  if (viewMode === "list") {
    return (
      <div
        className={[
          "group flex cursor-pointer items-center gap-4 border",
          "border-[#4a4a4a] bg-transparent p-4",
          "font-['DM_Mono','Courier_New',monospace]",
          "transition-all duration-200",
          "hover:border-[#8a8a8a] hover:bg-[#101010]",
        ].join(" ")}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        {/* Initial */}
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center border",
            "border-[#5a5a5a]",
            "text-[12px] uppercase tracking-[0.14em]",
            "text-[#d8d5ce]",
            "transition-all duration-200",
            "group-hover:border-[#8a8a8a]",
            "group-hover:bg-[#151515]",
            "group-hover:text-[#ffffff]",
          ].join(" ")}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[13px] font-normal leading-[1.5] text-[#ffffff]">
              {project.name}
            </h3>

            <ArrowUpRight
              className={[
                "h-3.5 w-3.5 shrink-0",
                "text-[#d8d5ce]",
                "opacity-0 transition-all duration-200",
                "group-hover:translate-x-[1px]",
                "group-hover:opacity-100",
              ].join(" ")}
            />
          </div>

          <p className="mt-1 truncate text-[12px] leading-[1.7] text-[#b8b8b8]">
            {project.description || "No description provided"}
          </p>
        </div>

        {/* Date */}
        <div
          className={[
            "hidden shrink-0 items-center gap-2 sm:flex",
            "text-[11px] uppercase tracking-[0.08em]",
            "text-[#c2c2c2]",
          ].join(" ")}
        >
          <CalendarDays className={iconClass} />
          {date}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {onEdit ? (
            <IconButton label={`Edit ${project.name}`} onClick={handleEdit}>
              <Edit3 className={iconClass} />
            </IconButton>
          ) : null}

          {onDelete ? (
            <IconButton
              danger
              label={`Delete ${project.name}`}
              onClick={handleDelete}
            >
              <Trash2 className={iconClass} />
            </IconButton>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "group flex min-h-52 cursor-pointer flex-col border",
        "border-[#4a4a4a] bg-transparent p-5",
        "font-['DM_Mono','Courier_New',monospace]",
        "transition-all duration-200",
        "hover:border-[#8a8a8a] hover:bg-[#101010]",
      ].join(" ")}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Top */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center border",
            "border-[#5a5a5a]",
            "text-[13px] uppercase tracking-[0.14em]",
            "text-[#d8d5ce]",
            "transition-all duration-200",
            "group-hover:border-[#8a8a8a]",
            "group-hover:bg-[#151515]",
            "group-hover:text-[#ffffff]",
          ].join(" ")}
        >
          {initials}
        </div>

        <div className="flex items-center gap-1">
          {onEdit ? (
            <IconButton label={`Edit ${project.name}`} onClick={handleEdit}>
              <Edit3 className={iconClass} />
            </IconButton>
          ) : null}

          {onDelete ? (
            <IconButton
              danger
              label={`Delete ${project.name}`}
              onClick={handleDelete}
            >
              <Trash2 className={iconClass} />
            </IconButton>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h2 className="line-clamp-2 text-[15px] font-normal leading-[1.55] text-[#ffffff]">
            {project.name}
          </h2>

          <ArrowUpRight
            className={[
              "mt-1 h-3.5 w-3.5 shrink-0",
              "text-[#d8d5ce]",
              "opacity-0 transition-all duration-200",
              "group-hover:translate-x-[1px]",
              "group-hover:opacity-100",
            ].join(" ")}
          />
        </div>

        <p className="mt-3 line-clamp-3 text-[12px] leading-[1.85] text-[#b8b8b8]">
          {project.description || "No description provided."}
        </p>
      </div>

      {/* Footer */}
      <div
        className={[
          "mt-5 flex items-center justify-between border-t pt-4",
          "border-[#4a4a4a]",
          "text-[11px] uppercase tracking-[0.08em]",
          "text-[#c2c2c2]",
        ].join(" ")}
      >
        <span className="flex items-center gap-2">
          <CalendarDays className={iconClass} />
          {date}
        </span>

        <span
          className={[
            "flex items-center gap-2",
            "text-[#d8d5ce]",
            "transition-colors duration-200",
            "group-hover:text-[#ffffff]",
          ].join(" ")}
        >
          <FolderKanban className={iconClass} />
          Open
        </span>
      </div>
    </div>
  );
}