import React, { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { parseMarkdownTable } from "../lib/markdown-parser";
import { useParams, useNavigate } from "react-router";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Database } from "lucide-react";
import { toast } from "sonner";

import { FileUploadZone } from "./file-upload";
import { ReviewItem, TransformedGroup } from "../types";
import GroupDestinationSelector from "./group-destination-selector";
import ReviewTable from "./review-table";
import { useGroups } from "../hooks/use-groups";
import { useGroup } from "../hooks/use-group";
import { billsApi } from "../api/bills";

const schema = z.object({
    markdown: z.string().min(1, "Input cannot be empty"),
});

interface ParsedMarkdownItem {
    description?: string;
    quantity?: number;
    price?: number;
}

const InputPanel = () => {
    const { groupId: urlGroupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();

    const { groups = [] } = useGroups();
    const { group: activeGroup } = useGroup(
        urlGroupId ? parseInt(urlGroupId) : null
    );

    const [reviewItems, setReviewItems] = useState<ReviewItem[] | null>(null);
    const [targetGroupId, setTargetGroupId] = useState<string>(
        urlGroupId || ""
    );

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { markdown: "" },
    });

    const groupOptions = useMemo(() => {
        const options: Record<string, TransformedGroup> = {};

        groups.forEach((group) => {
            options[group.id.toString()] = {
                id: group.id.toString(),
                name: group.name,
                memberIds: [],
                members: {},
            };
        });

        // If we have a target group with members, update it
        if (targetGroupId && activeGroup?.members) {
            options[targetGroupId] = {
                id: targetGroupId,
                name: activeGroup.name,
                memberIds: activeGroup.members.map((m) => m.id.toString()),
                members: activeGroup.members.reduce((acc, member) => {
                    acc[member.id.toString()] = {
                        id: member.id.toString(),
                        name: member.username,
                        role: member.role,
                    };
                    return acc;
                }, {} as Record<string, { id: string; name: string; role: string }>),
            };
        }

        return options;
    }, [groups, activeGroup, targetGroupId]);

    const activeGroupForReview = targetGroupId
        ? groupOptions[targetGroupId]
        : null;

    const isCommitDisabled = useMemo(() => {
        if (!targetGroupId || !reviewItems) return true;
        return reviewItems.some((item) => item.selectedMemberIds.length === 0);
    }, [targetGroupId, reviewItems]);

    const onParse = useCallback((data: z.infer<typeof schema>) => {
        try {
            const parsed: ParsedMarkdownItem[] = parseMarkdownTable(
                data.markdown
            );
            if (parsed.length === 0) {
                throw new Error("No items found. Check markdown format.");
            }

            const items: ReviewItem[] = parsed.map((p) => ({
                id: uuidv4(),
                description: p.description,
                quantity: p.quantity || 1,
                price: p.price || 0,
                amount: Math.round((p.quantity || 1) * (p.price || 0) * 100),
                selectedMemberIds: [],
            }));

            setReviewItems(items);
            toast.success("Parsed! Now select a group to auto-assign splits.");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Parse failed";
            toast.error(message);
        }
    }, []);

    const handleGroupChange = useCallback(
        (groupId: string) => {
            setTargetGroupId(groupId);
            navigate(`/group/${groupId}`);
        },
        [navigate]
    );

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

    const onCommit = useCallback(async () => {
        if (!targetGroupId || !reviewItems || !activeGroupForReview) {
            toast.error(
                "Please select a group and ensure all items have assignees"
            );
            return;
        }

        try {
            const billItems = reviewItems.map((item) => ({
                name: item.description,
                amount: item.amount,
                quantity: item.quantity,
                assigned_user_ids: item.selectedMemberIds.map((id) =>
                    parseInt(id)
                ),
            }));

            await billsApi.create({
                title: `Imported Bill - ${new Date().toLocaleDateString()}`,
                group_id: parseInt(targetGroupId),
                raw_markdown: reviewItems
                    .map(
                        (i) =>
                            `- ${i.description}: ${(i.amount / 100).toFixed(2)}`
                    )
                    .join("\n"),
                created_by: 1,
                items: billItems,
            });

            toast.success("Successfully imported bill and items!");
            setReviewItems(null);
            setTargetGroupId("");
            form.reset();
        } catch (error) {
            console.error(error);
            toast.error("Failed to import items");
        }
    }, [targetGroupId, reviewItems, activeGroupForReview, form]);

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
                                groups={groupOptions}
                                groupIds={groups.map((g) => g.id.toString())}
                                selectedId={targetGroupId}
                                onSelect={handleGroupChange}
                            />
                        </div>
                        <Button onClick={onCommit} disabled={isCommitDisabled}>
                            <Database className="w-4 h-4 mr-2" /> Import to
                            Group
                        </Button>
                    </div>

                    <ReviewTable
                        items={reviewItems}
                        activeGroup={activeGroupForReview}
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

export default InputPanel;
