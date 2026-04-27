import { format } from "date-fns";

export function formatDateTime(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return format(new Date(value), "PPP p");
}

export function formatDate(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return format(new Date(value), "PPP");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(value);
}
