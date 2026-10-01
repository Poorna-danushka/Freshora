import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  Gift,
  Shield,
  Truck,
  Leaf,
  Store,
  Bike,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { authApi, getPostAuthPath } from '@/api/auth';
import { parseApiError } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import loginCinematic from '@/assets/login_cinematic.png';

const schema = z
  .object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type SignupForm = z.infer<typeof schema>;

function PasswordStrengthMeter({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Letter', pass: /[a-zA-Z]/.test(password) },
    { label: 'Symbol', pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const barColors = ['rgba(255,255,255,0.1)', 'rgba(239,68,68,0.8)', 'rgba(245,158,11,0.8)', 'rgba(82,188,129,0.8)', '#52bc81'];
  const scoreLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const scoreLabelColor = ['', 'text-red-400', 'text-amber-400', 'text-teal-300', 'text-emerald-400'];

  if (!password) return null;

  return (
    <div className="space-y-1 pt-0.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? barColors[score] : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex flex-wrap gap-1.5 text-white/50">
          {checks.map((c) => (
            <span key={c.label} className={`inline-flex items-center gap-0.5 ${c.pass ? 'text-emerald-400 font-semibold' : ''}`}>
              <CheckCircle size={9} /> {c.label}
            </span>
          ))}
        </div>
        <span className={`font-bold ${scoreLabelColor[score]}`}>{scoreLabel[score]}</span>
      </div>
    </div>
  );
}

const FLOATING_EMOJIS = [
  { emoji: '🌿', style: { top: '10%', left: '4%', fontSize: '2.3rem' }, delay: '0s', dur: '7s' },
  { emoji: '🥥', style: { top: '18%', right: '5%', fontSize: '2rem' }, delay: '1.4s', dur: '5.5s' },
  { emoji: '🧄', style: { bottom: '22%', left: '3%', fontSize: '1.8rem' }, delay: '2.5s', dur: '6.5s' },
  { emoji: '🍃', style: { bottom: '12%', right: '8%', fontSize: '2.2rem' }, delay: '0.8s', dur: '8s' },
];

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const signupState = location.state as {
    from?: { pathname: string; search?: string; hash?: string };
    message?: string;
  } | null;

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    setError,
  } = useForm<SignupForm>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const passwordValue = watch('password', '');
  const nameValue = `${watch('firstName', '')} ${watch('lastName', '')}`.trim();
  const emailValue = watch('email', '');

  const { mutate: signup, isPending } = useMutation({
    mutationFn: (d: SignupForm) =>
      authApi.register({
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        password: d.password,
      }),
    onSuccess: ({ user }) => {
      setUser(user);
      navigate(getPostAuthPath(user.role, signupState?.from), { replace: true });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      const message = apiError.fieldErrors?.email ?? apiError.message;
      setError('email', { message });
    },
  });

  const handleNext = async () => {
    const ok = await trigger(['firstName', 'lastName', 'email']);
    if (ok) setStep(2);
  };

  return (
    <div className="h-screen max-h-screen w-full text-white font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between relative overflow-hidden bg-slate-950">
      {/* ── Background Cinematic Image Layer with Ken Burns Zoom ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={loginCinematic}
          alt=""
          className="w-full h-full object-cover scale-108 opacity-25"
          style={{ animation: 'kenBurnsReverse 24s ease-in-out infinite alternate' }}
        />
        {/* Rich dark forest + warm amber gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(7, 28, 17, 0.85) 0%, rgba(10, 46, 26, 0.78) 45%, rgba(20, 40, 20, 0.9) 100%)',
          }}
        />
      </div>

      {/* ── Background Ambient Light Orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #52bc81 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite' }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-[550px] h-[550px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite 2s' }}
        />
      </div>

      {/* ── Decorative Dashed Ring ── */}
      <div
        className="absolute w-[500px] h-[500px] border border-dashed rounded-full animate-spin-slow pointer-events-none top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 hidden xl:block"
        style={{ borderColor: 'rgba(82,188,129,0.2)' }}
      />

      {/* ── Floating Graphic Card: Welcome Gift Tag ── */}
      <div
        className="absolute top-24 left-12 z-10 hidden xl:flex items-center gap-3 px-4 py-3 rounded-2xl animate-float-slow backdrop-blur-md"
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
        }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(249,115,22,0.25)' }}>
          <Gift size={18} className="text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] font-medium text-white/60">New Member Reward</p>
          <p className="text-xs font-bold text-amber-300">LKR 200 Off First Order</p>
        </div>
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
          to="/login"
          state={signupState}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border border-white/15 hover:bg-white/15"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', color: '#fff' }}
        >
          <span className="text-white/70">Already registered?</span>
          <span style={{ color: '#74c898' }} className="font-extrabold">Sign In</span>
          <ArrowRight size={13} style={{ color: '#74c898' }} />
        </Link>
      </header>

      {/* ── Main Split Layout Container — Single Viewport Fit ── */}
      <main className="relative z-20 mx-auto max-w-7xl w-full px-4 sm:px-6 my-auto grid lg:grid-cols-12 gap-8 items-center shrink-0">
        {/* Left Side: Member Benefits & Welcome Gift Showcase */}
        <div className="lg:col-span-6 space-y-4 hidden lg:block pr-2">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/10 backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#74c898' }}
          >
            <Gift size={14} className="text-amber-400" /> Exclusive Welcome Gift Included
          </div>

          <h1 className="font-extrabold leading-[1.08] text-3xl xl:text-4xl tracking-tight">
            Join Freshora &amp; Claim <br />
            <span
              className="block"
              style={{
                background: 'linear-gradient(90deg, #52bc81 0%, #a8e6c3 50%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              LKR 200 Off First Order.
            </span>
          </h1>

          <p className="text-xs leading-relaxed text-white/70 max-w-md">
            Unlock instant access to 50+ verified local supermarkets, organic farms, and artisan produce stores across Colombo with 30-minute delivery.
          </p>

          <div className="space-y-2 pt-1">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl border border-white/10 backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Truck size={18} style={{ color: '#74c898' }} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">30-Minute Fast Delivery</p>
                <p className="text-[10px] text-white/50">Live GPS rider tracking on every single order</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl border border-white/10 backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Sparkles size={18} style={{ color: '#74c898' }} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Freshness Guaranteed</p>
                <p className="text-[10px] text-white/50">Directly sourced produce with hassle-free quality assurance</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl border border-white/10 backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Shield size={18} style={{ color: '#74c898' }} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Secure Flexible Payments</p>
                <p className="text-[10px] text-white/50">Credit card or cash on delivery options available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Multi-Step Registration Card */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <div
            className="rounded-3xl p-5 sm:p-6 space-y-4 border border-white/15 shadow-2xl"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {/* Step Progress Indicator Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: '#74c898' }}>
                  Step {step} of 2
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
                  {step === 1 ? 'Create Account' : 'Security Password'}
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= 1 ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-white/10 text-white/40'
                  }`}
                >
                  {step > 1 ? <CheckCircle size={14} /> : '1'}
                </div>
                <div className={`w-5 h-0.5 rounded-full ${step === 2 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 2 ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-white/10 text-white/40'
                  }`}
                >
                  2
                </div>
              </div>
            </div>

            {signupState?.message && (
              <div className="p-2.5 rounded-2xl border border-amber-300/30 bg-amber-400/10 text-amber-100 text-xs font-semibold flex items-center gap-2">
                <CheckCircle size={14} className="text-amber-300 shrink-0" />
                <span>{signupState.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit((d) => signup(d))} className="space-y-3">
              {/* STEP 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* First Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">First Name</label>
                      <div className="relative">
                        <User size={15} className="absolute left-3 top-2.5 text-white/40" />
                        <input
                          {...register('firstName')}
                          id="signup-first-name"
                          type="text"
                          placeholder="Kamal"
                          className="w-full rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 outline-none transition"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: errors.firstName ? '1.5px solid rgba(239,68,68,0.7)' : '1.5px solid rgba(255,255,255,0.15)',
                          }}
                          onFocus={(e) => (e.currentTarget.style.border = '1.5px solid rgba(82,188,129,0.7)')}
                          onBlur={(e) =>
                            (e.currentTarget.style.border = errors.firstName
                              ? '1.5px solid rgba(239,68,68,0.7)'
                              : '1.5px solid rgba(255,255,255,0.15)')
                          }
                        />
                      </div>
                      {errors.firstName && <p className="text-red-400 text-[10px] font-semibold">{errors.firstName.message}</p>}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Last Name</label>
                      <div className="relative">
                        <User size={15} className="absolute left-3 top-2.5 text-white/40" />
                        <input
                          {...register('lastName')}
                          id="signup-last-name"
                          type="text"
                          placeholder="Perera"
                          className="w-full rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 outline-none transition"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: errors.lastName ? '1.5px solid rgba(239,68,68,0.7)' : '1.5px solid rgba(255,255,255,0.15)',
                          }}
                          onFocus={(e) => (e.currentTarget.style.border = '1.5px solid rgba(82,188,129,0.7)')}
                          onBlur={(e) =>
                            (e.currentTarget.style.border = errors.lastName
                              ? '1.5px solid rgba(239,68,68,0.7)'
                              : '1.5px solid rgba(255,255,255,0.15)')
                          }
                        />
                      </div>
                      {errors.lastName && <p className="text-red-400 text-[10px] font-semibold">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-2.5 text-white/40" />
                      <input
                        {...register('email')}
                        id="signup-email"
                        type="email"
                        placeholder="kamal@example.com"
                        className="w-full rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 outline-none transition"
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
                    {errors.email && <p className="text-red-400 text-[10px] font-semibold">{errors.email.message}</p>}
                  </div>

                  {/* Step 1 Next Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full rounded-2xl text-white font-bold text-xs py-2.5 transition duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-1 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #1a7a4a 0%, #157040 100%)',
                      boxShadow: '0 8px 24px rgba(26,122,74,0.45)',
                    }}
                  >
                    <span>Continue to Security</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* STEP 2: Security Password */}
              {step === 2 && (
                <div className="space-y-3">
                  {/* Step 1 Summary Capsule */}
                  <div
                    className="p-2.5 rounded-2xl border border-white/10 flex items-center justify-between gap-2"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-7 h-7 rounded-full font-bold flex items-center justify-center text-[11px] shrink-0 text-white"
                        style={{ background: 'linear-gradient(135deg, #1a7a4a, #52bc81)' }}
                      >
                        {nameValue[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-white truncate">{nameValue}</p>
                        <p className="text-[10px] text-white/50 truncate">{emailValue}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-xl border border-white/15 hover:bg-white/10 transition"
                      style={{ color: '#74c898' }}
                    >
                      Edit
                    </button>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-2.5 text-white/40" />
                      <input
                        {...register('password')}
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 8 characters"
                        className="w-full rounded-2xl pl-9 pr-9 py-2 text-xs text-white placeholder:text-white/30 outline-none transition"
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
                        className="absolute right-3 top-2.5 text-white/40 hover:text-white/70 transition"
                        aria-label="Toggle Password Visibility"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-[10px] font-semibold">{errors.password.message}</p>}
                    <PasswordStrengthMeter password={passwordValue} />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-2.5 text-white/40" />
                      <input
                        {...register('confirmPassword')}
                        id="signup-confirm"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repeat password"
                        className="w-full rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 outline-none transition"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: errors.confirmPassword ? '1.5px solid rgba(239,68,68,0.7)' : '1.5px solid rgba(255,255,255,0.15)',
                        }}
                        onFocus={(e) => (e.currentTarget.style.border = '1.5px solid rgba(82,188,129,0.7)')}
                        onBlur={(e) =>
                          (e.currentTarget.style.border = errors.confirmPassword
                            ? '1.5px solid rgba(239,68,68,0.7)'
                            : '1.5px solid rgba(255,255,255,0.15)')
                        }
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-[10px] font-semibold">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-3.5 py-2.5 rounded-2xl border border-white/15 text-white/70 text-xs font-bold hover:bg-white/10 transition flex items-center gap-1"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>

                    <button
                      id="signup-submit"
                      type="submit"
                      disabled={isPending}
                      className="flex-1 rounded-2xl text-white font-bold text-xs py-2.5 transition duration-300 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #1a7a4a 0%, #157040 100%)',
                        boxShadow: '0 8px 24px rgba(26,122,74,0.45)',
                      }}
                    >
                      {isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Creating Account…
                        </>
                      ) : (
                        <>
                          Complete Registration <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Partner & Operations Portals Section (Home Page Partner Card Style) */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Partner & Operations Portals</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  to="/join/store"
                  className="p-2.5 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 text-white transition flex items-center gap-2 group"
                >
                  <Store size={14} style={{ color: '#74c898' }} className="shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="truncate">
                    <p className="font-bold text-[11px] truncate">Store Partner</p>
                    <p className="text-[9px] text-white/50 truncate">Join as store</p>
                  </div>
                </Link>

                <Link
                  to="/join/driver"
                  className="p-2.5 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 text-white transition flex items-center gap-2 group"
                >
                  <Bike size={14} className="text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="truncate">
                    <p className="font-bold text-[11px] truncate">Delivery Driver</p>
                    <p className="text-[9px] text-white/50 truncate">Join as rider</p>
                  </div>
                </Link>
              </div>
            </div>

            <p className="text-center text-[11px] text-white/60 pt-0.5">
              Already have an account?{' '}
              <Link to="/login" state={signupState} className="font-bold hover:underline transition" style={{ color: '#74c898' }}>
                Sign in →
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
            <span>🎁 LKR 200 Gift</span>
            <span>⚡ Instant Account Setup</span>
            <span>🔒 Encrypted SSL Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
