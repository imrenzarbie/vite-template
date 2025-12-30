export const queryKeys = {
    users: {
        all: ["users"] as const,
        detail: (id: number) => ["users", id] as const,
    },
    groups: {
        all: ["groups"] as const,
        detail: (id: number) => ["groups", id] as const,
        members: (id: number) => ["groups", id, "members"] as const,
    },
    bills: {
        all: ["bills"] as const,
        detail: (id: number) => ["bills", id] as const,
        byGroup: (groupId: number) => ["bills", "group", groupId] as const,
    },
} as const;
