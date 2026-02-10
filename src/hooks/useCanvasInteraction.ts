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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const initialPositionsRef = useRef<Record<string, { x: number; y: number }>>(
    {},
  );

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

    // Selection Logic
    let newSelectedIds = selectedIds;
    if (e.ctrlKey || e.metaKey) {
      if (selectedIds.includes(cardId)) {
        newSelectedIds = selectedIds.filter((id) => id !== cardId);
        // If we deselect, we don't drag
        setSelectedIds(newSelectedIds);
        return;
      } else {
        newSelectedIds = [...selectedIds, cardId];
      }
    } else {
      if (!selectedIds.includes(cardId)) {
        newSelectedIds = [cardId];
      }
    }
    setSelectedIds(newSelectedIds);

    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    setDraggingId(cardId);
    setDraggingType("card");
    const newOffset = {
      x: e.clientX / transform.scale - card.x,
      y: e.clientY / transform.scale - card.y,
    };
    setOffset(newOffset);

    // Capture initial positions for all selected cards and tracks for multi-drag
    const initialPos: Record<string, { x: number; y: number }> = {};
    cards.forEach((c) => {
      if (newSelectedIds.includes(c.id)) {
        initialPos[c.id] = { x: c.x, y: c.y };
      }
    });
    tracks.forEach((t) => {
      if (newSelectedIds.includes(t.id)) {
        initialPos[t.id] = { x: t.x, y: t.y };
      }
    });
    initialPositionsRef.current = initialPos;
  };

  const handleStartDragTrack = (e: React.MouseEvent, trackId: string) => {
    if (toolMode !== "select" || e.button !== 0) return;
    e.stopPropagation();

    // Selection Logic
    let newSelectedIds = selectedIds;
    if (e.ctrlKey || e.metaKey) {
      if (selectedIds.includes(trackId)) {
        newSelectedIds = selectedIds.filter((id) => id !== trackId);
        // If we deselect, we don't drag
        setSelectedIds(newSelectedIds);
        return;
      } else {
        newSelectedIds = [...selectedIds, trackId];
      }
    } else {
      if (!selectedIds.includes(trackId)) {
        newSelectedIds = [trackId];
      }
    }
    setSelectedIds(newSelectedIds);

    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;

    setDraggingId(trackId);
    setDraggingType("track");
    const newOffset = {
      x: e.clientX / transform.scale - track.x,
      y: e.clientY / transform.scale - track.y,
    };
    setOffset(newOffset);

    // Capture initial positions for all selected tracks or cards
    const initialPos: Record<string, { x: number; y: number }> = {};
    // We only support multi-dragging TRACKS here if we follow the pattern,
    // but ideally we support both. For now, let's at least support multiple tracks.
    tracks.forEach((t) => {
      if (newSelectedIds.includes(t.id)) {
        initialPos[t.id] = { x: t.x, y: t.y };
      }
    });
    // Also include cards if we want mixed dragging?
    cards.forEach((c) => {
      if (newSelectedIds.includes(c.id)) {
        initialPos[c.id] = { x: c.x, y: c.y };
      }
    });
    initialPositionsRef.current = initialPos;
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

      const newMouseX =
        Math.round((e.clientX / transform.scale - offset.x) / GRID_SIZE) *
        GRID_SIZE;
      const newMouseY =
        Math.round((e.clientY / transform.scale - offset.y) / GRID_SIZE) *
        GRID_SIZE;

      if (draggingType === "card" || draggingType === "track") {
        // Multi-drag logic for both types
        const initialPositions = initialPositionsRef.current;
        const leaderInitial = initialPositions[draggingId];

        if (!leaderInitial) {
          // Fallback if something went wrong - single item drag
          if (draggingType === "card") {
            setCards((prev) =>
              prev.map((c) =>
                c.id === draggingId ? { ...c, x: newMouseX, y: newMouseY } : c,
              ),
            );
          } else {
            setTracks((prev) =>
              prev.map((t) =>
                t.id === draggingId ? { ...t, x: newMouseX, y: newMouseY } : t,
              ),
            );
          }
          return;
        }

        const deltaX = newMouseX - leaderInitial.x;
        const deltaY = newMouseY - leaderInitial.y;

        // Update Cards if involved in selection
        setCards((prev) =>
          prev.map((c) => {
            if (initialPositions[c.id]) {
              return {
                ...c,
                x: initialPositions[c.id].x + deltaX,
                y: initialPositions[c.id].y + deltaY,
              };
            }
            return c;
          }),
        );
        // Update Tracks if involved in selection
        setTracks((prev) =>
          prev.map((t) => {
            if (initialPositions[t.id]) {
              return {
                ...t,
                x: initialPositions[t.id].x + deltaX,
                y: initialPositions[t.id].y + deltaY,
              };
            }
            return t;
          }),
        );
      }
    },
    [setCards, setTracks, setTransform, deleteZoneRef],
  );

  const handleMouseUp = useCallback(() => {
    const draggingId = draggingIdRef.current;
    const draggingType = draggingTypeRef.current;
    const isOverDeleteZone = isOverDeleteZoneRef.current;
    const initialPositions = initialPositionsRef.current;

    if (draggingId) {
      if (isOverDeleteZone) {
        if (draggingType === "card") {
          // Delete all selected cards that were being dragged
          const draggedIds = Object.keys(initialPositions);
          // If draggedIds is empty (e.g. single drag fallback), just delete draggingId
          if (draggedIds.length > 0) {
            setCards((prev) => prev.filter((c) => !draggedIds.includes(c.id)));
            setSelectedIds([]); // Clear selection after delete
          } else {
            setCards((prev) => prev.filter((c) => c.id !== draggingId));
          }
        } else setTracks((prev) => prev.filter((t) => t.id !== draggingId));
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
    initialPositionsRef.current = {}; // Clear initial positions

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

  // Main canvas mouse down used for panning OR creating track
  const handleMouseDown = (e: React.MouseEvent) => {
    // Pan Mode
    if (toolMode === "pan" || e.button === 1) {
      setIsPanning(true);
      const startPoint = { x: e.clientX, y: e.clientY };
      setLastPanPoint(startPoint);
      lastPanPointRef.current = startPoint;
      return;
    }

    // Clear selection if clicking on background
    if (toolMode === "select" && e.button === 0) {
      setSelectedIds([]);
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

  // Clipboard
  const clipboardRef = useRef<
    { type: "card" | "track"; data: Role | TrackData }[]
  >([]);

  // Refs for current data to access in keydown without dependencies
  const cardsRef = useRef(cards);
  const tracksRef = useRef(tracks); // Add tracksRef
  const selectedIdsRef = useRef(selectedIds);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);
  useEffect(() => {
    tracksRef.current = tracks; // Sync tracksRef
  }, [tracks]);
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Delete (Delete or Backspace)
      if (e.key === "Delete" || e.key === "Backspace") {
        const selected = selectedIdsRef.current;
        if (selected.length > 0) {
          setCards((prev) => prev.filter((c) => !selected.includes(c.id)));
          setTracks((prev) => prev.filter((t) => !selected.includes(t.id)));
          setSelectedIds([]);
        }
      }

      // Copy (Ctrl+C or Meta+C)
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyC") {
        const selected = selectedIdsRef.current;
        if (selected.length > 0) {
          const itemsToCopy: {
            type: "card" | "track";
            data: Role | TrackData;
          }[] = [];

          // Find cards
          const currentCards = cardsRef.current;
          currentCards.forEach((c) => {
            if (selected.includes(c.id)) {
              itemsToCopy.push({ type: "card", data: c });
            }
          });

          // Find tracks
          const currentTracks = tracksRef.current;
          currentTracks.forEach((t) => {
            if (selected.includes(t.id)) {
              itemsToCopy.push({ type: "track", data: t });
            }
          });

          clipboardRef.current = JSON.parse(JSON.stringify(itemsToCopy));
        }
      }

      // Paste (Ctrl+V or Meta+V)
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyV") {
        const clipboard = clipboardRef.current;
        if (clipboard.length > 0) {
          const newCards: Role[] = [];
          const newTracks: TrackData[] = [];
          const newSelectedIds: string[] = [];

          clipboard.forEach((item) => {
            const newId = `${item.type === "track" ? "track-" : ""}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Apply offset
            const newItem = {
              ...item.data,
              id: newId,
              x: item.data.x + GRID_SIZE,
              y: item.data.y + GRID_SIZE,
            };

            // Cast generic Item data to specific and push
            if (item.type === "card") {
              newCards.push(newItem as Role);
            } else {
              newTracks.push(newItem as TrackData);
            }
            newSelectedIds.push(newId);
          });

          if (newCards.length > 0) setCards((prev) => [...prev, ...newCards]);
          if (newTracks.length > 0)
            setTracks((prev) => [...prev, ...newTracks]);

          // Update clipboard with new items for iterative paste
          // We need to reconstruct the clipboard structure with new items
          const newClipboard = [
            ...newCards.map((c) => ({ type: "card" as const, data: c })),
            ...newTracks.map((t) => ({ type: "track" as const, data: t })),
          ];
          clipboardRef.current = newClipboard;

          setSelectedIds(newSelectedIds);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCards, setTracks]);

  return {
    draggingId,
    draggingType,
    resizingId,
    resizingSide,
    isPanning,
    isOverDeleteZone,
    selectedIds,
    handleStartDragCard,
    handleStartDragTrack,
    handleResizeStart,
    handleMouseDown,
    handleWheel,
    handleZoom,
    startDragExternal,
  };
}
