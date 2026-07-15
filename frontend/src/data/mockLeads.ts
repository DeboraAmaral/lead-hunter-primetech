import type { Lead, LeadStatus } from "@/types/lead";

const segments = [
  "Restaurantes",
  "Clínicas Odontológicas",
  "Academias",
  "Barbearias",
  "Advocacia",
  "Imobiliárias",
  "Petshops",
  "Autopeças",
  "Salões de Beleza",
  "Consultórios Médicos",
];

const cities = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Porto Alegre",
  "Florianópolis",
  "Salvador",
  "Recife",
  "Fortaleza",
  "Brasília",
];

const companyBases = [
  "Prime",
  "Alfa",
  "Nova",
  "Bella",
  "Vitalità",
  "Sunset",
  "Central",
  "Estrela",
  "Real",
  "Master",
  "Aurora",
  "Elite",
  "Boa Vista",
  "Vip",
  "Urban",
  "Nova Era",
  "Top",
  "Golden",
  "Aliança",
  "Império",
];

const statuses: LeadStatus[] = [
  "novo",
  "novo",
  "novo",
  "em_contato",
  "sem_resposta",
  "interessado",
  "cliente",
  "descartado",
];

function pad(n: number, s = 2) {
  return n.toString().padStart(s, "0");
}

function randPhone() {
  const ddd = 11 + Math.floor(Math.random() * 88);
  const a = 9000 + Math.floor(Math.random() * 999);
  const b = 1000 + Math.floor(Math.random() * 8999);
  return `+55 ${ddd} 9${pad(a, 4)}-${pad(b, 4)}`;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function randomDate(daysBack: number) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d.toISOString();
}

export function generateMockLeads(count = 48): Lead[] {
  const leads: Lead[] = [];
  for (let i = 0; i < count; i++) {
    const segment = segments[i % segments.length];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const base = companyBases[Math.floor(Math.random() * companyBases.length)];
    const name = `${base} ${segment.split(" ")[0]} ${pad(i + 1)}`;
    const hasSite = Math.random() > 0.35;
    const hasEmail = Math.random() > 0.25;
    const hasWa = Math.random() > 0.2;
    const created = randomDate(20);
    leads.push({
      id: `lead_${i + 1}_${Date.now().toString(36)}`,
      company_name: name,
      phone: randPhone(),
      whatsapp: hasWa ? randPhone().replace(/\D/g, "") : undefined,
      email: hasEmail ? `contato@${slugify(base + segment)}.com.br` : undefined,
      website: hasSite ? `https://www.${slugify(base + segment)}.com.br` : undefined,
      city,
      segment,
      address: `Rua ${base}, ${100 + i} - Centro, ${city}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      favorite: Math.random() > 0.75,
      notes: "",
      created_at: created,
      updated_at: created,
    });
  }
  // Ensure some created today
  for (let i = 0; i < 6; i++) {
    leads[i].created_at = new Date().toISOString();
    leads[i].updated_at = leads[i].created_at;
  }
  return leads;
}

export const MOCK_LEADS: Lead[] = generateMockLeads();
