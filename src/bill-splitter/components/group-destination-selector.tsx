import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TransformedGroup } from "../types";

interface GroupDestinationSelectorProps {
    groups: Record<string, TransformedGroup>;
    groupIds: string[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export const GroupDestinationSelector = ({
    groups,
    groupIds,
    selectedId,
    onSelect,
}: GroupDestinationSelectorProps) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Destination Group</label>
            <Select value={selectedId} onValueChange={onSelect}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                    {groupIds.map((groupId) => (
                        <SelectItem key={groupId} value={groupId}>
                            {groups[groupId]?.name || "Unknown Group"}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default GroupDestinationSelector;
