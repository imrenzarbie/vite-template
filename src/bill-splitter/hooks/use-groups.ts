import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi, CreateGroupPayload, AddMemberPayload } from "../api/groups";
import { queryKeys } from "../query-keys";

export const useGroups = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: queryKeys.groups.all,
        queryFn: groupsApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateGroupPayload) => groupsApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => groupsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
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

export const useGroupMutations = (groupId: number) => {
    const queryClient = useQueryClient();

    const addMemberMutation = useMutation({
        mutationFn: (payload: AddMemberPayload) =>
            groupsApi.addMember(groupId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.groups.detail(groupId),
            });
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId: number) => groupsApi.removeMember(groupId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.groups.detail(groupId),
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
                queryKey: queryKeys.groups.detail(groupId),
            }),
    };
};
