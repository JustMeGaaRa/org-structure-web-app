import { useOrganization } from "./hooks/useOrganization";
import { useLibrary } from "./hooks/useLibrary";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { CanvasPage } from "./pages/CanvasPage";
import { LibraryEditor } from "./pages/LibraryEditor";

/**
 * Main App
 */
export default function App() {
  const {
    orgs,
    currentOrgId,
    orgName,
    switchOrg,
    createNewOrg,
    deleteOrg,
    updateOrgName,
  } = useOrganization();

  const {
    roleTemplates,
    setRoleTemplates,
    peopleTemplates,
    setPeopleTemplates,
  } = useLibrary(currentOrgId);

  const [currentPage, setCurrentPage] = useLocalStorage<string>(
    "org_currentPage",
    "canvas",
  );

  return (
    <>
      {currentPage === "canvas" ? (
        <CanvasPage
          orgs={orgs}
          currentOrgId={currentOrgId}
          orgName={orgName}
          updateOrgName={updateOrgName}
          switchOrg={switchOrg}
          deleteOrg={deleteOrg}
          createNewOrg={createNewOrg}
          roleTemplates={roleTemplates}
          peopleTemplates={peopleTemplates}
          setRoleTemplates={setRoleTemplates}
          setPeopleTemplates={setPeopleTemplates}
          onNavigateToLibrary={() => setCurrentPage("library-editor")}
        />
      ) : (
        <LibraryEditor
          roleTemplates={roleTemplates}
          setRoleTemplates={setRoleTemplates}
          peopleTemplates={peopleTemplates}
          setPeopleTemplates={setPeopleTemplates}
          onBack={() => setCurrentPage("canvas")}
        />
      )}
    </>
  );
}
