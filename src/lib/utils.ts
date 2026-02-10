import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}

/**
 * Format LAK currency
 * e.g. 150000 → "150,000 ₭"
 */
export function formatLAK(amount: number): string {
    return `${amount.toLocaleString("en-US")} ₭`;
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string, locale: string = "lo"): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString(locale === "lo" ? "lo-LA" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
