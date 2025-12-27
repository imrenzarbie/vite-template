import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "../store";
import { parseMarkdownTable } from "../lib/markdown-parser";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Import sub-components
import { FileUploadZone } from "./file-upload";
import { GroupDestinationSelector } from "./group-destination-selector";
import { ReviewTable, ReviewItem } from "./review-table";

const schema = z.object({
    markdown: z.string().min(1, "Input cannot be empty"),
});

export const InputPanel: React.FC = () => {
    const { groups, groupIds, setCurrentGroup, loadItemsFromMarkdown } =
        useStore();

    // Local state for the review process
    const [reviewItems, setReviewItems] = useState<ReviewItem[] | null>(null);
    const [targetGroupId, setTargetGroupId] = useState<string>("");

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { markdown: "" },
    });

    // Handler for parsing raw markdown into ReviewItems
    const onParse = (data: z.infer<typeof schema>) => {
        try {
            const parsed = parseMarkdownTable(data.markdown);
            if (parsed.length === 0)
                throw new Error("No items found. Check markdown format.");

            const items: ReviewItem[] = parsed.map((p) => ({
                id: uuidv4(),
                description: p.description,
                // (Qty * Price) * 100 for cents
                amount: Math.round((p.quantity || 1) * (p.price || 0) * 100),
                selectedMemberIds: [], // Empty until group is chosen
                originalNames: [],
            }));

            setReviewItems(items);
            toast.success("Parsed! Now select a group to auto-assign splits.");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Parse failed");
        }
    };

    // CRITICAL: When group changes, update all items to default to everyone
    const handleGroupChange = (groupId: string) => {
        setTargetGroupId(groupId);
        const group = groups[groupId];
        if (group && reviewItems) {
            const allIds = group.memberIds;
            setReviewItems(
                (items) =>
                    items?.map((item) => ({
                        ...item,
                        selectedMemberIds: allIds, // Default: Split with all
                    })) || null
            );
        }
    };

    // Update a single item's split list
    const handleUpdateItem = useCallback(
        (itemId: string, memberIds: string[]) => {
            setReviewItems(
                (prev) =>
                    prev?.map((item) =>
                        item.id === itemId
                            ? { ...item, selectedMemberIds: memberIds }
                            : item
                    ) || null
            );
        },
        []
    );

    const onCommit = () => {
        if (!targetGroupId || !reviewItems) return;
        const activeGroup = groups[targetGroupId];

        // Map local ReviewItems back to the store's ParsedItem format
        const finalData = reviewItems.map((item) => ({
            description: item.description,
            amount: item.amount,
            assignees: item.selectedMemberIds.map(
                (id) => activeGroup.members[id].name
            ),
        }));

        setCurrentGroup(targetGroupId);
        loadItemsFromMarkdown(finalData);

        // Clear state
        setReviewItems(null);
        setTargetGroupId("");
        form.reset();
        toast.success("Successfully imported items!");
    };

    if (reviewItems) {
        return (
            <Card className="animate-in fade-in slide-in-from-right-4">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Assign & Review</CardTitle>
                        <CardDescription>
                            Select group to auto-split items with all members.
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReviewItems(null)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Edit
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-end bg-muted/30 p-4 rounded-lg border">
                        <div className="flex-1">
                            <GroupDestinationSelector
                                groups={groups}
                                groupIds={groupIds}
                                selectedId={targetGroupId}
                                onSelect={handleGroupChange}
                            />
                        </div>
                        <Button
                            onClick={onCommit}
                            disabled={
                                !targetGroupId ||
                                reviewItems.some(
                                    (i) => i.selectedMemberIds.length === 0
                                )
                            }>
                            <Database className="w-4 h-4 mr-2" /> Import to
                            Group
                        </Button>
                    </div>

                    <ReviewTable
                        items={reviewItems}
                        activeGroup={
                            targetGroupId ? groups[targetGroupId] : null
                        }
                        onUpdateItem={handleUpdateItem}
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Import Bill
                </CardTitle>
                <CardDescription>
                    Format: | Item Name | Qty | Price |
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FileUploadZone
                    onFileLoad={(val) => form.setValue("markdown", val)}
                />
                <form
                    onSubmit={form.handleSubmit(onParse)}
                    className="space-y-4">
                    <Textarea
                        {...form.register("markdown")}
                        placeholder="| Burger | 1 | 12.50 |"
                        className="min-h-[200px] font-mono"
                    />
                    <Button type="submit" className="w-full">
                        Parse Table
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
