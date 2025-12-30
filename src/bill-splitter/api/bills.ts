import { CreateBillPayload } from "../types";

export const billsApi = {
    create: async (payload: CreateBillPayload) => {
        const response = await fetch("/api/bills", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: "Unknown error" }));
            throw new Error(error.error || "Failed to create bill");
        }

        return response.json();
    },
    getByGroup: async (groupId: number) => {
        const response = await fetch(`/api/bills?groupId=${groupId}`);
        if (!response.ok) throw new Error("Failed to fetch bills");
        return response.json();
    },
};
