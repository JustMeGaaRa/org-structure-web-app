import type { FC } from "react";

interface RoleInfoProps {
  variant: "simple" | "detailed";
  isSmall: boolean;
  role: string;
  summary: string;
  assignedPerson?: { id: string; name: string; imageUrl: string };
}

export const RoleInfo: FC<RoleInfoProps> = ({
  variant,
  isSmall,
  role,
  summary,
  assignedPerson,
}) => {
  return (
    <div className="flex flex-col flex-grow overflow-hidden">
      <h2
        className={`font-bold text-slate-900 leading-tight truncate ${isSmall ? "text-sm" : "text-base"}`}
      >
        {variant === "detailed" && assignedPerson ? assignedPerson.name : role}
      </h2>
      {variant === "detailed" && assignedPerson && (
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
