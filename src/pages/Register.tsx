import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PageHead from '@/components/PageHead';
import heroImage from '@/assets/auth-hero.webp';
import logoImage from '@/assets/starline-logo-full.png';

const benefits = [
  'Instant e-tickets & QR boarding',
  'Earn Star Line loyalty points',
  'Exclusive premium departure access',
  'Live trip tracking & alerts',
];

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleSSO = async () => {
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (authError) setError(authError.message);
  };

  const handleFacebookSSO = async () => {
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'facebook' });
    if (authError) setError(authError.message);
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email format'); return; }
    if (!password) { setError('Password is required'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(password)) { setError('Include at least one uppercase letter'); return; }
    if (!/[0-9]/.test(password)) { setError('Include at least one number'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Full name is required'); return; }
    if (!phone.trim()) { setError('Phone number is required'); return; }
    const fullPhone = phone.startsWith('+') || phone.startsWith('0') ? phone : `+880${phone}`;
    if (!/^(\+?880|0)1[3-9]\d{8}$/.test(fullPhone.replace(/\s/g, ''))) {
      setError('Enter a valid BD phone number');
      return;
    }
    if (!agreedTerms) { setError('You must agree to the terms'); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, phone: fullPhone },
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess('Account created! Please check your email to confirm your account.');
    }
    setLoading(false);
  };

  // Password strength
  const getStrength = () => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };
  const strength = getStrength();

  return (
    <div className="min-h-screen bg-background flex">
      <PageHead title="Create Account — Star Line Group" description="Create your Star Line account to book bus tickets, manage bookings, and enjoy exclusive benefits." />

      {/* Left — Branding panel */}
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/60" />

        <div className="relative z-10 p-12 max-w-lg">
          <Link to="/" className="flex items-center gap-2 mb-12 group">
            <img src={logoImage} alt="Star Line Group" className="h-20 w-auto" />
          </Link>

          <h1 className="text-3xl font-bold text-foreground leading-snug mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Join the <span className="text-gradient-primary">premium</span> <br />
            travel experience.
          </h1>

          <div className="space-y-4 mt-8">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 glass-card-accent p-5">
            <p className="text-xs text-primary font-medium tracking-wider uppercase mb-1">Limited Offer</p>
            <p className="text-sm text-foreground font-medium">
              Sign up today & get <span className="text-primary font-bold">200 bonus points</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Valid for first-time riders only</p>
          </div>
        </div>
      </div>

      {/* Right — Sign Up form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-10">
            <img src={logoImage} alt="Star Line Group" className="h-14 w-auto" />
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">Account</span>
            </div>
            <div className={`flex-1 h-px ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                2
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">Details</span>
            </div>
          </div>

          <div className="mb-8">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">Get started</span>
            <h2 className="text-3xl font-bold text-foreground mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Create account</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1 ? 'Enter your email and password' : 'Tell us a bit about yourself'}
            </p>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-lg px-4 py-3 mb-6">
              {success}
            </div>
          )}

          {step === 1 && (
            <>
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

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground tracking-wider uppercase">or use email</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form className="space-y-4" onSubmit={handleStep1}>
                <div>
                  <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase block mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    className="w-full h-12 rounded-lg bg-secondary/50 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="Minimum 8 characters"
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
                  {/* Password strength */}
                  {password.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= strength
                              ? strength >= 4 ? 'bg-green-500' : strength >= 3 ? 'bg-blue-500' : strength >= 2 ? 'bg-yellow-500' : 'bg-destructive'
                              : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors btn-primary-glow group"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="Enter your full name"
                  className="w-full h-12 rounded-lg bg-secondary/50 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase block mb-1.5">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center h-12 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground shrink-0">
                    +880
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(''); }}
                    placeholder="1XXXXXXXXX"
                    className="w-full h-12 rounded-lg bg-secondary/50 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 mt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedTerms}
                  onChange={(e) => { setAgreedTerms(e.target.checked); setError(''); }}
                  className="w-4 h-4 rounded border-border bg-secondary accent-primary mt-0.5"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                  I agree to the <span className="text-primary underline cursor-pointer">Terms of Service</span> and{' '}
                  <span className="text-primary underline cursor-pointer">Privacy Policy</span>
                </label>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="flex-1 h-12 flex items-center justify-center rounded-lg text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] h-12 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors btn-primary-glow group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
