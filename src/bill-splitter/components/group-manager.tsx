import React, { useState, useMemo } from "react";
import { useStore } from "../store";
import { v4 as uuidv4 } from "uuid";

// shadcn/ui components (Adjust paths to your project)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Users, Layers, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const GroupManager: React.FC = () => {
    const {
        groups,
        groupIds,
        currentGroupId,
        createGroup,
        setCurrentGroup,
        deleteGroup,
        addMember,
        addSubGroup,
    } = useStore();

    // --- Local UI State ---
    const [newGroupName, setNewGroupName] = useState("");
    const [newMemberName, setNewMemberName] = useState("");
    const [newSubGroupName, setNewSubGroupName] = useState("");
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

    // --- Selectors ---
    const currentGroup = useMemo(
        () => (currentGroupId ? groups[currentGroupId] : null),
        [groups, currentGroupId]
    );

    const groupList = useMemo(
        () => groupIds.map((id) => groups[id]),
        [groups, groupIds]
    );

    const membersArray = useMemo(
        () =>
            currentGroup
                ? currentGroup.memberIds.map((id) => currentGroup.members[id])
                : [],
        [currentGroup]
    );

    // --- Handlers ---
    const handleCreateGroup = () => {
        if (!newGroupName.trim()) return;
        createGroup(newGroupName.trim());
        setNewGroupName("");
        toast.success("Group created");
    };

    const handleAddMember = () => {
        if (!newMemberName.trim() || !currentGroupId) return;
        addMember({ id: uuidv4(), name: newMemberName.trim(), email: "" });
        setNewMemberName("");
    };

    const handleAddSubGroup = () => {
        if (!newSubGroupName.trim() || selectedMemberIds.length === 0) {
            toast.error(
                "Please provide a name and select at least one member."
            );
            return;
        }
        addSubGroup({
            id: uuidv4(),
            name: newSubGroupName.trim(),
            memberIds: selectedMemberIds,
        });
        setNewSubGroupName("");
        setSelectedMemberIds([]);
        toast.success("Subgroup created");
    };

    const toggleMemberSelection = (id: string) => {
        setSelectedMemberIds((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* 1. GROUP SELECTOR & CREATOR (The "Master" View) */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" />
                        Project Groups
                    </CardTitle>
                    <CardDescription>
                        Select a project to manage or create a new one.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g., Road Trip Summer"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleCreateGroup()
                            }
                            className="bg-background"
                        />
                        <Button onClick={handleCreateGroup}>
                            <Plus className="w-4 h-4 mr-2" /> New Group
                        </Button>
                    </div>

                    <Separator />

                    <div className="flex flex-wrap gap-2">
                        {groupList.map((g) => (
                            <div key={g.id} className="relative group">
                                <Button
                                    variant={
                                        currentGroupId === g.id
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => setCurrentGroup(g.id)}
                                    className="pr-8">
                                    {g.name}
                                </Button>
                                <button
                                    onClick={() => deleteGroup(g.id)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 2. GROUP CONTENT (The "Detail" View) */}
            {currentGroup ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* MEMBERS MANAGEMENT */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                                <Users className="w-4 h-4" /> Members
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Alice"
                                    value={newMemberName}
                                    onChange={(e) =>
                                        setNewMemberName(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleAddMember()
                                    }
                                />
                                <Button
                                    variant="secondary"
                                    onClick={handleAddMember}>
                                    Add
                                </Button>
                            </div>
                            <ScrollArea className="h-[300px] border rounded-md p-2">
                                {membersArray.length === 0 && (
                                    <p className="text-center text-muted-foreground py-10 italic">
                                        No members yet.
                                    </p>
                                )}
                                {membersArray.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                                        <span className="text-sm font-medium">
                                            {m.name}
                                        </span>
                                        <CheckCircle2 className="w-4 h-4 text-green-500 opacity-50" />
                                    </div>
                                ))}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* SUBGROUP MANAGEMENT */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                                <Layers className="w-4 h-4" /> Subgroups
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Subgroup Name (e.g., Drivers)"
                                value={newSubGroupName}
                                onChange={(e) =>
                                    setNewSubGroupName(e.target.value)
                                }
                            />
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                                    Select Members:
                                </label>
                                <ScrollArea className="h-40 border rounded-md p-3">
                                    {membersArray.map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex items-center space-x-2 py-1">
                                            <Checkbox
                                                id={`check-${m.id}`}
                                                checked={selectedMemberIds.includes(
                                                    m.id
                                                )}
                                                onCheckedChange={() =>
                                                    toggleMemberSelection(m.id)
                                                }
                                            />
                                            <label
                                                htmlFor={`check-${m.id}`}
                                                className="text-sm cursor-pointer select-none">
                                                {m.name}
                                            </label>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleAddSubGroup}
                                disabled={
                                    !newSubGroupName ||
                                    selectedMemberIds.length === 0
                                }>
                                Create Subgroup
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-xl opacity-50">
                    <Layers className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No Group Selected</h3>
                    <p className="text-sm">
                        Create or select a group above to start managing
                        members.
                    </p>
                </div>
            )}
        </div>
    );
};
