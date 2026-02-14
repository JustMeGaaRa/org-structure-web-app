import type { FC, ReactNode } from "react";

interface ToolbarButtonProps {
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string; // Allow additional classes
  children: ReactNode;
  variant?: "default" | "danger" | "nav"; // Basic variants
}

export const ToolbarButton: FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  isDisabled = false,
  className = "",
  children,
  variant = "default",
}) => {
  const baseClasses =
    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all";

  let specificClasses = "";

  if (isDisabled) {
    specificClasses = "bg-slate-50 text-slate-300 cursor-not-allowed";
  } else if (variant === "danger") {
    specificClasses = "text-red-600 hover:bg-red-50";
  } else if (isActive) {
    specificClasses = "bg-blue-600 text-white shadow-md";
  } else {
    // Default interactive state
    specificClasses = "text-slate-500 hover:bg-slate-50 relative bg-white";
    if (variant === "nav") {
      // For prev/next buttons
      specificClasses = "bg-white text-slate-700 hover:bg-slate-50";
    }
  }

  // Handle custom overrides or merges if needed, for now simple concatenation
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${specificClasses} ${className}`}
    >
      {children}
    </button>
  );
};
