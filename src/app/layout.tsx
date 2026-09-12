import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { ApiProvider } from "@/providers/api-provider";
import { SiteShell } from "@/components/layout/site-shell";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Hello Cliente — sistemas para o seu negócio",
    template: "%s | Hello Cliente",
  },
  description:
    "Encontre sistemas desenvolvidos por pessoas que querem crescer junto com o seu negócio.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ApiProvider>
          <SiteShell>
            <Suspense
              fallback={
                <div className="container py-20" role="status">
                  Carregando…
                </div>
              }
            >
              {children}
            </Suspense>
          </SiteShell>
          <Toaster richColors position="bottom-right" />
        </ApiProvider>
      </body>
    </html>
  );
}
