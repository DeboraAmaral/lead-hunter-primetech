import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useRouterState } from "@tanstack/react-router";

const TITLES: Record<string, { title: string; sub?: string }> = {
  "/": { title: "Dashboard", sub: "Visão geral da sua prospecção" },
  "/search": { title: "Buscar Leads", sub: "Descubra novas empresas para prospectar" },
  "/leads": { title: "Leads", sub: "Gerencie sua base de contatos" },
  "/stats": { title: "Estatísticas", sub: "Métricas e distribuição da carteira" },
  "/settings": { title: "Configurações", sub: "Preferências da conta" },
};

export function AppShell({ children }: { children: ReactNode }) {
  const { settings, toggleTheme } = useSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const meta = TITLES[pathname] ?? { title: "" };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-5" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{meta.title}</p>
            {meta.sub && (
              <p className="hidden truncate text-xs text-muted-foreground sm:block">{meta.sub}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="h-9 w-9"
          >
            {settings.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>
        <main className="flex-1 bg-muted/30">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
