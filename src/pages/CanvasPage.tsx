import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Track } from "../components/Track/Track";
import { RoleCard } from "../components/RoleCard/RoleCard";
import { OrgHeader } from "../components/Canvas/OrgHeader";
import { ZoomControls } from "../components/Canvas/ZoomControls";
import { ViewControls } from "../components/Canvas/ViewControls";
import { Toolbar } from "../components/Canvas/Toolbar";
import { Sidebar } from "../components/Sidebar";
import { useCanvasData } from "../hooks/useCanvasData";
import { useCanvasInteraction } from "../hooks/useCanvasInteraction";
import type { Role, Person, Org, RoleTemplate } from "../types";

interface CanvasPageProps {
  orgs: Org[];
  currentOrgId: string;
  orgName: string;
  updateOrgName: (name: string) => void;
  switchOrg: (id: string) => void;
  deleteOrg: (e: React.MouseEvent, id: string) => void;
  createNewOrg: () => void;
  roleTemplates: RoleTemplate[];
  peopleTemplates: Person[];
  setRoleTemplates: (roles: RoleTemplate[]) => void;
  setPeopleTemplates: (people: Person[]) => void;
  onNavigateToLibrary: () => void;
  onDeleteRoleTemplate?: (id: string) => void;
  onDeletePersonTemplate?: (id: string) => void;
}

export const CanvasPage = ({
  orgs,
  currentOrgId,
  orgName,
  updateOrgName,
  switchOrg,
  deleteOrg,
  createNewOrg,
  roleTemplates,
  peopleTemplates,
  setRoleTemplates,
  setPeopleTemplates,
  onNavigateToLibrary,
  onDeleteRoleTemplate,
  onDeletePersonTemplate,
}: CanvasPageProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const deleteZoneRef = useRef<HTMLDivElement>(null);
  const [toolMode, setToolMode] = useState<"select" | "pan" | "track">(
    "select",
  );
  const [viewMode, setViewMode] = useState<"structure" | "chart">("chart");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Canvas Data & Interaction Hooks
  const { cards, setCards, tracks, setTracks, transform, setTransform } =
    useCanvasData(currentOrgId);

  const {
    draggingId,
    draggingType,
    resizingId,
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
  } = useCanvasInteraction(
    transform,
    setTransform,
    cards,
    setCards,
    tracks,
    setTracks,
    toolMode,
    canvasRef,
    deleteZoneRef,
  );

  const toggleCardSize = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, size: c.size === "small" ? "large" : "small" }
          : c,
      ),
    );
  };
  const handleBackup = () => {
    const backupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      orgId: currentOrgId,
      orgName: orgName,
      cards: cards,
      tracks: tracks,
      roleTemplates: roleTemplates,
      peopleTemplates: peopleTemplates,
      transform: transform,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${orgName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Basic validation
        if (!data.cards || !data.tracks) {
          alert("Invalid backup file: Missing cards or tracks data.");
          return;
        }

        // Restore data
        if (data.orgName) updateOrgName(data.orgName);
        if (data.cards) setCards(data.cards);
        if (data.tracks) setTracks(data.tracks);
        if (data.roleTemplates) setRoleTemplates(data.roleTemplates);
        if (data.peopleTemplates) setPeopleTemplates(data.peopleTemplates);
        if (data.transform) setTransform(data.transform);

        // alert("Organization restored successfully!");
      } catch (err) {
        console.error("Failed to restore backup:", err);
        alert("Failed to parse backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      <main
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        className={`flex-grow relative bg-slate-100 overflow-hidden outline-none ${
          toolMode === "pan"
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-default"
        }`}
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 ${1.5 * transform.scale}px, transparent ${1.5 * transform.scale}px)`,
          backgroundSize: `${20 * transform.scale}px ${20 * transform.scale}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px`,
        }}
      >
        <OrgHeader
          orgName={orgName}
          updateOrgName={updateOrgName}
          orgs={orgs}
          currentOrgId={currentOrgId}
          switchOrg={switchOrg}
          deleteOrg={deleteOrg}
          createNewOrg={createNewOrg}
        />

        <div
          className={`absolute inset-0 pointer-events-none ${
            isPanning ? "" : "transition-transform duration-75 ease-out"
          }`}
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <div className="relative w-full h-full pointer-events-auto">
            {tracks.map((track) => (
              <Track
                key={track.id}
                trackData={track}
                isDragging={draggingId === track.id && draggingType === "track"}
                isResizing={resizingId === track.id}
                isSelected={selectedIds.includes(track.id)}
                onMouseDown={handleStartDragTrack}
                onResizeStart={handleResizeStart}
                isOverDeleteZone={
                  isOverDeleteZone &&
                  draggingId === track.id &&
                  draggingType === "track"
                }
              />
            ))}
            {cards.map((card) => (
              <RoleCard
                key={card.id}
                roleData={card}
                viewMode={viewMode}
                isDragging={draggingId === card.id && draggingType === "card"}
                isSelected={selectedIds.includes(card.id)}
                isOverDeleteZone={
                  isOverDeleteZone &&
                  draggingId === card.id &&
                  draggingType === "card"
                }
                onMouseDown={(e: React.MouseEvent<HTMLDivElement>) =>
                  handleStartDragCard(e, card.id)
                }
                onPersonDrop={(
                  rid: string,
                  p: { id: string; name: string; imageUrl: string },
                ) =>
                  setCards((prev) =>
                    prev.map((c) =>
                      c.id === rid
                        ? { ...c, assignedPerson: p, status: "suggested" }
                        : c,
                    ),
                  )
                }
                onApprove={(rid: string) =>
                  setCards((prev) =>
                    prev.map((c) =>
                      c.id === rid ? { ...c, status: "assigned" } : c,
                    ),
                  )
                }
                onClear={(rid: string) =>
                  setCards((prev) =>
                    prev.map((c) =>
                      c.id === rid
                        ? {
                            ...c,
                            status: "unassigned",
                            assignedPerson: undefined,
                          }
                        : c,
                    ),
                  )
                }
                onToggleSize={toggleCardSize}
              />
            ))}
          </div>
        </div>

        <ViewControls viewMode={viewMode} setViewMode={setViewMode} />

        <ZoomControls
          scale={transform.scale}
          onZoomIn={() =>
            handleZoom(0.1, window.innerWidth / 2, window.innerHeight / 2)
          }
          onZoomOut={() =>
            handleZoom(-0.1, window.innerWidth / 2, window.innerHeight / 2)
          }
          onReset={() => setTransform({ x: 0, y: 0, scale: 1 })}
        />

        <Toolbar
          ref={deleteZoneRef}
          toolMode={toolMode}
          setToolMode={setToolMode}
          isDragging={!!draggingId}
          isOverDeleteZone={isOverDeleteZone}
        />

        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`absolute top-6 right-6 p-2 bg-white border border-slate-200 rounded-full shadow-lg hover:bg-slate-50 z-30 transition-all duration-300 ${
            isSidebarOpen
              ? "opacity-0 scale-90 pointer-events-none"
              : "opacity-100 scale-100"
          }`}
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
      </main>

      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={setIsSidebarOpen}
        onNavigateToLibrary={onNavigateToLibrary}
        roleTemplates={roleTemplates}
        peopleTemplates={peopleTemplates}
        onAddRoleTemplate={(name) => {
          setRoleTemplates([
            {
              id: `r-${Date.now()}`,
              role: name,
              summary: "Custom role added to library.",
            },
            ...roleTemplates,
          ]);
        }}
        onAddPersonTemplate={(name) => {
          setPeopleTemplates([
            {
              id: `p-${Date.now()}`,
              name: name,
              imageUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
            },
            ...peopleTemplates,
          ]);
        }}
        onDeleteRoleTemplate={onDeleteRoleTemplate}
        onDeletePersonTemplate={onDeletePersonTemplate}
        onBackup={handleBackup}
        onRestore={handleRestore}
        onRoleDragStart={(e, roleTemplate) => {
          // Create the card
          if (!canvasRef.current) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const canvasRect = canvasRef.current.getBoundingClientRect();
          const id = `${Date.now()}`;

          const initialX =
            (rect.left - canvasRect.left - transform.x) / transform.scale;
          const initialY =
            (rect.top - canvasRect.top - transform.y) / transform.scale;

          const newCard: Role = {
            ...roleTemplate,
            id,
            x: initialX,
            y: initialY,
            assignedPerson: undefined,
            status: "unassigned",
            size: "large",
          };

          setCards((prev) => [...prev, newCard]);

          startDragExternal(e, id, "card", initialX, initialY);
        }}
      />
    </div>
  );
};
