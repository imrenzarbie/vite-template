// src/lib/markdown-parser.ts
export interface ParsedItem {
    description: string;
    quantity?: number;
    amount: number; // Cents
}

/**
 * Parses a markdown table with the format:
 * | Description | Quantity | Price |
 * |-------------|----------|-------|
 * | Burger | 2 | 12.50 |
 * | Fries | 1 | 4.00 |
 *
 * - Description: Required, cannot be empty
 * - Quantity: Optional, will be undefined if empty or invalid
 * - Price: Required, must be a valid positive number
 *
 * Header row is optional - the parser will detect and skip it automatically.
 */
export function parseMarkdownTable(markdown: string): ParsedItem[] {
    const lines = markdown
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !/^[\s|-]+$/.test(line)); // Remove empty and separator lines

    if (lines.length === 0) {
        throw new Error("No data rows found");
    }

    // Check if first line is a header by seeing if it has any numeric values
    const firstLineParts = lines[0]
        .split("|")
        .map((p) => p.trim())
        .filter(Boolean);
    const hasNumericValue = firstLineParts.some((part) => /\d/.test(part));

    // If no numeric values in first line, it's likely a header, so skip it
    const dataLines = hasNumericValue ? lines : lines.slice(1);

    if (dataLines.length === 0) {
        throw new Error("No data rows found");
    }

    return dataLines.map((line, index) => {
        const parts = line
            .split("|")
            .map((p) => p.trim())
            .filter(Boolean);

        // Expect exactly 3 columns
        if (parts.length !== 3) {
            throw new Error(
                `Invalid row ${
                    index + 1
                }: "${line}". Expected 3 columns (Description | Quantity | Price)`
            );
        }

        const [description, quantityStr, amountStr] = parts;

        // Validate description
        if (!description || description.trim() === "") {
            throw new Error(
                `Invalid row ${index + 1}: Description cannot be empty`
            );
        }

        // Parse quantity (optional)
        let quantity: number | undefined;
        if (quantityStr && quantityStr.trim() !== "") {
            const parsedQty = parseInt(quantityStr, 10);
            if (!isNaN(parsedQty) && parsedQty > 0) {
                quantity = parsedQty;
            }
        }

        // Parse amount to cents
        const dollars = parseFloat(amountStr.replace(/[^0-9.-]/g, ""));
        if (isNaN(dollars) || dollars <= 0) {
            throw new Error(
                `Invalid row ${index + 1}: Invalid amount "${amountStr}"`
            );
        }

        // Convert to cents without external library
        const amount = Math.round(dollars * 100);

        return {
            description: description.trim(),
            quantity,
            amount,
        };
    });
}
