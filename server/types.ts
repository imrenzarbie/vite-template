export interface User {
    id: number;
    username: string;
    email: string;
    default_group_id?: number | null;
    created_at: string;
}

export interface Group {
    id: number;
    name: string;
    parent_group_id?: number | null;
    created_at: string;
}

export interface GroupMember {
    group_id: number;
    user_id: number;
    role: string;
}

export interface Bill {
    id: number;
    group_id: number;
    title: string;
    raw_markdown?: string;
    total_amount: number;
    created_by: number;
    created_at: string;
}

export interface BillItem {
    id: number;
    bill_id: number;
    name: string;
    amount: number;
    quantity: number;
}

export interface BillItemAssignment {
    bill_item_id: number;
    user_id: number;
    paid_date: string | null;
}

export interface CreateUserRequest {
    username: string;
    email: string;
}

export interface UpdateUserRequest {
    username?: string;
    email?: string;
    default_group_id?: number | null;
}

export interface CreateGroupRequest {
    name: string;
    parent_group_id?: number | null;
}

export interface UpdateGroupRequest {
    name?: string;
    parent_group_id?: number | null;
}
