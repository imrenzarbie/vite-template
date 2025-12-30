// src/components/GroupList.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Layers, Trash2, Loader2 } from "lucide-react";
import { Group } from "../types/user.type";

interface GroupListProps {
    groups: Group[];
    isLoading: boolean;
    currentGroupId: number | null;
    newGroupName: string;
    setNewGroupName: (name: string) => void;
    onCreateGroup: () => void;
    isCreating: boolean;
    onSelectGroup: (id: number) => void;
    onDeleteGroup: (id: number) => void;
    isDeleting: boolean;
}

const GroupList: React.FC<GroupListProps> = ({
    groups,
    isLoading,
    currentGroupId,
    newGroupName,
    setNewGroupName,
    onCreateGroup,
    isCreating,
    onSelectGroup,
    onDeleteGroup,
    isDeleting,
}) => {
    return (
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
                        onKeyDown={(e) => e.key === "Enter" && onCreateGroup()}
                        className="bg-background"
                        data-testid="new-group-input"
                    />
                    <Button
                        onClick={onCreateGroup}
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

                {isLoading ? (
                    <div className="flex gap-2" data-testid="groups-loading">
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
                                        onClick={() => onSelectGroup(g.id)}
                                        className="pr-8"
                                        data-testid={`group-button-${g.id}`}>
                                        {g.name}
                                    </Button>
                                    <button
                                        onClick={() => onDeleteGroup(g.id)}
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
    );
};

export default GroupList;
