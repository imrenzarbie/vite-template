import { Hono } from "hono";
import { Bill } from "../types";
import { db } from "../database";

export const bills = new Hono();

bills.get("/:id", (c) => {
    const billId = c.req.param("id");

    const bill = db.prepare("SELECT * FROM bills WHERE id = ?").get(billId) as
        | Bill
        | undefined;
    if (!bill) return c.json({ error: "Bill not found" }, 404);

    const rawResults = db
        .prepare(
            `
      SELECT
        bi.id,
        bi.name,
        bi.amount,
        bi.quantity,
        bia.user_id,
        bia.paid_date
      FROM bill_items bi
      LEFT JOIN bill_item_assignments bia ON bi.id = bia.bill_item_id
      WHERE bi.bill_id = ?
      ORDER BY bi.id
      `
        )
        .all(billId) as Array<{
        id: number;
        name: string;
        amount: number;
        quantity: number;
        user_id: number | null;
        paid_date: string | null;
    }>;

    const formattedItems = rawResults.reduce(
        (acc, row) => {
            const existingItem = acc.find((item) => item.id === row.id);
            if (existingItem) {
                if (row.user_id !== null) {
                    existingItem.assignments.push({
                        user_id: row.user_id,
                        paid_date: row.paid_date,
                    });
                }
            } else {
                acc.push({
                    id: row.id,
                    name: row.name,
                    amount: row.amount,
                    quantity: row.quantity,
                    assignments:
                        row.user_id !== null
                            ? [
                                  {
                                      user_id: row.user_id,
                                      paid_date: row.paid_date,
                                  },
                              ]
                            : [],
                });
            }
            return acc;
        },
        [] as Array<{
            id: number;
            name: string;
            amount: number;
            quantity: number;
            assignments: Array<{ user_id: number; paid_date: string | null }>;
        }>
    );

    return c.json({ ...bill, items: formattedItems });
});
