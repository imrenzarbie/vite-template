import React from "react";
import { Check, Save } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Assuming you have a standard cn utility
import { ReviewItem, TransformedGroup } from "../types";

interface ReviewTableProps {
    items: ReviewItem[];
    activeGroup?: TransformedGroup;
    onUpdateItem: (itemId: string, memberIds: string[]) => void;
    onSave: () => void; // Added onSave prop
}

const ReviewTable: React.FC<ReviewTableProps> = ({
    items,
    activeGroup,
    onUpdateItem,
    onSave,
}) => {
    const formatMoney = (cents: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(cents / 100);
    };

    const toggleMember = (
        itemId: string,
        currentIds: string[],
        memberId: string
    ) => {
        const isSelected = currentIds.includes(memberId);
        let newIds: string[];

        if (isSelected) {
            // Unassign user
            newIds = currentIds.filter((id) => id !== memberId);
        } else {
            // Assign user
            newIds = [...currentIds, memberId];
        }
        onUpdateItem(itemId, newIds);
    };

    const ActionButtons = () => (
        <div className="flex justify-end py-4">
            <Button
                onClick={onSave}
                disabled={!activeGroup || items.length === 0}
                className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Bill & Assignments
            </Button>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Top Save Button */}
            <ActionButtons />

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30%]">Item</TableHead>
                            <TableHead className="w-[10%]">Qty</TableHead>
                            <TableHead className="w-[15%]">Price</TableHead>
                            <TableHead>Split Between</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {item.description}
                                </TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                    {formatMoney(item.amount)}
                                </TableCell>
                                <TableCell>
                                    {!activeGroup ? (
                                        <span className="text-muted-foreground text-sm italic">
                                            Select a group to assign members
                                        </span>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {Object.values(
                                                activeGroup.members
                                            ).map((member) => {
                                                const isSelected =
                                                    item.selectedMemberIds.includes(
                                                        member.id
                                                    );
                                                return (
                                                    <Button
                                                        key={member.id}
                                                        size="sm"
                                                        variant={
                                                            isSelected
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        onClick={() =>
                                                            toggleMember(
                                                                item.id,
                                                                item.selectedMemberIds,
                                                                member.id
                                                            )
                                                        }
                                                        className={cn(
                                                            "h-8 text-xs transition-all",
                                                            isSelected
                                                                ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                                                                : "text-muted-foreground hover:text-foreground"
                                                        )}>
                                                        {isSelected && (
                                                            <Check className="w-3 h-3 mr-1" />
                                                        )}
                                                        {member.name}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Bottom Save Button */}
            <ActionButtons />
        </div>
    );
};

export default ReviewTable;
