import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { vi, type Mock } from 'vitest';
import type { ReactElement, ReactNode } from 'react';

// Fresh QueryClient per test — no shared cache
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: MemoryRouterProps['initialEntries'];
}

/**
 * Renders a component wrapped with the provider stack used in App.tsx
 * (QueryClient + MemoryRouter + TooltipProvider).
 *
 * Does NOT include AuthProvider — tests that need auth should mock
 * useAuth or wrap with AuthProvider themselves after mocking supabase.
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialEntries = ['/'], ...options }: RenderWithProvidersOptions = {},
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <TooltipProvider>{children}</TooltipProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient };
}

/**
 * Creates a complete Supabase mock.
 * Call this in vi.mock('@/lib/supabase', ...) factory.
 */
export function createSupabaseMock() {
  const chainable = () => {
    const obj: Record<string, Mock> = {};
    obj.select = vi.fn().mockReturnValue(obj);
    obj.insert = vi.fn().mockReturnValue(obj);
    obj.update = vi.fn().mockReturnValue(obj);
    obj.upsert = vi.fn().mockReturnValue(obj);
    obj.delete = vi.fn().mockReturnValue(obj);
    obj.eq = vi.fn().mockReturnValue(obj);
    obj.neq = vi.fn().mockReturnValue(obj);
    obj.single = vi.fn().mockResolvedValue({ data: null, error: null });
    obj.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    obj.order = vi.fn().mockReturnValue(obj);
    obj.limit = vi.fn().mockReturnValue(obj);
    obj.range = vi.fn().mockReturnValue(obj);
    obj.then = undefined; // prevent auto-await treating it as thenable
    return obj;
  };

  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
      from: vi.fn().mockReturnValue(chainable()),
    },
  };
}

// Default mock — importable for quick use
export const mockSupabase = createSupabaseMock();
