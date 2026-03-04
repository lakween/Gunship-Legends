"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableFormInputProps {
    label: string;
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
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [savedValue, setSavedValue] = useState(initialValue);
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const inputRef = useRef<HTMLInputElement>(null);

    const enterEdit = () => {
        setIsEditing(true);
        setStatus("idle");
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const cancel = () => {
        setValue(savedValue); // revert
        setIsEditing(false);
        setStatus("idle");
    };

    const save = useCallback(async () => {
        if (value === savedValue) {
            setIsEditing(false);
            return;
        }
        setStatus("saving");
        try {
            await onSave(name, value);
            setSavedValue(value);
            setStatus("saved");
            setIsEditing(false);
            setTimeout(() => setStatus("idle"), 2000);
        } catch {
            setStatus("error");
        }
    }, [name, value, savedValue, onSave]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") cancel();
    };

    return (
        <div className={cn("grid gap-1.5", className)}>
            <Label htmlFor={name} className="text-sm font-medium text-muted-foreground">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {isEditing ? (
                /* ── Edit mode ── */
                <div className="flex items-center gap-2">
                    <Input
                        ref={inputRef}
                        id={name}
                        name={name}
                        type={type}
                        value={value}
                        placeholder={placeholder}
                        required={required}
                        disabled={status === "saving"}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={save}
                        className="h-8 text-sm"
                    />
                    {/* Confirm / cancel buttons — optional, onBlur handles it too */}
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                        onClick={save}
                        disabled={status === "saving"}
                        className="text-muted-foreground hover:text-green-500 transition-colors disabled:opacity-40"
                    >
                        {status === "saving"
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Check className="w-4 h-4" />
                        }
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={cancel}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                /* ── Display mode ── */
                <button
                    type="button"
                    onClick={enterEdit}
                    className={cn(
                        "group flex items-center gap-2 w-full text-left",
                        "px-3 py-1.5 rounded-md text-sm",
                        "hover:bg-muted/60 transition-colors duration-150",
                        status === "error" && "text-destructive"
                    )}
                >
                    <span className={cn("flex-1 truncate", !savedValue && "text-muted-foreground/50")}>
                        {savedValue || placeholder}
                    </span>

                    {status === "saved" ? (
                        <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    ) : status === "error" ? (
                        <span className="text-[11px] text-destructive shrink-0">Failed</span>
                    ) : (
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    )}
                </button>
            )}
        </div>
    );
};

export default EditableFormInput;