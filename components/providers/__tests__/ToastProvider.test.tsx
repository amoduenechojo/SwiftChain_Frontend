/**
 * ToastProvider Component Tests
 *
 * Tests that verify:
 * - Multiple toasts can be displayed simultaneously
 * - Toasts auto-dismiss after configured duration
 * - Toast types (success, error, info, loading) display correctly
 * - Toast content (message, description) is rendered
 * - Toast queue maintains FIFO ordering
 * - Action buttons work correctly
 * - Toast dismissal works correctly
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Create mock functions before mocking sonner
const mockToastFn = jest.fn();
mockToastFn.success = jest.fn();
mockToastFn.error = jest.fn();
mockToastFn.info = jest.fn();
mockToastFn.loading = jest.fn();
mockToastFn.dismiss = jest.fn();

// Mock sonner to have better control over toast behavior
jest.mock('sonner', () => ({
  Toaster: ({ children }: any) => <div data-testid="toaster">{children}</div>,
  toast: mockToastFn,
}));

// Mock the toastService
jest.mock('@/lib/toast', () => ({
  toastService: {
    subscribe: jest.fn((callback: any) => {
      // Store the callback for testing
      (window as any).__toastCallback = callback;
      return jest.fn();
    }),
  },
}));

import ToastProvider from '@/components/providers/ToastProvider';
import { toastService } from '@/lib/toast';

describe('ToastProvider Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window as any).__toastCallback = undefined;
    mockToastFn.mockClear();
    mockToastFn.success.mockClear();
    mockToastFn.error.mockClear();
    mockToastFn.info.mockClear();
    mockToastFn.loading.mockClear();
  });

  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <ToastProvider>
          <div data-testid="test-child">Test Content</div>
        </ToastProvider>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should render Toaster component', () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });

    it('should subscribe to toastService on mount', () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      expect(toastService.subscribe).toHaveBeenCalled();
    });
  });

  describe('Success Toast', () => {
    it('should display success toast with message', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      // Simulate firing a success toast
      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'success',
          message: 'Operation successful',
          description: 'Your changes have been saved',
          duration: 4000,
        });
      });

      expect(mockToastFn.success).toHaveBeenCalled();
      const call = mockToastFn.success.mock.calls[0];
      expect(call[0]).toBeDefined(); // JSX component
      expect(call[1]).toEqual(
        expect.objectContaining({
          duration: 4000,
        })
      );
    });

    it('should use default duration for success toast', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'success',
          message: 'Success',
        });
      });

      const call = mockToastFn.success.mock.calls[0];
      expect(call[1]).toEqual(
        expect.objectContaining({
          duration: 4000,
        })
      );
    });
  });

  describe('Error Toast', () => {
    it('should display error toast with message', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'error',
          message: 'Operation failed',
          description: 'An error occurred',
          duration: 4000,
        });
      });

      expect(mockToastFn.error).toHaveBeenCalled();
      const call = mockToastFn.error.mock.calls[0];
      expect(call[0]).toBeDefined();
      expect(call[1]).toEqual(
        expect.objectContaining({
          duration: 4000,
        })
      );
    });

    it('should use default duration for error toast', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'error',
          message: 'Error',
        });
      });

      const call = mockToastFn.error.mock.calls[0];
      expect(call[1]).toEqual(
        expect.objectContaining({
          duration: 4000,
        })
      );
    });
  });

  describe('Info Toast', () => {
    it('should display info toast', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'info',
          message: 'Information',
          description: 'Some info',
          duration: 4000,
        });
      });

      expect(mockToastFn).toHaveBeenCalled();
      // Info toast is called via the default toast function
    });
  });

  describe('Loading Toast', () => {
    it('should display loading toast without auto-dismiss', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'loading',
          message: 'Loading',
          description: 'Please wait',
        });
      });

      // Loading toast uses the default toast call (not mockToastFn.loading)
      expect(mockToastFn).toHaveBeenCalled();
      const call = mockToastFn.mock.calls[0];
      expect(call[1]).toEqual(
        expect.objectContaining({
          duration: 0,
          dismissible: false,
        })
      );
    });
  });

  describe('Multiple Toasts Queue', () => {
    it('should handle multiple toasts without clearing previous ones', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;

      act(() => {
        callback({
          variant: 'success',
          message: 'Toast 1',
          duration: 4000,
        });
      });

      act(() => {
        callback({
          variant: 'error',
          message: 'Toast 2',
          duration: 4000,
        });
      });

      act(() => {
        callback({
          variant: 'info',
          message: 'Toast 3',
          duration: 4000,
        });
      });

      // All toasts should be displayed
      expect(mockToastFn.success).toHaveBeenCalledTimes(1);
      expect(mockToastFn.error).toHaveBeenCalledTimes(1);
      // Info toast uses default toast call
      expect(mockToastFn).toHaveBeenCalledTimes(1);
    });

    it('should maintain FIFO ordering for toasts', async () => {
      const callOrder: string[] = [];

      mockToastFn.success.mockImplementation(() => {
        callOrder.push('success');
      });
      mockToastFn.error.mockImplementation(() => {
        callOrder.push('error');
      });

      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;

      act(() => {
        callback({ variant: 'success', message: 'First' });
        callback({ variant: 'error', message: 'Second' });
        callback({ variant: 'success', message: 'Third' });
      });

      expect(callOrder).toEqual(['success', 'error', 'success']);
    });

    it('should stack up to multiple toasts', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;

      // Add 5 toasts
      for (let i = 1; i <= 5; i++) {
        act(() => {
          callback({
            variant: i % 2 === 0 ? 'error' : 'success',
            message: `Toast ${i}`,
            duration: 4000,
          });
        });
      }

      // Verify toasts are called appropriately
      expect(mockToastFn.success).toHaveBeenCalledTimes(3);
      expect(mockToastFn.error).toHaveBeenCalledTimes(2);
    });

    it('should display overlapping toasts simultaneously', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;

      // Simulate overlapping toasts with short durations
      act(() => {
        callback({
          variant: 'success',
          message: 'Toast 1',
          duration: 2000,
        });
        callback({
          variant: 'error',
          message: 'Toast 2',
          duration: 3000,
        });
        callback({
          variant: 'info',
          message: 'Toast 3',
          duration: 4000,
        });
      });

      // All should be triggered immediately (overlapping)
      expect(mockToastFn.success).toHaveBeenCalledTimes(1);
      expect(mockToastFn.error).toHaveBeenCalledTimes(1);
      // Info toast uses default toast call
      expect(mockToastFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Toast with Actions', () => {
    it('should include action button in toast options', async () => {
      const mockAction = jest.fn();

      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'success',
          message: 'Action Toast',
          action: {
            label: 'Undo',
            onClick: mockAction,
          },
        });
      });

      expect(mockToastFn.success).toHaveBeenCalled();
      const call = mockToastFn.success.mock.calls[0];
      expect(call[1]).toEqual(
        expect.objectContaining({
          action: expect.objectContaining({
            label: 'Undo',
            onClick: mockAction,
          }),
        })
      );
    });

    it('should handle toast without action', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'success',
          message: 'No Action Toast',
        });
      });

      expect(mockToastFn.success).toHaveBeenCalled();
      const call = mockToastFn.success.mock.calls[0];
      expect(call[1].action).toBeUndefined();
    });
  });

  describe('Toast Auto-Dismiss', () => {
    it('should auto-dismiss success toast after duration', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'success',
          message: 'Auto-dismiss',
          duration: 2000,
        });
      });

      const call = mockToastFn.success.mock.calls[0];
      expect(call[1].duration).toBe(2000);
    });

    it('should auto-dismiss error toast after duration', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'error',
          message: 'Auto-dismiss',
          duration: 3000,
        });
      });

      const call = mockToastFn.error.mock.calls[0];
      expect(call[1].duration).toBe(3000);
    });

    it('should not auto-dismiss loading toast', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'loading',
          message: 'Loading',
        });
      });

      // Loading toast uses default toast call, not mockToastFn.loading
      const call = mockToastFn.mock.calls[0];
      expect(call[1].duration).toBe(0);
    });

    it('should apply dismissible: false to loading toasts', async () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'loading',
          message: 'Loading',
        });
      });

      // Loading toast uses default toast call
      const call = mockToastFn.mock.calls[0];
      expect(call[1].dismissible).toBe(false);
    });
  });

  describe('Toast Content Rendering', () => {
    it('should render success toast with message and description', () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'success',
          message: 'Success Message',
          description: 'Success Description',
        });
      });

      expect(mockToastFn.success).toHaveBeenCalled();
      const component = mockToastFn.success.mock.calls[0][0];
      expect(component.props.message).toBe('Success Message');
      expect(component.props.description).toBe('Success Description');
    });

    it('should render error toast with message and description', () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'error',
          message: 'Error Message',
          description: 'Error Description',
        });
      });

      expect(mockToastFn.error).toHaveBeenCalled();
      const component = mockToastFn.error.mock.calls[0][0];
      expect(component.props.message).toBe('Error Message');
      expect(component.props.description).toBe('Error Description');
    });

    it('should render toast with message only', () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const callback = (window as any).__toastCallback;
      act(() => {
        callback({
          variant: 'success',
          message: 'Just Message',
        });
      });

      expect(mockToastFn.success).toHaveBeenCalled();
      const component = mockToastFn.success.mock.calls[0][0];
      expect(component.props.message).toBe('Just Message');
      expect(component.props.description).toBeUndefined();
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from toastService on unmount', () => {
      const unsubscribeMock = jest.fn();
      jest.mocked(toastService.subscribe).mockReturnValue(unsubscribeMock);

      const { unmount } = render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
