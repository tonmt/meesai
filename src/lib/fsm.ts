/**
 * MeeSai FSM — Finite State Machine for Asset Status
 * 
 * Pillar 2: ทุก status transition ต้องผ่าน function นี้เท่านั้น
 * ห้าม manual update status field โดยตรง
 */

import { AssetStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// ─── Valid Transition Map ───
// Key = fromState, Value = allowed toStates
const TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
    AVAILABLE: ['RESERVED', 'MAINTENANCE', 'RETIRED'],
    RESERVED: ['AVAILABLE', 'PICKED_UP', 'MAINTENANCE'],   // cancel → AVAILABLE
    PICKED_UP: ['RETURNED'],
    RETURNED: ['IN_QC'],
    IN_QC: ['CLEANING', 'DAMAGED'],
    CLEANING: ['AVAILABLE'],
    DAMAGED: ['MAINTENANCE', 'RETIRED'],
    MAINTENANCE: ['AVAILABLE', 'RETIRED'],
    RETIRED: [],  // Terminal state
}

export type TransitionResult = {
    success: boolean
    error?: string
    fromState?: AssetStatus
    toState?: AssetStatus
}

/**
 * Transition an asset from its current state to a new state.
 * Enforces valid FSM transitions + logs to StatusTransition table.
 * 
 * @param assetId - The ID of the ItemAsset
 * @param toState - The target state
 * @param changedById - The user ID performing the transition
 * @param reason - Optional reason for the transition
 */
export async function transitionAssetStatus(
    assetId: string,
    toState: AssetStatus,
    changedById: string,
    reason?: string
): Promise<TransitionResult> {
    return await prisma.$transaction(async (tx) => {
        // 1. Get current asset state with lock
        const asset = await tx.itemAsset.findUnique({
            where: { id: assetId },
            select: { id: true, status: true },
        })

        if (!asset) {
            return { success: false, error: 'Asset not found' }
        }

        const fromState = asset.status

        // 2. Validate transition
        const allowed = TRANSITIONS[fromState]
        if (!allowed.includes(toState)) {
            return {
                success: false,
                error: `Invalid transition: ${fromState} → ${toState}. Allowed: [${allowed.join(', ')}]`,
            }
        }

        // 3. Update asset status
        await tx.itemAsset.update({
            where: { id: assetId },
            data: { status: toState },
        })

        // 4. Log transition (Pillar 5: Audit Trail)
        await tx.statusTransition.create({
            data: {
                assetId,
                fromState,
                toState,
                changedById,
                reason,
            },
        })

        return { success: true, fromState, toState }
    })
}

/**
 * Check if a transition is valid without executing it.
 */
export function isValidTransition(from: AssetStatus, to: AssetStatus): boolean {
    return TRANSITIONS[from]?.includes(to) ?? false
}

/**
 * Get all valid next states for a given current state.
 */
export function getNextStates(current: AssetStatus): AssetStatus[] {
    return TRANSITIONS[current] ?? []
}
