import { useRef } from "react";
import { Settings2, ChevronRight, Download, Upload } from "lucide-react";

interface SidebarFooterProps {
  onNavigateToLibrary: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}

export const SidebarFooter = ({
  onNavigateToLibrary,
  onBackup,
  onRestore,
}: SidebarFooterProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 border-t border-slate-100 mt-auto flex gap-2 w-full bg-white/50 backdrop-blur-sm">
      <button
        onClick={onNavigateToLibrary}
        className="flex-1 flex items-center justify-between px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm group"
        title="Manage Assets"
      >
        <div className="flex items-center gap-3">
          <Settings2
            size={16}
            className="text-slate-400 group-hover:text-blue-500"
          />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Manage Assets
          </span>
        </div>
        <ChevronRight
          size={14}
          className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
        />
      </button>

      <button
        onClick={onBackup}
        className="p-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
        title="Backup Organization"
      >
        <Download size={18} />
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
        title="Restore Organization"
      >
        <Upload size={18} />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onRestore(file);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
};
