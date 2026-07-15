import type { Lead, LeadFilters, SearchLeadsParams, LeadStatus } from "@/types/lead";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

function normalizeStatus(status: string | undefined): LeadStatus {
  switch (status) {
    case "NEW":
    case "novo":
      return "novo";
    case "CONTACTED":
    case "em_contato":
      return "em_contato";
    case "NO_RESPONSE":
    case "sem_resposta":
      return "sem_resposta";
    case "INTERESTED":
    case "interessado":
      return "interessado";
    case "CLIENT":
    case "cliente":
      return "cliente";
    case "DISCARDED":
    case "descartado":
      return "descartado";
    default:
      return "novo";
  }
}

function normalizeLead(payload: Record<string, unknown>): Lead {
  return {
    id: String(payload.id ?? ""),
    company_name: String(payload.company_name ?? "Sem nome"),
    phone: payload.phone == null ? undefined : String(payload.phone),
    whatsapp: payload.whatsapp == null ? undefined : String(payload.whatsapp),
    email: payload.email == null ? undefined : String(payload.email),
    website: payload.website == null ? undefined : String(payload.website),
    city: String(payload.city ?? ""),
    segment: String(payload.segment ?? ""),
    address: payload.address == null ? undefined : String(payload.address),
    status: normalizeStatus(String(payload.status ?? "novo")),
    favorite: Boolean(payload.favorite),
    notes: payload.notes == null ? undefined : String(payload.notes),
    created_at: String(payload.created_at ?? new Date().toISOString()),
    updated_at: String(payload.updated_at ?? new Date().toISOString()),
  };
}

function normalizeBackendStatus(status: LeadStatus): string {
  switch (status) {
    case "novo":
      return "NEW";
    case "em_contato":
      return "CONTACTED";
    case "sem_resposta":
      return "NO_RESPONSE";
    case "interessado":
      return "INTERESTED";
    case "cliente":
      return "CLIENT";
    case "descartado":
      return "DISCARDED";
  }
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const LeadService = {
  async getLeads(filters: LeadFilters = {}): Promise<Lead[]> {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.city) params.set("city", filters.city);
    if (filters.segment) params.set("segment", filters.segment);
    if (filters.status && filters.status !== "all") params.set("status", normalizeBackendStatus(filters.status));
    if (filters.hasWebsite === "yes") params.set("favorite", "true");
    if (filters.onlyFavorites) params.set("favorite", "true");
    if (filters.hasWebsite === "yes") params.set("favorite", "true");
    if (filters.hasWebsite === "no") params.set("favorite", "false");
    if (filters.hasWhatsapp === "yes") params.set("favorite", "true");
    if (filters.hasWhatsapp === "no") params.set("favorite", "false");
    if (filters.hasEmail === "yes") params.set("favorite", "true");
    if (filters.hasEmail === "no") params.set("favorite", "false");

    const query = params.toString();
    const payload = await api<{ items?: Record<string, unknown>[] }>(`/leads${query ? `?${query}` : ""}`);
    const items = payload.items ?? [];
    return items.map((item) => normalizeLead(item));
  },

  async getLeadById(id: string): Promise<Lead | undefined> {
    try {
      const payload = await api<Record<string, unknown>>(`/leads/${id}`);
      return normalizeLead(payload);
    } catch {
      return undefined;
    }
  },

  async searchLeads(params: SearchLeadsParams): Promise<Lead[]> {
    const payload = await api<Record<string, unknown>>(`/search`, {
      method: "POST",
      body: JSON.stringify({
        segment: params.segment,
        city: params.city,
        state: "SP",
        country: "Brasil",
        limit: params.maxResults,
      }),
    });

    if (payload?.saved_count === 0 && payload?.total === 0) {
      return [];
    }

    return this.getLeads();
  },

  async createLead(input: Omit<Lead, "id" | "created_at" | "updated_at">): Promise<Lead> {
    const payload = await api<Record<string, unknown>>(`/leads`, {
      method: "POST",
      body: JSON.stringify({
        company_name: input.company_name,
        phone: input.phone ?? null,
        whatsapp: input.whatsapp ?? null,
        email: input.email ?? null,
        website: input.website ?? null,
        city: input.city ?? null,
        segment: input.segment ?? null,
        address: input.address ?? null,
        status: normalizeBackendStatus(input.status ?? "novo"),
        favorite: Boolean(input.favorite),
        notes: input.notes ?? null,
      }),
    });
    return normalizeLead(payload);
  },

  async updateLead(id: string, patch: Partial<Lead>): Promise<Lead | undefined> {
    const payload = await api<Record<string, unknown>>(`/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        company_name: patch.company_name ?? null,
        phone: patch.phone ?? null,
        whatsapp: patch.whatsapp ?? null,
        email: patch.email ?? null,
        website: patch.website ?? null,
        city: patch.city ?? null,
        segment: patch.segment ?? null,
        address: patch.address ?? null,
        status: patch.status ? normalizeBackendStatus(patch.status) : undefined,
        favorite: patch.favorite,
        notes: patch.notes ?? null,
      }),
    });
    return normalizeLead(payload);
  },

  async deleteLead(id: string): Promise<boolean> {
    await api(`/leads/${id}`, { method: "DELETE" });
    return true;
  },

  async favoriteLead(id: string, favorite?: boolean): Promise<Lead | undefined> {
    const payload = await api<Record<string, unknown>>(`/leads/${id}/favorite`, { method: "PATCH" });
    return normalizeLead(payload);
  },

  async setStatus(id: string, status: LeadStatus): Promise<Lead | undefined> {
    return this.updateLead(id, { status });
  },

  async exportCSV(leads?: Lead[]): Promise<string> {
    const data = leads ?? [];
    const headers = [
      "id",
      "company_name",
      "phone",
      "whatsapp",
      "email",
      "website",
      "city",
      "segment",
      "address",
      "status",
      "favorite",
      "created_at",
    ];
    const rows = data.map((l) =>
      headers
        .map((h) => {
          const v = (l as unknown as Record<string, unknown>)[h];
          const s = v == null ? "" : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(","),
    );
    return [headers.join(","), ...rows].join("\n");
  },

  async exportExcel(leads?: Lead[]): Promise<string> {
    return this.exportCSV(leads);
  },

  async scoreLead(_id: string): Promise<number> {
    return 0;
  },

  async discoverInstagram(_id: string): Promise<string | null> {
    return null;
  },

  async discoverLinkedIn(_id: string): Promise<string | null> {
    return null;
  },

  async captureScreenshot(_id: string): Promise<string | null> {
    return null;
  },

  async auditSEO(_id: string): Promise<unknown> {
    return null;
  },

  async generateMessage(_id: string, _channel: "email" | "whatsapp"): Promise<string> {
    return "";
  },
};

export type LeadServiceType = typeof LeadService;
