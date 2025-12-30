import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ReviewItem, TransformedGroup } from "../types";

interface ReviewTableProps {
    items: ReviewItem[];
    activeGroup: TransformedGroup | null;
    onUpdateItem: (itemId: string, memberIds: string[]) => void;
}

export const ReviewTable = ({
    items,
    activeGroup,
    onUpdateItem,
}: ReviewTableProps) => {
    if (!activeGroup) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Please select a group to assign members
            </div>
        );
    }

    const handleMemberToggle = (itemId: string, memberId: string) => {
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        const isSelected = item.selectedMemberIds.includes(memberId);
        const newMemberIds = isSelected
            ? item.selectedMemberIds.filter((id) => id !== memberId)
            : [...item.selectedMemberIds, memberId];

        onUpdateItem(itemId, newMemberIds);
    };

    const handleSelectAll = (itemId: string) => {
        onUpdateItem(itemId, activeGroup.memberIds);
    };

    const handleClearAll = (itemId: string) => {
        onUpdateItem(itemId, []);
    };

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 bg-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h3 className="font-medium text-lg">
                                {item.description}
                            </h3>
                            <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                                <span>Qty: {item.quantity}</span>
                                <span>
                                    Price: ${(item.price / 100).toFixed(2)}
                                </span>
                                <span className="font-medium text-foreground">
                                    Total: ${(item.amount / 100).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSelectAll(item.id)}>
                                All
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleClearAll(item.id)}>
                                None
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">
                            Assign to members:
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {activeGroup.memberIds.map((memberId) => {
                                const member = activeGroup.members[memberId];
                                if (!member) return null;

                                const isSelected =
                                    item.selectedMemberIds.includes(memberId);

                                return (
                                    <div
                                        key={memberId}
                                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                        <Checkbox
                                            id={`${item.id}-${memberId}`}
                                            checked={isSelected}
                                            onCheckedChange={() =>
                                                handleMemberToggle(
                                                    item.id,
                                                    memberId
                                                )
                                            }
                                        />
                                        <label
                                            htmlFor={`${item.id}-${memberId}`}
                                            className="text-sm font-medium leading-none cursor-pointer">
                                            {member.name}
                                        </label>
                                        {member.role === "admin" && (
                                            <Badge
                                                variant="outline"
                                                className="ml-auto text-xs">
                                                Admin
                                            </Badge>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {item.selectedMemberIds.length === 0 && (
                            <p className="text-sm text-destructive mt-2">
                                Please select at least one member
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReviewTable;
