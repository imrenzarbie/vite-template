// src/hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users";
import { CreateUserRequest, UpdateUserRequest } from "../types/user.type";

export const userKeys = {
    all: ["users"] as const,
};

export function useUsers() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: userKeys.all,
        queryFn: usersApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateUserRequest) => usersApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: number;
            payload: UpdateUserRequest;
        }) => usersApi.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => usersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });

    return {
        users: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
        createUser: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateUser: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteUser: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}
