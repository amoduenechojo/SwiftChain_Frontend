import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BulkShipmentImport } from '@/features/deliveries/components/BulkShipmentImport';
import { useToast } from '@/hooks/useToast';
import { deliveriesService } from '@/services/deliveries.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/services/deliveries.service');
jest.mock('@/hooks/useToast');

const mockDeliveriesService = deliveriesService as jest.Mocked<typeof deliveriesService>;

const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

mockUseToast.mockReturnValue({
  success: mockToastSuccess,
  error: mockToastError,
  info: jest.fn(),
  loading: jest.fn(),
  toast: jest.fn(),
  isLoading: false,
  notifications: [],
  fetchNotifications: jest.fn(),
} as any);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

const validCsvContent = `pickupAddress,destination,packageSize,description,recipientName,recipientPhone,recipientEmail
123 Main St,Lagos,small,Electronics package,John Doe,+2348012345678,john@example.com
456 Oak Ave,Abuja,medium,Documents shipment,Jane Smith,+2348098765432,jane@example.com`;

const singleCsvContent = `pickupAddress,destination,packageSize,description,recipientName,recipientPhone,recipientEmail
123 Main St,Lagos,small,Electronics package,John Doe,+2348012345678,john@example.com`;

const createMockDelivery = (trackingNumber: string) => ({
  id: `delivery-${trackingNumber}`,
  trackingNumber,
  senderId: 'sender-1',
  status: 'PENDING' as const,
  origin: 'Origin',
  destination: 'Destination',
  escrowStatus: 'NOT_LOCKED' as const,
  amount: 100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

Object.defineProperty(window, 'File', {
  writable: true,
  value: class MockFile extends File {
    constructor(bits: any[], name: string, options?: FilePropertyBag) {
      super(bits, name, options);
      (this as any).text = async () => {
        if (typeof bits[0] === 'string') return bits[0];
        return bits[0].text ? await bits[0].text() : '';
      };
    }
  },
});

describe('BulkShipmentImport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
  });

  it('renders upload drop zone initially', () => {
    render(<BulkShipmentImport />, { wrapper: createWrapper() });

    expect(screen.getByText('Bulk Shipment Import')).toBeInTheDocument();
    expect(screen.getByText(/Click to upload or drag and drop/)).toBeInTheDocument();
    expect(screen.getByText(/CSV files only/)).toBeInTheDocument();
  });

  it('processes valid CSV and creates deliveries', async () => {
    const mockDelivery1 = createMockDelivery('TRACK-001');
    const mockDelivery2 = createMockDelivery('TRACK-002');

    mockDeliveriesService.createDelivery
      .mockResolvedValueOnce(mockDelivery1)
      .mockResolvedValueOnce(mockDelivery2);

    render(<BulkShipmentImport />, { wrapper: createWrapper() });

    const input = document.getElementById('csv-upload-input') as HTMLInputElement;
    const file = new File([validCsvContent], 'shipments.csv', { type: 'text/csv' });

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/shipments\.csv/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockDeliveriesService.createDelivery).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText(/2 shipments imported successfully/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/New shipments are now visible on the Active Deliveries page/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Row 1:')).toBeInTheDocument();
      expect(screen.getByText(/Created TRACK-001/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Row 2:')).toBeInTheDocument();
      expect(screen.getByText(/Created TRACK-002/)).toBeInTheDocument();
    });
  });

  it('shows error for CSV with missing required columns', async () => {
    const invalidCsv = `pickupAddress,destination\n123 Main St,Lagos`;
    render(<BulkShipmentImport />, { wrapper: createWrapper() });

    const input = document.getElementById('csv-upload-input') as HTMLInputElement;
    const file = new File([invalidCsv], 'bad.csv', { type: 'text/csv' });

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/Missing required CSV columns/)).toBeInTheDocument();
    });
  });

  it('shows error for empty CSV file', async () => {
    render(<BulkShipmentImport />, { wrapper: createWrapper() });

    const input = document.getElementById('csv-upload-input') as HTMLInputElement;
    const file = new File([''], 'empty.csv', { type: 'text/csv' });

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/CSV file is empty or has no valid data rows/)).toBeInTheDocument();
    });
  });

  it('handles partial API failures gracefully', async () => {
    const mockDelivery1 = createMockDelivery('TRACK-001');

    mockDeliveriesService.createDelivery
      .mockResolvedValueOnce(mockDelivery1)
      .mockRejectedValueOnce(new Error('Network error'));

    render(<BulkShipmentImport />, { wrapper: createWrapper() });

    const input = document.getElementById('csv-upload-input') as HTMLInputElement;
    const file = new File([validCsvContent], 'partial.csv', { type: 'text/csv' });

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockDeliveriesService.createDelivery).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText(/1 succeeded/)).toBeInTheDocument();
      expect(screen.getByText(/1 failed/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Row 2:')).toBeInTheDocument();
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it('handles complete API failure', async () => {
    mockDeliveriesService.createDelivery.mockRejectedValue(new Error('Server error'));

    render(<BulkShipmentImport />, { wrapper: createWrapper() });

    const input = document.getElementById('csv-upload-input') as HTMLInputElement;
    const file = new File([singleCsvContent], 'fail.csv', { type: 'text/csv' });

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockDeliveriesService.createDelivery).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        'Bulk import failed',
        'All shipments failed to create'
      );
    });
  });

  it('allows resetting after upload completes', async () => {
    const mockDelivery = createMockDelivery('TRACK-001');
    mockDeliveriesService.createDelivery.mockResolvedValue(mockDelivery);

    render(<BulkShipmentImport />, { wrapper: createWrapper() });

    const input = document.getElementById('csv-upload-input') as HTMLInputElement;
    const file = new File([singleCsvContent], 'reset.csv', { type: 'text/csv' });

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/reset\.csv/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/1 shipment imported successfully/)).toBeInTheDocument();
    });

    const resetButton = screen.getByLabelText('Remove file');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.queryByText(/reset\.csv/)).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Click to upload or drag and drop/)).toBeInTheDocument();
    });
  });

  it('handles drag and drop of CSV file', async () => {
    const mockDelivery = createMockDelivery('TRACK-001');
    mockDeliveriesService.createDelivery.mockResolvedValue(mockDelivery);

    render(<BulkShipmentImport />, { wrapper: createWrapper() });

    const dropZone = document.querySelector('label[for="csv-upload-input"]') as HTMLElement;
    expect(dropZone).toBeTruthy();

    const file = new File([singleCsvContent], 'dropped.csv', { type: 'text/csv' });

    const dataTransfer = {
      files: [file],
    };

    fireEvent.dragEnter(dropZone, { dataTransfer });
    fireEvent.dragOver(dropZone, { dataTransfer });
    fireEvent.drop(dropZone, { dataTransfer });

    await waitFor(() => {
      expect(screen.getByText(/dropped\.csv/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockDeliveriesService.createDelivery).toHaveBeenCalledTimes(1);
    });

    expect(mockDeliveriesService.createDelivery).toHaveBeenCalledWith({
      pickupAddress: '123 Main St',
      destination: 'Lagos',
      packageSize: 'small',
      description: 'Electronics package',
      recipientName: 'John Doe',
      recipientPhone: '+2348012345678',
      recipientEmail: 'john@example.com',
    });
  });

  it('calls onComplete callback with results', async () => {
    const mockDelivery = createMockDelivery('TRACK-001');
    mockDeliveriesService.createDelivery.mockResolvedValue(mockDelivery);

    const onComplete = jest.fn();
    render(<BulkShipmentImport onComplete={onComplete} />, { wrapper: createWrapper() });

    const input = document.getElementById('csv-upload-input') as HTMLInputElement;
    const file = new File([singleCsvContent], 'callback.csv', { type: 'text/csv' });

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    const callbackResults = onComplete.mock.calls[0][0];
    expect(callbackResults).toHaveLength(1);
    expect(callbackResults[0].success).toBe(true);
    expect(callbackResults[0].trackingNumber).toBe('TRACK-001');
  });

  it('invalidates deliveries query on successful import', async () => {
    const mockDelivery = createMockDelivery('TRACK-001');
    mockDeliveriesService.createDelivery.mockResolvedValue(mockDelivery);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const wrapper = function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
    };

    render(<BulkShipmentImport />, { wrapper });

    const input = document.getElementById('csv-upload-input') as HTMLInputElement;
    const file = new File([singleCsvContent], 'invalidate.csv', { type: 'text/csv' });

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['deliveries'] });
    });

    invalidateQueries.mockRestore();
  });

  it('shows processing state during import', async () => {
    let resolveCreate: (_value: ReturnType<typeof createMockDelivery>) => void;
    const mockDeliveryPromise = new Promise<ReturnType<typeof createMockDelivery>>((resolve) => {
      resolveCreate = resolve;
    });

    mockDeliveriesService.createDelivery.mockReturnValue(mockDeliveryPromise);

    render(<BulkShipmentImport />, { wrapper: createWrapper() });

    const input = document.getElementById('csv-upload-input') as HTMLInputElement;
    const file = new File([singleCsvContent], 'progress.csv', { type: 'text/csv' });

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/Processing shipments/)).toBeInTheDocument();
    });

    resolveCreate!(createMockDelivery('TRACK-001'));
    await mockDeliveryPromise;

    await waitFor(() => {
      expect(screen.getByText(/Processing complete/)).toBeInTheDocument();
    });
  });

  it('handles CSV with extra whitespace in headers and values', async () => {
    const csvWithSpaces = ` pickupAddress , destination , packageSize , description , recipientName , recipientPhone , recipientEmail 
123 Main St,Lagos,small,Test,John Doe,+2348012345678,john@example.com`;
    const mockDelivery = createMockDelivery('TRACK-001');
    mockDeliveriesService.createDelivery.mockResolvedValue(mockDelivery);

    render(<BulkShipmentImport />, { wrapper: createWrapper() });

    const input = document.getElementById('csv-upload-input') as HTMLInputElement;
    const file = new File([csvWithSpaces], 'spaces.csv', { type: 'text/csv' });

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockDeliveriesService.createDelivery).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText(/1 shipment imported successfully/)).toBeInTheDocument();
    });
  });
});
