import type { Lead, LeadFilters, SearchLeadsParams, LeadStatus } from "@/types/lead";
import { MOCK_LEADS, generateMockLeads } from "@/data/mockLeads";

/**
 * LeadService
 * -----------
 * Camada de acesso a dados. Hoje usa mocks em memória.
 * No futuro, cada método aqui será substituído por uma chamada
 * a uma API REST em FastAPI. A assinatura pública deve permanecer
 * estável — nenhum componente da UI deve conhecer a origem dos dados.
 */

// TODO: substituir por variável de ambiente quando integrar FastAPI
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

let leadsStore: Lead[] = [...MOCK_LEADS];

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function uid() {
  return `lead_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export const LeadService = {
  async getLeads(filters: LeadFilters = {}): Promise<Lead[]> {
    let data = [...leadsStore];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (l) =>
          l.company_name.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q),
      );
    }
    if (filters.city) data = data.filter((l) => l.city === filters.city);
    if (filters.segment) data = data.filter((l) => l.segment === filters.segment);
    if (filters.status && filters.status !== "all")
      data = data.filter((l) => l.status === filters.status);
    if (filters.hasWebsite === "yes") data = data.filter((l) => !!l.website);
    if (filters.hasWebsite === "no") data = data.filter((l) => !l.website);
    if (filters.hasWhatsapp === "yes") data = data.filter((l) => !!l.whatsapp);
    if (filters.hasWhatsapp === "no") data = data.filter((l) => !l.whatsapp);
    if (filters.hasEmail === "yes") data = data.filter((l) => !!l.email);
    if (filters.hasEmail === "no") data = data.filter((l) => !l.email);
    if (filters.onlyFavorites) data = data.filter((l) => l.favorite);

    return delay(
      data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    );
  },

  async getLeadById(id: string): Promise<Lead | undefined> {
    return delay(leadsStore.find((l) => l.id === id));
  },

  async searchLeads(params: SearchLeadsParams): Promise<Lead[]> {
    // TODO: POST ${API_BASE_URL}/leads/search
    await delay(null, 1400);
    const generated = generateMockLeads(params.maxResults);
    const filtered = generated
      .map((l) => ({ ...l, segment: params.segment || l.segment, city: params.city || l.city }))
      .filter((l) => (params.onlyWithoutWebsite ? !l.website : true))
      .filter((l) => (params.onlyWithWhatsapp ? !!l.whatsapp : true))
      .filter((l) => (params.onlyWithEmail ? !!l.email : true));

    leadsStore = [...filtered, ...leadsStore];
    return filtered;
  },

  async createLead(input: Omit<Lead, "id" | "created_at" | "updated_at">): Promise<Lead> {
    const now = new Date().toISOString();
    const lead: Lead = { ...input, id: uid(), created_at: now, updated_at: now };
    leadsStore = [lead, ...leadsStore];
    return delay(lead);
  },

  async updateLead(id: string, patch: Partial<Lead>): Promise<Lead | undefined> {
    let updated: Lead | undefined;
    leadsStore = leadsStore.map((l) => {
      if (l.id !== id) return l;
      updated = { ...l, ...patch, updated_at: new Date().toISOString() };
      return updated;
    });
    return delay(updated);
  },

  async deleteLead(id: string): Promise<boolean> {
    const before = leadsStore.length;
    leadsStore = leadsStore.filter((l) => l.id !== id);
    return delay(leadsStore.length < before);
  },

  async favoriteLead(id: string, favorite?: boolean): Promise<Lead | undefined> {
    const lead = leadsStore.find((l) => l.id === id);
    if (!lead) return delay(undefined);
    return this.updateLead(id, { favorite: favorite ?? !lead.favorite });
  },

  async setStatus(id: string, status: LeadStatus): Promise<Lead | undefined> {
    return this.updateLead(id, { status });
  },

  async exportCSV(leads?: Lead[]): Promise<string> {
    const data = leads ?? leadsStore;
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
    return delay([headers.join(","), ...rows].join("\n"), 200);
  },

  async exportExcel(leads?: Lead[]): Promise<string> {
    // Placeholder — em produção geraremos XLSX no backend.
    return this.exportCSV(leads);
  },

  // -------- Métodos preparados para futura integração com IA --------
  async scoreLead(_id: string): Promise<number> {
    // TODO: chamar endpoint de IA para gerar score 0-100
    return delay(Math.floor(Math.random() * 100));
  },

  async discoverInstagram(_id: string): Promise<string | null> {
    // TODO
    return delay(null);
  },

  async discoverLinkedIn(_id: string): Promise<string | null> {
    // TODO
    return delay(null);
  },

  async captureScreenshot(_id: string): Promise<string | null> {
    // TODO
    return delay(null);
  },

  async auditSEO(_id: string): Promise<unknown> {
    // TODO
    return delay(null);
  },

  async generateMessage(_id: string, _channel: "email" | "whatsapp"): Promise<string> {
    // TODO
    return delay("");
  },
};

export type LeadServiceType = typeof LeadService;
