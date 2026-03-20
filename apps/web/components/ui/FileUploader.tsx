"use client";

import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: string | null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function FileUploader({
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  preview,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview ?? null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(preview ?? null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value, preview]);

  const handleFile = (file: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`File must be smaller than ${maxSizeMB}MB`);
      return;
    }
    onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-label="Upload photo"
        className={cn(
          "w-full min-h-[120px] rounded-lg border-2 border-dashed transition-colors cursor-pointer",
          "flex flex-col items-center justify-center gap-3 p-6",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary",
        )}
      >
        {previewUrl ? (
          <>
            {/* biome-ignore lint/performance/noImgElement: blob/data URL preview, not compatible with next/image */}
            <img
              src={previewUrl}
              alt="Preview"
              className="h-16 w-16 rounded-lg object-cover"
            />
            <p className="text-sm text-muted-foreground">
              {value
                ? `${value.name} (${(value.size / (1024 * 1024)).toFixed(1)}MB)`
                : "Current photo"}
            </p>
            <p className="text-xs text-muted-foreground/60">
              Click or drag to replace
            </p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground/40" />
            <div className="text-center">
              <p className="text-sm font-medium">Click or drag to upload</p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WEBP — up to {maxSizeMB}MB
              </p>
            </div>
          </>
        )}
      </button>

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
