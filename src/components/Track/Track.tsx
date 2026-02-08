import type { FC } from "react";
import { ResizeHandle } from "./ResizeHandle";

/**
 * Track Component
 * A resizable, movable frame that sits behind cards
 */
export const Track: FC<{
  trackData: {
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
  };
  isDragging: boolean;
  isResizing: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, trackId: string) => void;
  onResizeStart: (
    e: React.PointerEvent<HTMLDivElement>,
    trackId: string,
    direction: "top" | "bottom" | "left" | "right",
  ) => void;
  isOverDeleteZone: boolean;
}> = ({
  trackData,
  isDragging,
  isResizing,
  onPointerDown,
  onResizeStart,
  isOverDeleteZone,
}) => {
  const { x, y, width, height } = trackData;

  const handleResize = (
    e: React.PointerEvent<HTMLDivElement>,
    direction: "top" | "bottom" | "left" | "right",
  ) => {
    onResizeStart(e, trackData.id, direction);
  };

  return (
    <div
      onPointerDown={(e) => onPointerDown(e, trackData.id)}
      className={`absolute border-2 border-dashed rounded-2xl transition-shadow group select-none ${
        isDragging
          ? `shadow-xl border-blue-400 bg-blue-50/10 z-20 ${isOverDeleteZone ? "border-red-500 opacity-50" : ""}`
          : "border-slate-300 bg-transparent z-0 hover:border-slate-400"
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: isResizing ? "grabbing" : "grab",
      }}
    >
      <ResizeHandle direction="top" onResizeStart={handleResize} />
      <ResizeHandle direction="bottom" onResizeStart={handleResize} />
      <ResizeHandle direction="left" onResizeStart={handleResize} />
      <ResizeHandle direction="right" onResizeStart={handleResize} />
    </div>
  );
};
