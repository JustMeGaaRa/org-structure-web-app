import { useState, useEffect } from "react";
import type { RoleTemplate, Person } from "../types";

const INITIAL_ROLES = [
  {
    id: "r1",
    role: "Chief Executive",
    summary:
      "Strategic vision and high-level decision making for the entire organization.",
  },
  {
    id: "r2",
    role: "Engineering Lead",
    summary:
      "Oversees technical implementation, roadmap, and core platform architecture.",
  },
  {
    id: "r3",
    role: "Product Designer",
    summary:
      "Ensures user-centricity through rigorous research and visual consistency.",
  },
];

const INITIAL_PEOPLE = [
  {
    id: "p1",
    name: "Alex Rivera",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
  },
  {
    id: "p2",
    name: "Sarah Chen",
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
  },
];

function usePersistedState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(error);
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export function useLibrary(currentOrgId: string) {
  const [roleTemplates, setRoleTemplates] = usePersistedState<RoleTemplate[]>(
    `org_${currentOrgId}_role_templates`,
    INITIAL_ROLES,
  );
  const [peopleTemplates, setPeopleTemplates] = usePersistedState<Person[]>(
    `org_${currentOrgId}_people_templates`,
    INITIAL_PEOPLE,
  );

  return {
    roleTemplates,
    setRoleTemplates,
    peopleTemplates,
    setPeopleTemplates,
  };
}
