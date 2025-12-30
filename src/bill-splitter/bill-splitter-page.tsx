import { Toaster } from "sonner";
import ExportPanel from "./components/export-panel";
import InputPanel from "./components/input-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "./components/dashboard";
import GroupManager from "./components/group-manager";

const BillSplitterPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6 max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Bill Splitter</h1>
                    <p className="text-muted-foreground mt-2">
                        Easily split expenses among friends and groups
                    </p>
                </div>

                <Tabs defaultValue="input" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="input">Input Data</TabsTrigger>
                        <TabsTrigger value="group">Manage Group</TabsTrigger>
                        <TabsTrigger value="dashboard">Review</TabsTrigger>
                        <TabsTrigger value="export">Export</TabsTrigger>
                    </TabsList>

                    <TabsContent value="input" className="mt-6">
                        <InputPanel />
                    </TabsContent>

                    <TabsContent value="group" className="mt-6">
                        <GroupManager />
                    </TabsContent>

                    <TabsContent value="dashboard" className="mt-6">
                        <Dashboard />
                    </TabsContent>

                    <TabsContent value="export" className="mt-6">
                        <ExportPanel />
                    </TabsContent>
                </Tabs>

                <Toaster position="top-right" richColors />
            </div>
        </div>
    );
};

export default BillSplitterPage;
