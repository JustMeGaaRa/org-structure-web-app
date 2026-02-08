import { forwardRef } from "react";
import { Trash2, MousePointer2, Hand, Square } from "lucide-react";

interface ToolbarProps {
  toolMode: "select" | "pan" | "track";
  setToolMode: (mode: "select" | "pan" | "track") => void;
  isDragging: boolean;
  isOverDeleteZone: boolean;
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ toolMode, setToolMode, isDragging, isOverDeleteZone }, ref) => {
    return (
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          ref={ref}
          className={`flex items-center p-1.5 rounded-2xl shadow-xl transition-all duration-300 ${
            isDragging
              ? isOverDeleteZone
                ? "bg-red-500 scale-110 w-48 justify-center text-white"
                : "bg-slate-900 w-48 justify-center text-white"
              : "bg-white/90 backdrop-blur-sm border border-slate-200/60"
          }`}
        >
          {isDragging ? (
            <div className="flex items-center gap-2">
              <Trash2
                size={20}
                className={isOverDeleteZone ? "animate-bounce" : ""}
              />
              <span className="text-xs font-bold uppercase tracking-widest">
                Delete
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-1">
              <button
                onClick={() => setToolMode("select")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                  toolMode === "select"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <MousePointer2 size={16} /> <span>Cursor</span>
              </button>
              <button
                onClick={() => setToolMode("pan")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                  toolMode === "pan"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Hand size={16} /> <span>Pan</span>
              </button>
              <div className="w-px h-6 bg-slate-100 mx-1" />
              <button
                onClick={() => setToolMode("track")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                  toolMode === "track"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Square size={16} /> <span>Track</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

Toolbar.displayName = "Toolbar";
