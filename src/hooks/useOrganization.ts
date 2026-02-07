import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Org } from "../types";

export function useOrganization() {
  const [currentOrgId, setCurrentOrgId] = useLocalStorage<string>(
    "org_current_id",
    "o1",
  );

  const [orgs, setOrgs] = useLocalStorage<Org[]>("org_list", () => {
    return [{ id: "o1", name: "Untitled Organization" }];
  });

  // Let's just derive it and provide a setter that updates the org list.
  const currentOrg = orgs.find((o) => o.id === currentOrgId) || orgs[0];

  const updateOrgName = useCallback(
    (newName: string) => {
      setOrgs((prev) =>
        prev.map((o) => (o.id === currentOrgId ? { ...o, name: newName } : o)),
      );
    },
    [currentOrgId, setOrgs],
  );

  const switchOrg = useCallback(
    (id: string) => {
      setCurrentOrgId(id);
      window.location.reload(); // The original code did reload.
    },
    [setCurrentOrgId],
  );

  const createNewOrg = useCallback(() => {
    const newId = `o-${Date.now()}`;
    const newOrg = { id: newId, name: "New Organization" };
    setOrgs((prev) => [...prev, newOrg]);
    switchOrg(newId);
  }, [setOrgs, switchOrg]);

  const deleteOrg = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (orgs.length <= 1) return;
      const updatedOrgs = orgs.filter((o) => o.id !== id);
      setOrgs(updatedOrgs);
      if (currentOrgId === id) {
        switchOrg(updatedOrgs[0].id);
      }
    },
    [orgs, currentOrgId, setOrgs, switchOrg],
  );

  return {
    orgs,
    currentOrgId,
    orgName: currentOrg?.name || "",
    switchOrg,
    createNewOrg,
    deleteOrg,
    updateOrgName,
  };
}
