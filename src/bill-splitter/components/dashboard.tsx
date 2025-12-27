import React, { useMemo } from "react";
import { useActiveGroup } from "../hooks/use-active-group";
import { calculateDebts } from "../lib/calculate-engine";
import DebtMatrixTable from "./debt-matrix-table";
import ItemBreakdownTable from "./item-breakdown-table";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Dashboard: React.FC = () => {
    const activeGroup = useActiveGroup();

    // 1. Memoize transformations to prevent unnecessary recalculations
    const itemArray = useMemo(
        () => (activeGroup ? Object.values(activeGroup.items) : []),
        [activeGroup?.items]
    );

    const memberArray = useMemo(
        () => (activeGroup ? Object.values(activeGroup.members) : []),
        [activeGroup?.members]
    );

    const subGroupArray = useMemo(
        () => (activeGroup ? Object.values(activeGroup.subGroups) : []),
        [activeGroup?.subGroups]
    );

    const debts = useMemo(() => {
        if (!activeGroup) return [];
        return calculateDebts(itemArray, memberArray, subGroupArray);
    }, [itemArray, memberArray, subGroupArray, activeGroup]);

    if (!activeGroup) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Group Selected</AlertTitle>
                <AlertDescription>
                    Please select or create a group in the Group Manager to see
                    the dashboard.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="grid gap-6 animate-in fade-in duration-500">
            <ItemBreakdownTable
                items={itemArray}
                members={activeGroup.members}
                subGroups={activeGroup.subGroups}
            />
            <DebtMatrixTable debts={debts} members={activeGroup.members} />
        </div>
    );
};

export default Dashboard;
