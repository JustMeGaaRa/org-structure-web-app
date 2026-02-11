import { forwardRef } from "react";
import {
  Trash2,
  MousePointer2,
  Hand,
  Square,
  StopCircle,
  Camera,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";

interface ToolbarProps {
  toolMode: "select" | "pan" | "track" | "record" | "present";
  setToolMode: (
    mode: "select" | "pan" | "track" | "record" | "present",
  ) => void;
  onCapture?: () => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  stepCount?: number;
  currentStepIndex?: number;
  onResetRecording?: () => void;
  isDragging: boolean;
  isOverDeleteZone: boolean;
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  (
    {
      toolMode,
      setToolMode,
      isDragging,
      isOverDeleteZone,
      onCapture,
      onNextStep,
      onPrevStep,
      stepCount = 0,
      currentStepIndex = 0,
      onResetRecording,
    },
    ref,
  ) => {
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
              {toolMode === "present" ? (
                <>
                  <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {currentStepIndex + 1} / {stepCount}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <button
                    onClick={onPrevStep}
                    disabled={currentStepIndex === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                      currentStepIndex === 0
                        ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <SkipBack size={16} /> <span>Prev Step</span>
                  </button>
                  <button
                    onClick={onNextStep}
                    disabled={currentStepIndex >= stepCount - 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                      currentStepIndex >= stepCount - 1
                        ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <SkipForward size={16} /> <span>Next Step</span>
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <button
                    onClick={() => setToolMode("select")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all text-red-600 hover:bg-red-50"
                  >
                    <StopCircle size={16} /> <span>End Presentation</span>
                  </button>
                </>
              ) : (
                <>
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
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <button
                    onClick={onCapture}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all text-slate-500 hover:bg-slate-50 relative"
                  >
                    <Camera size={16} /> <span>Capture</span>
                    <span className="absolute -top-3 -right-3 bg-slate-800 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-100 font-bold">
                      {stepCount}
                    </span>
                  </button>
                  <button
                    onClick={onResetRecording}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all text-slate-500 hover:bg-slate-50"
                  >
                    <Trash2 size={16} /> <span>Reset</span>
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <button
                    onClick={() => setToolMode("present")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all text-slate-500 hover:bg-slate-50"
                  >
                    <Play size={16} /> <span>Present</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Toolbar.displayName = "Toolbar";
