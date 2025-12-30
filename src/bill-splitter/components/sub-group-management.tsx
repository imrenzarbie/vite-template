// src/components/SubGroupManagement.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Layers, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useGroups } from "../hooks/use-groups";
import { GroupWithMembers } from "../types/user.type";

interface SubGroupManagementProps {
    parentGroup: GroupWithMembers;
    onSelectGroup: (id: number) => void;
    onDeleteGroup: (id: number) => Promise<void>;
}

const SubGroupManagement: React.FC<SubGroupManagementProps> = ({
    parentGroup,
    onSelectGroup,
    onDeleteGroup,
}) => {
    const [newSubGroupName, setNewSubGroupName] = useState("");
    const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);

    const { groups, createGroup } = useGroups();

    const subGroups = groups.filter(
        (g) => g.parent_group_id === parentGroup.id
    );

    const handleCreateSubGroup = async () => {
        if (!newSubGroupName.trim() || selectedMemberIds.length === 0) {
            toast.error(
                "Please provide a name and select at least one member."
            );
            return;
        }
        try {
            const result = await createGroup({
                name: newSubGroupName.trim(),
                parent_group_id: parentGroup.id,
            });

            // Add selected members to the newly created subgroup
            await Promise.all(
                selectedMemberIds.map((memberId) =>
                    fetch(
                        `http://localhost:3001/api/groups/${result.id}/members`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                user_id: memberId,
                                role: "member",
                            }),
                        }
                    ).then((res) => {
                        if (!res.ok)
                            throw new Error(`Failed to add member ${memberId}`);
                    })
                )
            );

            setNewSubGroupName("");
            setSelectedMemberIds([]);
            toast.success("Subgroup created");
        } catch {
            toast.error("Failed to create subgroup");
        }
    };

    const toggleMemberSelection = (id: number) => {
        setSelectedMemberIds((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                    <Layers className="w-4 h-4" /> Subgroups
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {subGroups.length > 0 && (
                    <div className="space-y-2 mb-4">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">
                            Existing Subgroups:
                        </label>
                        <div
                            className="flex flex-wrap gap-2"
                            data-testid="subgroups-list">
                            {subGroups.map((sg) => (
                                <div key={sg.id} className="relative group">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onSelectGroup(sg.id)}>
                                        {sg.name}
                                    </Button>
                                    <button
                                        onClick={() => onDeleteGroup(sg.id)}
                                        className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground rounded-full p-0.5 transition-opacity"
                                        data-testid={`delete-subgroup-${sg.id}`}>
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <Separator />
                    </div>
                )}

                <Input
                    placeholder="Subgroup Name (e.g., Drivers)"
                    value={newSubGroupName}
                    onChange={(e) => setNewSubGroupName(e.target.value)}
                    data-testid="subgroup-name-input"
                />
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Select Members:
                    </label>
                    <ScrollArea className="h-40 border rounded-md p-3">
                        {parentGroup.members.map((m) => (
                            <div
                                key={m.id}
                                className="flex items-center space-x-2 py-1">
                                <Checkbox
                                    id={`check-${m.id}`}
                                    checked={selectedMemberIds.includes(m.id)}
                                    onCheckedChange={() =>
                                        toggleMemberSelection(m.id)
                                    }
                                    data-testid={`checkbox-member-${m.id}`}
                                />
                                <label
                                    htmlFor={`check-${m.id}`}
                                    className="text-sm cursor-pointer select-none">
                                    {m.username}
                                </label>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
                <Button
                    className="w-full"
                    onClick={handleCreateSubGroup}
                    disabled={
                        !newSubGroupName || selectedMemberIds.length === 0
                    }
                    data-testid="create-subgroup-button">
                    Create Subgroup
                </Button>
            </CardContent>
        </Card>
    );
};

export default SubGroupManagement;
