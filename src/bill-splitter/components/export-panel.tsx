import React from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { formatCents } from "@/lib/currency";
import { calculateDebts } from "../lib/calculate-engine";
import { useActiveGroup } from "../hooks/use-active-group";
import { FileDown, FileText } from "lucide-react";
import { toast } from "sonner";

export const ExportPanel: React.FC = () => {
    const activeGroup = useActiveGroup();

    const exportToMarkdown = () => {
        if (!activeGroup) {
            toast.error("No active group to export");
            return;
        }

        const { members, items, subGroups, name } = activeGroup;
        const itemArray = Object.values(items);
        const memberArray = Object.values(members);
        const subGroupArray = Object.values(subGroups);

        const debts = calculateDebts(itemArray, memberArray, subGroupArray);

        let markdown = `# ${name} - Expense Report\n\n`;

        // Items Table
        markdown += "## Itemized Breakdown\n";
        markdown += "| Description | Amount | Paid By | Assigned To |\n";
        markdown += "|:------------|:-------|:--------|:------------|\n";

        itemArray.forEach((item) => {
            const assigneeNames = item.assignedTo
                .map(
                    (id) =>
                        members[id]?.name || subGroups[id]?.name || "Unknown"
                )
                .join(", ");

            const paidBy = members[item.paidBy]?.name || "Unknown";

            markdown += `| ${item.description} | ${formatCents(
                item.amount
            )} | ${paidBy} | ${assigneeNames} |\n`;
        });

        // Debts Table
        markdown += "\n## Settlement Matrix (Who owes who)\n";
        markdown += "| From | To | Amount |\n";
        markdown += "|:-----|:---|:-------|\n";

        debts.forEach((debt) => {
            const fromName = members[debt.from]?.name || "Unknown";
            const toName = members[debt.to]?.name || "Unknown";
            markdown += `| ${fromName} | ${toName} | ${formatCents(
                debt.amount
            )} |\n`;
        });

        // File Generation
        try {
            const blob = new Blob([markdown], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${name
                .toLowerCase()
                .replace(/\s+/g, "-")}-report.md`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Markdown report exported successfully");
        } catch (error) {
            toast.error("Failed to generate report");
            console.error(error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Data Export
                </CardTitle>
                <CardDescription>
                    Download your current group data for backup or sharing.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
                <Button
                    onClick={exportToMarkdown}
                    disabled={!activeGroup}
                    className="flex-1">
                    <FileDown className="w-4 h-4 mr-2" />
                    Export Markdown
                </Button>
                <Button variant="outline" disabled className="flex-1">
                    Export PDF (Coming Soon)
                </Button>
            </CardContent>
        </Card>
    );
};
