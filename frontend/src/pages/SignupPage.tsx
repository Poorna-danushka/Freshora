import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, Gift } from 'lucide-react';
import { authApi, getDashboardPath } from '@/api/auth';
import { useAuthStore } from '@/store/useAuthStore';
import signupBg from '@/assets/signup_bg.png';

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Min. 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type SignupForm = z.infer<typeof schema>;

/* ── floating emoji configs ─────────────────────────── */
const FLOATS = [
  { emoji: '🌿', style: { top: '7%',   left: '5%',   fontSize: '2.4rem' }, delay: '0s',    dur: '7s'   },
  { emoji: '🥥', style: { top: '14%',  right: '7%',  fontSize: '2rem'   }, delay: '1.2s',  dur: '5.5s' },
  { emoji: '🧄', style: { bottom: '22%', left: '4%', fontSize: '1.8rem'  }, delay: '2.5s',  dur: '6.5s' },
  { emoji: '🍃', style: { bottom: '8%', right: '7%', fontSize: '2.2rem'  }, delay: '0.8s',  dur: '8s'   },
  { emoji: '🌱', style: { top: '50%',  left: '3%',   fontSize: '1.6rem'  }, delay: '1.8s',  dur: '7.5s' },
  { emoji: '🥦', style: { top: '70%',  right: '5%',  fontSize: '1.7rem'  }, delay: '3.2s',  dur: '6s'   },
];

/* ── password strength ──────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '6+ chars',  pass: password.length >= 6 },
    { label: 'Number',    pass: /\d/.test(password) },
    { label: 'Letter',    pass: /[a-zA-Z]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const barColors = ['rgba(255,255,255,0.08)', 'rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)', 'rgba(74,222,128,0.85)'];
  const scoreLabel = ['', 'Weak', 'Fair', 'Strong'];
  const scoreLabelColor = ['', '#f87171', '#fbbf24', '#4ade80'];

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ background: i <= score ? barColors[score] : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(c => (
            <span key={c.label}
              className="flex items-center gap-1 text-[10px] transition-colors"
              style={{ color: c.pass ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
              <CheckCircle size={9} /> {c.label}
            </span>
          ))}
        </div>
        <span className="text-[10px] font-bold transition-colors" style={{ color: scoreLabelColor[score] }}>
          {scoreLabel[score]}
        </span>
      </div>
    </div>
  );
}

/* ── reusable glass input ───────────────────────────── */
function GlassInput({
  icon: Icon,
  error,
  inputRef,
  suffix,
  ...props
}: {
  icon: React.ElementType;
  error?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  suffix?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div className="relative">
        <Icon size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors z-10"
          style={{ color: focused ? '#4ade80' : 'rgba(255,255,255,0.35)' }}
        />
        <input
          ref={inputRef}
          {...props}
          onFocus={e => { setFocused(true); props.onFocus?.(e); }}
          onBlur={e => { setFocused(false); props.onBlur?.(e); }}
          className="w-full pl-10 h-11 rounded-xl text-sm outline-none text-white placeholder:text-white/30 transition-all pr-4"
          style={{
            background: focused ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.08)',
            border: error
              ? '1.5px solid rgba(239,68,68,0.65)'
              : focused
              ? '1.5px solid rgba(74,222,128,0.6)'
              : '1.5px solid rgba(255,255,255,0.13)',
          }}
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {error && (
        <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SignupPage
═══════════════════════════════════════════════════════ */
export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const { register, handleSubmit, watch, trigger, formState: { errors }, setError } = useForm<SignupForm>({
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
      navigate(getDashboardPath(user.role));
    },
    onError: () => setError('email', { message: 'Account already exists with this email' }),
  });

  const handleNext = async () => {
    const ok = await trigger(['firstName', 'lastName', 'email']);
    if (ok) setStep(2);
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center">

      {/* ── Full-screen background ─────────────────────── */}
      <img
        src={signupBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scale(1.08)', animation: 'kenBurns 24s ease-in-out infinite alternate' }}
      />
      {/* Overlay — warm golden-dark toned to complement the market photo */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-primary-900/60 to-amber-950/70" />
      {/* Vignette */}
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 130px rgba(0,0,0,0.65)' }} />

      {/* Floating emojis */}
      {FLOATS.map((f, i) => (
        <div key={i} className="absolute pointer-events-none select-none"
          style={{ ...f.style, animation: `floatEmoji ${f.dur} ease-in-out infinite`, animationDelay: f.delay, filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.55))' }}>
          {f.emoji}
        </div>
      ))}

      {/* ── Top bar ────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/25 group-hover:bg-white/25 transition-colors">
            <span className="text-white font-black text-base">F</span>
          </div>
          <span className="font-black text-xl text-white tracking-tight drop-shadow-lg">
            Fresh<span className="text-primary-300">ora</span>
          </span>
        </Link>
        <Link to="/login"
          className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 rounded-full text-white text-sm font-medium transition-all">
          Sign in <ArrowRight size={13} />
        </Link>
      </div>

      {/* ── Glass card ─────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[440px] mx-4">
        <div className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(36px)',
            border: '1px solid rgba(255,255,255,0.16)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}>

          {/* ── Card top: progress + gift ─────────────── */}
          <div className="px-8 pt-7 pb-5 border-b border-white/10">
            {/* Gift badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.22)' }}>
                <Gift size={13} className="text-green-400" />
                <span className="text-green-300 text-xs font-bold">LKR 200 off your first order</span>
              </div>
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: 'rgba(74,222,128,0.8)', color: '#fff' }}>
                    {step === 2 ? <CheckCircle size={12} /> : '1'}
                  </div>
                  <div className="w-8 h-px" style={{ background: step === 2 ? 'rgba(74,222,128,0.6)' : 'rgba(255,255,255,0.15)' }} />
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                    style={{
                      background: step === 2 ? 'rgba(74,222,128,0.8)' : 'rgba(255,255,255,0.12)',
                      color: step === 2 ? '#fff' : 'rgba(255,255,255,0.4)',
                      border: step === 1 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    }}>2</div>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-0.5">
              {step === 1 ? 'Create account' : 'Set your password'}
            </h1>
            <p className="text-white/50 text-xs">
              {step === 1 ? 'Step 1 of 2 — Your details' : 'Step 2 of 2 — Secure your account'}
            </p>
          </div>

          {/* ── Form ─────────────────────────────────── */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit(d => signup(d))}>

              {/* ── STEP 1 ── */}
              <div className={`space-y-4 transition-all duration-400 ${step === 1 ? 'block' : 'hidden'}`}>
                <div>
                  <label className="text-[10px] font-bold text-white/45 mb-1.5 block uppercase tracking-widest">First Name</label>
                  <GlassInput icon={User} id="signup-first-name" placeholder="Kamal"
                    error={errors.firstName?.message} {...register('firstName')} />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/45 mb-1.5 block uppercase tracking-widest">Last Name</label>
                  <GlassInput icon={User} id="signup-last-name" placeholder="Perera"
                    error={errors.lastName?.message} {...register('lastName')} />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/45 mb-1.5 block uppercase tracking-widest">Email Address</label>
                  <GlassInput icon={Mail} id="signup-email" type="email" placeholder="kamal@example.com"
                    error={errors.email?.message} {...register('email')} />
                </div>

                <button type="button" onClick={handleNext}
                  className="w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                  style={{
                    background: 'linear-gradient(135deg, #1a7a4a, #22c55e)',
                    boxShadow: '0 8px 28px rgba(26,122,74,0.4)',
                    color: 'white',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  Continue <ArrowRight size={17} />
                </button>
              </div>

              {/* ── STEP 2 ── */}
              <div className={`space-y-4 transition-all duration-400 ${step === 2 ? 'block' : 'hidden'}`}>
                {/* Summary of step 1 */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center font-black text-white text-base shrink-0">
                    {nameValue.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{nameValue}</p>
                    <p className="text-white/45 text-xs truncate">{emailValue}</p>
                  </div>
                  <button type="button" onClick={() => setStep(1)}
                    className="ml-auto text-primary-400 text-xs font-bold hover:text-primary-300 transition-colors shrink-0">
                    Edit
                  </button>
                </div>

                {/* Password */}
                <div>
                  <label className="text-[10px] font-bold text-white/45 mb-1.5 block uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <input {...register('password')} id="signup-password" type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-12 h-11 rounded-xl text-sm outline-none text-white placeholder:text-white/30 transition-all"
                      style={{ background: 'rgba(255,255,255,0.08)', border: errors.password ? '1.5px solid rgba(239,68,68,0.65)' : '1.5px solid rgba(255,255,255,0.13)' }}
                      onFocus={e => e.currentTarget.style.border = '1.5px solid rgba(74,222,128,0.6)'}
                      onBlur={e => e.currentTarget.style.border = errors.password ? '1.5px solid rgba(239,68,68,0.65)' : '1.5px solid rgba(255,255,255,0.13)'}
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-[10px] mt-1">⚠ {errors.password.message}</p>}
                  <PasswordStrength password={passwordValue} />
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-[10px] font-bold text-white/45 mb-1.5 block uppercase tracking-widest">Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <input {...register('confirmPassword')} id="signup-confirm" type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 h-11 rounded-xl text-sm outline-none text-white placeholder:text-white/30 transition-all"
                      style={{ background: 'rgba(255,255,255,0.08)', border: errors.confirmPassword ? '1.5px solid rgba(239,68,68,0.65)' : '1.5px solid rgba(255,255,255,0.13)' }}
                      onFocus={e => e.currentTarget.style.border = '1.5px solid rgba(74,222,128,0.6)'}
                      onBlur={e => e.currentTarget.style.border = errors.confirmPassword ? '1.5px solid rgba(239,68,68,0.65)' : '1.5px solid rgba(255,255,255,0.13)'}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-[10px] mt-1">⚠ {errors.confirmPassword.message}</p>}
                </div>

                {/* Terms */}
                <p className="text-[10px] text-white/25 leading-relaxed">
                  By creating an account you agree to our{' '}
                  <Link to="/terms" className="text-primary-300 hover:underline">Terms</Link> &{' '}
                  <Link to="/privacy" className="text-primary-300 hover:underline">Privacy Policy</Link>.
                </p>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="h-12 px-5 rounded-2xl font-semibold text-sm transition-all"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                    ← Back
                  </button>
                  <button id="signup-submit" type="submit" disabled={isPending}
                    className="flex-1 h-12 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #1a7a4a, #22c55e)',
                      boxShadow: '0 8px 28px rgba(26,122,74,0.4)',
                      color: 'white',
                    }}
                    onMouseEnter={e => !isPending && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    {isPending
                      ? <><Loader2 size={16} className="animate-spin" /> Creating...</>
                      : <>Create Account <ArrowRight size={17} /></>
                    }
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* Below card */}
        <p className="text-center text-white/40 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-300 font-bold hover:text-primary-200 transition-colors">
            Sign in →
          </Link>
        </p>
      </div>

      {/* ── Bottom stats ── same as login ─────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="flex justify-center gap-10 py-4 px-6"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { val: 'Free',    label: 'To join' },
            { val: 'LKR 200', label: 'Welcome gift' },
            { val: '30 min',  label: 'First delivery' },
            { val: '4.9 ★',   label: 'App rating' },
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
