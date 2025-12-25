// src/components/Dashboard.tsx
import { useStore } from "../store";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCents } from "@/lib/currency";
import { calculateDebts } from "../lib/calculate-engine";

export function Dashboard() {
    const { items, members, subGroups } = useStore();

    const memberArray = Object.values(members);
    const itemArray = Object.values(items);
    const debts = calculateDebts(
        itemArray,
        memberArray,
        Object.values(subGroups)
    );

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Item Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Paid By</TableHead>
                                <TableHead>Assigned To</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {itemArray.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>
                                        {formatCents(item.amount)}
                                    </TableCell>
                                    <TableCell>
                                        {members[item.paidBy]?.name ||
                                            "Unknown"}
                                    </TableCell>
                                    <TableCell>
                                        {item.assignedTo
                                            .map(
                                                (id) =>
                                                    members[id]?.name ||
                                                    subGroups[id]?.name ||
                                                    id
                                            )
                                            .join(", ")}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Debt Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {debts.map((debt, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        {members[debt.from]?.name}
                                    </TableCell>
                                    <TableCell>
                                        {members[debt.to]?.name}
                                    </TableCell>
                                    <TableCell>
                                        {formatCents(debt.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
