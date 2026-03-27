import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PageHead from '@/components/PageHead';
import heroImage from '@/assets/auth-hero.webp';
import logoImage from '@/assets/starline-logo-full.png';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.from || '/';

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      navigate(returnTo, { replace: true });
    }
  };

  const handleGoogleSSO = async () => {
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (authError) setError(authError.message);
  };

  const handleFacebookSSO = async () => {
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'facebook' });
    if (authError) setError(authError.message);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <PageHead title="Sign In — Star Line Group" description="Sign in to your Star Line account to book tickets, manage bookings, and track trips." />

      {/* Left — Branding panel */}
      <div className="hidden lg:flex lg:w-[45%] relative items-end justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/60" />

        <div className="relative z-10 p-12 pb-16 max-w-lg">
          <Link to="/" className="flex items-center gap-2 mb-10 group">
            <img src={logoImage} alt="Star Line Group" className="h-20 w-auto" />
          </Link>

          <h1 className="text-3xl font-bold text-foreground leading-snug mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Your journey begins <br />
            <span className="text-gradient-primary">with a single tap.</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Premium intercity travel across Bangladesh. Book, track, and manage your trips with Star Line.
          </p>

          {/* Trust badges */}
          <div className="flex gap-6 mt-8">
            {[
              { n: '50K+', l: 'Happy Riders' },
              { n: '99.2%', l: 'On-Time Rate' },
              { n: '4.9★', l: 'Rating' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-lg font-bold text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.n}</p>
                <p className="text-[11px] text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Sign In form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-10">
            <img src={logoImage} alt="Star Line Group" className="h-14 w-auto" />
          </Link>

          <div className="mb-8">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">Welcome back</span>
            <h2 className="text-3xl font-bold text-foreground mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter your credentials to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleGoogleSSO}
              className="flex items-center justify-center gap-2 h-12 rounded-lg border border-border bg-secondary/50 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button
              onClick={handleFacebookSSO}
              className="flex items-center justify-center gap-2 h-12 rounded-lg border border-border bg-secondary/50 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground tracking-wider uppercase">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase block mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-12 rounded-lg bg-secondary/50 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Password</label>
                <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 rounded-lg bg-secondary/50 border border-border px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-border bg-secondary accent-primary" />
              <label htmlFor="remember" className="text-sm text-muted-foreground">Keep me signed in</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors btn-primary-glow group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">Create one</Link>
          </p>

          <p className="text-center text-[11px] text-muted-foreground/60 mt-8">
            By signing in you agree to our <span className="underline cursor-pointer">Terms</span> & <span className="underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
