import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/components/Navbar', () => ({ default: () => <nav data-testid="navbar">Navbar</nav> }));
vi.mock('@/components/Footer', () => ({ default: () => <footer data-testid="footer">Footer</footer> }));
vi.mock('@/components/PageHead', () => ({ default: () => null }));
vi.mock('@/components/SearchResultsSkeleton', () => ({ default: () => <div>Loading...</div> }));

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}));

vi.mock('@/services/routeService', () => ({
  getCities: vi.fn().mockResolvedValue(['Dhaka', 'Chattogram']),
  searchTrips: vi.fn().mockResolvedValue([]),
  BusResult: {},
}));

import SearchResults from '@/pages/SearchResults';

function renderSearchResults(query = '?from=Dhaka&to=Chattogram&date=2026-04-01&passengers=1') {
  return render(
    <MemoryRouter initialEntries={[`/search${query}`]}>
      <SearchResults />
    </MemoryRouter>,
  );
}

describe('SearchResults Page', () => {
  it('renders without crashing', () => {
    expect(() => renderSearchResults()).not.toThrow();
  });

  it('renders Navbar and Footer', () => {
    renderSearchResults();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders the search form with From/To fields', () => {
    renderSearchResults();
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
  });
});
