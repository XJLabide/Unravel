import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
}

export function getFileIcon(extension: string): "pdf" | "xlsx" | "txt" | "json" | "docx" {
    const map: Record<string, "pdf" | "xlsx" | "txt" | "json" | "docx"> = {
        pdf: "pdf",
        xlsx: "xlsx",
        xls: "xlsx",
        csv: "xlsx",
        txt: "txt",
        md: "txt",
        json: "json",
        docx: "docx",
        doc: "docx",
    };
    return map[extension] || "txt";
}

export function generateId(): string {
    return crypto.randomUUID();
}
