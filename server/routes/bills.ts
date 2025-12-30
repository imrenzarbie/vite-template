import { Hono } from "hono";
import { Bill } from "../types";
import { db } from "../database";

// Define TypeScript interfaces for the request payload
interface CreateBillItemRequest {
    name: string;
    amount: number;
    quantity: number;
    assigned_user_ids: number[];
}

interface CreateBillRequest {
    title: string;
    group_id: number;
    raw_markdown?: string;
    created_by: number;
    items: CreateBillItemRequest[];
}

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

bills.post("/", async (c) => {
    // ✅ Use generic type parameter instead of 'any'
    const body = await c.req.json<CreateBillRequest>();

    // Validate required fields
    if (!body.title || !body.group_id || !body.created_by || !body.items) {
        return c.json({ error: "Missing required fields" }, 400);
    }

    try {
        // ✅ Type-safe reduce with proper type inference
        const totalAmount = body.items.reduce(
            (sum, item) => sum + item.amount,
            0
        );

        // Transaction to create bill, items, and assignments
        const result = db.transaction(() => {
            const billRes = db
                .prepare(
                    "INSERT INTO bills (title, group_id, raw_markdown, total_amount, created_by) VALUES (?, ?, ?, ?, ?)"
                )
                .run(
                    body.title,
                    body.group_id,
                    body.raw_markdown || null,
                    totalAmount,
                    body.created_by
                );

            const billId = billRes.lastInsertRowid;

            for (const item of body.items) {
                const itemRes = db
                    .prepare(
                        "INSERT INTO bill_items (bill_id, name, amount, quantity) VALUES (?, ?, ?, ?)"
                    )
                    .run(billId, item.name, item.amount, item.quantity || 1);

                const itemId = itemRes.lastInsertRowid;

                for (const userId of item.assigned_user_ids) {
                    db.prepare(
                        "INSERT INTO bill_item_assignments (bill_item_id, user_id) VALUES (?, ?)"
                    ).run(itemId, userId);
                }
            }

            return billId;
        })();

        return c.json(
            { id: result, message: "Bill created successfully" },
            201
        );
    } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to create bill" }, 500);
    }
});

bills.get("/", (c) => {
    const groupId = c.req.query("groupId");
    if (!groupId) return c.json({ error: "groupId required" }, 400);

    const bills = db
        .prepare(
            "SELECT * FROM bills WHERE group_id = ? ORDER BY created_at DESC"
        )
        .all(groupId) as Bill[];
    return c.json(bills);
});

export default bills;
