import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock supabase BEFORE any component import
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}));

// Mock image imports
vi.mock('@/assets/auth-hero.webp', () => ({ default: '' }));
vi.mock('@/assets/starline-logo-full.png', () => ({ default: '' }));

// Mock PageHead
vi.mock('@/components/PageHead', () => ({
  default: () => null,
}));

import Register from '@/pages/Register';

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <Register />
    </MemoryRouter>,
  );
}

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email input on step 1', () => {
    renderRegister();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('renders password input on step 1', () => {
    renderRegister();
    expect(screen.getByPlaceholderText('Minimum 8 characters')).toBeInTheDocument();
  });

  it('renders Create account heading', () => {
    renderRegister();
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });

  it('renders Google SSO button', () => {
    renderRegister();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('renders Facebook SSO button', () => {
    renderRegister();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });

  it('has link to sign in page', () => {
    renderRegister();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('renders step indicator', () => {
    renderRegister();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('renders Continue button on step 1', () => {
    renderRegister();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });
});
