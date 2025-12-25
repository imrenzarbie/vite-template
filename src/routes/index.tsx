import App from "@/App";
import BillSplitterPage from "@/bill-splitter/bill-splitter-page";
import DashboardPage from "@/features/dashboard/dashboard-page";
import { RootLayout } from "@/layouts/root-layout";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                path: "/",
                element: <App />,
            },
            {
                path: "/dashboard",
                element: <DashboardPage />,
            },
            {
                path: "/bill-splitter",
                element: <BillSplitterPage />,
            },
        ],
    },
]);
