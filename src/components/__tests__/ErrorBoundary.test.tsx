import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock ErrorBoundary's dependencies
vi.mock('lucide-react', () => ({
  AlertTriangle: () => <span data-testid="alert-icon" />,
  Home: () => <span data-testid="home-icon" />,
  RotateCcw: () => <span data-testid="retry-icon" />,
}));

import ErrorBoundary from '@/components/ErrorBoundary';

// A component that throws
function ProblemChild({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('Test explosion');
  return <div data-testid="child">All good</div>;
}

describe('ErrorBoundary', () => {
  // Suppress React error boundary console output during tests
  const originalError = console.error;
  beforeAll(() => { console.error = vi.fn(); });
  afterAll(() => { console.error = originalError; });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('displays the error message', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Test explosion')).toBeInTheDocument();
  });

  it('renders Try Again and Go Home actions', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });
});
