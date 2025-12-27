// src/hooks/useUsers.ts

import { useQuery } from "@tanstack/react-query";

const API_BASE = "http://localhost:3001/api";

export interface User {
    id: number;
    username: string;
    email: string;
    default_group_id: number | null;
    created_at: string;
}

export function useUsers() {
    const query = useQuery({
        queryKey: ["users"],
        queryFn: async (): Promise<User[]> => {
            const res = await fetch(`${API_BASE}/users`);
            if (!res.ok) throw new Error("Failed to fetch users");
            const json = await res.json();
            return json.data;
        },
    });

    return {
        users: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
