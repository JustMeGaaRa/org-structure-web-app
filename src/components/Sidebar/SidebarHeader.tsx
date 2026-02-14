import { X } from "lucide-react";

interface SidebarHeaderProps {
  title: string;
  onClose: () => void;
}

export const SidebarHeader = ({ title, onClose }: SidebarHeaderProps) => {
  return (
    <>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-10"
        aria-label="Close sidebar"
      >
        <X size={20} />
      </button>

      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
          {title}
        </h2>
      </div>
    </>
  );
};
