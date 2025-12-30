import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, ArrowRight, Plus, FileText, DollarSign } from "lucide-react";
import React from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useBills } from "../hooks/use-bills";
import { useGroup } from "../hooks/use-group";
import { useGroups } from "../hooks/use-groups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const numericGroupId = groupId ? parseInt(groupId) : null;

    const { groups, isLoading: groupsLoading } = useGroups();
    const { group, isLoading: groupLoading } = useGroup(numericGroupId);
    const { bills = [], isLoading: billsLoading } = useBills(numericGroupId);

    // Calculate totals safely
    const totalOwed = React.useMemo(() => {
        return bills.reduce((sum, bill) => sum + bill.total_amount, 0);
    }, [bills]);

    if (groupsLoading) {
        return <div className="p-8">Loading...</div>;
    }

    // --- VIEW 1: LIST ALL GROUPS ---
    if (!groupId) {
        return (
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">My Groups</h1>
                        <p className="text-muted-foreground">
                            Select a group to view bills
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((g) => (
                        <Card
                            key={g.id}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate(`/dashboard/${g.id}`)}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{g.name}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/dashboard/${g.id}`);
                                    }}>
                                    View Bills{" "}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add New Group Card (Optional) */}
                    <Card
                        className="flex flex-col items-center justify-center border-dashed cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate("/import")}>
                        <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="font-medium text-muted-foreground">
                            Import / Create Group
                        </span>
                    </Card>
                </div>
            </div>
        );
    }

    // --- VIEW 2: SPECIFIC GROUP ---
    if (groupLoading || billsLoading) {
        return <div className="p-8">Loading group details...</div>;
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">
                        {group?.name || "Group"}
                    </h1>
                    <p className="text-muted-foreground">
                        {group?.members?.length ?? 0} members • {bills.length}{" "}
                        bills
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/dashboard")}>
                        <Users className="w-4 h-4 mr-2" /> All Groups
                    </Button>
                    <Button onClick={() => navigate(`/import/${groupId}`)}>
                        <FileText className="w-4 h-4 mr-2" /> Import Bill
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Bills
                        </CardTitle>
                        <FileText className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bills.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Amount
                        </CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${(totalOwed / 100).toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Members
                        </CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {group?.members?.length ?? 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Members List */}
            <Card>
                <CardHeader>
                    <CardTitle>Group Members</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {group?.members?.map((member) => (
                            <Badge
                                key={member.id}
                                variant="secondary"
                                className="text-sm">
                                {member.username}
                                {member.role === "admin" && (
                                    <span className="ml-1 text-xs">
                                        (Admin)
                                    </span>
                                )}
                            </Badge>
                        ))}
                        {(!group?.members || group.members.length === 0) && (
                            <span className="text-muted-foreground text-sm">
                                No members found.
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Bills List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Bills</CardTitle>
                    <Button variant="link" asChild>
                        <Link to={`/bills?groupId=${groupId}`}>View All</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {bills.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No bills yet. Import your first bill!
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {bills.slice(0, 5).map((bill) => (
                                <div
                                    key={bill.id}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() =>
                                        navigate(`/bill/${bill.id}`)
                                    }>
                                    <div>
                                        <div className="font-medium">
                                            {bill.title}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {/* {format(
                                                new Date(bill.created_at),
                                                "MMM d, yyyy"
                                            )} */}
                                        </div>
                                    </div>
                                    <div className="font-bold">
                                        ${(bill.total_amount / 100).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
