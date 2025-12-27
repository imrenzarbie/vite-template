import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { formatCents } from "@/lib/currency";
import { Table } from "lucide-react";

const ItemBreakdownTable = ({ items, members, subGroups }: any) => (
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
                    {items.map((item: any) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">
                                {item.description}
                            </TableCell>
                            <TableCell>{formatCents(item.amount)}</TableCell>
                            <TableCell>
                                {members[item.paidBy]?.name ?? "Unknown"}
                            </TableCell>
                            <TableCell>
                                {item.assignedTo
                                    .map(
                                        (id: string) =>
                                            members[id]?.name ??
                                            subGroups[id]?.name ??
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
);

export default ItemBreakdownTable;
