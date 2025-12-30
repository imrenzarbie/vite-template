import z from "zod";

export interface Member {
    id: number;
    username: string;
    email?: string;
    role?: string;
}

export interface Group {
    id: number;
    name: string;
    members?: Member[];
}
export interface SubGroup {
    id: string;
    name: string;
    memberIds: string[];
}

export interface Item {
    id: string;
    description: string;
    amount: number; // Cents
    assignedTo: string[]; // memberIds
    paidBy: string; // memberId
}

export interface Debt {
    from: string;
    to: string;
    amount: number; // Cents
}

export interface ParsedItem {
    description: string;
    amount: number; // Cents
    assignees: string[]; // Names
}
export interface ReviewItem {
    id: string;
    description: string;
    quantity: number;
    amount: number;
    selectedMemberIds: string[];
}

export interface TransformedGroup {
    id: string;
    name: string;
    memberIds: string[];
    members: Record<string, { id: string; name: string; role: string }>;
}

export interface CreateBillPayload {
    title: string;
    group_id: number;
    raw_markdown?: string;
    created_by: number;
    items: Array<{
        name: string;
        amount: number;
        quantity: number;
    }>;
}

export const parserSchema = z.object({
    markdown: z.string().min(1, "Input cannot be empty"),
});
