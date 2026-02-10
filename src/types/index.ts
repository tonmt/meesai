import { UserRole } from "@prisma/client";

export type { UserRole } from "@prisma/client";

/**
 * Extended session user with MeeSai-specific fields
 */
export interface SessionUser {
    id: string;
    name: string;
    phone: string;
    role: UserRole;
    image?: string | null;
}

/**
 * Locale type
 */
export type Locale = "lo" | "en";

/**
 * Common page props with locale
 */
export interface LocalePageProps {
    params: Promise<{ locale: Locale }>;
}
