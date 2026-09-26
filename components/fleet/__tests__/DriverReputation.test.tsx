import { render, screen, fireEvent } from '@testing-library/react';
import { DriverReputation } from '../DriverReputation';
import { useDriverReputation } from '@/hooks/useDriverReputation';

// Mock the useDriverReputation hook
jest.mock('@/hooks/useDriverReputation');
const mockedUseDriverReputation = useDriverReputation as jest.Mock;

describe('DriverReputation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the standard rating', () => {
    mockedUseDriverReputation.mockReturnValue({
      onChainScore: null,
      isLoading: false,
      error: null,
    });

    render(<DriverReputation driverId="1" standardRating={4.8} />);

    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByTitle('Standard Platform Rating')).toBeInTheDocument();
  });

  it('should show a loading skeleton for the on-chain score', () => {
    mockedUseDriverReputation.mockReturnValue({
      onChainScore: null,
      isLoading: true,
      error: null,
    });

    const { container } = render(<DriverReputation driverId="1" standardRating={4.8} />);

    expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
  });

  it('should render both standard and on-chain scores when available', () => {
    mockedUseDriverReputation.mockReturnValue({
      onChainScore: 1250,
      isLoading: false,
      error: null,
    });

    render(<DriverReputation driverId="1" standardRating={4.9} />);

    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(
      screen.getByTitle('Verified On-Chain Reputation Score'),
    ).toBeInTheDocument();
  });

  it('should not render the on-chain score if it is 0 or null', () => {
    mockedUseDriverReputation.mockReturnValue({
      onChainScore: 0,
      isLoading: false,
      error: null,
    });

    render(<DriverReputation driverId="1" standardRating={4.5} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(
      screen.queryByTitle('Verified On-Chain Reputation Score'),
    ).not.toBeInTheDocument();
  });

  it('should open and close the information modal', () => {
    mockedUseDriverReputation.mockReturnValue({
      onChainScore: 1250,
      isLoading: false,
      error: null,
    });

    render(<DriverReputation driverId="1" standardRating={4.9} />);

    expect(screen.queryByText('About Reputation Scores')).not.toBeInTheDocument();

    const infoButton = screen.getByLabelText(
      'More information about reputation scores',
    );
    fireEvent.click(infoButton);

    expect(screen.getByText('About Reputation Scores')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Got it' });
    fireEvent.click(closeButton);

    expect(screen.queryByText('About Reputation Scores')).not.toBeInTheDocument();
  });
});