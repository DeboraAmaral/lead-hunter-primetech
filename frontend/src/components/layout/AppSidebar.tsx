import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Search, ListChecks, BarChart3, Settings, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSettings } from "@/contexts/SettingsContext";

const nav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Buscar Leads", url: "/search", icon: Search },
  { title: "Leads", url: "/leads", icon: ListChecks },
  { title: "Estatísticas", url: "/stats", icon: BarChart3 },
  { title: "Configurações", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { settings } = useSettings();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm">
            <Sparkles className="h-4.5 w-4.5" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold leading-tight">Lead Hunter</p>
            <p className="truncate text-[11px] text-muted-foreground">{settings.companyName}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <p className="font-medium text-foreground">IA em breve</p>
          <p className="mt-0.5">Score, mensagens e enriquecimento automático de leads.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
