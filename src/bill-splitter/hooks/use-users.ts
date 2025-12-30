// src/hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users";
import { CreateUserRequest, UpdateUserRequest } from "../types/user.type";
import { queryKeys } from "../query-keys";

export function useUsers() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: queryKeys.users.all,
        queryFn: usersApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateUserRequest) => usersApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
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
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => usersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
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
