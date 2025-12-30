import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddMemberPayload, groupsApi } from "../api/groups";
import { queryKeys } from "../query-keys";

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
