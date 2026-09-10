import { ModerationPage } from "@/features/admin/moderation-page";
import { AccessGate } from "@/components/layout/access-gate";
export const metadata = { title: "Moderação" };
export default function Page() {
  return (
    <AccessGate role="ADMIN">
      <ModerationPage />
    </AccessGate>
  );
}
