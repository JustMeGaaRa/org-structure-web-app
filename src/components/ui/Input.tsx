import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-slate-50 border rounded-xl text-xs focus:bg-white outline-none transition-all ${
          error ? "border-amber-200" : "border-slate-100 focus:border-blue-300"
        } ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
