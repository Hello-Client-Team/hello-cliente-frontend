import { SystemsPage } from "@/features/merchant/systems-page";
import { AccessGate } from "@/components/layout/access-gate";
export const metadata = { title: "Meus sistemas" };
export default function Page() {
  return (
    <AccessGate role="MERCHANT">
      <SystemsPage />
    </AccessGate>
  );
}
