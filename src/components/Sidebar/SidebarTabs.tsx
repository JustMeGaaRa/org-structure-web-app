import { Briefcase, Users } from "lucide-react";

interface SidebarTabsProps {
  activeTab: "roles" | "people";
  onTabChange: (tab: "roles" | "people") => void;
}

export const SidebarTabs = ({ activeTab, onTabChange }: SidebarTabsProps) => {
  return (
    <div className="flex px-6 pt-2 gap-4 border-b border-slate-50">
      <button
        onClick={() => onTabChange("roles")}
        className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${activeTab === "roles" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
      >
        <Briefcase size={14} /> Roles
      </button>
      <button
        onClick={() => onTabChange("people")}
        className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${activeTab === "people" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
      >
        <Users size={14} /> People
      </button>
    </div>
  );
};
