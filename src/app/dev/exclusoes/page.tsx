import { DeletionsPage } from "@/features/developer/deletions-page";
import { AccessGate } from "@/components/layout/access-gate";
export const metadata = { title: "Solicitações de exclusão" };
export default function Page() {
  return (
    <AccessGate role="DEVELOPER">
      <DeletionsPage />
    </AccessGate>
  );
}
