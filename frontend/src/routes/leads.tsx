import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Filter, Search as SearchIcon, Users, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { useLeadsContext } from "@/contexts/LeadsContext";
import type { Lead, LeadStatus } from "@/types/lead";
import { LEAD_STATUSES, LEAD_STATUS_META } from "@/types/lead";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Lead Hunter PrimeTech" },
      {
        name: "description",
        content: "Sua base de leads: filtre por cidade, segmento, status e mais.",
      },
    ],
  }),
  component: LeadsPage,
});

const PAGE_SIZE = 10;

function LeadsPage() {
  const { leads, loading, exportCSV } = useLeadsContext();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState<string>("all");
  const [segment, setSegment] = useState<string>("all");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [siteFilter, setSiteFilter] = useState<"any" | "yes" | "no">("any");
  const [waFilter, setWaFilter] = useState<"any" | "yes" | "no">("any");
  const [emailFilter, setEmailFilter] = useState<"any" | "yes" | "no">("any");
  const [onlyFav, setOnlyFav] = useState(false);
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Lead | null>(null);

  const cities = useMemo(() => [...new Set(leads.map((l) => l.city))].sort(), [leads]);
  const segments = useMemo(() => [...new Set(leads.map((l) => l.segment))].sort(), [leads]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let data = leads.filter((l) => {
      if (q && !l.company_name.toLowerCase().includes(q) && !l.email?.toLowerCase().includes(q) && !l.city.toLowerCase().includes(q))
        return false;
      if (city !== "all" && l.city !== city) return false;
      if (segment !== "all" && l.segment !== segment) return false;
      if (status !== "all" && l.status !== status) return false;
      if (siteFilter === "yes" && !l.website) return false;
      if (siteFilter === "no" && l.website) return false;
      if (waFilter === "yes" && !l.whatsapp) return false;
      if (waFilter === "no" && l.whatsapp) return false;
      if (emailFilter === "yes" && !l.email) return false;
      if (emailFilter === "no" && l.email) return false;
      if (onlyFav && !l.favorite) return false;
      return true;
    });
    if (sort === "name") data = [...data].sort((a, b) => a.company_name.localeCompare(b.company_name));
    else if (sort === "city") data = [...data].sort((a, b) => a.city.localeCompare(b.city));
    else data = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return data;
  }, [leads, search, city, segment, status, siteFilter, waFilter, emailFilter, onlyFav, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const clearFilters = () => {
    setSearch(""); setCity("all"); setSegment("all"); setStatus("all");
    setSiteFilter("any"); setWaFilter("any"); setEmailFilter("any"); setOnlyFav(false);
  };

  const hasFilters =
    search || city !== "all" || segment !== "all" || status !== "all" ||
    siteFilter !== "any" || waFilter !== "any" || emailFilter !== "any" || onlyFav;

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${leads.length} empresas na sua base`}
        actions={
          <Button variant="outline" onClick={() => exportCSV(filtered)}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        }
      />

      <Card className="p-4">
        <div className="grid gap-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nome, email ou cidade..."
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
            <FilterSelect value={city} onChange={(v) => { setCity(v); setPage(1); }} options={cities} placeholder="Cidade" />
            <FilterSelect value={segment} onChange={(v) => { setSegment(v); setPage(1); }} options={segments} placeholder="Segmento" />
            <Select value={status} onValueChange={(v) => { setStatus(v as LeadStatus | "all"); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{LEAD_STATUS_META[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TriSelect value={siteFilter} onChange={setSiteFilter} label="Site" />
            <TriSelect value={waFilter} onChange={setWaFilter} label="WhatsApp" />
            <TriSelect value={emailFilter} onChange={setEmailFilter} label="Email" />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="name">Nome A–Z</SelectItem>
                <SelectItem value="city">Cidade A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-input accent-primary" checked={onlyFav} onChange={(e) => { setOnlyFav(e.target.checked); setPage(1); }} />
              Apenas favoritos
            </label>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-3.5 w-3.5" /> Limpar filtros
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" /> {filtered.length} resultados</span>
        <span>Página {currentPage} de {totalPages}</span>
      </div>

      <div className="mt-2">
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum lead encontrado" description="Ajuste os filtros ou faça uma nova busca." />
        ) : (
          <LeadTable leads={pageData} onView={setActive} />
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
              </PaginationItem>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
                const p = i + 1;
                return (
                  <PaginationItem key={p}>
                    <Button variant={p === currentPage ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p)}>
                      {p}
                    </Button>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <LeadDrawer lead={active} open={!!active} onOpenChange={(o) => !o && setActive(null)} />
    </>
  );
}

function FilterSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas {placeholder.toLowerCase()}s</SelectItem>
        {options.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
      </SelectContent>
    </Select>
  );
}

function TriSelect({ value, onChange, label }: { value: "any" | "yes" | "no"; onChange: (v: "any" | "yes" | "no") => void; label: string }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as "any" | "yes" | "no")}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="any">{label}: qualquer</SelectItem>
        <SelectItem value="yes">Com {label.toLowerCase()}</SelectItem>
        <SelectItem value="no">Sem {label.toLowerCase()}</SelectItem>
      </SelectContent>
    </Select>
  );
}
