import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import Database from "better-sqlite3";
import {
    User,
    Bill,
    BillItem,
    CreateUserRequest,
    GroupMember,
    UpdateUserRequest,
    UpdateGroupRequest,
    CreateGroupRequest,
    Group,
} from "./types";

const app = new Hono();
const db = new Database("database.db");

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    default_group_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (default_group_id) REFERENCES groups(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_group_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (parent_group_id) REFERENCES groups(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    raw_markdown TEXT,
    total_amount REAL DEFAULT 0,
    created_by INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bill_item_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_item_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    UNIQUE (bill_item_id, user_id),
    FOREIGN KEY (bill_item_id) REFERENCES bill_items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_bills_group ON bills(group_id);
  CREATE INDEX IF NOT EXISTS idx_bill_items_bill ON bill_items(bill_id);
  CREATE INDEX IF NOT EXISTS idx_assignments_item ON bill_item_assignments(bill_item_id);
  CREATE INDEX IF NOT EXISTS idx_assignments_user ON bill_item_assignments(user_id);
`);

app.use("/*", cors());

app.get("/api/users", (c) => {
    const users = db.prepare("SELECT * FROM users").all() as User[];
    return c.json(users);
});

// 1. Typed Request Body
app.post("/api/users", async (c) => {
    const body = await c.req.json<CreateUserRequest>();

    // TypeScript now knows body has username and email
    const res = db
        .prepare("INSERT INTO users (username, email) VALUES (?, ?)")
        .run(body.username, body.email);

    return c.json({ id: res.lastInsertRowid, ...body }, 201);
});
// Update user
app.patch("/api/users/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json<UpdateUserRequest>();

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User;
    if (!user) return c.json({ error: "User not found" }, 404);

    db.prepare(
        `
    UPDATE users
    SET username = COALESCE(?, username),
        email = COALESCE(?, email),
        default_group_id = COALESCE(?, default_group_id)
    WHERE id = ?
  `
    ).run(body.username, body.email, body.default_group_id, id);

    return c.json({ message: "User updated" });
});

// Delete user
app.delete("/api/users/:id", (c) => {
    const id = c.req.param("id");
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return c.json({ message: "User deleted" });
});

// 2. Typed Response
app.get("/api/users/:id", (c) => {
    const userId = c.req.param("id");
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as
        | User
        | undefined;

    if (!user) return c.json({ error: "User not found" }, 404);

    // Logic for default group
    const activeGroupId =
        user.default_group_id ||
        (
            db
                .prepare(
                    "SELECT group_id FROM group_members WHERE user_id = ? LIMIT 1"
                )
                .get(user.id) as GroupMember | undefined
        )?.group_id;

    return c.json({ ...user, active_group_id: activeGroupId });
});

/**
 * GROUP CRUD
 */

// List all groups
app.get("/api/groups", (c) => {
    const groups = db.prepare("SELECT * FROM groups").all() as Group[];
    return c.json(groups);
});

// Get single group with members
app.get("/api/groups/:id", (c) => {
    const id = c.req.param("id");
    const group = db
        .prepare("SELECT * FROM groups WHERE id = ?")
        .get(id) as Group;
    if (!group) return c.json({ error: "Group not found" }, 404);

    const members = db
        .prepare(
            `
    SELECT u.id, u.username, gm.role
    FROM users u
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = ?
  `
        )
        .all(id);

    return c.json({ ...group, members });
});

// Create group
app.post("/api/groups", async (c) => {
    const body = await c.req.json<CreateGroupRequest>();
    const res = db
        .prepare("INSERT INTO groups (name, parent_group_id) VALUES (?, ?)")
        .run(body.name, body.parent_group_id || null);

    return c.json({ id: res.lastInsertRowid, ...body }, 201);
});

// Update group
app.patch("/api/groups/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json<UpdateGroupRequest>();

    db.prepare(
        `
    UPDATE groups
    SET name = COALESCE(?, name),
        parent_group_id = COALESCE(?, parent_group_id)
    WHERE id = ?
  `
    ).run(body.name, body.parent_group_id, id);

    return c.json({ message: "Group updated" });
});

// Delete group
app.delete("/api/groups/:id", (c) => {
    const id = c.req.param("id");
    db.prepare("DELETE FROM groups WHERE id = ?").run(id);
    return c.json({ message: "Group deleted" });
});

// Add member to group
app.post("/api/groups/:id/members", async (c) => {
    const groupId = c.req.param("id");
    const { user_id, role } = await c.req.json<{
        user_id: number;
        role?: string;
    }>();

    db.prepare(
        "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)"
    ).run(groupId, user_id, role || "member");

    return c.json({ message: "Member added" }, 201);
});

// 3. Typed Bill Splitting Logic
app.get("/api/bills/:id", (c) => {
    const billId = c.req.param("id");

    const bill = db
        .prepare("SELECT * FROM bills WHERE id = ?")
        .get(billId) as Bill;

    // Get items and cast to BillItem array
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

serve({ fetch: app.fetch, port: 3001 });
