import * as z from "zod";

// --- 1. Zod Schema for Input ---
export const parserSchema = z.object({
    markdown: z.string().min(1, "Input cannot be empty"),
});

// --- 2. Database/Domain Entities ---
export interface User {
    id: number;
    username: string;
    role: string;
}

export interface Group {
    id: number;
    name: string;
    members: User[];
}

// --- 3. Markdown Parser Output ---
export interface ParsedMarkdownItem {
    description: string;
    quantity?: number;
    amount: number; // in cents
}

// --- 4. UI State (Frontend Only) ---
export interface ReviewItem {
    id: string; // Temporary UUID for React keys
    description: string;
    quantity: number;
    amount: number;
    selectedMemberIds: string[]; // Strings for UI handling
}

// --- 5. Selector Transformation Types ---
// These ensure type safety when transforming Groups for the Dropdown/Table
export interface TransformedMember {
    id: string;
    name: string;
    role: string;
}

export interface TransformedGroup {
    id: string;
    name: string;
    memberIds: string[];
    members: Record<string, TransformedMember>;
}

// --- 6. API Payload Types (Matches your SQL Schema) ---
export interface BillItemPayload {
    name: string;
    quantity: number;
    amount: number;
    // This array maps to the 'bill_item_assignments' table
    assigned_user_ids: number[];
}

export interface CreateBillPayload {
    title: string;
    group_id: number;
    raw_markdown: string;
    created_by: number;
    items: BillItemPayload[];
}
