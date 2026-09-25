import { render, screen } from '@testing-library/react';
import OfflineBanner from '@/components/ui/OfflineBanner';
import useOffline from '@/hooks/useOffline';

jest.mock('@/hooks/useOffline');

const mockedUseOffline = useOffline as jest.Mock;

describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing while online and no success flash is pending', () => {
    mockedUseOffline.mockReturnValue({ isOnline: true, showBackOnline: false });

    const { container } = render(<OfflineBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the offline message while disconnected', () => {
    mockedUseOffline.mockReturnValue({ isOnline: false, showBackOnline: false });

    render(<OfflineBanner />);

    expect(screen.getByRole('status')).toHaveTextContent(/currently offline/i);
  });

  it('shows the "Back Online!" success state', () => {
    mockedUseOffline.mockReturnValue({ isOnline: true, showBackOnline: true });

    render(<OfflineBanner />);

    expect(screen.getByRole('status')).toHaveTextContent(/back online!/i);
  });
});
