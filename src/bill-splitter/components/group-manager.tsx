// src/components/GroupManager.tsx
import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Layers } from "lucide-react";
import { toast } from "sonner";
import { useGroups, useGroup } from "../hooks/use-groups";
import GroupList from "./group-list";
import MemberManagement from "./member-management";
import SubGroupManagement from "./sub-group-management";

const GroupManager: React.FC = () => {
    const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
    const [newGroupName, setNewGroupName] = useState("");

    const {
        groups,
        isLoading: isLoadingGroups,
        error: groupsError,
        createGroup,
        isCreating,
        deleteGroup,
        isDeleting,
    } = useGroups();

    const { group: currentGroup, error: groupError } = useGroup(currentGroupId);

    const error = groupsError || groupError;

    const handleSelectGroup = (id: number) => {
        setCurrentGroupId(id);
    };

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

    const handleDeleteSubGroup = async (id: number) => {
        try {
            await deleteGroup(id);
            toast.success("Subgroup deleted");
        } catch {
            toast.error("Failed to delete subgroup");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {error && (
                <Alert variant="destructive" data-testid="error-alert">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}

            <GroupList
                groups={groups}
                isLoading={isLoadingGroups}
                currentGroupId={currentGroupId}
                newGroupName={newGroupName}
                setNewGroupName={setNewGroupName}
                onCreateGroup={handleCreateGroup}
                isCreating={isCreating}
                onSelectGroup={handleSelectGroup}
                onDeleteGroup={handleDeleteGroup}
                isDeleting={isDeleting}
            />

            {currentGroup ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MemberManagement group={currentGroup} />
                    <SubGroupManagement
                        parentGroup={currentGroup}
                        onSelectGroup={handleSelectGroup}
                        onDeleteGroup={handleDeleteSubGroup}
                    />
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

export default GroupManager;
