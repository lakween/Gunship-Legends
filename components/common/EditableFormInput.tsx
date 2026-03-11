"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableFormInputProps {
    label?: string;
    name: string;
    type?: string;
    placeholder?: string;
    value: string;
    required?: boolean;
    onSave: (key: string, value: string) => Promise<void>;
    className?: string;
}

const EditableFormInput = ({
    label,
    name,
    type = "text",
    placeholder = "—",
    value: initialValue,
    required = false,
    onSave,
    className,
}: EditableFormInputProps) => {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(initialValue);
    const [savedValue, setSavedValue] = useState(initialValue);
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });

    const anchorRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSavedValue(initialValue);
    }, [initialValue]);

    // Calculate position from anchor button
    const openPopover = () => {
        if (anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            setPopoverPos({
                top: rect.bottom + window.scrollY + 6,
                left: rect.left + window.scrollX,
                width: Math.max(rect.width, 260),
            });
        }
        setDraft(savedValue);
        setStatus("idle");
        setOpen(true);
    };

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node) &&
                !anchorRef.current?.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const update = () => {
            if (anchorRef.current) {
                const rect = anchorRef.current.getBoundingClientRect();
                setPopoverPos({
                    top: rect.bottom + window.scrollY + 6,
                    left: rect.left + window.scrollX,
                    width: Math.max(rect.width, 260),
                });
            }
        };
        window.addEventListener("scroll", update, true);
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update, true);
            window.removeEventListener("resize", update);
        };
    }, [open]);

    const save = useCallback(async () => {
        if (draft === savedValue) {
            setOpen(false);
            return;
        }
        setStatus("saving");
        try {
            await onSave(name, draft);
            setSavedValue(draft);
            setStatus("saved");
            setTimeout(() => {
                setStatus("idle");
                setOpen(false);
            }, 800);
        } catch {
            setStatus("error");
        }
    }, [draft, savedValue, name, onSave]);


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setOpen(false);
    };

    return (
        <div className={cn("grid gap-1.5", className)}>
            {label && (<Label className="text-sm font-medium text-muted-foreground">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </Label>)}

            {/* ── Display row ── */}
            <button
                ref={anchorRef}
                type="button"
                onClick={openPopover}
                className="group flex items-center justify-between w-full text-left px-3 py-1.5 rounded-md text-sm hover:bg-muted/60 transition-colors"
            >
                <span className={cn("flex-1 truncate", !savedValue && "text-muted-foreground/40")}>
                    {savedValue || placeholder}
                </span>
                {status === "saved" ? (
                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                ) : (
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
            </button>

            {/* ── Portal popover — renders on document.body, escapes overflow:hidden ── */}
            {open && typeof window !== "undefined" && createPortal(
                <div
                    ref={popoverRef}
                    style={{
                        position: "absolute",
                        top: popoverPos.top,
                        left: popoverPos.left,
                        width: popoverPos.width,
                        zIndex: 9999,
                    }}
                    className="rounded-lg border bg-popover shadow-lg p-3 flex flex-col gap-3"
                >
                    <p className="text-xs font-medium text-muted-foreground">
                        Edit {label}
                    </p>

                    <Input
                        ref={inputRef}
                        id={name}
                        type={type}
                        value={draft}
                        placeholder={placeholder}
                        disabled={status === "saving"}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-8 text-sm"
                    />

                    {status === "error" && (
                        <p className="text-xs text-destructive">
                            Failed to save. Try again.
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-xs px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={save}
                            disabled={status === "saving"}
                            className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {status === "saving" && (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            Save
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default EditableFormInput;