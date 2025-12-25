import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Member, SubGroup, Item, Group } from "./types";

interface AppState {
    // Normalized entities
    members: Record<string, Member>;
    subGroups: Record<string, SubGroup>;
    items: Record<string, Item>;

    // IDs for ordering
    memberIds: string[];
    subGroupIds: string[];
    itemIds: string[];

    // Current group
    currentGroup: Group | null;

    // Actions
    addMember: (member: Member) => void;
    addSubGroup: (subGroup: SubGroup) => void;
    addItem: (item: Item) => void;
    removeItem: (itemId: string) => void;
    loadGroup: (group: Group) => void;
}

export const useStore = create<AppState>()(
    devtools((set, get) => ({
        members: {},
        subGroups: {},
        items: {},
        memberIds: [],
        subGroupIds: [],
        itemIds: [],
        currentGroup: null,

        addMember: (member) =>
            set((state) => ({
                members: { ...state.members, [member.id]: member },
                memberIds: [...state.memberIds, member.id],
            })),

        addSubGroup: (subGroup) =>
            set((state) => ({
                subGroups: { ...state.subGroups, [subGroup.id]: subGroup },
                subGroupIds: [...state.subGroupIds, subGroup.id],
            })),

        addItem: (item) =>
            set((state) => ({
                items: { ...state.items, [item.id]: item },
                itemIds: [...state.itemIds, item.id],
            })),

        removeItem: (itemId) =>
            set((state) => {
                const { [itemId]: _, ...remainingItems } = state.items;
                return {
                    items: remainingItems,
                    itemIds: state.itemIds.filter((id) => id !== itemId),
                };
            }),

        loadGroup: (group) =>
            set({
                members: group.members.reduce(
                    (acc, m) => ({ ...acc, [m.id]: m }),
                    {}
                ),
                subGroups: group.subGroups.reduce(
                    (acc, sg) => ({ ...acc, [sg.id]: sg }),
                    {}
                ),
                items: group.items.reduce(
                    (acc, item) => ({ ...acc, [item.id]: item }),
                    {}
                ),
                memberIds: group.members.map((m) => m.id),
                subGroupIds: group.subGroups.map((sg) => sg.id),
                itemIds: group.items.map((item) => item.id),
                currentGroup: group,
            }),
    }))
);
