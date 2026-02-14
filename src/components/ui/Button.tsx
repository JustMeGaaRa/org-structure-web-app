import type { FC, ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "icon";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const baseClasses =
    "rounded-xl transition-all font-bold flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary:
      "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 shadow-sm",
    danger: "text-red-500 hover:bg-red-50 hover:text-red-600",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100/50",
    icon: "p-2 bg-transparent hover:bg-slate-100 text-slate-500",
  };

  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-xs px-4 py-2.5",
    lg: "text-sm px-5 py-3",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
