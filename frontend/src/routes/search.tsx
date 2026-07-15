import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Search as SearchIcon, Sparkles, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { EmptyState } from "@/components/common/EmptyState";
import { useLeadsContext } from "@/contexts/LeadsContext";
import { useSettings } from "@/contexts/SettingsContext";
import type { Lead } from "@/types/lead";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Buscar Leads — Lead Hunter PrimeTech" },
      {
        name: "description",
        content:
          "Encontre empresas locais por segmento e cidade para prospectar serviços de desenvolvimento.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { searchLeads } = useLeadsContext();
  const { settings } = useSettings();
  const [segment, setSegment] = useState("");
  const [city, setCity] = useState("");
  const [maxResults, setMax] = useState<number>(settings.defaultSearchLimit);
  const [noSite, setNoSite] = useState(false);
  const [withWa, setWithWa] = useState(false);
  const [withEmail, setWithEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Lead[]>([]);
  const [active, setActive] = useState<Lead | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!segment.trim() || !city.trim()) {
      toast.error("Informe segmento e cidade");
      return;
    }
    setLoading(true);
    try {
      const found = await searchLeads({
        segment: segment.trim(),
        city: city.trim(),
        maxResults,
        onlyWithoutWebsite: noSite,
        onlyWithWhatsapp: withWa,
        onlyWithEmail: withEmail,
      });
      setResults(found);
      toast.success(`${found.length} leads encontrados`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Buscar Leads"
        description="Descubra novas empresas locais para prospectar"
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="segment">Segmento</Label>
              <Input
                id="segment"
                placeholder="Ex: Restaurantes, Clínicas..."
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                placeholder="Ex: São Paulo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max">Quantidade máxima</Label>
              <Input
                id="max"
                type="number"
                min={1}
                max={200}
                value={maxResults}
                onChange={(e) => setMax(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border bg-muted/40 p-3.5">
            <Toggle checked={noSite} onChange={setNoSite} label="Apenas empresas sem site" />
            <Toggle checked={withWa} onChange={setWithWa} label="Apenas com WhatsApp" />
            <Toggle checked={withEmail} onChange={setWithEmail} label="Apenas com Email" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
              <Sparkles className="h-3.5 w-3.5" /> Em breve: enriquecimento com IA.
            </p>
            <Button type="submit" disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...
                </>
              ) : (
                <>
                  <SearchIcon className="mr-2 h-4 w-4" /> Buscar Leads
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Resultados da busca</p>
          {results.length > 0 && (
            <p className="text-xs text-muted-foreground">{results.length} empresas</p>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border bg-muted/30 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Procurando empresas...
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="Nenhuma busca ainda"
            description="Preencha o formulário acima para encontrar novos leads. Os resultados aparecerão aqui e serão salvos automaticamente na sua base."
          />
        ) : (
          <LeadTable leads={results} onView={setActive} />
        )}
      </section>

      <LeadDrawer lead={active} open={!!active} onOpenChange={(o) => !o && setActive(null)} />
    </>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      {label}
    </label>
  );
}
