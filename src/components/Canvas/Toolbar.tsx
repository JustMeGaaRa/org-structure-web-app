import { forwardRef } from "react";
import {
  Trash2,
  MousePointer2,
  Hand,
  Square,
  LayoutGrid,
  Scan,
} from "lucide-react";

interface ToolbarProps {
  toolMode: "select" | "pan" | "track";
  setToolMode: (mode: "select" | "pan" | "track") => void;
  isDragging: boolean;
  isOverDeleteZone: boolean;
  onResetZoom: () => void;
  onToggleLibrary: () => void;
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  (
    {
      toolMode,
      setToolMode,
      isDragging,
      isOverDeleteZone,
      onResetZoom,
      onToggleLibrary,
    },
    ref,
  ) => {
    return (
      <div
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40 w-[90%] md:w-auto flex justify-center"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          ref={ref}
          className={`flex items-center p-1.5 rounded-2xl shadow-xl transition-all duration-300 ${
            isDragging
              ? isOverDeleteZone
                ? "bg-red-500 scale-110 w-48 justify-center text-white"
                : "bg-slate-900 w-48 justify-center text-white"
              : "bg-white/90 backdrop-blur-sm border border-slate-200/60 w-full md:w-auto justify-between md:justify-center"
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
            <div className="flex items-center gap-1 md:gap-2 px-1 w-full md:w-auto justify-between md:justify-start">
              {/* Mobile Library Button */}
              <button
                onClick={onToggleLibrary}
                className="md:hidden flex flex-col items-center justify-center w-12 h-10 rounded-xl text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-50"
              >
                <LayoutGrid size={18} />
                <span className="text-[8px] mt-0.5">Lib</span>
              </button>

              <div className="w-px h-6 bg-slate-100 mx-1 md:hidden" />

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setToolMode("select")}
                  className={`flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                    toolMode === "select"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <MousePointer2 size={16} />{" "}
                  <span className="hidden md:inline">Cursor</span>
                </button>
                <button
                  onClick={() => setToolMode("pan")}
                  className={`flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                    toolMode === "pan"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Hand size={16} />{" "}
                  <span className="hidden md:inline">Pan</span>
                </button>
                <div className="w-px h-6 bg-slate-100 mx-1 hidden md:block" />
                <button
                  onClick={() => setToolMode("track")}
                  className={`flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                    toolMode === "track"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Square size={16} />{" "}
                  <span className="hidden md:inline">Track</span>
                </button>
              </div>

              {/* Mobile Reset Zoom */}
              <div className="w-px h-6 bg-slate-100 mx-1 md:hidden" />
              <button
                onClick={onResetZoom}
                className="md:hidden flex flex-col items-center justify-center w-12 h-10 rounded-xl text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-50"
              >
                <Scan size={18} />
                <span className="text-[8px] mt-0.5">Reset</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

Toolbar.displayName = "Toolbar";
