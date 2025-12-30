import React, { useState } from "react";
import { useParams } from "react-router";
import { ReviewItem } from "../types";
import BillAssignmentManager from "./bill-assignment-manager";
import BillParserForm from "./bill-parser-form";

// State interface to avoid implicit 'any'
interface ParsedDataState {
    items: ReviewItem[];
    markdown: string;
}

const InputPanel: React.FC = () => {
    const { groupId: urlGroupId } = useParams<{ groupId: string }>();

    const [step, setStep] = useState<"input" | "review">("input");
    const [parsedData, setParsedData] = useState<ParsedDataState | null>(null);

    const handleParseSuccess = (items: ReviewItem[], markdown: string) => {
        setParsedData({ items, markdown });
        setStep("review");
    };

    const handleBack = () => {
        setStep("input");
    };

    const handleComplete = () => {
        setParsedData(null);
        setStep("input");
    };

    if (step === "review" && parsedData) {
        return (
            <BillAssignmentManager
                initialItems={parsedData.items}
                rawMarkdown={parsedData.markdown}
                initialGroupId={urlGroupId}
                onBack={handleBack}
                onComplete={handleComplete}
            />
        );
    }

    return <BillParserForm onParseSuccess={handleParseSuccess} />;
};

export default InputPanel;
