// src/components/input/file-upload-zone.tsx
import React, { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface FileUploadZoneProps {
    onFileLoad: (content: string) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
    onFileLoad,
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const processFile = (file: File) => {
        if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) {
            toast.error("Please upload a .md or .txt file");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => onFileLoad(e.target?.result as string);
        reader.readAsText(file);
        toast.info("File loaded into editor");
    };

    return (
        <div
            className={`group relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                isDragging
                    ? "border-primary bg-primary/5 scale-[0.99]"
                    : "border-muted hover:border-primary/50"
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
                if (file) processFile(file);
            }}>
            <input
                type="file"
                accept=".md,.txt"
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processFile(file);
                }}
            />
            <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center">
                <Upload
                    className={`w-10 h-10 mb-4 ${
                        isDragging ? "text-primary" : "text-muted-foreground"
                    }`}
                />
                <span className="text-sm font-medium">
                    Drop Markdown file here or click to browse
                </span>
            </label>
        </div>
    );
};
