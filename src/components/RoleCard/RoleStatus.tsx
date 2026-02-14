import { Circle, Clock, CheckCircle } from "lucide-react";
import type { FC } from "react";

interface RoleStatusProps {
  status: "unassigned" | "suggested" | "assigned";
  variant: "simple" | "detailed";
  isSmall: boolean;
}

export const RoleStatus: FC<RoleStatusProps> = ({
  status,
  variant,
  isSmall,
}) => {
  if (variant === "simple") return null;

  const statusConfig = {
    unassigned: {
      color: "text-slate-400",
      icon: <Circle size={14} />,
      label: "Position Unassigned",
    },
    suggested: {
      color: "text-blue-500",
      icon: <Clock size={14} />,
      label: "Candidate Suggested",
    },
    assigned: {
      color: "text-green-600",
      icon: <CheckCircle size={14} />,
      label: "Role Approved",
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div
      className={`p-1 rounded-full bg-white shadow-sm border border-slate-100 ${currentStatus.color} ${!isSmall ? "absolute -bottom-1 -right-1" : ""}`}
    >
      {currentStatus.icon}
    </div>
  );
};
