import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "../api/groups";
import { queryKeys } from "../query-keys";

export const useGroup = (groupId: number | null) => {
    const query = useQuery({
        queryKey: queryKeys.groups.detail(groupId!),
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
