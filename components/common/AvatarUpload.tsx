'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Upload, Camera, X, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadAvatar } from '@/app/app/dashboard/actions'

export default function AvatarUpload({ currentUrl, username }: { currentUrl?: string; username?: string }) {
    const [preview, setPreview] = useState<string | null>(currentUrl || null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    function handleFileChange(file: File) {
        setError(null)
        setSuccess(false)

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPG, PNG, and WebP files are allowed.')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be under 5MB.')
            return
        }

        setSelectedFile(file)
        setPreview(URL.createObjectURL(file))
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) handleFileChange(file)
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFileChange(file)
    }

    function handleClear() {
        setPreview(currentUrl || null)
        setSelectedFile(null)
        setError(null)
        setSuccess(false)
        if (inputRef.current) inputRef.current.value = ''
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!selectedFile) return

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const formData = new FormData()
            formData.append('avatar', selectedFile)
            const { url }: any = await uploadAvatar(formData)
            setPreview(url)
            setSelectedFile(null)
            setSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const initials = username
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">Profile Photo</CardTitle>
                <CardDescription>Upload a photo to personalize your profile.</CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Avatar Preview + Drop Zone */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">

                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <Avatar className="w-24 h-24 ring-2 ring-border">
                                <AvatarImage src={preview ?? undefined} alt="Avatar preview" className="object-cover" />
                                <AvatarFallback className="text-lg font-medium bg-muted">
                                    {initials ?? <Camera className="w-6 h-6 text-muted-foreground" />}
                                </AvatarFallback>
                            </Avatar>

                            {/* Clear button */}
                            {selectedFile && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Drop Zone */}
                        <div
                            onClick={() => inputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={cn(
                                'flex-1 w-full min-h-[96px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors px-4 py-4 text-center',
                                isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            )}
                        >
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">
                                {selectedFile ? selectedFile.name : 'Click or drag to upload'}
                            </p>
                            <p className="text-xs text-muted-foreground">JPG, PNG, WebP — max 5MB</p>
                        </div>
                    </div>

                    {/* Hidden input */}
                    <input
                        ref={inputRef}
                        type="file"
                        name="avatar"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    {/* Error */}
                    {error && (
                        <Alert variant="destructive" className="py-2">
                            <AlertDescription className="text-sm">{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Success */}
                    {success && (
                        <Alert className="py-2 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                            <CheckCircle2 className="w-4 h-4" />
                            <AlertDescription className="text-sm">Photo updated successfully!</AlertDescription>
                        </Alert>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={!selectedFile || loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Save Photo
                            </>
                        )}
                    </Button>

                </form>
            </CardContent>
        </Card>
    )
}