import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { Moon, Save, Sun, Monitor } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings, type Language, type ThemeMode } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Lead Hunter PrimeTech" },
      { name: "description", content: "Preferências da aplicação, tema e idioma." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState(settings);

  const save = () => {
    updateSettings(form);
    toast.success("Configurações salvas");
  };

  return (
    <>
      <PageHeader title="Configurações" description="Ajuste as preferências da sua conta" actions={<Button onClick={save}><Save className="mr-2 h-4 w-4" /> Salvar</Button>} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-sm font-semibold">Empresa</h3>
          <p className="mb-5 text-xs text-muted-foreground">Identificação exibida no app.</p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="company">Nome da empresa</Label>
              <Input id="company" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logo">Logo (URL)</Label>
              <Input id="logo" placeholder="https://..." value={form.logoUrl ?? ""} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="limit">Quantidade padrão de busca</Label>
              <Input id="limit" type="number" min={1} max={200} value={form.defaultSearchLimit} onChange={(e) => setForm({ ...form, defaultSearchLimit: Number(e.target.value) })} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold">Aparência</h3>
          <p className="mb-5 text-xs text-muted-foreground">Tema e idioma da interface.</p>

          <div className="space-y-4">
            <div>
              <Label>Tema</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <ThemeOption current={form.theme} value="light" icon={Sun} label="Claro" onClick={(v) => setForm({ ...form, theme: v })} />
                <ThemeOption current={form.theme} value="dark" icon={Moon} label="Escuro" onClick={(v) => setForm({ ...form, theme: v })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Idioma</Label>
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v as Language })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (BR)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold">Integrações futuras</h3>
          <p className="mb-4 text-xs text-muted-foreground">Estas funcionalidades serão liberadas em breve.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {["IA local (Ollama)", "Score automático", "Descobrir Instagram", "Descobrir LinkedIn", "Screenshot do site", "Auditoria SEO", "Kanban CRM", "Mensagens automáticas"].map((f) => (
              <div key={f} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">{f}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">Em breve</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function ThemeOption({ current, value, icon: Icon, label, onClick }: { current: ThemeMode; value: ThemeMode; icon: typeof Monitor; label: string; onClick: (v: ThemeMode) => void }) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={cn(
        "flex items-center gap-2 rounded-lg border p-3 text-sm transition",
        active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted",
      )}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
