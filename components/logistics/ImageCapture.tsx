'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import { useImageCompressor } from '@/hooks/useImageCompressor';
import { uploadService } from '@/services/uploadService';

export default function ImageCapture() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const { compress, isCompressing } = useImageCompressor();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (!file) return;

      // Create preview immediately
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
      setUploadResult(null);
    },
    []
  );

  const compressedInfo = useMemo(() => {
    if (!selectedFile) return null;
    return {
      name: selectedFile.name,
      sizeKB: (selectedFile.size / 1024).toFixed(2),
    };
  }, [selectedFile]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadResult(null);
    try {
      // Compress to under 500KB
      const compressed = await compress(selectedFile, 500);

      // Optionally show compressed size in result
      const compressedSizeKB = (compressed.size / 1024).toFixed(2);

      const response = await uploadService.uploadFile(compressed, 'proof');
      if (response.success) {
        setUploadResult(
          `Uploaded ${response.data?.fileName ?? compressed.name} (${compressedSizeKB} KB)`
        );
        // cleanup preview
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setSelectedFile(null);
      } else {
        setUploadResult(
          `Upload failed: ${response.message ?? 'unknown error'}`
        );
      }
    } catch (err: any) {
      setUploadResult(err?.message ?? 'Upload error');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, compress, previewUrl]);

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-semibold mb-3">Capture Proof of Delivery</h2>

      <div className="mb-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="block"
        />
      </div>

      {previewUrl && (
        <div className="mb-3">
          <img
            src={previewUrl}
            alt="preview"
            className="w-full rounded-md border"
          />
        </div>
      )}

      {compressedInfo && (
        <p className="text-sm text-gray-600 mb-2">
          Original: {compressedInfo.name} -- {compressedInfo.sizeKB} KB
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded border bg-white"
        >
          <Upload className="w-4 h-4" />
          Choose Photo
        </button>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || isCompressing || isUploading}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-white ${
            !selectedFile || isCompressing || isUploading
              ? 'bg-gray-400'
              : 'bg-blue-600'
          }`}
        >
          {isCompressing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Compressing...
            </>
          ) : isUploading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Proof'
          )}
        </button>
      </div>

      {uploadResult && (
        <div className="mt-3 text-sm text-gray-700">{uploadResult}</div>
      )}
    </div>
  );
}
