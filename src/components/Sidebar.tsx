import { useState, useRef } from "react";
import {
  ChevronRight,
  Settings2,
  Briefcase,
  Users,
  Search,
  Plus,
  AlertCircle,
  X,
  Trash2,
  Download,
  Upload,
} from "lucide-react";
import type { RoleTemplate, Person } from "../types";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        <button
          onClick={() => onToggle(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-10"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Library
          </h2>
        </div>

        <div className="flex px-6 pt-2 gap-4 border-b border-slate-50">
          <button
            onClick={() => setActiveTab("roles")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${activeTab === "roles" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
          >
            <Briefcase size={14} /> Roles
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${activeTab === "people" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
          >
            <Users size={14} /> People
          </button>
        </div>
        <div className="px-6 py-4">
          <form onSubmit={handleAdd} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs focus:bg-white outline-none transition-all ${isDuplicate ? "border-amber-200" : "border-slate-100 focus:border-blue-300"}`}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={14} />
            </div>
            {searchQuery && !isDuplicate && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-blue-600 text-white rounded-md"
              >
                <Plus size={14} />
              </button>
            )}
            {isDuplicate && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500">
                <AlertCircle size={14} />
              </div>
            )}
          </form>
        </div>
        <div className="flex-grow p-6 pt-0 space-y-3 overflow-y-auto">
          {activeTab === "roles"
            ? filteredRoles.map((r) => (
                <div
                  key={r.id}
                  onMouseDown={(e) => onRoleDragStart(e, r)}
                  className="group relative p-4 border border-slate-100 bg-slate-50 rounded-xl cursor-grab hover:border-blue-200 hover:bg-blue-50 transition-all"
                  style={{ userSelect: "none" }}
                >
                  <p className="text-xs font-bold text-slate-700">{r.role}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
                    Role Template
                  </p>
                  {onDeleteRoleTemplate && (
                    <button
                      onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRoleTemplate(r.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Template"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))
            : filteredPeople.map((p) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(e) => handlePersonDragStart(e, p)}
                  className="group relative p-3 border border-slate-100 bg-white rounded-xl cursor-grab hover:border-green-200 hover:bg-green-50 flex items-center gap-3 transition-all"
                  style={{ userSelect: "none" }}
                >
                  <img
                    src={p.imageUrl}
                    className="w-8 h-8 rounded-full shadow-sm"
                    alt=""
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-700">{p.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">
                      Person
                    </p>
                  </div>
                  {onDeletePersonTemplate && (
                    <button
                      onMouseDown={(e) => e.stopPropagation()} // Prevent drag start? Draggable works via dragstart.
                      // For draggable element, buttons inside might need preventDefault on mousedown or dragstart stop propagation.
                      // Usually click works fine if we don't drag.
                      onClick={(e) => {
                        e.stopPropagation(); // prevent drag selection if any
                        onDeletePersonTemplate(p.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Person"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
        </div>
        <div className="p-4 border-t border-slate-100 mt-auto flex gap-2">
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
      </div>
    </div>
  );
};
