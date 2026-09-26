import { proofService, ApiResponse, ProofDocument } from '@/services/proofService';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock browser-image-compression
jest.mock('browser-image-compression');
const mockedImageCompression =
  imageCompression as jest.MockedFunction<typeof imageCompression>;

describe('proofService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('compressImage', () => {
    test('should return original file if under size limit', async () => {
      const mockFile = new File(['small'], 'test.jpg', { type: 'image/jpeg' });

      const result = await proofService.compressImage(mockFile, {
        maxSizeMB: 5,
      });

      expect(result.file).toBe(mockFile);
      expect(result.isCompressed).toBe(false);
      expect(result.originalSize).toBe(mockFile.size);
      expect(mockedImageCompression).not.toHaveBeenCalled();
    });

    test('should compress image if over size limit', async () => {
      // Create a large mock file (simulating >5MB)
      const largeData = new Uint8Array(6 * 1024 * 1024); // 6MB
      const mockFile = new File([largeData], 'large.jpg', {
        type: 'image/jpeg',
      });

      const mockCompressedFile = new File(['compressed'], 'large.jpg', {
        type: 'image/jpeg',
      });

      mockedImageCompression.mockResolvedValue(mockCompressedFile);

      const onProgress = jest.fn();
      const result = await proofService.compressImage(mockFile, {
        maxSizeMB: 5,
        onProgress,
      });

      expect(result.isCompressed).toBe(true);
      expect(result.file).toBe(mockCompressedFile);
      expect(mockedImageCompression).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          maxSizeMB: 5,
        })
      );
    });

    test('should call progress callback during compression', async () => {
      const largeData = new Uint8Array(6 * 1024 * 1024);
      const mockFile = new File([largeData], 'large.jpg', {
        type: 'image/jpeg',
      });

      const mockCompressedFile = new File(['compressed'], 'large.jpg', {
        type: 'image/jpeg',
      });

      mockedImageCompression.mockResolvedValue(mockCompressedFile);

      const onProgress = jest.fn();
      await proofService.compressImage(mockFile, {
        maxSizeMB: 5,
        onProgress,
      });

      expect(onProgress).toHaveBeenCalledWith(10); // Starting
      expect(onProgress).toHaveBeenCalledWith(95); // Finishing
    });

    test('should handle compression error', async () => {
      const largeData = new Uint8Array(6 * 1024 * 1024);
      const mockFile = new File([largeData], 'large.jpg', {
        type: 'image/jpeg',
      });

      mockedImageCompression.mockRejectedValue(
        new Error('Compression failed')
      );

      await expect(
        proofService.compressImage(mockFile, { maxSizeMB: 5 })
      ).rejects.toThrow('Image compression failed');
    });
  });

  describe('uploadProof', () => {
    test('should successfully upload proof', async () => {
      const mockFormData = new FormData();
      mockFormData.append('proof', new File(['test'], 'test.jpg'));

      const mockResponse: ApiResponse<ProofDocument> = {
        success: true,
        message: 'Proof uploaded successfully',
        data: {
          id: 'proof_123',
          deliveryId: 'delivery_456',
          filename: 'test.jpg',
          fileSize: 1024,
          originalSize: 2048,
          isCompressed: true,
          uploadedAt: new Date().toISOString(),
          status: 'pending',
        },
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await proofService.uploadProof(
        mockFormData,
        'delivery_456'
      );

      expect(result.success).toBe(true);
      expect(result.data?.filename).toBe('test.jpg');
      expect(result.data?.status).toBe('pending');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/deliveries/delivery_456/proof'),
        mockFormData,
        expect.any(Object)
      );
    });

    test('should handle upload error', async () => {
      const mockFormData = new FormData();
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Upload failed',
          },
        },
      };

      mockedAxios.post.mockRejectedValue(mockError);

      try {
        await proofService.uploadProof(mockFormData, 'delivery_456');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.data.message).toBe('Upload failed');
      }
    });

    test('should track upload progress', async () => {
      const mockFormData = new FormData();
      const mockProgress = jest.fn();

      const mockResponse: ApiResponse<ProofDocument> = {
        success: true,
        message: 'Proof uploaded successfully',
        data: {
          id: 'proof_123',
          deliveryId: 'delivery_456',
          filename: 'test.jpg',
          fileSize: 1024,
          originalSize: 1024,
          isCompressed: false,
          uploadedAt: new Date().toISOString(),
          status: 'pending',
        },
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      await proofService.uploadProof(mockFormData, 'delivery_456', mockProgress);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/deliveries/delivery_456/proof'),
        mockFormData,
        expect.objectContaining({
          onUploadProgress: mockProgress,
        })
      );
    });
  });

  describe('getProofDocuments', () => {
    test('should retrieve proof documents', async () => {
      const mockResponse: ApiResponse<ProofDocument[]> = {
        success: true,
        message: 'Proofs retrieved',
        data: [
          {
            id: 'proof_123',
            deliveryId: 'delivery_456',
            filename: 'test.jpg',
            fileSize: 1024,
            originalSize: 1024,
            isCompressed: false,
            uploadedAt: new Date().toISOString(),
            status: 'pending',
          },
        ],
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await proofService.getProofDocuments('delivery_456');

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/deliveries/delivery_456/proof')
      );
    });
  });

  describe('deleteProof', () => {
    test('should delete proof document', async () => {
      const mockResponse: ApiResponse<null> = {
        success: true,
        message: 'Proof deleted successfully',
      };

      mockedAxios.delete.mockResolvedValue({ data: mockResponse });

      const result = await proofService.deleteProof('delivery_456', 'proof_123');

      expect(result.success).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/deliveries/delivery_456/proof/proof_123')
      );
    });
  });
});
