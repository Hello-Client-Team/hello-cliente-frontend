import { ProjectsPage } from "@/features/developer/projects-page";
import { AccessGate } from "@/components/layout/access-gate";
export const metadata = { title: "Meus projetos" };
export default function Page() {
  return (
    <AccessGate role="DEVELOPER">
      <ProjectsPage />
    </AccessGate>
  );
}
