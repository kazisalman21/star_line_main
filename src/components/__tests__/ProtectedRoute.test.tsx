import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock useAuth BEFORE importing ProtectedRoute
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

import ProtectedRoute from '@/components/ProtectedRoute';

function renderWithRoutes(requireAdmin = false, route = '/protected') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requireAdmin={requireAdmin}>
              <div data-testid="protected-content">Secret Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/signin" element={<div data-testid="signin-page">Sign In Page</div>} />
        <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@test.com' },
      profile: { role: 'passenger' },
      loading: false,
    });

    renderWithRoutes();
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects to /signin when user is null', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
    });

    renderWithRoutes();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('signin-page')).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
    });

    renderWithRoutes();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects to / when requireAdmin but user is passenger', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@test.com' },
      profile: { role: 'passenger' },
      loading: false,
    });

    renderWithRoutes(true);
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders children when requireAdmin and user is admin', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'admin@test.com' },
      profile: { role: 'admin' },
      loading: false,
    });

    renderWithRoutes(true);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
