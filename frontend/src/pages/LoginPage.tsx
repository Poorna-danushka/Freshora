import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Star,
  Shield,
  Truck,
  Leaf,
  CheckCircle,
  Headphones,
  Clock,
  Sparkles,
} from 'lucide-react';
import { authApi, getPostAuthPath } from '@/api/auth';
import { parseApiError } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import loginCinematic from '@/assets/login_cinematic.png';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof schema>;

const REVIEWS = [
  {
    name: 'Samanthi Perera',
    area: 'Colombo 07',
    text: 'Freshora delivered fresh organic vegetables in under 25 minutes! Best grocery app in Sri Lanka.',
    avatar: 'S',
    role: 'Verified Buyer',
    rating: 5,
  },
  {
    name: 'Ruwan Jayasinghe',
    area: 'Nugegoda',
    text: 'Extremely fast delivery and the fruit quality was unbeatable. Highly recommended!',
    avatar: 'R',
    role: 'Loyal Customer',
    rating: 5,
  },
  {
    name: 'Dilini Mendis',
    area: 'Battaramulla',
    text: 'Ordering daily produce takes less than a minute. Smooth app and amazing service!',
    avatar: 'D',
    role: 'Regular Shopper',
    rating: 5,
  },
];

const BENEFITS = [
  { icon: Truck, title: '30-Min Fast Delivery', desc: 'Direct to your door' },
  { icon: Shield, title: 'Fresh & Quality', desc: 'Handpicked with care' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here for you' },
];

const FLOATING_EMOJIS = [
  { emoji: '🥦', style: { top: '8%', left: '3%', fontSize: '2.2rem' }, delay: '0s', dur: '6s' },
  { emoji: '🍎', style: { top: '15%', right: '4%', fontSize: '2rem' }, delay: '1.2s', dur: '7s' },
  { emoji: '🍋', style: { bottom: '22%', left: '2%', fontSize: '1.8rem' }, delay: '2.5s', dur: '5.5s' },
  { emoji: '🌶️', style: { top: '62%', right: '3%', fontSize: '1.9rem' }, delay: '0.8s', dur: '6.5s' },
  { emoji: '🥥', style: { bottom: '12%', right: '12%', fontSize: '2.1rem' }, delay: '1.8s', dur: '7.5s' },
];

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const loginState = location.state as {
    from?: { pathname: string; search?: string; hash?: string };
    message?: string;
  } | null;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % REVIEWS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user }) => {
      setUser(user);
      navigate(getPostAuthPath(user.role, loginState?.from), { replace: true });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      setError('email', { message: apiError.message });
      setError('password', { message: apiError.message });
    },
  });

  return (
    <div className="h-screen max-h-screen w-full text-white font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between relative overflow-hidden bg-slate-950">
      {/* ── Background Cinematic Image Layer with Ken Burns Zoom ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={loginCinematic}
          alt=""
          className="w-full h-full object-cover scale-105 opacity-25"
          style={{ animation: 'kenBurns 24s ease-in-out infinite alternate' }}
        />
        {/* Rich dark forest gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(7, 28, 17, 0.85) 0%, rgba(10, 46, 26, 0.78) 40%, rgba(7, 28, 17, 0.9) 100%)',
          }}
        />
      </div>

      {/* ── Background Ambient Light Orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #52bc81 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite' }}
        />
        <div
          className="absolute -bottom-40 -left-20 w-[550px] h-[550px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite 2s' }}
        />
      </div>

      {/* ── Decorative Rotating Dashed Ring ── */}
      <div
        className="absolute w-[520px] h-[520px] border border-dashed rounded-full animate-spin-slow pointer-events-none top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 hidden xl:block"
        style={{ borderColor: 'rgba(82,188,129,0.2)' }}
      />

      {/* ── Floating Graphic Card 1: Express Delivery Badge ── */}
      <div
        className="absolute top-24 left-10 z-10 hidden xl:flex items-center gap-3 px-4 py-3 rounded-2xl animate-float-slow backdrop-blur-md"
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
        }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(82,188,129,0.25)' }}>
          <Clock size={18} style={{ color: '#74c898' }} />
        </div>
        <div>
          <p className="text-[10px] font-medium text-white/60">Express Delivery</p>
          <p className="text-xs font-bold" style={{ color: '#74c898' }}>30 Minutes</p>
        </div>
      </div>

      {/* ── Floating Graphic Card 2: Fresh Quality Verified ── */}
      <div
        className="absolute bottom-20 left-16 z-10 hidden xl:flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl backdrop-blur-md"
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
        }}
      >
        <Sparkles size={16} style={{ color: '#52bc81' }} />
        <span className="text-xs font-bold text-white">100% Farm Fresh Verified</span>
      </div>

      {/* ── Floating Emojis ── */}
      {FLOATING_EMOJIS.map((f, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none z-10"
          style={{
            ...f.style,
            animation: `floatEmoji ${f.dur} ease-in-out infinite`,
            animationDelay: f.delay,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
          }}
        >
          {f.emoji}
        </div>
      ))}

      {/* ── Top Header Navigation Bar (Home Page Style) ── */}
      <header className="relative z-20 mx-auto max-w-7xl w-full px-6 py-3.5 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #1a7a4a 0%, #52bc81 100%)',
              boxShadow: '0 4px 14px rgba(82,188,129,0.35)',
            }}
          >
            <Leaf size={17} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Fresh<span style={{ color: '#74c898' }}>ora</span>
          </span>
        </Link>

        <Link
          to="/signup"
          state={loginState}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border border-white/15 hover:bg-white/15"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', color: '#fff' }}
        >
          <span className="text-white/70">New to Freshora?</span>
          <span style={{ color: '#74c898' }} className="font-extrabold">Create account</span>
          <ArrowRight size={13} style={{ color: '#74c898' }} />
        </Link>
      </header>

      {/* ── Main Split Layout Container — Fits Single Viewport Screen ── */}
      <main className="relative z-20 mx-auto max-w-7xl w-full px-4 sm:px-6 my-auto grid lg:grid-cols-12 gap-8 items-center shrink-0">
        {/* Left Side: Home Page Style Hero Showcase */}
        <div className="lg:col-span-6 space-y-4 hidden lg:block pr-2">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/10 backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#74c898' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#52bc81' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#52bc81' }} />
            </span>
            🇱🇰&nbsp; 100% Fresh &amp; Local — Colombo
          </div>

          <h1 className="font-extrabold leading-[1.08] text-3xl xl:text-4xl tracking-tight">
            <span className="block text-white">Fresh Groceries,</span>
            <span
              className="block"
              style={{
                background: 'linear-gradient(90deg, #52bc81 0%, #a8e6c3 50%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Delivered Fast.
            </span>
          </h1>

          <p className="text-xs leading-relaxed text-white/70 max-w-md">
            Sign in to access saved grocery items, place instant 30-minute orders, track real-time delivery riders, or manage your workspace.
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl border border-white/10 backdrop-blur-md"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <b.icon size={16} style={{ color: '#74c898' }} className="mb-1" />
                <h3 className="font-bold text-white text-xs leading-snug">{b.title}</h3>
                <p className="text-[10px] text-white/50">{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl border border-white/10 backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-1 mb-1">
              {[...Array(REVIEWS[activeReview].rating)].map((_, i) => (
                <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
              ))}
              <span className="text-amber-400 text-xs font-bold ml-1">4.9 / 5.0</span>
            </div>
            <p className="text-xs font-medium text-white/90 italic">"{REVIEWS[activeReview].text}"</p>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="font-bold" style={{ color: '#74c898' }}>
                {REVIEWS[activeReview].name} · <span className="text-white/50 font-normal">{REVIEWS[activeReview].area}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/70 font-semibold">{REVIEWS[activeReview].role}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Home Page Styled Glass Card */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <div
            className="rounded-3xl p-6 sm:p-7 space-y-5 border border-white/15 shadow-2xl"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <div className="space-y-1 text-left">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
              <p className="text-xs text-white/60">Enter your account credentials to continue.</p>
            </div>

            {loginState?.message && (
              <div className="p-3 rounded-2xl border border-amber-300/30 bg-amber-400/10 text-amber-100 text-xs font-semibold flex items-center gap-2">
                <CheckCircle size={14} className="text-amber-300 shrink-0" />
                <span>{loginState.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit((d) => login(d))} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3 text-white/40" />
                  <input
                    {...register('email')}
                    id="login-email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none transition"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: errors.email ? '1.5px solid rgba(239,68,68,0.7)' : '1.5px solid rgba(255,255,255,0.15)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.border = '1.5px solid rgba(82,188,129,0.7)')}
                    onBlur={(e) =>
                      (e.currentTarget.style.border = errors.email
                        ? '1.5px solid rgba(239,68,68,0.7)'
                        : '1.5px solid rgba(255,255,255,0.15)')
                    }
                  />
                </div>
                {errors.email && <p className="text-red-400 text-[11px] font-semibold mt-1">{errors.email.message}</p>}
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: '#74c898' }}>
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-white/40" />
                  <input
                    {...register('password')}
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-white/30 outline-none transition"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: errors.password ? '1.5px solid rgba(239,68,68,0.7)' : '1.5px solid rgba(255,255,255,0.15)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.border = '1.5px solid rgba(82,188,129,0.7)')}
                    onBlur={(e) =>
                      (e.currentTarget.style.border = errors.password
                        ? '1.5px solid rgba(239,68,68,0.7)'
                        : '1.5px solid rgba(255,255,255,0.15)')
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-white/40 hover:text-white/70 transition"
                    aria-label="Toggle Password Visibility"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-[11px] font-semibold mt-1">{errors.password.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl text-white font-bold text-sm py-3 transition duration-300 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #1a7a4a 0%, #157040 100%)',
                  boxShadow: '0 8px 24px rgba(26,122,74,0.45)',
                }}
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Signing in…
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-white/60 pt-1">
              Don't have an account?{' '}
              <Link to="/signup" state={loginState} className="font-bold hover:underline transition" style={{ color: '#74c898' }}>
                Create one free →
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* ── Footer Stats Bar (Home Page Style) ── */}
      <footer className="relative z-20 border-t border-white/10 py-2.5 px-6 shrink-0" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}>
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center sm:justify-between gap-3 text-xs text-white/60">
          <p className="font-medium text-[11px]">© {new Date().getFullYear()} Freshora Inc. All rights reserved.</p>
          <div className="flex items-center gap-5 text-[11px] font-semibold">
            <span>🚀 30-Min Fast Delivery</span>
            <span>⭐ 4.9 App Rating</span>
            <span>🔒 Encrypted SSL Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
