import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock supabase (SearchForm → routeService → supabase)
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          then: vi.fn(),
        }),
        then: vi.fn(),
      }),
    }),
  },
}));

// Mock routeService to avoid real supabase calls
vi.mock('@/services/routeService', () => ({
  getCities: vi.fn().mockResolvedValue(['Dhaka', 'Chattogram', "Cox's Bazar", 'Sylhet']),
}));

import SearchForm from '@/components/SearchForm';

function renderSearchForm(variant: 'hero' | 'compact' = 'hero') {
  return render(
    <MemoryRouter>
      <SearchForm variant={variant} />
    </MemoryRouter>,
  );
}

describe('SearchForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders From label and select', () => {
    renderSearchForm();
    expect(screen.getByText('From')).toBeInTheDocument();
  });

  it('renders To label and select', () => {
    renderSearchForm();
    expect(screen.getByText('To')).toBeInTheDocument();
  });

  it('renders Date label and input', () => {
    renderSearchForm();
    expect(screen.getByText('Date')).toBeInTheDocument();
  });

  it('renders Passengers label and select', () => {
    renderSearchForm();
    expect(screen.getByText('Passengers')).toBeInTheDocument();
  });

  it('renders Search button', () => {
    renderSearchForm();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders with compact variant without crashing', () => {
    expect(() => renderSearchForm('compact')).not.toThrow();
  });
});
