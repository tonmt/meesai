"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ═══════════════════════════════════════════════════
// TICKET STATS
// ═══════════════════════════════════════════════════

export async function getTicketStats() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const [open, inProgress, resolvedToday, total] = await Promise.all([
        prisma.supportTicket.count({ where: { status: "OPEN" } }),
        prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
        prisma.supportTicket.count({
            where: {
                status: "RESOLVED",
                resolvedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            },
        }),
        prisma.supportTicket.count(),
    ]);

    return { open, inProgress, resolvedToday, total };
}

// ═══════════════════════════════════════════════════
// GET TICKETS
// ═══════════════════════════════════════════════════

export async function getTickets(status?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const where = status && status !== "ALL" ? { status: status as "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED" | "CLOSED" } : {};

    const tickets = await prisma.supportTicket.findMany({
        where,
        include: {
            customer: { select: { id: true, name: true, phone: true, avatar: true } },
            booking: {
                select: {
                    id: true,
                    status: true,
                    eventDate: true,
                    garment: { select: { titleLo: true, code: true } },
                },
            },
            assignee: { select: { id: true, name: true } },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 50,
    });

    return tickets;
}

// ═══════════════════════════════════════════════════
// RESPOND TO TICKET
// ═══════════════════════════════════════════════════

const respondSchema = z.object({
    ticketId: z.string().min(1),
    response: z.string().min(1, "ກະລຸນາພິມຄຳຕອບ"),
    resolve: z.boolean().default(false),
});

export async function respondToTicket(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const parsed = respondSchema.safeParse({
        ticketId: formData.get("ticketId"),
        response: formData.get("response"),
        resolve: formData.get("resolve") === "true",
    });

    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
    }

    const { ticketId, response, resolve } = parsed.data;

    await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
            response,
            status: resolve ? "RESOLVED" : "IN_PROGRESS",
            resolvedAt: resolve ? new Date() : undefined,
            assigneeId: session.user.id as string,
        },
    });

    revalidatePath("/admin/concierge");
    return { success: true };
}

// ═══════════════════════════════════════════════════
// CREATE TICKET (from customer SOS page)
// ═══════════════════════════════════════════════════

const createTicketSchema = z.object({
    category: z.enum([
        "PHOTO_REQUEST", "SIZE_INQUIRY", "AVAILABILITY",
        "DEPOSIT_QUERY", "DELIVERY", "DAMAGE", "GENERAL",
    ]),
    subject: z.string().min(1),
    message: z.string().min(1),
    bookingId: z.string().optional(),
});

export async function createTicket(data: z.infer<typeof createTicketSchema>) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const ticket = await prisma.supportTicket.create({
        data: {
            category: data.category,
            subject: data.subject,
            message: data.message,
            bookingId: data.bookingId || null,
            customerId: session.user.id as string,
            priority: data.category === "DAMAGE" ? 2 : data.category === "DELIVERY" ? 1 : 0,
        },
    });

    revalidatePath("/admin/concierge");
    return { success: true, ticketId: ticket.id };
}
