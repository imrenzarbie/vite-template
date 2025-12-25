// src/lib/currency.ts
// Store all monetary values as integers in cents to avoid floating-point errors

export const toCents = (dollars: number): number => {
    return Math.round(dollars * 100);
};

export const toDollars = (cents: number): number => {
    return cents / 100;
};

export const formatCents = (cents: number): string => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(toDollars(cents));
};

// Rounding strategy for splits: distribute remainder to first members
export const splitCents = (totalCents: number, parts: number): number[] => {
    if (parts === 0) throw new Error("Cannot split among zero parts");

    const base = Math.floor(totalCents / parts);
    const remainder = totalCents % parts;

    // Create array with base amount for everyone
    const splits = new Array(parts).fill(base);

    // Distribute remainder (1 cent each to first 'remainder' people)
    for (let i = 0; i < remainder; i++) {
        splits[i] += 1;
    }

    return splits;
};
