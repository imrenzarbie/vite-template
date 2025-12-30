import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useGroups } from "../hooks/use-groups";

export function GroupSelector() {
    const { groups, createGroup } = useGroups();
    const [newGroupName, setNewGroupName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            toast.error("Group name cannot be empty");
            return;
        }
        const result = await createGroup({ name: newGroupName.trim() });
        if (!result) {
            toast.error("Failed to create group");
            return;
        }
        setNewGroupName("");
        setIsCreating(false);
        toast.success(`Group "${newGroupName}" created and selected`);
    };

    const handleGroupSelect = (id: string) => {
        toast.success(`Group "${groups[id].name}" selected`);
    };

    const groupIds = Object.keys(groups).map((id) => Number(id));

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Select or Create Group</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {groupIds.length > 0 && (
                        <Select onValueChange={handleGroupSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a group" />
                            </SelectTrigger>
                            <SelectContent>
                                {groupIds.map((id) => (
                                    <SelectItem key={id} value={`${id}`}>
                                        {groups[id].name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {isCreating ? (
                        <div className="flex gap-2">
                            <Input
                                placeholder="Group name"
                                value={newGroupName}
                                onChange={(e) =>
                                    setNewGroupName(e.target.value)
                                }
                                onKeyPress={(e) =>
                                    e.key === "Enter" && handleCreateGroup()
                                }
                            />
                            <Button onClick={handleCreateGroup}>Create</Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsCreating(false)}>
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={() => setIsCreating(true)}>
                            {groupIds.length === 0
                                ? "Create Your First Group"
                                : "New Group"}
                        </Button>
                    )}

                    {groupIds.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {groupIds.length} group
                            {groupIds.length > 1 ? "s" : ""} available
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
