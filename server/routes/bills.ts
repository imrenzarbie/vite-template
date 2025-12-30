import { Hono } from "hono";
import { Bill, BillItem } from "../types";
import { db } from "../database";

export const bills = new Hono();

bills.get("/:id", (c) => {
    const billId = c.req.param("id");

    const bill = db.prepare("SELECT * FROM bills WHERE id = ?").get(billId) as
        | Bill
        | undefined;
    if (!bill) return c.json({ error: "Bill not found" }, 404);

    const items = db
        .prepare(
            `
    SELECT bi.*, GROUP_CONCAT(bia.user_id) as user_csv
    FROM bill_items bi
    LEFT JOIN bill_item_assignments bia ON bi.id = bia.bill_item_id
    WHERE bi.bill_id = ?
    GROUP BY bi.id
  `
        )
        .all(billId) as (BillItem & { user_csv: string | null })[];

    const formattedItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        assigned_user_ids: item.user_csv
            ? item.user_csv.split(",").map(Number)
            : [],
    }));

    return c.json({ ...bill, items: formattedItems });
});
