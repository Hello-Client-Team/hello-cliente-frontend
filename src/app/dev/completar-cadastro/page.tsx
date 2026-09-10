import { CompleteProfilePage } from "@/features/auth/auth-pages";
import { AccessGate } from "@/components/layout/access-gate";
export const metadata = { title: "Complete seu perfil" };
export default function Page() {
  return (
    <AccessGate role="DEVELOPER">
      <CompleteProfilePage />
    </AccessGate>
  );
}
