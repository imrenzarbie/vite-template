import { User, CreateUserRequest, UpdateUserRequest } from "../types/user.type";

export const usersApi = {
    getAll: async (): Promise<User[]> => {
        const response = await fetch(`/api/users`);
        if (!response.ok) throw new Error("Failed to fetch users");
        return response.json();
    },

    create: async (payload: CreateUserRequest): Promise<User> => {
        const response = await fetch(`/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to create user");
        return response.json();
    },

    update: async (id: number, payload: UpdateUserRequest): Promise<void> => {
        const response = await fetch(`/api/users/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to update user");
    },

    delete: async (id: number): Promise<void> => {
        const response = await fetch(`/api/users/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete user");
    },
};
