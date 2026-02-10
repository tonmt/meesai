import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const role = (session.user as Record<string, unknown>).role as string;
    if (role !== "ADMIN") redirect("/account");

    return <>{children}</>;
}
