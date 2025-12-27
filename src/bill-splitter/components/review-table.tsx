import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { formatCents } from "@/lib/currency";
import { Group } from "../types";

export interface ReviewItem {
    id: string;
    description: string;
    amount: number;
    quantity: number;
    price: number;
    selectedMemberIds: string[];
}

interface ReviewTableProps {
    items: ReviewItem[];
    activeGroup: Group | null;
    onUpdateItem: (id: string, memberIds: string[]) => void;
}

export const ReviewTable: React.FC<ReviewTableProps> = ({
    items,
    activeGroup,
    onUpdateItem,
}) => {
    if (!activeGroup) {
        return (
            <div className="p-12 text-center border-2 border-dashed rounded-lg opacity-50">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">
                    Select a group above to see members and split options.
                </p>
            </div>
        );
    }

    const groupMembers = Object.values(activeGroup.members);

    const handleToggle = (
        itemId: string,
        memberId: string,
        current: string[]
    ) => {
        const next = current.includes(memberId)
            ? current.filter((id) => id !== memberId)
            : [...current, memberId];
        onUpdateItem(itemId, next);
    };

    return (
        <ScrollArea className="h-[400px] rounded-md border">
            <Table>
                <TableHeader className="sticky top-0 bg-muted z-10">
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">
                            Splitting With
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">
                                {item.description}
                            </TableCell>
                            <TableCell>{formatCents(item.amount)}</TableCell>
                            <TableCell className="text-right">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2">
                                            <Users className="w-3 h-3" />
                                            {item.selectedMemberIds.length}{" "}
                                            Members
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-56"
                                        align="end">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <span className="text-[10px] font-bold uppercase">
                                                    Split Item
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    className="h-6 text-[10px]"
                                                    onClick={() =>
                                                        onUpdateItem(
                                                            item.id,
                                                            activeGroup.memberIds
                                                        )
                                                    }>
                                                    Select All
                                                </Button>
                                            </div>
                                            <div className="space-y-1">
                                                {groupMembers.map((m) => (
                                                    <div
                                                        key={m.id}
                                                        className="flex items-center space-x-2 p-1 hover:bg-muted rounded cursor-pointer"
                                                        onClick={() =>
                                                            handleToggle(
                                                                item.id,
                                                                m.id,
                                                                item.selectedMemberIds
                                                            )
                                                        }>
                                                        <Checkbox
                                                            checked={item.selectedMemberIds.includes(
                                                                m.id
                                                            )}
                                                            onCheckedChange={() =>
                                                                handleToggle(
                                                                    item.id,
                                                                    m.id,
                                                                    item.selectedMemberIds
                                                                )
                                                            }
                                                        />
                                                        <span className="text-sm">
                                                            {m.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    );
};
