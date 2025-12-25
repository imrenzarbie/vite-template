import { Item } from "../types";

export function validateItems(
    items: Item[],
    totalAmountCents: number
): boolean {
    const sum = items.reduce((acc, item) => acc + item.amount, 0);
    return sum === totalAmountCents;
}
