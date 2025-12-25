import { splitCents } from "../../lib/currency";
import { Item, Member, SubGroup, Debt } from "../types";

export function calculateDebts(
    items: Item[],
    members: Member[],
    subGroups: SubGroup[]
): Debt[] {
    // Track balances in cents
    const memberBalances = new Map<string, number>();
    members.forEach((m) => memberBalances.set(m.id, 0));

    // Process each item
    items.forEach((item) => {
        const assigneeIds = expandAssignees(item.assignedTo, subGroups);

        if (assigneeIds.length === 0) {
            throw new Error(`Item "${item.description}" has no assignees`);
        }

        // Split amount among assignees
        const splitAmounts = splitCents(item.amount, assigneeIds.length);

        // Payer gets credited the full amount
        const payerBalance = memberBalances.get(item.paidBy) || 0;
        memberBalances.set(item.paidBy, payerBalance + item.amount);

        // Each assignee gets debited their share
        assigneeIds.forEach((memberId, index) => {
            const balance = memberBalances.get(memberId) || 0;
            memberBalances.set(memberId, balance - splitAmounts[index]);
        });
    });

    // Generate debt matrix using minimum number of transactions
    const debts: Debt[] = [];
    const memberIds = Array.from(memberBalances.keys());

    // Create arrays of debtors and creditors
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    memberIds.forEach((id) => {
        const balance = memberBalances.get(id)!;
        if (balance < 0) {
            debtors.push({ id, amount: -balance });
        } else if (balance > 0) {
            creditors.push({ id, amount: balance });
        }
    });

    // Match debtors with creditors
    let i = 0,
        j = 0;
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const settlementAmount = Math.min(debtor.amount, creditor.amount);

        debts.push({
            from: debtor.id,
            to: creditor.id,
            amount: settlementAmount,
        });

        debtor.amount -= settlementAmount;
        creditor.amount -= settlementAmount;

        if (debtor.amount === 0) i++;
        if (creditor.amount === 0) j++;
    }

    return debts;
}

function expandAssignees(assignees: string[], subGroups: SubGroup[]): string[] {
    const memberIds = new Set<string>();

    assignees.forEach((id) => {
        const subGroup = subGroups.find((sg) => sg.id === id);
        if (subGroup) {
            subGroup.memberIds.forEach((mid) => memberIds.add(mid));
        } else {
            memberIds.add(id);
        }
    });

    return Array.from(memberIds);
}
