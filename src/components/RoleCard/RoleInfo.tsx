import type { FC } from "react";

interface RoleInfoProps {
  isChart: boolean;
  isSmall: boolean;
  role: string;
  summary: string;
  assignedPerson?: { id: string; name: string; imageUrl: string };
}

export const RoleInfo: FC<RoleInfoProps> = ({
  isChart,
  isSmall,
  role,
  summary,
  assignedPerson,
}) => {
  return (
    <div className="flex flex-col grow overflow-hidden">
      <h2
        className={`font-bold text-slate-900 leading-tight truncate ${isSmall ? "text-sm" : "text-base"}`}
      >
        {isChart && assignedPerson ? assignedPerson.name : role}
      </h2>
      {isChart && assignedPerson && (
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5 truncate">
          {role}
        </p>
      )}
      {!isSmall && (
        <p
          className={`text-slate-500 text-[11px] leading-relaxed line-clamp-4 mt-2 transition-all italic`}
        >
          {summary}
        </p>
      )}
    </div>
  );
};
