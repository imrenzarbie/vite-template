import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import Database from "better-sqlite3";

const app = new Hono();
const db = new Database("database.db");

// Initialize table
db.exec("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, msg TEXT)");

app.use("/*", cors());

app.get("/api/data", (c) => {
    const data = db.prepare("SELECT * FROM logs").all();
    return c.json({ data });
});

serve({ fetch: app.fetch, port: 3001 });
console.log("Server running on http://localhost:3001");
