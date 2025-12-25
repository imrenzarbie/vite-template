// src/types/index.ts
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
    amount: number; // Store as cents (e.g., 1000 = $10.00)
    assignedTo: string[]; // memberIds or subGroupIds
    paidBy: string; // memberId
}

export interface Group {
    id: string;
    name: string;
    members: Member[];
    subGroups: SubGroup[];
    items: Item[];
}

export interface Debt {
    from: string;
    to: string;
    amount: number; // Cents
}
