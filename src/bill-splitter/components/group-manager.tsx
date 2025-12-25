// src/components/GroupManager.tsx
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
import { Member, SubGroup } from "../types";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "../store";

export function GroupManager() {
    const { members, subGroups, addMember, addSubGroup } = useStore();
    const [newMemberName, setNewMemberName] = useState("");
    const [newSubGroupName, setNewSubGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const handleAddMember = () => {
        if (!newMemberName.trim()) return;
        const member: Member = {
            id: uuidv4(),
            name: newMemberName,
            email: "",
        };
        addMember(member);
        setNewMemberName("");
    };

    const handleAddSubGroup = () => {
        if (!newSubGroupName.trim() || selectedMembers.length === 0) return;
        const subGroup: SubGroup = {
            id: uuidv4(),
            name: newSubGroupName,
            memberIds: selectedMembers,
        };
        addSubGroup(subGroup);
        setNewSubGroupName("");
        setSelectedMembers([]);
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Member name"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === "Enter" && handleAddMember()
                            }
                        />
                        <Button onClick={handleAddMember}>Add</Button>
                    </div>
                    <ul className="space-y-2">
                        {Object.values(members).map((member) => (
                            <li key={member.id} className="text-sm">
                                {member.name}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Subgroups</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Subgroup name"
                        value={newSubGroupName}
                        onChange={(e) => setNewSubGroupName(e.target.value)}
                    />
                    <Select
                        value={selectedMembers[0] || ""}
                        onValueChange={(value) => setSelectedMembers([value])}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select members" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(members).map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                    {member.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAddSubGroup}>Create Subgroup</Button>
                </CardContent>
            </Card>
        </div>
    );
}
