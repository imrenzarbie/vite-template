// --- Database Tables ---

export interface User {
    id: number;
    username: string;
    email: string;
    default_group_id: number | null;
    // Computed field for the UI
    active_group_id?: number | null;
}

export interface Group {
    id: number;
    name: string;
    parent_group_id: number | null;
    created_at: string;
}

export interface GroupMember {
    group_id: number;
    user_id: number;
}

export interface Bill {
    id: number;
    group_id: number;
    title: string;
    raw_markdown: string;
    created_at: string;
}

export interface BillItem {
    id: number;
    bill_id: number;
    name: string;
    amount: number;
    // This is used when returning the summary
    assigned_user_ids?: number[];
}

export interface BillItemAssignment {
    bill_item_id: number;
    user_id: number;
}

// --- API Request Payloads ---

export interface CreateUserRequest {
    username: string;
    email: string;
}

export interface CreateGroupRequest {
    name: string;
    parent_group_id?: number;
}

export interface CreateBillRequest {
    title: string;
    groupId: number;
    markdown: string; // Markdown format: "- Pizza: 20.00"
}
