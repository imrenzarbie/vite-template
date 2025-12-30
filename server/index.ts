import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { users } from "./routes/users";
import { bills } from "./routes/bills";
import { groups } from "./routes/groups";

const app = new Hono();

app.use("/*", cors());

app.route("/api/users", users);
app.route("/api/groups", groups);
app.route("/api/bills", bills);

serve({ fetch: app.fetch, port: 3001 });
