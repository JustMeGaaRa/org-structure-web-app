import { useState } from "react";
import type { RoleTemplate, Person } from "../../types";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarTabs } from "./SidebarTabs";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarRoleList } from "./SidebarRoleList";
import { SidebarPersonList } from "./SidebarPersonList";
import { SidebarFooter } from "./SidebarFooter";

interface SidebarProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  onNavigateToLibrary: () => void;
  roleTemplates: RoleTemplate[];
  peopleTemplates: Person[];
  onAddRoleTemplate: (name: string) => void;
  onAddPersonTemplate: (name: string) => void;
  onDeleteRoleTemplate?: (id: string) => void;
  onDeletePersonTemplate?: (id: string) => void;
  onRoleDragStart: (e: React.MouseEvent, role: RoleTemplate) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}

export const Sidebar = ({
  isOpen,
  onToggle,
  onNavigateToLibrary,
  roleTemplates,
  peopleTemplates,
  onAddRoleTemplate,
  onAddPersonTemplate,
  onDeleteRoleTemplate,
  onDeletePersonTemplate,
  onRoleDragStart,
  onBackup,
  onRestore,
}: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<"roles" | "people">("roles");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = roleTemplates.filter((r) =>
    r.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredPeople = peopleTemplates.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isDuplicate =
    activeTab === "roles"
      ? roleTemplates.some(
          (r) => r.role.toLowerCase() === searchQuery.trim().toLowerCase(),
        )
      : peopleTemplates.some(
          (p) => p.name.toLowerCase() === searchQuery.trim().toLowerCase(),
        );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isDuplicate) return;
    if (activeTab === "roles") {
      onAddRoleTemplate(searchQuery.trim());
    } else {
      onAddPersonTemplate(searchQuery.trim());
    }
    setSearchQuery("");
  };

  const handlePersonDragStart = (e: React.DragEvent, person: Person) => {
    e.dataTransfer.setData("person", JSON.stringify(person));
  };

  return (
    <div
      className={`absolute top-6 right-6 bottom-6 flex flex-col z-50 transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-[120%] pointer-events-none"
      }`}
    >
      <div className="w-80 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden relative">
        <SidebarHeader title="Library" onClose={() => onToggle(false)} />

        <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <SidebarSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          isDuplicate={isDuplicate}
          onAdd={handleAdd}
        />

        {activeTab === "roles" ? (
          <SidebarRoleList
            roles={filteredRoles}
            onRoleDragStart={onRoleDragStart}
            onDeleteRoleTemplate={onDeleteRoleTemplate}
          />
        ) : (
          <SidebarPersonList
            people={filteredPeople}
            onPersonDragStart={handlePersonDragStart}
            onDeletePersonTemplate={onDeletePersonTemplate}
          />
        )}

        <SidebarFooter
          onNavigateToLibrary={onNavigateToLibrary}
          onBackup={onBackup}
          onRestore={onRestore}
        />
      </div>
    </div>
  );
};
