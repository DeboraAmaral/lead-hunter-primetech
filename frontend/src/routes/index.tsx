import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart,
  CalendarDays,
  Globe,
  Mail,
  MessageCircle,
  Search as SearchIcon,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { LoadingState } from "@/components/common/LoadingState";
import { useLeadsContext } from "@/contexts/LeadsContext";
import type { Lead } from "@/types/lead";
import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lead Hunter PrimeTech" },
      {
        name: "description",
        content:
          "Painel de prospecção da PrimeTech: métricas, distribuição por cidade e segmento, e leads recentes.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { leads, loading } = useLeadsContext();
  const [active, setActive] = useState<Lead | null>(null);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: leads.length,
      today: leads.filter((l) => new Date(l.created_at).toDateString() === today).length,
      wa: leads.filter((l) => !!l.whatsapp).length,
      email: leads.filter((l) => !!l.email).length,
      noSite: leads.filter((l) => !l.website).length,
      site: leads.filter((l) => !!l.website).length,
      fav: leads.filter((l) => l.favorite).length,
    };
  }, [leads]);

  const byCity = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => map.set(l.city, (map.get(l.city) ?? 0) + 1));
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 7);
  }, [leads]);

  const bySegment = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => map.set(l.segment, (map.get(l.segment) ?? 0) + 1));
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 7);
  }, [leads]);

  const byDay = useMemo(() => {
    const days: { name: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      const count = leads.filter(
        (l) => new Date(l.created_at).toDateString() === d.toDateString(),
      ).length;
      days.push({ name: label, value: count });
    }
    return days;
  }, [leads]);

  const recent = leads.slice(0, 6);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral da prospecção da PrimeTech"
        actions={
          <Button asChild>
            <Link to="/search">
              <SearchIcon className="mr-2 h-4 w-4" /> Buscar leads
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Total de leads" value={stats.total} icon={Users} tone="primary" />
        <StatCard label="Encontrados hoje" value={stats.today} icon={CalendarDays} tone="info" hint="Últimas 24h" />
        <StatCard label="Com WhatsApp" value={stats.wa} icon={MessageCircle} tone="success" />
        <StatCard label="Com Email" value={stats.email} icon={Mail} tone="info" />
        <StatCard label="Sem site" value={stats.noSite} icon={XCircle} tone="warning" hint="Oportunidades de dev" />
        <StatCard label="Com site" value={stats.site} icon={Globe} />
        <StatCard label="Favoritos" value={stats.fav} icon={Star} tone="warning" />
        <StatCard label="Segmentos" value={new Set(leads.map((l) => l.segment)).size} icon={BarChart} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Leads por dia</p>
              <p className="text-xs text-muted-foreground">Últimos 14 dias</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byDay} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2.2}
                  dot={{ r: 3, fill: "var(--primary)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-semibold">Leads por cidade</p>
          <p className="mb-4 text-xs text-muted-foreground">Top 7</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={byCity} layout="vertical" margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={90} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <p className="text-sm font-semibold">Leads por segmento</p>
        <p className="mb-4 text-xs text-muted-foreground">Distribuição da carteira</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={bySegment} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Últimos leads</p>
            <p className="text-xs text-muted-foreground">Os 6 mais recentes</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/leads">Ver todos</Link>
          </Button>
        </div>
        {loading ? (
          <LoadingState />
        ) : (
          <LeadTable leads={recent} onView={setActive} />
        )}
      </section>

      <LeadDrawer lead={active} open={!!active} onOpenChange={(o) => !o && setActive(null)} />
    </>
  );
}
