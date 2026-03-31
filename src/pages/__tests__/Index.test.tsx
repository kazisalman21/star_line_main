import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock heavy child components to avoid their dependency chains
vi.mock('@/components/AnimatedHero', () => ({ default: () => <div data-testid="hero">Hero</div> }));
vi.mock('@/components/Navbar', () => ({ default: () => <nav data-testid="navbar">Navbar</nav> }));
vi.mock('@/components/Footer', () => ({ default: () => <footer data-testid="footer">Footer</footer> }));
vi.mock('@/components/PageHead', () => ({ default: () => null }));

// Mock supabase (routeService uses it)
vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}));

vi.mock('@/services/routeService', () => ({
  getPopularRoutes: vi.fn().mockResolvedValue([]),
  PopularRoute: {},
}));

import Index from '@/pages/Index';

function renderIndex() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Index />
    </MemoryRouter>,
  );
}

describe('Index (Homepage)', () => {
  it('renders without crashing', () => {
    expect(() => renderIndex()).not.toThrow();
  });

  it('renders Navbar, Hero, and Footer', () => {
    renderIndex();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders feature section with "Why Star Line"', () => {
    renderIndex();
    expect(screen.getByText('Why Star Line')).toBeInTheDocument();
    expect(screen.getByText('A Better Way to Travel')).toBeInTheDocument();
  });

  it('renders trust strip items', () => {
    renderIndex();
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText('On-Time Performance')).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    renderIndex();
    expect(screen.getByText('Book Your Next Trip')).toBeInTheDocument();
    expect(screen.getByText('Search Trips')).toBeInTheDocument();
  });
});
