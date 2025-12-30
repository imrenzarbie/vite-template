import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi, CreateGroupPayload, AddMemberPayload } from "../api/groups";

export const groupKeys = {
    all: ["groups"] as const,
    detail: (id: number) => ["groups", id] as const,
};

export const useGroups = () => {
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

    const deleteMutation = useMutation({
        mutationFn: (id: number) => groupsApi.delete(id),
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
        deleteGroup: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
};

export const useGroup = (groupId: number | null) => {
    const query = useQuery({
        queryKey: groupKeys.detail(groupId!),
        queryFn: () => groupsApi.getById(groupId!),
        enabled: groupId !== null,
    });

    return {
        group: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
};

export const useGroupMutations = (groupId: number) => {
    const queryClient = useQueryClient();

    const addMemberMutation = useMutation({
        mutationFn: (payload: AddMemberPayload) =>
            groupsApi.addMember(groupId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: groupKeys.detail(groupId),
            });
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId: number) => groupsApi.removeMember(groupId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: groupKeys.detail(groupId),
            });
        },
    });

    return {
        addMember: addMemberMutation.mutateAsync,
        isAddingMember: addMemberMutation.isPending,
        removeMember: removeMemberMutation.mutateAsync,
        isRemovingMember: removeMemberMutation.isPending,
        refetch: () =>
            queryClient.invalidateQueries({
                queryKey: groupKeys.detail(groupId),
            }),
    };
};
