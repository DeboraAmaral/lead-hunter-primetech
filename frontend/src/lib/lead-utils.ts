import { toast } from "sonner";

export async function copyToClipboard(text: string, label = "Texto") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.error("Não foi possível copiar");
  }
}

export function openWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
}

export function openMaps(address: string) {
  const q = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank", "noopener,noreferrer");
}

export function openWebsite(url: string) {
  const href = url.startsWith("http") ? url : `https://${url}`;
  window.open(href, "_blank", "noopener,noreferrer");
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
