import { Briefcase } from "lucide-react";
import type { FC } from "react";

interface RoleAvatarProps {
  isChart: boolean;
  isSmall: boolean;
  assignedPerson?: { id: string; name: string; imageUrl: string };
}

export const RoleAvatar: FC<RoleAvatarProps> = ({
  isChart,
  isSmall,
  assignedPerson,
}) => {
  if (!isChart || isSmall) return null;

  if (assignedPerson) {
    return (
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
        <img
          src={assignedPerson.imageUrl}
          alt=""
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
      <Briefcase size={18} className="text-slate-300" />
    </div>
  );
};
