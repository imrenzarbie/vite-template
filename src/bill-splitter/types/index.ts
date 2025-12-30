export interface Member {
    id: string;
    name: string;
    email: string;
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

export interface Group {
    id: string;
    name: string;
    members: Record<string, Member>;
    memberIds: string[];
    subGroups: Record<string, SubGroup>;
    subGroupIds: string[];
    items: Record<string, Item>;
    itemIds: string[];
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
    amount: number;
    quantity: number;
    price: number;
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
        amount: number; // in cents
        quantity: number;
        assigned_user_ids: number[];
    }>;
}
