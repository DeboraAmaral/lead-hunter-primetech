import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Globe,
  MapPin,
  MessageCircle,
  Mail,
  Phone,
  Star,
  Building2,
  Tag,
  Calendar,
} from "lucide-react";
import type { Lead, LeadStatus } from "@/types/lead";
import { LEAD_STATUSES } from "@/types/lead";
import { StatusBadge } from "./StatusBadge";
import { copyToClipboard, openMaps, openWebsite, openWhatsApp, formatDateTime } from "@/lib/lead-utils";
import { useLeadsContext } from "@/contexts/LeadsContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LEAD_STATUS_META } from "@/types/lead";

interface Props {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDrawer({ lead, open, onOpenChange }: Props) {
  const { favoriteLead, setStatus, updateLead } = useLeadsContext();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setNotes(lead?.notes ?? "");
  }, [lead?.id, lead?.notes]);

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="truncate text-xl">{lead.company_name}</SheetTitle>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" /> {lead.segment} • {lead.city}
              </p>
            </div>
            <button
              onClick={() => favoriteLead(lead.id)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition hover:bg-muted"
              aria-label="Favoritar"
            >
              <Star className={cn("h-4 w-4", lead.favorite && "fill-amber-400 text-amber-500")} />
            </button>
          </div>
          <StatusBadge status={lead.status} />
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contato
            </h3>
            <div className="space-y-2">
              <InfoRow icon={Phone} label="Telefone" value={lead.phone} />
              <InfoRow icon={MessageCircle} label="WhatsApp" value={lead.whatsapp} />
              <InfoRow icon={Mail} label="Email" value={lead.email} />
              <InfoRow icon={Globe} label="Website" value={lead.website} />
              <InfoRow icon={MapPin} label="Endereço" value={lead.address} />
              <InfoRow icon={Building2} label="Cidade" value={lead.city} />
              <InfoRow
                icon={Calendar}
                label="Criado em"
                value={formatDateTime(lead.created_at)}
              />
            </div>
          </section>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {lead.phone && (
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(lead.phone!, "Telefone")}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Telefone
              </Button>
            )}
            {lead.email && (
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(lead.email!, "Email")}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Email
              </Button>
            )}
            {lead.whatsapp && (
              <Button variant="outline" size="sm" onClick={() => openWhatsApp(lead.whatsapp!)}>
                <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> WhatsApp
              </Button>
            )}
            {lead.address && (
              <Button variant="outline" size="sm" onClick={() => openMaps(lead.address!)}>
                <MapPin className="mr-1.5 h-3.5 w-3.5" /> Maps
              </Button>
            )}
            {lead.website && (
              <Button variant="outline" size="sm" onClick={() => openWebsite(lead.website!)}>
                <Globe className="mr-1.5 h-3.5 w-3.5" /> Site
              </Button>
            )}
          </div>

          <Separator />

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </h3>
            <Select
              value={lead.status}
              onValueChange={(v) => setStatus(lead.id, v as LeadStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {LEAD_STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Observações
            </h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => updateLead(lead.id, { notes })}
              placeholder="Anote aqui detalhes da abordagem, próximos passos, etc."
              className="min-h-[120px]"
            />
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value?: string;
}) {
  return (
    <div className="grid grid-cols-[24px_100px_minmax(0,1fr)] items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate">{value || <span className="text-muted-foreground/60">—</span>}</span>
    </div>
  );
}
