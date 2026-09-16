import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, Star } from 'lucide-react';
import { authApi, getDashboardPath } from '@/api/auth';
import { useAuthStore } from '@/store/useAuthStore';
import loginCinematic from '@/assets/login_cinematic.png';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof schema>;

const REVIEWS = [
  { name: 'Samanthi P.', area: 'Colombo 07', text: 'Groceries in 25 min. Absolutely love it!', avatar: 'S', color: 'bg-emerald-500' },
  { name: 'Ruwan K.', area: 'Nugegoda', text: 'Freshest veggies I\'ve ever ordered online.', avatar: 'R', color: 'bg-blue-500' },
  { name: 'Dilini M.', area: 'Battaramulla', text: 'So easy, so fast, so fresh!', avatar: 'D', color: 'bg-purple-500' },
];

// Animated floating food emoji blobs
const FLOATS = [
  { emoji: '🥦', style: { top: '8%', left: '6%', fontSize: '2.5rem' }, delay: '0s', dur: '6s' },
  { emoji: '🍅', style: { top: '15%', right: '8%', fontSize: '2rem' }, delay: '1s', dur: '7s' },
  { emoji: '🌶️', style: { bottom: '20%', left: '5%', fontSize: '1.8rem' }, delay: '2s', dur: '5s' },
  { emoji: '🥥', style: { bottom: '10%', right: '10%', fontSize: '2.2rem' }, delay: '0.5s', dur: '8s' },
  { emoji: '🍋', style: { top: '45%', left: '3%', fontSize: '1.6rem' }, delay: '1.5s', dur: '6.5s' },
  { emoji: '🥕', style: { top: '70%', right: '5%', fontSize: '1.8rem' }, delay: '3s', dur: '7.5s' },
];

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const t = setInterval(() => setActiveReview(p => (p + 1) % REVIEWS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user }) => {
      setUser(user);
      navigate(getDashboardPath(user.role));
    },
    onError: (error) => {
      const message = error instanceof Error && 'response' in error
        ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Invalid email or password')
        : 'Unable to connect to the server';
      setError('email', { message });
    },
  });

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center">

      {/* ── Full-screen background image ── */}
      <img
        src={loginCinematic}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scale(1.05)', animation: 'kenBurns 20s ease-in-out infinite alternate' }}
      />

      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-primary-900/60 to-black/80" />

      {/* Blur vignette edges */}
      <div className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.6)' }}
      />

      {/* Floating food emojis */}
      {FLOATS.map((f, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
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

      {/* Top-left branding */}
      <Link to="/" className="absolute top-6 left-8 flex items-center gap-2.5 z-20 group">
        <div className="w-9 h-9 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/25 group-hover:bg-white/25 transition-colors">
          <span className="text-white font-black text-base">F</span>
        </div>
        <span className="font-black text-xl text-white tracking-tight drop-shadow-lg">
          Fresh<span className="text-primary-300">ora</span>
        </span>
      </Link>

      {/* Top-right signup link */}
      <div className="absolute top-6 right-8 z-20">
        <Link to="/signup" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 rounded-full text-white text-sm font-medium transition-all">
          New here? <span className="font-bold text-primary-300">Sign up free</span> <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── Centered glass card ── */}
      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          {/* Card header — review strip */}
          <div className="px-8 pt-7 pb-5 border-b border-white/10">
            <div className="flex items-center gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-amber-400 fill-amber-400" />)}
              <span className="text-white/60 text-xs ml-2">Trusted by 5,000+ in Colombo</span>
            </div>
            <div className="flex items-center gap-3 min-h-[44px]">
              <div className={`w-8 h-8 ${REVIEWS[activeReview].color} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 transition-all duration-500`}>
                {REVIEWS[activeReview].avatar}
              </div>
              <div className="transition-all duration-500">
                <p className="text-white text-sm font-medium leading-tight">"{REVIEWS[activeReview].text}"</p>
                <p className="text-white/50 text-xs mt-0.5">{REVIEWS[activeReview].name} · {REVIEWS[activeReview].area}</p>
              </div>
            </div>
            {/* Dots */}
            <div className="flex gap-1.5 mt-3">
              {REVIEWS.map((_, i) => (
                <button key={i} onClick={() => setActiveReview(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${i === activeReview ? 'bg-primary-400 w-5' : 'bg-white/20 w-1.5'}`}
                />
              ))}
            </div>
          </div>

          {/* Form area */}
          <div className="px-8 py-7">
            <h1 className="text-2xl font-extrabold text-white mb-1">Welcome back 👋</h1>
            <p className="text-white/60 text-sm mb-6">Sign in to your Freshora account</p>

            <form onSubmit={handleSubmit(d => login(d))} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-bold text-white/70 mb-1.5 block uppercase tracking-widest">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    {...register('email')}
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 h-12 rounded-2xl text-sm outline-none transition-all placeholder:text-white/30 text-white"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: errors.email ? '1.5px solid rgba(239,68,68,0.7)' : '1.5px solid rgba(255,255,255,0.15)',
                    }}
                    onFocus={e => e.currentTarget.style.border = '1.5px solid rgba(74,222,128,0.6)'}
                    onBlur={e => e.currentTarget.style.border = errors.email ? '1.5px solid rgba(239,68,68,0.7)' : '1.5px solid rgba(255,255,255,0.15)'}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-widest">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary-300 hover:text-primary-200 font-medium transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    {...register('password')}
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 h-12 rounded-2xl text-sm outline-none transition-all placeholder:text-white/30 text-white"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: errors.password ? '1.5px solid rgba(239,68,68,0.7)' : '1.5px solid rgba(255,255,255,0.15)',
                    }}
                    onFocus={e => e.currentTarget.style.border = '1.5px solid rgba(74,222,128,0.6)'}
                    onBlur={e => e.currentTarget.style.border = errors.password ? '1.5px solid rgba(239,68,68,0.7)' : '1.5px solid rgba(255,255,255,0.15)'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={isPending}
                className="w-full h-13 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{
                  background: isPending ? 'rgba(74,222,128,0.4)' : 'linear-gradient(135deg, #1a7a4a, #22c55e)',
                  boxShadow: '0 8px 32px rgba(26,122,74,0.45)',
                  color: 'white',
                }}
                onMouseEnter={e => !isPending && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {isPending
                  ? <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                  : <>Sign In <ArrowRight size={18} /></>
                }
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30 font-medium">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Google', icon: 'G', color: '#EA4335' }, { label: 'Facebook', icon: 'f', color: '#1877F2' }].map(p => (
                <button key={p.label} type="button"
                  className="flex items-center justify-center gap-2 h-11 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <span className="font-black" style={{ color: p.color }}>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Below card */}
        <p className="text-center text-white/50 text-sm mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-300 font-bold hover:text-primary-200 transition-colors">
            Create one free →
          </Link>
        </p>
      </div>

      {/* Bottom stats bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="flex justify-center gap-10 py-4 px-6"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { val: '5,000+', label: 'Happy Customers' },
            { val: '30 min', label: 'Avg Delivery' },
            { val: '50+', label: 'Partner Stores' },
            { val: '4.9★', label: 'App Rating' },
          ].map(s => (
            <div key={s.label} className="text-center hidden sm:block">
              <p className="text-white font-extrabold text-base leading-none">{s.val}</p>
              <p className="text-white/40 text-[10px] mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
