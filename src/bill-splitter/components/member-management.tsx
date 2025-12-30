// src/components/MemberManagement.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, RefreshCw, Users, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GroupWithMembers } from "../api/groups";
import { useGroupMutations } from "../hooks/use-groups";
import { useUsers } from "../hooks/use-users";
import UserCreationDialog from "./user-creation-dialog";

interface MemberManagementProps {
    group: GroupWithMembers;
}

const MemberManagement: React.FC<MemberManagementProps> = ({ group }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [selectedRole, setSelectedRole] = useState<string>("member");

    const { users, isLoading: isLoadingUsers } = useUsers();
    const {
        addMember,
        isAddingMember,
        removeMember,
        isRemovingMember,
        refetch,
    } = useGroupMutations(group.id);

    const availableUsers = users.filter(
        (user) => !group.members.some((m) => m.id === user.id)
    );

    const handleAddMember = async () => {
        if (!selectedUserId) return;
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

    const handleUserCreated = (user: {
        id: number;
        username: string;
        email: string;
    }) => {
        setSelectedUserId(user.id.toString());
        toast.success("User created. You can now add them as a member.");
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                        <Users className="w-4 h-4" /> Members
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refetch()}
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
                                    {user.username}
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
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
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
                    <UserCreationDialog
                        onUserCreated={handleUserCreated}
                        trigger={
                            <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Create & Add
                            </Button>
                        }
                    />
                </div>

                <ScrollArea className="h-[300px] border rounded-md p-2">
                    {group.members.length === 0 && (
                        <p
                            className="text-center text-muted-foreground py-10 italic"
                            data-testid="no-members">
                            No members yet.
                        </p>
                    )}
                    {group.members.map((m) => (
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
                                onClick={() => handleRemoveMember(m.id)}
                                disabled={isRemovingMember}
                                data-testid={`remove-member-${m.id}`}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default MemberManagement;
