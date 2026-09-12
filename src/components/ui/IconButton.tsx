import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  danger?: boolean;
  dragProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  label?: string;
};

export function IconButton({
  children,
  className = "",
  danger = false,
  dragProps,
  label,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...dragProps}
      {...props}
      aria-label={label ?? props["aria-label"]}
      className={[
        "inline-flex h-8 w-8 items-center justify-center border border-transparent",
        "rounded-none bg-transparent transition-all duration-200",
        danger
          ? "text-[#52525b] dark:text-[#b8b8b8] hover:border-[#b91c1c] dark:hover:border-[#f2867d] hover:bg-[#fef2f2] dark:hover:bg-[#1a0d0d] hover:text-[#b91c1c] dark:hover:text-[#ffb3b3]"
          : "text-[#52525b] dark:text-[#c2c2c2] hover:border-[#52525b] dark:hover:border-[#8a8a8a] hover:bg-[#f4f4f5] dark:hover:bg-[#111111] hover:text-[#171717] dark:hover:text-[#ffffff]",
        dragProps?.className ?? "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
