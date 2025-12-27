// src/components/input/group-destination-selector.tsx
import React from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Group } from "../types";

interface GroupDestinationSelectorProps {
    groups: Record<string, Group>;
    groupIds: string[];
    selectedId: string;
    onSelect: (id: string) => void;
}

/**
 * WHY: This component abstracts the selection logic.
 * By separating it, we can easily add search or "Create New Group"
 * shortcuts inside this dropdown later without cluttering the InputPanel.
 */
export const GroupDestinationSelector: React.FC<
    GroupDestinationSelectorProps
> = ({ groups, groupIds, selectedId, onSelect }) => {
    return (
        <div className="grid w-full items-center gap-1.5">
            <Label
                htmlFor="group-select"
                className="text-xs font-bold uppercase text-muted-foreground">
                Target Project/Group
            </Label>
            <Select value={selectedId} onValueChange={onSelect}>
                <SelectTrigger
                    id="group-select"
                    className="w-full bg-background">
                    <SelectValue placeholder="Select where to import..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Available Groups</SelectLabel>
                        {groupIds.length === 0 ? (
                            <div className="p-2 text-xs text-center text-muted-foreground italic">
                                No groups found. Create one first!
                            </div>
                        ) : (
                            groupIds.map((id) => (
                                <SelectItem key={id} value={id}>
                                    {groups[id]?.name || "Unnamed Group"}
                                </SelectItem>
                            ))
                        )}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};
