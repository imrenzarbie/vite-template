import { useQuery } from "@tanstack/react-query";
import { billsApi } from "../api/bills";
import { queryKeys } from "../query-keys";

export const useBills = (groupId: number | null) => {
    const query = useQuery({
        queryKey: queryKeys.bills.byGroup(groupId || 0),
        queryFn: () =>
            groupId ? billsApi.getByGroup(groupId) : Promise.resolve([]),
        enabled: groupId !== null,
    });

    return {
        bills: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
};
