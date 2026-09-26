import api from '@/lib/api';

export interface FileUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    fileId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  };
}

export interface FileUploadError {
  field: 'size' | 'type' | 'general';
  message: string;
}

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * uploadService -- handles file upload with validation.
 * Supports KYC documents, vehicle licenses, and proof of delivery uploads.
 */
export const uploadService = {
  /**
   * Validates a file against size and type constraints.
   * @returns FileUploadError[] - Empty array if valid, error array otherwise
   */
  validateFile(file: File): FileUploadError[] {
    const errors: FileUploadError[] = [];

    if (file.size > MAX_FILE_SIZE) {
      errors.push({
        field: 'size',
        message: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push({
        field: 'type',
        message: 'Only JPEG, PNG, and PDF files are allowed',
      });
    }

    return errors;
  },

  /**
   * Uploads a file to the backend.
   * @param file - File to upload
   * @param fileType - Category: 'kyc' | 'license' | 'proof'
   */
  async uploadFile(file: File, fileType: 'kyc' | 'license' | 'proof'): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);

      const { data } = await api.post<FileUploadResponse>('/api/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'File upload failed',
      };
    }
  },

  /**
   * Generates a preview URL for an image file.
   * @param file - Image file to preview
   */
  generateImagePreview(file: File): string {
    return URL.createObjectURL(file);
  },

  /**
   * Cleans up a preview URL.
   */
  revokePreviewURL(url: string): void {
    URL.revokeObjectURL(url);
  },
};
