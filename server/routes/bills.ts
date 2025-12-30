import { Hono } from "hono";
import { Bill } from "../types"; // Assuming this exists based on your imports
import { db } from "../database";

// --- 1. Strictly Typed Request Interfaces ---

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

// --- 2. Database Query Result Interfaces ---

interface BillItemRow {
    id: number;
    name: string;
    amount: number;
    quantity: number;
    // Assignment details
    user_id: number | null;
    username: string | null; // Added username
    paid_date: string | null;
}

interface BillListRow extends Bill {
    created_by_username: string;
}

export const bills = new Hono();

/**
 * GET /:id
 * Returns full bill details, items, and WHO is assigned to them (names).
 */
bills.get("/:id", (c) => {
    const billId = c.req.param("id");

    // 1. Get Bill Details
    const bill = db.prepare("SELECT * FROM bills WHERE id = ?").get(billId) as
        | Bill
        | undefined;

    if (!bill) return c.json({ error: "Bill not found" }, 404);

    // 2. Get Items + Assignments + Usernames
    // MISSING FIX: Added JOIN users to get the username
    const rawResults = db
        .prepare(
            `
            SELECT
                bi.id,
                bi.name,
                bi.amount,
                bi.quantity,
                bia.user_id,
                bia.paid_date,
                u.username
            FROM bill_items bi
            LEFT JOIN bill_item_assignments bia ON bi.id = bia.bill_item_id
            LEFT JOIN users u ON bia.user_id = u.id
            WHERE bi.bill_id = ?
            ORDER BY bi.id
            `
        )
        .all(billId) as BillItemRow[];

    // 3. Group flat SQL results into nested JSON
    const formattedItems = rawResults.reduce(
        (acc, row) => {
            const existingItem = acc.find((item) => item.id === row.id);

            // Construct assignment object if a user exists
            const assignment =
                row.user_id !== null && row.username !== null
                    ? {
                          user_id: row.user_id,
                          username: row.username,
                          paid_date: row.paid_date,
                      }
                    : null;

            if (existingItem) {
                if (assignment) {
                    existingItem.assignments.push(assignment);
                }
            } else {
                acc.push({
                    id: row.id,
                    name: row.name,
                    amount: row.amount,
                    quantity: row.quantity,
                    assignments: assignment ? [assignment] : [],
                });
            }
            return acc;
        },
        [] as Array<{
            id: number;
            name: string;
            amount: number;
            quantity: number;
            assignments: Array<{
                user_id: number;
                username: string;
                paid_date: string | null;
            }>;
        }>
    );

    return c.json({ ...bill, items: formattedItems });
});

/**
 * POST /
 * Creates a bill, its items, and assigns users.
 */
bills.post("/", async (c) => {
    const body = await c.req.json<CreateBillRequest>();

    if (!body.title || !body.group_id || !body.created_by || !body.items) {
        return c.json({ error: "Missing required fields" }, 400);
    }

    try {
        const totalAmount = body.items.reduce(
            (sum, item) => sum + item.amount,
            0
        );

        const newBillId = db.transaction(() => {
            // 1. Insert Bill
            const billRes = db
                .prepare(
                    `INSERT INTO bills (title, group_id, raw_markdown, total_amount, created_by)
                 VALUES (?, ?, ?, ?, ?)`
                )
                .run(
                    body.title,
                    body.group_id,
                    body.raw_markdown || null,
                    totalAmount,
                    body.created_by
                );

            // FIX: Convert BigInt to Number immediately
            const billId = Number(billRes.lastInsertRowid);

            // 2. Insert Items
            const insertItemStmt = db.prepare(
                `INSERT INTO bill_items (bill_id, name, amount, quantity)
                 VALUES (?, ?, ?, ?)`
            );

            const insertAssignmentStmt = db.prepare(
                `INSERT INTO bill_item_assignments (bill_item_id, user_id)
                 VALUES (?, ?)`
            );

            for (const item of body.items) {
                const itemRes = insertItemStmt.run(
                    billId,
                    item.name,
                    item.amount,
                    item.quantity || 1
                );

                // FIX: Convert BigInt to Number
                const itemId = Number(itemRes.lastInsertRowid);

                const uniqueUserIds = [...new Set(item.assigned_user_ids)];

                for (const userId of uniqueUserIds) {
                    insertAssignmentStmt.run(itemId, userId);
                }
            }

            return billId;
        })();

        return c.json(
            { id: newBillId, message: "Bill created successfully" },
            201
        );
    } catch (error: any) {
        console.error("Create Bill Error:", error);

        // Handle Foreign Key Errors specifically
        if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
            return c.json(
                { error: "Invalid Group ID or User ID provided." },
                400
            );
        }

        // Handle BigInt serialization errors specifically
        if (error instanceof TypeError) {
            return c.json({ error: "Server serialization error." }, 500);
        }

        return c.json({ error }, 500);
    }
});

/**
 * GET /
 * List bills for a group.
 */
bills.get("/", (c) => {
    const groupId = c.req.query("groupId");
    if (!groupId) return c.json({ error: "groupId required" }, 400);

    // MISSING FIX: Join users to show who created the bill
    const results = db
        .prepare(
            `SELECT b.*, u.username as created_by_username
             FROM bills b
             JOIN users u ON b.created_by = u.id
             WHERE b.group_id = ?
             ORDER BY b.created_at DESC`
        )
        .all(groupId) as BillListRow[];

    return c.json(results);
});

export default bills;
