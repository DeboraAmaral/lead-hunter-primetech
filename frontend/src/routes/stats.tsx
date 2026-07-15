import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { useLeadsContext } from "@/contexts/LeadsContext";
import { LEAD_STATUSES, LEAD_STATUS_META } from "@/types/lead";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Estatísticas — Lead Hunter PrimeTech" },
      { name: "description", content: "Distribuição de leads por status, cidade e segmento." },
    ],
  }),
  component: StatsPage,
});

const COLORS = ["#3b82f6", "#f59e0b", "#71717a", "#8b5cf6", "#10b981", "#ef4444"];

function StatsPage() {
  const { leads } = useLeadsContext();

  const byStatus = useMemo(
    () =>
      LEAD_STATUSES.map((s) => ({
        name: LEAD_STATUS_META[s].label,
        value: leads.filter((l) => l.status === s).length,
      })),
    [leads],
  );

  const byCity = useMemo(() => {
    const m = new Map<string, number>();
    leads.forEach((l) => m.set(l.city, (m.get(l.city) ?? 0) + 1));
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [leads]);

  const bySegment = useMemo(() => {
    const m = new Map<string, number>();
    leads.forEach((l) => m.set(l.segment, (m.get(l.segment) ?? 0) + 1));
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [leads]);

  return (
    <>
      <PageHeader title="Estatísticas" description="Como sua carteira está distribuída" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-semibold">Distribuição por status</p>
          <p className="mb-4 text-xs text-muted-foreground">Funil da prospecção</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {byStatus.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-semibold">Por cidade</p>
          <p className="mb-4 text-xs text-muted-foreground">Total de {byCity.length} cidades</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCity} margin={{ top: 5, right: 8, left: -18, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} angle={-25} textAnchor="end" height={60} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <p className="text-sm font-semibold">Por segmento</p>
          <p className="mb-4 text-xs text-muted-foreground">Distribuição da carteira</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySegment} margin={{ top: 5, right: 8, left: -18, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={60} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}
