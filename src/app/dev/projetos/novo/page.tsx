import { ProjectForm } from "@/features/developer/project-form";
import { AccessGate } from "@/components/layout/access-gate";
export const metadata = { title: "Enviar projeto" };
export default function Page() {
  return (
    <AccessGate role="DEVELOPER">
      <ProjectForm />
    </AccessGate>
  );
}
