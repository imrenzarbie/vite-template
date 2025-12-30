// src/components/GroupManager.test.tsx

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import GroupManager from "../components/group-manager";
import "@testing-library/jest-dom";

const mockGroups = [
    {
        id: 1,
        name: "Trip Group",
        parent_group_id: null,
        created_at: "2024-01-01",
    },
    { id: 2, name: "Drivers", parent_group_id: 1, created_at: "2024-01-02" },
];

const mockGroupWithMembers = {
    id: 1,
    name: "Trip Group",
    parent_group_id: null,
    created_at: "2024-01-01",
    members: [
        { id: 1, username: "Alice", email: "alice@test.com", role: "admin" },
        { id: 2, username: "Bob", email: "bob@test.com", role: "member" },
    ],
};

const mockUsers = [
    {
        id: 1,
        username: "Alice",
        email: "alice@test.com",
        default_group_id: null,
        created_at: "2024-01-01",
    },
    {
        id: 2,
        username: "Bob",
        email: "bob@test.com",
        default_group_id: null,
        created_at: "2024-01-01",
    },
    {
        id: 3,
        username: "Charlie",
        email: "charlie@test.com",
        default_group_id: null,
        created_at: "2024-01-01",
    },
];

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
});

describe("GroupManager", () => {
    describe("Initial State", () => {
        it("renders the component with no group selected", async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
                (url: string) => {
                    if (url.includes("/groups")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: [] }),
                        });
                    }
                    if (url.includes("/users")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: [] }),
                        });
                    }
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            );

            render(<GroupManager />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(
                    screen.getByTestId("no-group-selected")
                ).toBeInTheDocument();
            });
        });

        it("shows loading state while fetching groups", async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(
                            () =>
                                resolve({
                                    ok: true,
                                    json: () => Promise.resolve({ data: [] }),
                                }),
                            100
                        )
                    )
            );

            render(<GroupManager />, { wrapper: createWrapper() });

            expect(screen.getByTestId("groups-loading")).toBeInTheDocument();
        });

        it("displays error alert when fetch fails", async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
                (url: string) => {
                    if (url.includes("/groups")) {
                        return Promise.resolve({
                            ok: false,
                            json: () => Promise.resolve({}),
                        });
                    }
                    if (url.includes("/users")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: [] }),
                        });
                    }
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            );

            render(<GroupManager />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByTestId("error-alert")).toBeInTheDocument();
            });
        });
    });

    describe("Group Creation", () => {
        it("creates a new group when form is submitted", async () => {
            const user = userEvent.setup();
            (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
                (url: string, options?: RequestInit) => {
                    if (url.includes("/groups") && options?.method === "POST") {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ id: 3 }),
                        });
                    }
                    if (url.includes("/groups/3")) {
                        return Promise.resolve({
                            ok: true,
                            json: () =>
                                Promise.resolve({
                                    data: {
                                        ...mockGroupWithMembers,
                                        id: 3,
                                        name: "New Group",
                                        members: [],
                                    },
                                }),
                        });
                    }
                    if (url.includes("/groups")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockGroups }),
                        });
                    }
                    if (url.includes("/users")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockUsers }),
                        });
                    }
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            );

            render(<GroupManager />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(
                    screen.getByTestId("new-group-input")
                ).toBeInTheDocument();
            });

            const input = screen.getByTestId("new-group-input");
            const button = screen.getByTestId("create-group-button");

            await user.type(input, "New Group");
            await user.click(button);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining("/groups"),
                    expect.objectContaining({
                        method: "POST",
                        body: JSON.stringify({ name: "New Group" }),
                    })
                );
            });
        });

        it("does not create group when name is empty", async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
                (url: string) => {
                    if (url.includes("/groups")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: [] }),
                        });
                    }
                    if (url.includes("/users")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: [] }),
                        });
                    }
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            );

            render(<GroupManager />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(
                    screen.getByTestId("create-group-button")
                ).toBeInTheDocument();
            });

            const button = screen.getByTestId("create-group-button");
            expect(button).toBeDisabled();
        });
    });

    describe("Group Selection", () => {
        it("displays group list and allows selection", async () => {
            const user = userEvent.setup();
            (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
                (url: string) => {
                    if (url.includes("/groups/1")) {
                        return Promise.resolve({
                            ok: true,
                            json: () =>
                                Promise.resolve({ data: mockGroupWithMembers }),
                        });
                    }
                    if (url.includes("/groups")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockGroups }),
                        });
                    }
                    if (url.includes("/users")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockUsers }),
                        });
                    }
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            );

            render(<GroupManager />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(
                    screen.getByTestId("group-button-1")
                ).toBeInTheDocument();
            });

            await user.click(screen.getByTestId("group-button-1"));

            await waitFor(() => {
                expect(
                    screen.queryByTestId("no-group-selected")
                ).not.toBeInTheDocument();
            });
        });
    });

    describe("Member Management", () => {
        it("displays members when group is selected", async () => {
            const user = userEvent.setup();
            (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
                (url: string) => {
                    if (url.includes("/groups/1")) {
                        return Promise.resolve({
                            ok: true,
                            json: () =>
                                Promise.resolve({ data: mockGroupWithMembers }),
                        });
                    }
                    if (url.includes("/groups")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockGroups }),
                        });
                    }
                    if (url.includes("/users")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockUsers }),
                        });
                    }
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            );

            render(<GroupManager />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(
                    screen.getByTestId("group-button-1")
                ).toBeInTheDocument();
            });

            await user.click(screen.getByTestId("group-button-1"));

            await waitFor(() => {
                expect(screen.getByTestId("member-1")).toBeInTheDocument();
                expect(screen.getByTestId("member-2")).toBeInTheDocument();
            });
        });

        it("removes member when delete button is clicked", async () => {
            const user = userEvent.setup();
            (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
                (url: string, options?: RequestInit) => {
                    if (
                        url.includes("/members/1") &&
                        options?.method === "DELETE"
                    ) {
                        return Promise.resolve({ ok: true });
                    }
                    if (url.includes("/groups/1")) {
                        return Promise.resolve({
                            ok: true,
                            json: () =>
                                Promise.resolve({ data: mockGroupWithMembers }),
                        });
                    }
                    if (url.includes("/groups")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockGroups }),
                        });
                    }
                    if (url.includes("/users")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockUsers }),
                        });
                    }
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            );

            render(<GroupManager />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(
                    screen.getByTestId("group-button-1")
                ).toBeInTheDocument();
            });

            await user.click(screen.getByTestId("group-button-1"));

            await waitFor(() => {
                expect(
                    screen.getByTestId("remove-member-1")
                ).toBeInTheDocument();
            });

            await user.click(screen.getByTestId("remove-member-1"));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining("/groups/1/members/1"),
                    expect.objectContaining({ method: "DELETE" })
                );
            });
        });
    });

    describe("Subgroup Management", () => {
        it("displays existing subgroups", async () => {
            const user = userEvent.setup();
            (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
                (url: string) => {
                    if (url.includes("/groups/1")) {
                        return Promise.resolve({
                            ok: true,
                            json: () =>
                                Promise.resolve({ data: mockGroupWithMembers }),
                        });
                    }
                    if (url.includes("/groups")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockGroups }),
                        });
                    }
                    if (url.includes("/users")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockUsers }),
                        });
                    }
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            );

            render(<GroupManager />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(
                    screen.getByTestId("group-button-1")
                ).toBeInTheDocument();
            });

            await user.click(screen.getByTestId("group-button-1"));

            await waitFor(() => {
                expect(
                    screen.getByTestId("subgroups-list")
                ).toBeInTheDocument();
                expect(
                    within(screen.getByTestId("subgroups-list")).getByText(
                        "Drivers"
                    )
                ).toBeInTheDocument();
            });
        });

        it("creates subgroup with selected members", async () => {
            const user = userEvent.setup();
            (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
                (url: string, options?: RequestInit) => {
                    if (url.includes("/groups") && options?.method === "POST") {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ id: 4 }),
                        });
                    }
                    if (url.includes("/groups/1")) {
                        return Promise.resolve({
                            ok: true,
                            json: () =>
                                Promise.resolve({ data: mockGroupWithMembers }),
                        });
                    }
                    if (url.includes("/groups")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockGroups }),
                        });
                    }
                    if (url.includes("/users")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockUsers }),
                        });
                    }
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            );

            render(<GroupManager />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(
                    screen.getByTestId("group-button-1")
                ).toBeInTheDocument();
            });

            await user.click(screen.getByTestId("group-button-1"));

            await waitFor(() => {
                expect(
                    screen.getByTestId("subgroup-name-input")
                ).toBeInTheDocument();
            });

            await user.type(
                screen.getByTestId("subgroup-name-input"),
                "New Subgroup"
            );
            await user.click(screen.getByTestId("checkbox-member-1"));
            await user.click(screen.getByTestId("create-subgroup-button"));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining("/groups"),
                    expect.objectContaining({
                        method: "POST",
                        body: JSON.stringify({
                            name: "New Subgroup",
                            parent_group_id: 1,
                        }),
                    })
                );
            });
        });

        it("disables create subgroup button when no name or members selected", async () => {
            const user = userEvent.setup();
            (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
                (url: string) => {
                    if (url.includes("/groups/1")) {
                        return Promise.resolve({
                            ok: true,
                            json: () =>
                                Promise.resolve({ data: mockGroupWithMembers }),
                        });
                    }
                    if (url.includes("/groups")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockGroups }),
                        });
                    }
                    if (url.includes("/users")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockUsers }),
                        });
                    }
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            );

            render(<GroupManager />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(
                    screen.getByTestId("group-button-1")
                ).toBeInTheDocument();
            });

            await user.click(screen.getByTestId("group-button-1"));

            await waitFor(() => {
                expect(
                    screen.getByTestId("create-subgroup-button")
                ).toBeDisabled();
            });
        });
    });

    describe("Group Deletion", () => {
        it("deletes group when delete button is clicked", async () => {
            const user = userEvent.setup();
            (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
                (url: string, options?: RequestInit) => {
                    if (
                        url.includes("/groups/1") &&
                        options?.method === "DELETE"
                    ) {
                        return Promise.resolve({ ok: true });
                    }
                    if (url.includes("/groups")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockGroups }),
                        });
                    }
                    if (url.includes("/users")) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ data: mockUsers }),
                        });
                    }
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            );

            render(<GroupManager />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(
                    screen.getByTestId("delete-group-1")
                ).toBeInTheDocument();
            });

            await user.click(screen.getByTestId("delete-group-1"));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining("/groups/1"),
                    expect.objectContaining({ method: "DELETE" })
                );
            });
        });
    });
});
