import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { FileText } from "lucide-react";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadZone } from "./file-upload";
import { parseMarkdownTable } from "../lib/markdown-parser";
import { ReviewItem, parserSchema } from "../types";
import { ParsedMarkdownItem } from "../types/billing.type";

interface BillParserFormProps {
    onParseSuccess: (items: ReviewItem[], rawMarkdown: string) => void;
}

export const BillParserForm: React.FC<BillParserFormProps> = ({
    onParseSuccess,
}) => {
    const form = useForm<z.infer<typeof parserSchema>>({
        resolver: zodResolver(parserSchema),
        defaultValues: { markdown: "" },
    });

    const onSubmit = (data: z.infer<typeof parserSchema>) => {
        try {
            // We explicitly type the result of the parser
            const parsed = parseMarkdownTable(
                data.markdown
            ) as ParsedMarkdownItem[];

            if (!parsed || parsed.length === 0) {
                throw new Error("No items found. Check markdown format.");
            }

            const items: ReviewItem[] = parsed.map((p) => ({
                id: uuidv4(),
                description: p.description,
                quantity: p.quantity || 1,
                amount: p.amount,
                selectedMemberIds: [], // Defaults to empty
            }));

            onParseSuccess(items, data.markdown);
            toast.success("Parsed! Now assign items to group members.");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Parse failed";
            toast.error(message);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Import Bill
                </CardTitle>
                <CardDescription>
                    Format: | Item Name | Qty | Price |
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FileUploadZone
                    onFileLoad={(val) => form.setValue("markdown", val)}
                />
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4">
                    <Textarea
                        {...form.register("markdown")}
                        placeholder="| Burger | 1 | 12.50 |"
                        className="min-h-[200px] font-mono"
                    />
                    <Button type="submit" className="w-full">
                        Parse Table
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
export default BillParserForm;
