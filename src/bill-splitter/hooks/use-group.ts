// src/hooks/useGroups.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi, CreateGroupPayload, AddMemberPayload } from "../api/groups";

export const groupKeys = {
    all: ["groups"] as const,
    detail: (id: number) => ["groups", id] as const,
};

// Hook for managing groups list
export function useGroups() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: groupKeys.all,
        queryFn: groupsApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateGroupPayload) => groupsApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: groupKeys.all });
        },
    });

    return {
        groups: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
        createGroup: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
    };
}

// Hook for managing a single group
export function useGroup(groupId: number | null) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: groupKeys.detail(groupId!),
        queryFn: () => groupsApi.getById(groupId!),
        enabled: groupId !== null,
    });

    const addMemberMutation = useMutation({
        mutationFn: (payload: AddMemberPayload) =>
            groupsApi.addMember(groupId!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: groupKeys.detail(groupId!),
            });
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId: number) =>
            groupsApi.removeMember(groupId!, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: groupKeys.detail(groupId!),
            });
        },
    });

    return {
        group: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
        addMember: addMemberMutation.mutateAsync,
        isAddingMember: addMemberMutation.isPending,
        removeMember: removeMemberMutation.mutateAsync,
        isRemovingMember: removeMemberMutation.isPending,
    };
}
