export type LeadStatus =
  | "novo"
  | "em_contato"
  | "sem_resposta"
  | "interessado"
  | "cliente"
  | "descartado";

export interface Lead {
  id: string;
  company_name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  city: string;
  segment: string;
  address?: string;
  status: LeadStatus;
  favorite: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SearchLeadsParams {
  segment: string;
  city: string;
  maxResults: number;
  onlyWithoutWebsite?: boolean;
  onlyWithWhatsapp?: boolean;
  onlyWithEmail?: boolean;
}

export interface LeadFilters {
  city?: string;
  segment?: string;
  status?: LeadStatus | "all";
  hasWebsite?: "any" | "yes" | "no";
  hasWhatsapp?: "any" | "yes" | "no";
  hasEmail?: "any" | "yes" | "no";
  onlyFavorites?: boolean;
  search?: string;
}

export const LEAD_STATUS_META: Record<
  LeadStatus,
  { label: string; className: string; dot: string }
> = {
  novo: {
    label: "Novo",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  em_contato: {
    label: "Em contato",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  sem_resposta: {
    label: "Sem resposta",
    className: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400",
    dot: "bg-zinc-500",
  },
  interessado: {
    label: "Interessado",
    className: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  cliente: {
    label: "Cliente",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  descartado: {
    label: "Descartado",
    className: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};

export const LEAD_STATUSES: LeadStatus[] = [
  "novo",
  "em_contato",
  "sem_resposta",
  "interessado",
  "cliente",
  "descartado",
];
