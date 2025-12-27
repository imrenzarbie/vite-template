import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Member, SubGroup, Item, Group, ParsedItem } from "./types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface AppState {
    groups: Record<string, Group>;
    groupIds: string[];
    currentGroupId: string | null;

    // Group Actions
    createGroup: (name: string) => void;
    setCurrentGroup: (groupId: string) => void;
    deleteGroup: (groupId: string) => void;

    // Member & Subgroup Actions (Scoped to currentGroupId)
    addMember: (member: Member) => void;
    addSubGroup: (subGroup: SubGroup) => void;
    addItem: (item: Item) => void;
    removeItem: (itemId: string) => void;
    loadItemsFromMarkdown: (parsedItems: ParsedItem[]) => void;
}

export const useStore = create<AppState>()(
    devtools((set) => ({
        groups: {},
        groupIds: [],
        currentGroupId: null,

        createGroup: (name) =>
            set((state) => {
                const groupId = uuidv4();
                const newGroup: Group = {
                    id: groupId,
                    name,
                    members: {},
                    memberIds: [],
                    subGroups: {},
                    subGroupIds: [],
                    items: {},
                    itemIds: [],
                };
                return {
                    groups: { ...state.groups, [groupId]: newGroup },
                    groupIds: [...state.groupIds, groupId],
                    currentGroupId: groupId, // Auto-select new group
                };
            }),

        setCurrentGroup: (groupId) => set({ currentGroupId: groupId }),

        deleteGroup: (groupId) =>
            set((state) => {
                const { [groupId]: _, ...remainingGroups } = state.groups;
                const newGroupIds = state.groupIds.filter(
                    (id) => id !== groupId
                );
                return {
                    groups: remainingGroups,
                    groupIds: newGroupIds,
                    currentGroupId:
                        state.currentGroupId === groupId
                            ? newGroupIds[0] || null
                            : state.currentGroupId,
                };
            }),

        addMember: (member) =>
            set((state) => {
                const id = state.currentGroupId;
                if (!id || !state.groups[id]) return state;
                const group = state.groups[id];
                return {
                    groups: {
                        ...state.groups,
                        [id]: {
                            ...group,
                            members: { ...group.members, [member.id]: member },
                            memberIds: [...group.memberIds, member.id],
                        },
                    },
                };
            }),

        addSubGroup: (subGroup) =>
            set((state) => {
                const id = state.currentGroupId;
                if (!id || !state.groups[id]) return state;
                const group = state.groups[id];
                return {
                    groups: {
                        ...state.groups,
                        [id]: {
                            ...group,
                            subGroups: {
                                ...group.subGroups,
                                [subGroup.id]: subGroup,
                            },
                            subGroupIds: [...group.subGroupIds, subGroup.id],
                        },
                    },
                };
            }),

        addItem: (item) =>
            set((state) => {
                const id = state.currentGroupId;
                if (!id) return state;
                const group = state.groups[id];
                return {
                    groups: {
                        ...state.groups,
                        [id]: {
                            ...group,
                            items: { ...group.items, [item.id]: item },
                            itemIds: [...group.itemIds, item.id],
                        },
                    },
                };
            }),

        removeItem: (itemId) =>
            set((state) => {
                const id = state.currentGroupId;
                if (!id) return state;
                const group = state.groups[id];
                const { [itemId]: _, ...remainingItems } = group.items;
                return {
                    groups: {
                        ...state.groups,
                        [id]: {
                            ...group,
                            items: remainingItems,
                            itemIds: group.itemIds.filter((i) => i !== itemId),
                        },
                    },
                };
            }),

        loadItemsFromMarkdown: (parsedItems) =>
            set((state) => {
                const id = state.currentGroupId;
                if (!id) {
                    toast.error("No group selected");
                    return state;
                }

                const group = state.groups[id];
                // Create local copies to avoid mid-loop mutations
                const nextMembers = { ...group.members };
                const nextMemberIds = [...group.memberIds];
                const nextItems = { ...group.items };
                const nextItemIds = [...group.itemIds];

                const memberNameToId = new Map<string, string>();
                nextMemberIds.forEach((mId) =>
                    memberNameToId.set(nextMembers[mId].name, mId)
                );

                parsedItems.forEach((p) => {
                    const assigneeIds = p.assignees.map((name) => {
                        if (memberNameToId.has(name))
                            return memberNameToId.get(name)!;

                        const newId = uuidv4();
                        nextMembers[newId] = { id: newId, name, email: "" };
                        nextMemberIds.push(newId);
                        memberNameToId.set(name, newId);
                        return newId;
                    });

                    const itemId = uuidv4();
                    nextItems[itemId] = {
                        id: itemId,
                        description: p.description,
                        amount: p.amount,
                        assignedTo: assigneeIds,
                        paidBy: nextMemberIds[0] || "", // Default to first available member
                    };
                    nextItemIds.push(itemId);
                });

                return {
                    groups: {
                        ...state.groups,
                        [id]: {
                            ...group,
                            members: nextMembers,
                            memberIds: nextMemberIds,
                            items: nextItems,
                            itemIds: nextItemIds,
                        },
                    },
                };
            }),
    }))
);
