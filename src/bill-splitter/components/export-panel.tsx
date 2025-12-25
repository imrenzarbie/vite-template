// src/components/ExportPanel.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCents } from "@/lib/currency";
import { calculateDebts } from "../lib/calculate-engine";
import { useStore } from "../store";

export function ExportPanel() {
    const { items, members, subGroups } = useStore();

    const exportToMarkdown = () => {
        const memberArray = Object.values(members);
        const itemArray = Object.values(items);
        const debts = calculateDebts(
            itemArray,
            memberArray,
            Object.values(subGroups)
        );

        let markdown = "# Splitwise Report\n\n";
        markdown += "## Items\n";
        markdown += "| Description | Amount | Paid By | Assigned To |\n";
        markdown += "|-------------|--------|---------|-------------|\n";

        itemArray.forEach((item) => {
            const assigneeNames = item.assignedTo
                .map((id) => members[id]?.name || subGroups[id]?.name || id)
                .join(", ");
            markdown += `| ${item.description} | ${formatCents(
                item.amount
            )} | ${members[item.paidBy]?.name} | ${assigneeNames} |\n`;
        });

        markdown += "\n## Debts\n";
        markdown += "| From | To | Amount |\n";
        markdown += "|------|----|--------|\n";
        debts.forEach((debt) => {
            markdown += `| ${members[debt.from]?.name} | ${
                members[debt.to]?.name
            } | ${formatCents(debt.amount)} |\n`;
        });

        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "splitwise-report.md";
        a.click();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Export</CardTitle>
            </CardHeader>
            <CardContent className="space-x-2">
                <Button onClick={exportToMarkdown}>Export Markdown</Button>
                <Button disabled>Export PDF (requires additional setup)</Button>
            </CardContent>
        </Card>
    );
}
