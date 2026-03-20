"use client";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";

interface FileUploaderProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: string | null;
}

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

  const previewUrl = value ? URL.createObjectURL(value) : preview;

  const handleFile = (file: File) => {
    setError(null);
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
    <Box>
      <Box
        component="button"
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: "2px dashed",
          borderColor: isDragging ? "primary.main" : "divider",
          borderRadius: 2,
          p: 3,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          transition: "border-color 0.2s",
          "&:hover": { borderColor: "primary.main" },
          bgcolor: isDragging ? "action.hover" : "transparent",
          minHeight: 120,
          justifyContent: "center",
          width: "100%",
          background: "none",
        }}
        aria-label="Upload photo"
      >
        {previewUrl ? (
          <>
            <Avatar
              src={previewUrl}
              sx={{ width: 72, height: 72 }}
              variant="rounded"
            />
            <Typography variant="body2" color="text.secondary">
              {value
                ? `${value.name} (${(value.size / (1024 * 1024)).toFixed(1)}MB)`
                : "Current photo"}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Click or drag to replace
            </Typography>
          </>
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 40, color: "text.disabled" }} />
            <Box textAlign="center">
              <Typography variant="body2" fontWeight={500}>
                Click or drag to upload
              </Typography>
              <Typography variant="caption" color="text.secondary">
                JPEG, PNG, WEBP — up to {maxSizeMB}MB
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {error && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 0.5, display: "block" }}
        >
          {error}
        </Typography>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={handleInputChange}
      />
    </Box>
  );
}
