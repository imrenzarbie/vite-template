import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GroupDestinationSelector from "./group-destination-selector";
import ReviewTable from "./review-table";

// Hooks
import { useGroups } from "../hooks/use-groups";
import { useGroup } from "../hooks/use-group";

// API
import { billsApi } from "../api/bills";
import { ReviewItem, TransformedGroup, CreateBillPayload } from "../types";
import { TransformedMember, BillItemPayload } from "../types/billing.type";

interface BillAssignmentManagerProps {
    initialItems: ReviewItem[];
    rawMarkdown: string;
    initialGroupId?: string;
    onBack: () => void;
    onComplete: () => void;
}

export const BillAssignmentManager: React.FC<BillAssignmentManagerProps> = ({
    initialItems,
    rawMarkdown,
    initialGroupId,
    onBack,
    onComplete,
}) => {
    // Local state for the items being edited
    const [reviewItems, setReviewItems] = useState<ReviewItem[]>(initialItems);

    // Local state for the selected group
    const [targetGroupId, setTargetGroupId] = useState<string>(
        initialGroupId || ""
    );

    // 1. Fetch available groups for the selector
    const { groups = [] } = useGroups();

    // 2. Fetch details (members) for the specifically selected group
    const { group: activeGroup } = useGroup(
        targetGroupId ? parseInt(targetGroupId) : null
    );

    // 3. Transform Data for the UI (Selector & Table)
    const groupOptions = useMemo<Record<string, TransformedGroup>>(() => {
        const options: Record<string, TransformedGroup> = {};

        // Initialize generic group info
        groups.forEach((g) => {
            options[g.id.toString()] = {
                id: g.id.toString(),
                name: g.name,
                memberIds: [],
                members: {},
            };
        });

        // Populate members if a group is selected and data is loaded
        if (targetGroupId && activeGroup && activeGroup.members) {
            const membersRecord = activeGroup.members.reduce<
                Record<string, TransformedMember>
            >((acc, member) => {
                acc[member.id.toString()] = {
                    id: member.id.toString(),
                    name: member.username,
                    role: member.role,
                };
                return acc;
            }, {});

            options[targetGroupId] = {
                id: targetGroupId,
                name: activeGroup.name,
                memberIds: activeGroup.members.map((m) => m.id.toString()),
                members: membersRecord,
            };
        }

        return options;
    }, [groups, activeGroup, targetGroupId]);

    // Helper accessor for the currently active group object
    const activeGroupForReview = targetGroupId
        ? groupOptions[targetGroupId]
        : undefined;

    // --- Auto-Assign Effect ---
    // When the active group changes (and has loaded), assign ALL members to ALL items by default.
    useEffect(() => {
        if (activeGroupForReview && activeGroupForReview.memberIds.length > 0) {
            const allMemberIds = activeGroupForReview.memberIds;

            setReviewItems((prevItems) =>
                prevItems.map((item) => ({
                    ...item,
                    // Reset assignments to ALL members of the new group
                    // This ensures the "Green Button" state is active for everyone initially
                    selectedMemberIds: allMemberIds,
                }))
            );
        }
    }, [activeGroupForReview?.id, activeGroupForReview?.memberIds.length]);

    // --- Handlers ---

    const handleUpdateItem = useCallback(
        (itemId: string, memberIds: string[]) => {
            setReviewItems((prev) =>
                prev.map((item) =>
                    item.id === itemId
                        ? { ...item, selectedMemberIds: memberIds }
                        : item
                )
            );
        },
        []
    );

    const handleCommit = async () => {
        if (!targetGroupId) {
            toast.error("Please select a group first.");
            return;
        }

        try {
            // Validate that we aren't sending empty assignments if that matters
            // (Optional: You could check if any item has 0 assignments here)

            // Transform UI items to API Payload
            const billItems: BillItemPayload[] = reviewItems.map((item) => ({
                name: item.description,
                amount: item.amount,
                quantity: item.quantity,
                assigned_user_ids: item.selectedMemberIds.map((id) =>
                    parseInt(id)
                ),
            }));

            const payload: CreateBillPayload = {
                title: `Imported Bill - ${new Date().toLocaleDateString()}`,
                group_id: parseInt(targetGroupId),
                raw_markdown: rawMarkdown,
                created_by: 1, // TODO: Replace with actual logged-in user ID
                items: billItems,
            };

            await billsApi.create(payload);

            toast.success("Bill and assignments saved successfully!");
            onComplete();
        } catch (error) {
            console.error(error);
            const message =
                error instanceof Error ? error.message : "Failed to save bill";
            toast.error(message);
        }
    };

    return (
        <Card className="animate-in fade-in slide-in-from-right-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Assign & Review</CardTitle>
                    <CardDescription>
                        Select a group. All members are assigned by default
                        (green). Click a member to remove them from a specific
                        item.
                    </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Edit Markdown
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Group Selector */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                    <GroupDestinationSelector
                        groups={groupOptions}
                        groupIds={groups.map((g) => g.id.toString())}
                        selectedId={targetGroupId}
                        onSelect={setTargetGroupId}
                    />
                </div>

                {/* Review Table with Save Buttons */}
                <ReviewTable
                    items={reviewItems}
                    activeGroup={activeGroupForReview}
                    onUpdateItem={handleUpdateItem}
                    onSave={handleCommit}
                />
            </CardContent>
        </Card>
    );
};

export default BillAssignmentManager;
