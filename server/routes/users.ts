import { Hono } from "hono";
import {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    GroupMember,
} from "../types";
import { db } from "../database";

export const users = new Hono();

users.get("/", (c) => {
    const users = db.prepare("SELECT * FROM users").all() as User[];
    return c.json(users);
});

users.post("/", async (c) => {
    const body = await c.req.json<CreateUserRequest>();
    const res = db
        .prepare("INSERT INTO users (username, email) VALUES (?, ?)")
        .run(body.username, body.email);

    return c.json({ id: res.lastInsertRowid, ...body }, 201);
});

users.patch("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json<UpdateUserRequest>();

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
        | User
        | undefined;
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

users.delete("/:id", (c) => {
    const id = c.req.param("id");
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return c.json({ message: "User deleted" });
});

users.get("/:id", (c) => {
    const userId = c.req.param("id");
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as
        | User
        | undefined;

    if (!user) return c.json({ error: "User not found" }, 404);

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
