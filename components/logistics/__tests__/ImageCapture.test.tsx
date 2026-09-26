import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageCapture from '@/components/logistics/ImageCapture';
import { useImageCompressor } from '@/hooks/useImageCompressor';
import { uploadService } from '@/services/uploadService';

jest.mock('@/hooks/useImageCompressor');
jest.mock('@/services/uploadService');

const mockUseImageCompressor = useImageCompressor as jest.MockedFunction<typeof useImageCompressor>;
const mockedUploadService = uploadService as jest.Mocked<typeof uploadService>;

function makeFile(sizeBytes: number, name = 'proof.jpg') {
  return new File([new Uint8Array(sizeBytes)], name, { type: 'image/jpeg' });
}

describe('ImageCapture', () => {
  const compress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseImageCompressor.mockReturnValue({
      compress,
      isCompressing: false,
    });
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-preview');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('renders the file picker and disables Upload Proof until a file is selected', () => {
    render(<ImageCapture />);

    expect(screen.getByText('Choose Photo')).toBeInTheDocument();
    expect(screen.getByText('Upload Proof')).toBeDisabled();
  });

  it('shows a preview and original file size once a file is selected', async () => {
    render(<ImageCapture />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile(1024 * 1024, 'delivery.jpg');

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByAltText('preview')).toBeInTheDocument();
    expect(screen.getByText(/delivery\.jpg/)).toBeInTheDocument();
    expect(screen.getByText('Upload Proof')).not.toBeDisabled();
  });

  it('compresses the selected file to under 500KB before calling the upload API', async () => {
    const compressedFile = makeFile(400 * 1024, 'delivery.jpg');
    compress.mockResolvedValueOnce(compressedFile);
    mockedUploadService.uploadFile.mockResolvedValueOnce({
      success: true,
      data: {
        fileId: 'f-1',
        fileName: 'delivery.jpg',
        fileSize: compressedFile.size,
        mimeType: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
      },
    });

    render(<ImageCapture />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const originalFile = makeFile(3 * 1024 * 1024, 'delivery.jpg');
    fireEvent.change(input, { target: { files: [originalFile] } });

    fireEvent.click(screen.getByText('Upload Proof'));

    await waitFor(() => expect(compress).toHaveBeenCalledWith(originalFile, 500));
    await waitFor(() =>
      expect(mockedUploadService.uploadFile).toHaveBeenCalledWith(compressedFile, 'proof')
    );

    expect(compressedFile.size).toBeLessThan(500 * 1024);
    expect(await screen.findByText(/Uploaded/)).toBeInTheDocument();
  });

  it('surfaces an error message when compression cannot meet the size target', async () => {
    compress.mockRejectedValueOnce(new Error('Unable to compress below 500KB'));

    render(<ImageCapture />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile(8 * 1024 * 1024)] } });
    fireEvent.click(screen.getByText('Upload Proof'));

    expect(await screen.findByText(/Unable to compress below 500KB/)).toBeInTheDocument();
    expect(mockedUploadService.uploadFile).not.toHaveBeenCalled();
  });

  it('surfaces a failure message when the backend upload rejects the file', async () => {
    const compressedFile = makeFile(400 * 1024);
    compress.mockResolvedValueOnce(compressedFile);
    mockedUploadService.uploadFile.mockResolvedValueOnce({
      success: false,
      message: 'Server rejected file',
    });

    render(<ImageCapture />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile(2 * 1024 * 1024)] } });
    fireEvent.click(screen.getByText('Upload Proof'));

    expect(await screen.findByText(/Upload failed: Server rejected file/)).toBeInTheDocument();
  });

  it('shows a compressing indicator while isCompressing is true', () => {
    mockUseImageCompressor.mockReturnValue({
      compress,
      isCompressing: true,
    });

    render(<ImageCapture />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile(1024 * 1024)] } });

    expect(screen.getByText('Compressing...')).toBeInTheDocument();
  });
});
