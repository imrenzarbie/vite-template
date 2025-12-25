import { toCents } from "@/lib/currency";

// src/lib/markdown-parser.ts
export interface ParsedItem {
    description: string;
    amount: number; // Cents
    assignees: string[];
}

export function parseMarkdownTable(markdown: string): ParsedItem[] {
    const lines = markdown
        .trim()
        .split("\n")
        .filter((line) => line.trim());
    if (lines.length < 3) throw new Error("Invalid table format");

    // Skip header and separator
    const dataLines = lines.slice(2);

    return dataLines.map((line) => {
        const parts = line
            .split("|")
            .map((p) => p.trim())
            .filter(Boolean);
        if (parts.length !== 3) throw new Error(`Invalid row: ${line}`);

        const [description, amountStr, assigneesStr] = parts;

        // Parse amount to cents
        const dollars = parseFloat(amountStr.replace(/[^0-9.-]/g, ""));
        if (isNaN(dollars)) throw new Error(`Invalid amount: ${amountStr}`);

        const assignees = assigneesStr
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean);

        return {
            description,
            amount: toCents(dollars),
            assignees,
        };
    });
}
