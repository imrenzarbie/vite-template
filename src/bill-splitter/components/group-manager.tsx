// src/components/GroupManager.tsx

import React, { useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Plus,
    Users,
    Layers,
    Trash2,
    RefreshCw,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useGroup, useGroups } from "../hooks/use-groups";
import { useUsers } from "../hooks/use-users";

export const GroupManager: React.FC = () => {
    const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
    const [newGroupName, setNewGroupName] = useState("");
    const [newSubGroupName, setNewSubGroupName] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [selectedRole, setSelectedRole] = useState<string>("member");
    const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);

    const {
        groups,
        isLoading: isLoadingGroups,
        error: groupsError,
        createGroup,
        isCreating,
        deleteGroup,
        isDeleting,
    } = useGroups();

    const {
        group: currentGroup,
        isLoading: isLoadingGroup,
        error: groupError,
        addMember,
        isAddingMember,
        removeMember,
        isRemovingMember,
        refetch: refetchGroup,
    } = useGroup(currentGroupId);

    const { users, isLoading: isLoadingUsers } = useUsers();

    const subGroups = groups.filter(
        (g) => g.parent_group_id === currentGroupId
    );

    const availableUsers = users.filter(
        (user) => !currentGroup?.members.some((m) => m.id === user.id)
    );

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        try {
            const result = await createGroup({ name: newGroupName.trim() });
            setNewGroupName("");
            setCurrentGroupId(result.id);
            toast.success("Group created");
        } catch {
            toast.error("Failed to create group");
        }
    };

    const handleDeleteGroup = async (id: number) => {
        try {
            await deleteGroup(id);
            if (currentGroupId === id) {
                setCurrentGroupId(null);
            }
            toast.success("Group deleted");
        } catch {
            toast.error("Failed to delete group");
        }
    };

    const handleAddMember = async () => {
        if (!selectedUserId || !currentGroupId) return;
        try {
            await addMember({
                user_id: parseInt(selectedUserId),
                role: selectedRole,
            });
            setSelectedUserId("");
            setSelectedRole("member");
            toast.success("Member added");
        } catch {
            toast.error("Failed to add member");
        }
    };

    const handleRemoveMember = async (userId: number) => {
        try {
            await removeMember(userId);
            toast.success("Member removed");
        } catch {
            toast.error("Failed to remove member");
        }
    };

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
                parent_group_id: currentGroupId,
            });
            for (const memberId of selectedMemberIds) {
                await fetch(
                    `http://localhost:3001/api/groups/${result.id}/members`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            user_id: memberId,
                            role: "member",
                        }),
                    }
                );
            }
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

    const error = groupsError || groupError;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {error && (
                <Alert variant="destructive" data-testid="error-alert">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}

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
                            data-testid="new-group-input"
                        />
                        <Button
                            onClick={handleCreateGroup}
                            disabled={isCreating || !newGroupName.trim()}
                            data-testid="create-group-button">
                            {isCreating ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            New Group
                        </Button>
                    </div>

                    <Separator />

                    {isLoadingGroups ? (
                        <div
                            className="flex gap-2"
                            data-testid="groups-loading">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    ) : (
                        <div
                            className="flex flex-wrap gap-2"
                            data-testid="groups-list">
                            {groups
                                .filter((g) => !g.parent_group_id)
                                .map((g) => (
                                    <div key={g.id} className="relative group">
                                        <Button
                                            variant={
                                                currentGroupId === g.id
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                setCurrentGroupId(g.id)
                                            }
                                            className="pr-8"
                                            data-testid={`group-button-${g.id}`}>
                                            {g.name}
                                        </Button>
                                        <button
                                            onClick={() =>
                                                handleDeleteGroup(g.id)
                                            }
                                            disabled={isDeleting}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity disabled:opacity-50"
                                            data-testid={`delete-group-${g.id}`}>
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            {groups.filter((g) => !g.parent_group_id).length ===
                                0 && (
                                <p
                                    className="text-muted-foreground text-sm"
                                    data-testid="no-groups">
                                    No groups yet. Create one to get started.
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {currentGroup ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                                    <Users className="w-4 h-4" /> Members
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => refetchGroup()}
                                    data-testid="refresh-members">
                                    <RefreshCw className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Select
                                    value={selectedUserId}
                                    onValueChange={setSelectedUserId}
                                    disabled={isLoadingUsers}>
                                    <SelectTrigger data-testid="user-select">
                                        <SelectValue placeholder="Select user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUsers.map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={user.id.toString()}>
                                                {user.username} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={selectedRole}
                                    onValueChange={setSelectedRole}>
                                    <SelectTrigger
                                        className="w-28"
                                        data-testid="role-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            Admin
                                        </SelectItem>
                                        <SelectItem value="member">
                                            Member
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="secondary"
                                    onClick={handleAddMember}
                                    disabled={isAddingMember || !selectedUserId}
                                    data-testid="add-member-button">
                                    {isAddingMember ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Add"
                                    )}
                                </Button>
                            </div>

                            {isLoadingGroup ? (
                                <div
                                    className="space-y-2"
                                    data-testid="members-loading">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : (
                                <ScrollArea className="h-[300px] border rounded-md p-2">
                                    {currentGroup.members.length === 0 && (
                                        <p
                                            className="text-center text-muted-foreground py-10 italic"
                                            data-testid="no-members">
                                            No members yet.
                                        </p>
                                    )}
                                    {currentGroup.members.map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                                            data-testid={`member-${m.id}`}>
                                            <div>
                                                <span className="text-sm font-medium">
                                                    {m.username}
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    ({m.role})
                                                </span>
                                                <p className="text-xs text-muted-foreground">
                                                    {m.email}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleRemoveMember(m.id)
                                                }
                                                disabled={isRemovingMember}
                                                data-testid={`remove-member-${m.id}`}>
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>

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
                                            <div
                                                key={sg.id}
                                                className="relative group">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setCurrentGroupId(sg.id)
                                                    }>
                                                    {sg.name}
                                                </Button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteGroup(sg.id)
                                                    }
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
                                onChange={(e) =>
                                    setNewSubGroupName(e.target.value)
                                }
                                data-testid="subgroup-name-input"
                            />
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                                    Select Members:
                                </label>
                                <ScrollArea className="h-40 border rounded-md p-3">
                                    {currentGroup.members.map((m) => (
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
                                    !newSubGroupName ||
                                    selectedMemberIds.length === 0
                                }
                                data-testid="create-subgroup-button">
                                Create Subgroup
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div
                    className="text-center py-20 border-2 border-dashed rounded-xl opacity-50"
                    data-testid="no-group-selected">
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
