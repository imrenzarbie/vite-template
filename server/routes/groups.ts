import { Hono } from "hono";
import { db } from "../database";
import { Group, CreateGroupRequest, UpdateGroupRequest } from "../types";

export const groups = new Hono();

groups.get("/", (c) => {
    const groups = db.prepare("SELECT * FROM groups").all() as Group[];
    return c.json(groups);
});

groups.get("/:id", (c) => {
    const id = c.req.param("id");
    const group = db.prepare("SELECT * FROM groups WHERE id = ?").get(id) as
        | Group
        | undefined;
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

groups.post("/", async (c) => {
    const body = await c.req.json<CreateGroupRequest>();
    const res = db
        .prepare("INSERT INTO groups (name, parent_group_id) VALUES (?, ?)")
        .run(body.name, body.parent_group_id || null);

    return c.json({ id: res.lastInsertRowid, ...body }, 201);
});

groups.patch("/:id", async (c) => {
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

groups.delete("/:id", (c) => {
    const id = c.req.param("id");
    db.prepare("DELETE FROM groups WHERE id = ?").run(id);
    return c.json({ message: "Group deleted" });
});

groups.post("/:id/members", async (c) => {
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
