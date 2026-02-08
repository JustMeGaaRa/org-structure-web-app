import { useState, useRef, useEffect, useCallback } from "react";
import type { Role, TrackData, Transform, Point } from "../types";

export function useCanvasInteraction(
  transform: Transform,
  setTransform: (t: Transform | ((prev: Transform) => Transform)) => void,
  cards: Role[],
  setCards: (cards: Role[] | ((prev: Role[]) => Role[])) => void,
  tracks: TrackData[],
  setTracks: (
    tracks: TrackData[] | ((prev: TrackData[]) => TrackData[]),
  ) => void,
  toolMode: "select" | "pan" | "track",
  canvasRef: React.RefObject<HTMLDivElement | null>,
  deleteZoneRef: React.RefObject<HTMLDivElement | null>,
) {
  const GRID_SIZE = 20;

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<
    "card" | "track" | "track-create" | null
  >(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizingSide, setResizingSide] = useState<
    "top" | "bottom" | "left" | "right" | null
  >(null);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });
  const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);

  // Refs for values accessed in event listeners to avoid re-attaching listeners
  const transformRef = useRef(transform);
  const offsetRef = useRef(offset);
  const lastPanPointRef = useRef(lastPanPoint);
  const isPanningRef = useRef(isPanning);
  const draggingIdRef = useRef(draggingId);
  const draggingTypeRef = useRef(draggingType);
  const resizingIdRef = useRef(resizingId);
  const resizingSideRef = useRef(resizingSide);
  const isOverDeleteZoneRef = useRef(isOverDeleteZone);

  // Sync refs
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);
  useEffect(() => {
    lastPanPointRef.current = lastPanPoint;
  }, [lastPanPoint]);
  useEffect(() => {
    isPanningRef.current = isPanning;
  }, [isPanning]);
  useEffect(() => {
    draggingIdRef.current = draggingId;
  }, [draggingId]);
  useEffect(() => {
    draggingTypeRef.current = draggingType;
  }, [draggingType]);
  useEffect(() => {
    resizingIdRef.current = resizingId;
  }, [resizingId]);
  useEffect(() => {
    resizingSideRef.current = resizingSide;
  }, [resizingSide]);
  useEffect(() => {
    isOverDeleteZoneRef.current = isOverDeleteZone;
  }, [isOverDeleteZone]);

  // Zoom Logic
  const handleZoom = useCallback(
    (delta: number, centerX: number, centerY: number) => {
      setTransform((prev) => {
        const newScale = Math.min(Math.max(prev.scale + delta, 0.2), 3);
        if (newScale === prev.scale) return prev;
        const ratio = newScale / prev.scale;
        const x = centerX - (centerX - prev.x) * ratio;
        const y = centerY - (centerY - prev.y) * ratio;
        return { x, y, scale: newScale };
      });
    },
    [setTransform],
  );

  const handleStartDragCard = (e: React.MouseEvent, cardId: string) => {
    if (toolMode !== "select" || e.button !== 0) return;
    e.stopPropagation();
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    // We update state AND ref manually just to point of interest, but ref sync effect handles it too.
    // However, event handlers need up-to-date state ASAP so relying on useEffect sync is tricky if events fire
    // before effect. But React state updates are batched and effect runs after render.
    // For drag start, the next mousemove is usually later.
    setDraggingId(cardId);
    setDraggingType("card");
    const newOffset = {
      x: e.clientX / transform.scale - card.x,
      y: e.clientY / transform.scale - card.y,
    };
    setOffset(newOffset);
  };

  const handleStartDragTrack = (e: React.MouseEvent, trackId: string) => {
    if (toolMode !== "select" || e.button !== 0) return;
    e.stopPropagation();
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;
    setDraggingId(trackId);
    setDraggingType("track");
    const newOffset = {
      x: e.clientX / transform.scale - track.x,
      y: e.clientY / transform.scale - track.y,
    };
    setOffset(newOffset);
  };

  const handleResizeStart = (
    e: React.MouseEvent,
    trackId: string,
    side: "top" | "bottom" | "left" | "right",
  ) => {
    e.stopPropagation();
    setResizingId(trackId);
    setResizingSide(side);
  };

  // Handlers for mouse events on Window
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const isPanning = isPanningRef.current;

      // Handle Panning
      if (isPanning) {
        const lastPanPoint = lastPanPointRef.current;
        const dx = e.clientX - lastPanPoint.x;
        const dy = e.clientY - lastPanPoint.y;
        setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        setLastPanPoint({ x: e.clientX, y: e.clientY });
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // Handle Track Creation (draggingType === 'track-create')
      const createType = draggingTypeRef.current;
      const createId = draggingIdRef.current;
      // We check draggingId above anyway

      if (createType === "track-create" && createId) {
        const transform = transformRef.current;
        const startOffset = offsetRef.current; // Contains {x: startX, y: startY}

        const mouseX = (e.clientX - transform.x) / transform.scale;
        const mouseY = (e.clientY - transform.y) / transform.scale;

        // Snap to grid
        const currentGridX = Math.round(mouseX / GRID_SIZE) * GRID_SIZE;
        const currentGridY = Math.round(mouseY / GRID_SIZE) * GRID_SIZE;

        setTracks((prev) =>
          prev.map((t) => {
            if (t.id !== createId) return t;

            // Calculate new geometry
            // startOffset.{x,y} is the Top-Left corner of where we started.
            // currentGrid.{x,y} is where we are now.
            // We need to handle dragging in any direction (top-left, bottom-right etc).

            const startX = startOffset.x;
            const startY = startOffset.y;

            const newX = Math.min(startX, currentGridX);
            const newY = Math.min(startY, currentGridY);
            const newWidth = Math.abs(currentGridX - startX);
            const newHeight = Math.abs(currentGridY - startY);

            // Enforce minimum size if desired? Or allow small? Resize logic enforces >= 100.
            // Let's enforce min size 100 on creation as well to match resize logic?
            // Or allow smaller during creation and fix on mouse up?
            // The user says "release to stop drawing". Often lets you draw small.
            // Let's stick to simple logic for now.

            return {
              ...t,
              x: newX,
              y: newY,
              width: Math.max(20, newWidth), // Arbitrary min size 20 to avoid hidden tracks
              height: Math.max(20, newHeight),
            };
          }),
        );
        return;
      }

      const resizingId = resizingIdRef.current;

      // Handle Resizing
      if (resizingId) {
        const resizingSide = resizingSideRef.current;
        const transform = transformRef.current;
        const mouseX = (e.clientX - transform.x) / transform.scale;
        const mouseY = (e.clientY - transform.y) / transform.scale;

        setTracks((prev) =>
          prev.map((t) => {
            if (t.id !== resizingId) return t;
            const newT = { ...t };
            const gridX = Math.round(mouseX / GRID_SIZE) * GRID_SIZE;
            const gridY = Math.round(mouseY / GRID_SIZE) * GRID_SIZE;

            if (resizingSide === "right")
              newT.width = Math.max(100, gridX - t.x);
            if (resizingSide === "left") {
              const newWidth = t.width + (t.x - gridX);
              if (newWidth >= 100) {
                newT.x = gridX;
                newT.width = newWidth;
              }
            }
            if (resizingSide === "bottom")
              newT.height = Math.max(100, gridY - t.y);
            if (resizingSide === "top") {
              const newHeight = t.height + (t.y - gridY);
              if (newHeight >= 100) {
                newT.y = gridY;
                newT.height = newHeight;
              }
            }
            return newT;
          }),
        );
        return;
      }

      const draggingId = draggingIdRef.current;
      if (!draggingId) return;

      if (deleteZoneRef.current) {
        const dzRect = deleteZoneRef.current.getBoundingClientRect();
        const isOver =
          e.clientX >= dzRect.left &&
          e.clientX <= dzRect.right &&
          e.clientY >= dzRect.top &&
          e.clientY <= dzRect.bottom;

        setIsOverDeleteZone(isOver);
        isOverDeleteZoneRef.current = isOver; // update ref immediately
      }

      const offset = offsetRef.current;
      const draggingType = draggingTypeRef.current;
      const transform = transformRef.current;

      const newX =
        Math.round((e.clientX / transform.scale - offset.x) / GRID_SIZE) *
        GRID_SIZE;
      const newY =
        Math.round((e.clientY / transform.scale - offset.y) / GRID_SIZE) *
        GRID_SIZE;

      if (draggingType === "card") {
        setCards((prev) =>
          prev.map((c) =>
            c.id === draggingId ? { ...c, x: newX, y: newY } : c,
          ),
        );
      } else {
        setTracks((prev) =>
          prev.map((t) =>
            t.id === draggingId ? { ...t, x: newX, y: newY } : t,
          ),
        );
      }
    },
    [setCards, setTracks, setTransform, deleteZoneRef],
  );

  const handleMouseUp = useCallback(() => {
    const draggingId = draggingIdRef.current;
    const draggingType = draggingTypeRef.current;
    const isOverDeleteZone = isOverDeleteZoneRef.current;

    if (draggingId) {
      if (isOverDeleteZone) {
        if (draggingType === "card")
          setCards((prev) => prev.filter((c) => c.id !== draggingId));
        else setTracks((prev) => prev.filter((t) => t.id !== draggingId));
      } else if (draggingType === "track-create") {
        // Remove if too small (< 10x10)
        setTracks((prev) =>
          prev.filter((t) => {
            if (t.id === draggingId) {
              return t.width >= 50 && t.height >= 50;
            }
            return true;
          }),
        );
      }
    }

    setDraggingId(null);
    setDraggingType(null);
    setResizingId(null);
    setResizingSide(null);
    setIsPanning(false);
    setIsOverDeleteZone(false);

    // Reset local refs just in case? Not strictly needed as effect will sync nulls
  }, [setCards, setTracks]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Main canvas pointer down used for panning OR creating track
  const handlePointerDown = (e: React.PointerEvent) => {
    // Pan Mode
    if (toolMode === "pan" || e.button === 1) {
      setIsPanning(true);
      const startPoint = { x: e.clientX, y: e.clientY };
      setLastPanPoint(startPoint);
      lastPanPointRef.current = startPoint;
      e.currentTarget.setPointerCapture(e.pointerId); // Capture pointer for smooth panning
      return;
    }

    // Track Creation Mode
    if (toolMode === "track") {
      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const id = `track-${Date.now()}`;

      const mouseX =
        (e.clientX - canvasRect.left - transform.x) / transform.scale;
      const mouseY =
        (e.clientY - canvasRect.top - transform.y) / transform.scale;

      // Snap to grid
      const gridX = Math.round(mouseX / GRID_SIZE) * GRID_SIZE;
      const gridY = Math.round(mouseY / GRID_SIZE) * GRID_SIZE;

      const newTrack: TrackData = {
        id,
        x: gridX,
        y: gridY,
        width: 0,
        height: 0,
      };

      setTracks((prev) => [...prev, newTrack]);
      setResizingId(id); // Reuse resizing logic for "active interaction" state tracking if needed, or mostly just for ID.
      setDraggingType("track-create"); // Special internal type or just use a new Ref?
      // Actually let's just use resizingId and a new way to identify creation.
      // Re-using resizingId is fine, but I need to distinguish "resizing existing" vs "creating".
      // Let's use `draggingType` = 'track-create'.

      setDraggingId(id);
      setDraggingType("track-create");

      // Store start point in offset for convenience (using logic: startX, startY)
      setOffset({ x: gridX, y: gridY });
      offsetRef.current = { x: gridX, y: gridY };

      e.currentTarget.setPointerCapture(e.pointerId); // Capture pointer
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (!canvasRef.current) return;
      e.preventDefault();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      handleZoom(
        -e.deltaY * 0.002,
        e.clientX - canvasRect.left,
        e.clientY - canvasRect.top,
      );
    } else {
      setTransform((prev) => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  const startDragExternal = (
    e: React.MouseEvent,
    id: string,
    type: "card" | "track",
    initialX: number,
    initialY: number,
  ) => {
    setDraggingId(id);
    setDraggingType(type);
    const newOffset = {
      x: e.clientX / transform.scale - initialX,
      y: e.clientY / transform.scale - initialY,
    };
    setOffset(newOffset);
  };

  return {
    draggingId,
    draggingType,
    resizingId,
    resizingSide,
    isPanning,
    isOverDeleteZone,
    handleStartDragCard,
    handleStartDragTrack,
    handleResizeStart,
    handlePointerDown,
    handleWheel,
    handleZoom,
    startDragExternal,
  };
}
