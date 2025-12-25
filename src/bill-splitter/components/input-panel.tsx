// src/components/InputPanel.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { parseMarkdownTable } from "../lib/markdown-parser";

const schema = z.object({
    markdown: z.string().min(1, "Input cannot be empty"),
});

export function InputPanel() {
    const [isDragging, setIsDragging] = useState(false);

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { markdown: "" },
    });

    const onSubmit = (data: z.infer<typeof schema>) => {
        try {
            const items = parseMarkdownTable(data.markdown);
            toast.success(`Parsed ${items.length} items successfully`);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unknown parse error"
            );
        }
    };

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            form.setValue("markdown", content);
            toast.info("File uploaded successfully");
        };
        reader.readAsText(file);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Input Data</CardTitle>
                <CardDescription>
                    Paste markdown table or upload file
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4">
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center ${
                            isDragging
                                ? "border-primary bg-primary/10"
                                : "border-muted"
                        }`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files[0];
                            if (file) handleFileUpload(file);
                        }}>
                        <input
                            type="file"
                            accept=".md,.txt"
                            className="hidden"
                            id="file-upload"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                            }}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            Drop file here or click to upload
                        </label>
                    </div>

                    <Textarea
                        placeholder="| Description | Amount | Assignees |\n|-------------|--------|-----------|\n| Pizza | 25.00 | Alice, Bob |"
                        className="min-h-[200px] font-mono"
                        {...form.register("markdown")}
                    />

                    <Button type="submit">Parse Items</Button>
                </form>
            </CardContent>
        </Card>
    );
}
