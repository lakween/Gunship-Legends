"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Camera, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadAvatarAction } from "@/app/app/dashboard/actions";

interface AvatarUploadProps {
    currentUrl: string | null;
    displayName?: string;
    size?: "sm" | "md" | "lg";
    onUploaded?: (url: string) => void;
}

const SIZE = {
    sm: { wrap: "h-12 w-12", text: "text-base", camera: "h-4 w-4", badge: "h-5 w-5" },
    md: { wrap: "h-20 w-20", text: "text-2xl", camera: "h-4 w-4", badge: "h-6 w-6" },
    lg: { wrap: "h-24 w-24", text: "text-3xl", camera: "h-5 w-5", badge: "h-7 w-7" },
};

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 2;

export default function AvatarUpload({
    currentUrl,
    displayName,
    size = "lg",
    onUploaded,
}: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const s = SIZE[size];

    const initials = displayName
        ? displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    const displayUrl = preview ?? currentUrl;

    const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0];
        if (!picked) return;

        if (!ALLOWED.includes(picked.type)) {
            toast.error("Only JPG, PNG, WEBP, or GIF files are allowed.");
            return;
        }
        if (picked.size > MAX_MB * 1024 * 1024) {
            toast.error(`File must be smaller than ${MAX_MB}MB.`);
            return;
        }

        setFile(picked);
        setPreview(URL.createObjectURL(picked));
        setOpen(true);
        e.target.value = "";
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const result = await uploadAvatarAction(formData);

            if (!result.success) throw new Error(result.error);

            setPreview(result.url!);
            onUploaded?.(result.url!);
            toast.success("Profile picture updated!");
            setOpen(false);
            setFile(null);
        } catch (err: any) {
            toast.error(err.message ?? "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setOpen(false);
        setFile(null);
        setPreview(currentUrl);
    };

    return (
        <>
           
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "relative group rounded-full shrink-0 focus:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    s.wrap,
                )}
                aria-label="Change profile picture"
            >
                
                <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary to-purple-600 blur opacity-70 group-hover:opacity-100 transition duration-200 pointer-events-none" />

                <span className={cn("relative flex h-full w-full rounded-full overflow-hidden bg-surface-dark border-2 border-background-dark", s.wrap)}>
                    {displayUrl ? (
                        <img
                            src={displayUrl}
                            alt={displayName ?? "Avatar"}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className={cn("flex h-full w-full items-center justify-center font-bold text-primary", s.text)}>
                            {initials}
                        </span>
                    )}
                </span>

                <span className={cn(
                    "absolute bottom-0 right-0 flex items-center justify-center rounded-full",
                    "bg-primary border-2 border-background-dark text-primary-foreground",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    s.badge,
                )}>
                    <Camera className={s.camera} />
                </span>
            </button>

            <input
                ref={inputRef}
                type="file"
                accept={ALLOWED.join(",")}
                className="hidden"
                onChange={onFilePicked}
            />

            <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
                <DialogContent className="sm:max-w-sm w-[calc(100vw-2rem)] border-border-dark">
                    <DialogHeader>
                        <DialogTitle className="text-primary">Update Profile Picture</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-5 py-2">
                        {/* Preview */}
                        <div className="relative h-32 w-32 rounded-full overflow-hidden bg-surface-dark border-2 border-border-dark">
                            {preview ? (
                                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-4xl font-bold text-primary">
                                    {initials}
                                </span>
                            )}
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-primary font-medium truncate max-w-[220px]">{file?.name}</p>
                            <p className="text-xs text-primary  opacity-60 mt-0.5">
                                {file ? `${(file.size / 1024).toFixed(0)} KB` : ""}
                            </p>
                        </div>

                        <div className="flex w-full gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleCancel}
                                disabled={uploading}
                            >
                                <X className="h-4 w-4 mr-1.5" />
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={handleUpload}
                                disabled={uploading}
                            >
                                {uploading
                                    ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Uploading…</>
                                    : <><Camera className="h-4 w-4 mr-1.5" />Save</>
                                }
                            </Button>
                        </div>

                        <button
                            type="button"
                            className="text-xs text-primary opacity-60 underline underline-offset-4 hover:text-primary hover:opacity-100 transition-colors"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                        >
                            Choose a different photo
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}