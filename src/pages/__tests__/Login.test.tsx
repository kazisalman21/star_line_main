import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock supabase BEFORE any component import
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}));

// Mock image imports
vi.mock('@/assets/auth-hero.webp', () => ({ default: '' }));
vi.mock('@/assets/starline-logo-full.png', () => ({ default: '' }));

// Mock PageHead to avoid helmet issues
vi.mock('@/components/PageHead', () => ({
  default: () => null,
}));

import Login from '@/pages/Login';

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/signin']}>
      <Login />
    </MemoryRouter>,
  );
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email input', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('renders password input', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders Sign in heading', () => {
    renderLogin();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('renders Google SSO button', () => {
    renderLogin();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('renders Facebook SSO button', () => {
    renderLogin();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });

  it('has link to create account', () => {
    renderLogin();
    expect(screen.getByText('Create one')).toBeInTheDocument();
  });

  it('renders sign in submit button', () => {
    renderLogin();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders remember me checkbox', () => {
    renderLogin();
    expect(screen.getByText('Keep me signed in')).toBeInTheDocument();
  });
});
