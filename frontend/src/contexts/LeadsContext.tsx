import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { LeadService } from "@/services/LeadService";
import type { Lead, LeadStatus, SearchLeadsParams } from "@/types/lead";

interface LeadsContextValue {
  leads: Lead[];
  loading: boolean;
  refresh: () => Promise<void>;
  searchLeads: (params: SearchLeadsParams) => Promise<Lead[]>;
  favoriteLead: (id: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  updateLead: (id: string, patch: Partial<Lead>) => Promise<void>;
  setStatus: (id: string, status: LeadStatus) => Promise<void>;
  exportCSV: (leads?: Lead[]) => Promise<void>;
}

const LeadsContext = createContext<LeadsContextValue | undefined>(undefined);

function download(filename: string, content: string, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await LeadService.getLeads();
    setLeads(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const searchLeads = useCallback(
    async (params: SearchLeadsParams) => {
      const result = await LeadService.searchLeads(params);
      await refresh();
      return result;
    },
    [refresh],
  );

  const favoriteLead = useCallback(async (id: string) => {
    const updated = await LeadService.favoriteLead(id);
    if (updated) setLeads((ls) => ls.map((l) => (l.id === id ? updated : l)));
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    await LeadService.deleteLead(id);
    setLeads((ls) => ls.filter((l) => l.id !== id));
    toast.success("Lead excluído");
  }, []);

  const updateLead = useCallback(async (id: string, patch: Partial<Lead>) => {
    const updated = await LeadService.updateLead(id, patch);
    if (updated) setLeads((ls) => ls.map((l) => (l.id === id ? updated : l)));
  }, []);

  const setStatus = useCallback(async (id: string, status: LeadStatus) => {
    const updated = await LeadService.setStatus(id, status);
    if (updated) setLeads((ls) => ls.map((l) => (l.id === id ? updated : l)));
  }, []);

  const exportCSV = useCallback(async (data?: Lead[]) => {
    const csv = await LeadService.exportCSV(data);
    download(`leads-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast.success("CSV exportado");
  }, []);

  const value = useMemo<LeadsContextValue>(
    () => ({ leads, loading, refresh, searchLeads, favoriteLead, deleteLead, updateLead, setStatus, exportCSV }),
    [leads, loading, refresh, searchLeads, favoriteLead, deleteLead, updateLead, setStatus, exportCSV],
  );

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeadsContext() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeadsContext must be used within LeadsProvider");
  return ctx;
}
