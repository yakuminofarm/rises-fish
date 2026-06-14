import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

export function getGenderLabel(gender: string): string {
  switch (gender) {
    case "male": return "♂ オス";
    case "female": return "♀ メス";
    default: return "不明";
  }
}

export function getGenderColor(gender: string): string {
  switch (gender) {
    case "male": return "text-blue-600";
    case "female": return "text-pink-600";
    default: return "text-gray-500";
  }
}
