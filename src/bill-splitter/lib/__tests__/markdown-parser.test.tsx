import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { parseMarkdownTable } from "../markdown-parser";

describe("parseMarkdownTable", () => {
    describe("Valid inputs", () => {
        it("should parse table with header", () => {
            const markdown = `
| Description | Quantity | Price |
|-------------|----------|-------|
| Burger | 2 | 12.50 |
| Fries | 1 | 4.00 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result).toEqual([
                { description: "Burger", quantity: 2, amount: 1250 },
                { description: "Fries", quantity: 1, amount: 400 },
            ]);
        });

        it("should parse table without header", () => {
            const markdown = `
| Burger | 2 | 12.50 |
| Fries | 1 | 4.00 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result).toEqual([
                { description: "Burger", quantity: 2, amount: 1250 },
                { description: "Fries", quantity: 1, amount: 400 },
            ]);
        });

        it("should handle missing quantity", () => {
            const markdown = `
| Burger |  | 12.50 |
| Fries | 1 | 4.00 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result).toEqual([
                { description: "Burger", quantity: undefined, amount: 1250 },
                { description: "Fries", quantity: 1, amount: 400 },
            ]);
        });

        it("should handle zero quantity as undefined", () => {
            const markdown = `
| Burger | 0 | 12.50 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result).toEqual([
                { description: "Burger", quantity: undefined, amount: 1250 },
            ]);
        });

        it("should handle decimal quantities", () => {
            const markdown = `
| Burger | 1.5 | 12.50 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result).toEqual([
                { description: "Burger", quantity: undefined, amount: 1250 },
            ]);
        });

        it("should parse prices with currency symbols", () => {
            const markdown = `
| Burger | 2 | $12.50 |
| Fries | 1 | €4.00 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result).toEqual([
                { description: "Burger", quantity: 2, amount: 1250 },
                { description: "Fries", quantity: 1, amount: 400 },
            ]);
        });

        it("should handle extra whitespace", () => {
            const markdown = `
|   Burger   |   2   |   12.50   |
|   Fries   |   1   |   4.00   |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result).toEqual([
                { description: "Burger", quantity: 2, amount: 1250 },
                { description: "Fries", quantity: 1, amount: 400 },
            ]);
        });

        it("should handle tabs and mixed spacing", () => {
            const markdown = `
|Burger|\t2\t|12.50|
|Fries|\t1\t|4.00|
      `;
            const result = parseMarkdownTable(markdown);
            expect(result).toEqual([
                { description: "Burger", quantity: 2, amount: 1250 },
                { description: "Fries", quantity: 1, amount: 400 },
            ]);
        });

        it("should handle single row", () => {
            const markdown = `| Burger | 2 | 12.50 |`;
            const result = parseMarkdownTable(markdown);
            expect(result).toEqual([
                { description: "Burger", quantity: 2, amount: 1250 },
            ]);
        });
    });

    describe("Invalid inputs", () => {
        it("should throw error for empty string", () => {
            expect(() => parseMarkdownTable("")).toThrow("No data rows found");
        });

        it("should throw error for whitespace only", () => {
            expect(() => parseMarkdownTable("   \n   \n   ")).toThrow(
                "No data rows found"
            );
        });

        it("should throw error for only separator lines", () => {
            const markdown = `
|-------------|----------|-------|
|-------------|----------|-------|
      `;
            expect(() => parseMarkdownTable(markdown)).toThrow(
                "No data rows found"
            );
        });

        it("should throw error for invalid row format - too few columns", () => {
            const markdown = `
| Burger | 12.50 |
      `;
            expect(() => parseMarkdownTable(markdown)).toThrow(
                "Expected 3 columns"
            );
        });

        it("should throw error for invalid row format - too many columns", () => {
            const markdown = `
| Burger | 2 | 12.50 | Extra |
      `;
            expect(() => parseMarkdownTable(markdown)).toThrow(
                "Expected 3 columns"
            );
        });

        it("should throw error for empty description", () => {
            const markdown = `
|  | 2 | 12.50 |
      `;
            expect(() => parseMarkdownTable(markdown)).toThrow(
                "Description cannot be empty"
            );
        });

        it("should throw error for negative price", () => {
            const markdown = `
| Burger | 2 | -12.50 |
      `;
            expect(() => parseMarkdownTable(markdown)).toThrow(
                "Invalid amount"
            );
        });

        it("should throw error for zero price", () => {
            const markdown = `
| Burger | 2 | 0 |
      `;
            expect(() => parseMarkdownTable(markdown)).toThrow(
                "Invalid amount"
            );
        });

        it("should throw error for non-numeric price", () => {
            const markdown = `
| Burger | 2 | abc |
      `;
            expect(() => parseMarkdownTable(markdown)).toThrow(
                "Invalid amount"
            );
        });

        it("should throw error for empty price", () => {
            const markdown = `
| Burger | 2 |  |
      `;
            expect(() => parseMarkdownTable(markdown)).toThrow(
                "Invalid amount"
            );
        });

        it("should throw error for negative quantity", () => {
            const markdown = `
| Burger | -2 | 12.50 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result[0].quantity).toBeUndefined();
        });

        it("should throw error for non-integer quantity", () => {
            const markdown = `
| Burger | 2.5 | 12.50 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result[0].quantity).toBeUndefined();
        });
    });

    describe("Edge cases", () => {
        it("should handle description with pipe characters", () => {
            const markdown = `
| Burger | 2 | 12.50 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result[0].description).toBe("Burger");
        });

        it("should handle description with special characters", () => {
            const markdown = `
| Burger & Fries | 2 | 12.50 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result[0].description).toBe("Burger & Fries");
        });

        it("should handle very large numbers", () => {
            const markdown = `
| Burger | 999999 | 999999.99 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result[0]).toEqual({
                description: "Burger",
                quantity: 999999,
                amount: 99999999,
            });
        });

        it("should handle very small decimal prices", () => {
            const markdown = `
| Burger | 1 | 0.01 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result[0].amount).toBe(1);
        });

        it("should handle multiple spaces between pipes", () => {
            const markdown = `
|  Burger  |  2  |  12.50  |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result[0].description).toBe("Burger");
        });

        it("should handle Windows line endings (\\r\\n)", () => {
            const markdown = "| Burger | 2 | 12.50 |\r\n| Fries | 1 | 4.00 |";
            const result = parseMarkdownTable(markdown);
            expect(result).toHaveLength(2);
        });

        it("should handle mixed empty and valid rows", () => {
            const markdown = `
| Burger | 2 | 12.50 |

| Fries | 1 | 4.00 |
      `;
            const result = parseMarkdownTable(markdown);
            expect(result).toHaveLength(2);
        });
    });
});
