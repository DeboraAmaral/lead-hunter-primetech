import { useState } from "react";
import {
  MoreHorizontal,
  Star,
  Eye,
  Copy,
  MessageCircle,
  Globe,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "./StatusBadge";
import type { Lead } from "@/types/lead";
import { cn } from "@/lib/utils";
import {
  copyToClipboard,
  openMaps as _openMaps,
  openWebsite,
  openWhatsApp,
} from "@/lib/lead-utils";
import { useLeadsContext } from "@/contexts/LeadsContext";

interface LeadTableProps {
  leads: Lead[];
  onView: (lead: Lead) => void;
}

export function LeadTable({ leads, onView }: LeadTableProps) {
  const { favoriteLead, deleteLead } = useLeadsContext();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-10"></TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="hidden md:table-cell">Cidade</TableHead>
                <TableHead className="hidden lg:table-cell">Segmento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} className="group">
                  <TableCell>
                    <button
                      onClick={() => favoriteLead(lead.id)}
                      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-amber-500"
                      aria-label="Favoritar"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          lead.favorite && "fill-amber-400 text-amber-500",
                        )}
                      />
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => onView(lead)}
                      className="block max-w-[220px] truncate text-left text-sm font-medium hover:underline"
                    >
                      {lead.company_name}
                    </button>
                    <p className="truncate text-xs text-muted-foreground">
                      {lead.address ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {lead.phone && (
                        <span className="inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                      )}
                      {lead.email && (
                        <span className="inline-flex max-w-[180px] items-center gap-1 truncate rounded-md border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </span>
                      )}
                      {lead.website && (
                        <span className="inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          Site
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {lead.city}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {lead.segment}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onView(lead)}>
                          <Eye className="mr-2 h-4 w-4" /> Visualizar
                        </DropdownMenuItem>
                        {lead.phone && (
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(lead.phone!, "Telefone")}
                          >
                            <Copy className="mr-2 h-4 w-4" /> Copiar telefone
                          </DropdownMenuItem>
                        )}
                        {lead.email && (
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(lead.email!, "Email")}
                          >
                            <Copy className="mr-2 h-4 w-4" /> Copiar email
                          </DropdownMenuItem>
                        )}
                        {lead.whatsapp && (
                          <DropdownMenuItem onClick={() => openWhatsApp(lead.whatsapp!)}>
                            <MessageCircle className="mr-2 h-4 w-4" /> Abrir WhatsApp
                          </DropdownMenuItem>
                        )}
                        {lead.website && (
                          <DropdownMenuItem onClick={() => openWebsite(lead.website!)}>
                            <Globe className="mr-2 h-4 w-4" /> Abrir website
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setConfirmId(lead.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação é permanente e não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmId) deleteLead(confirmId);
                setConfirmId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
