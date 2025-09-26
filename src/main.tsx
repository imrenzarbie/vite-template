import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { router } from "./routes/index.tsx";

const client = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={client}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>
);
