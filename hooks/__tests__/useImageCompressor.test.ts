import { renderHook, act, waitFor } from '@testing-library/react';
import { useImageCompressor } from '@/hooks/useImageCompressor';
import { imageCompressionService } from '@/services/imageCompressionService';

jest.mock('@/services/imageCompressionService');

const mockedService = imageCompressionService as jest.Mocked<typeof imageCompressionService>;

function makeFile(sizeBytes: number, name = 'proof.jpg'): File {
  return new File([new Uint8Array(sizeBytes)], name, { type: 'image/jpeg' });
}

describe('useImageCompressor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with isCompressing set to false', () => {
    const { result } = renderHook(() => useImageCompressor());
    expect(result.current.isCompressing).toBe(false);
  });

  it('delegates compression to imageCompressionService with a default target of 500KB', async () => {
    const input = makeFile(2 * 1024 * 1024);
    const compressed = makeFile(400 * 1024);
    mockedService.compressImage.mockResolvedValueOnce(compressed);

    const { result } = renderHook(() => useImageCompressor());

    let output: File | undefined;
    await act(async () => {
      output = await result.current.compress(input);
    });

    expect(mockedService.compressImage).toHaveBeenCalledWith(input, 500);
    expect(output).toBe(compressed);
  });

  it('respects a custom target size', async () => {
    const input = makeFile(2 * 1024 * 1024);
    mockedService.compressImage.mockResolvedValueOnce(makeFile(200 * 1024));

    const { result } = renderHook(() => useImageCompressor());

    await act(async () => {
      await result.current.compress(input, 250);
    });

    expect(mockedService.compressImage).toHaveBeenCalledWith(input, 250);
  });

  it('toggles isCompressing to true during compression and back to false after', async () => {
    let resolveCompression: (file: File) => void;
    mockedService.compressImage.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCompression = resolve;
      })
    );

    const { result } = renderHook(() => useImageCompressor());
    const input = makeFile(1024 * 1024);

    act(() => {
      void result.current.compress(input);
    });

    await waitFor(() => expect(result.current.isCompressing).toBe(true));

    await act(async () => {
      resolveCompression(makeFile(300 * 1024));
    });

    await waitFor(() => expect(result.current.isCompressing).toBe(false));
  });

  it('resets isCompressing to false even when compression throws', async () => {
    mockedService.compressImage.mockRejectedValueOnce(new Error('too large'));

    const { result } = renderHook(() => useImageCompressor());
    const input = makeFile(1024 * 1024);

    await act(async () => {
      await expect(result.current.compress(input)).rejects.toThrow('too large');
    });

    expect(result.current.isCompressing).toBe(false);
  });
});
