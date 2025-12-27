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

const DebtMatrixTable = ({ debts, members }: any) => (
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
                    {debts.map((debt: any, idx: number) => (
                        <TableRow key={`${debt.from}-${debt.to}-${idx}`}>
                            <TableCell>
                                {members[debt.from]?.name ?? "Unknown"}
                            </TableCell>
                            <TableCell>
                                {members[debt.to]?.name ?? "Unknown"}
                            </TableCell>
                            <TableCell className="font-semibold text-destructive">
                                {formatCents(debt.amount)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

export default DebtMatrixTable;
