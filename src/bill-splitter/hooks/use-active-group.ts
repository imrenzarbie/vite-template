import { useStore } from "../store";
import { useMemo } from "react";

export const useActiveGroup = () => {
    const groups = useStore((state) => state.groups);
    const currentGroupId = useStore((state) => state.currentGroupId);

    return useMemo(() => {
        if (!currentGroupId) return null;
        return groups[currentGroupId] || null;
    }, [groups, currentGroupId]);
};
