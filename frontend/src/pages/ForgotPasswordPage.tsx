import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Mail, Loader2, CheckCircle, ArrowRight, ArrowLeft, Star } from 'lucide-react';
import { authApi } from '@/api/auth';
import loginBg from '@/assets/login_bg.png';

const schema = z.object({ email: z.string().email('Enter a valid email address') });
type ForgotForm = z.infer<typeof schema>;

// Same floating food emojis pattern as Login/Signup
const FLOATS = [
  { emoji: '🍋', style: { top: '8%',    left: '7%',   fontSize: '2.4rem' }, delay: '0s',    dur: '7s'   },
  { emoji: '🥝', style: { top: '16%',   right: '8%',  fontSize: '2rem'   }, delay: '1.2s',  dur: '5.5s' },
  { emoji: '🍃', style: { bottom: '22%',left: '5%',   fontSize: '1.8rem' }, delay: '2.5s',  dur: '6.5s' },
  { emoji: '🥥', style: { bottom: '10%',right: '9%',  fontSize: '2.2rem' }, delay: '0.8s',  dur: '8s'   },
  { emoji: '🌿', style: { top: '48%',   left: '3%',   fontSize: '1.6rem' }, delay: '1.8s',  dur: '7.5s' },
  { emoji: '🫑', style: { top: '72%',   right: '5%',  fontSize: '1.7rem' }, delay: '3.2s',  dur: '6s'   },
];

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(schema) });

  const emailValue = watch('email', '');

  const { mutate, isPending } = useMutation({
    mutationFn: (d: ForgotForm) => authApi.forgotPassword(d.email),
    onSuccess: () => setSubmitted(true),
    onError: () => setSubmitted(true), // security: show success regardless
  });

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center">

      {/* ── Full-screen background image ── */}
      <img
        src={loginBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scale(1.05)', animation: 'kenBurnsReverse 22s ease-in-out infinite alternate' }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-primary-900/55 to-black/75" />

      {/* Vignette edges */}
      <div
        className="absolute inset-0"
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

      {/* Top-right sign-in link */}
      <div className="absolute top-6 right-8 z-20">
        <Link
          to="/login"
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 rounded-full text-white text-sm font-medium transition-all"
        >
          <ArrowLeft size={14} /> Back to Sign In
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
          {/* Card header — trust strip */}
          <div className="px-8 pt-7 pb-5 border-b border-white/10">
            <div className="flex items-center gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
              ))}
              <span className="text-white/60 text-xs ml-2">Trusted by 5,000+ in Colombo</span>
            </div>
            <p className="text-white/40 text-xs">
              We'll send a secure link to reset your password.
            </p>
          </div>

          {/* Form / Success area */}
          <div className="px-8 py-7">
            {submitted ? (
              /* ── SUCCESS STATE ── */
              <div className="text-center py-4">
                {/* Animated success icon */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{
                    background: 'rgba(74,222,128,0.15)',
                    border: '1.5px solid rgba(74,222,128,0.4)',
                  }}
                >
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h1 className="text-2xl font-extrabold text-white mb-2">Check your inbox!</h1>
                <p className="text-white/55 text-sm leading-relaxed mb-2">
                  If an account exists for
                </p>
                <p
                  className="text-primary-300 font-semibold text-sm mb-5 truncate px-4"
                  title={emailValue}
                >
                  {emailValue || 'that email'}
                </p>
                <p className="text-white/45 text-sm leading-relaxed mb-8">
                  we've sent a password reset link. Check your spam folder if you don't see it.
                </p>
                <Link
                  to="/login"
                  className="w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #1a7a4a, #22c55e)',
                    boxShadow: '0 8px 32px rgba(26,122,74,0.45)',
                    color: 'white',
                  }}
                >
                  Back to Sign In <ArrowRight size={18} />
                </Link>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-white/40 hover:text-white/70 text-sm transition-colors"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              /* ── FORM STATE ── */
              <>
                {/* Lock icon */}
                <div className="mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: 'rgba(26,122,74,0.2)',
                      border: '1.5px solid rgba(74,222,128,0.3)',
                    }}
                  >
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-white mb-1">Forgot password?</h1>
                  <p className="text-white/55 text-sm">
                    No worries! Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-5">
                  {/* Email field */}
                  <div>
                    <label className="text-xs font-bold text-white/70 mb-1.5 block uppercase tracking-widest">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: focused ? '#4ade80' : 'rgba(255,255,255,0.4)' }}
                      />
                      <input
                        {...register('email')}
                        id="forgot-email"
                        type="email"
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 h-12 rounded-2xl text-sm outline-none transition-all placeholder:text-white/30 text-white"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: errors.email
                            ? '1.5px solid rgba(239,68,68,0.7)'
                            : focused
                            ? '1.5px solid rgba(74,222,128,0.6)'
                            : '1.5px solid rgba(255,255,255,0.15)',
                        }}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <span>⚠</span> {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    id="forgot-submit"
                    type="submit"
                    disabled={isPending}
                    className="w-full h-12 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: isPending
                        ? 'rgba(74,222,128,0.4)'
                        : 'linear-gradient(135deg, #1a7a4a, #22c55e)',
                      boxShadow: '0 8px 32px rgba(26,122,74,0.45)',
                      color: 'white',
                    }}
                    onMouseEnter={(e) =>
                      !isPending && (e.currentTarget.style.transform = 'translateY(-2px)')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Sending link...
                      </>
                    ) : (
                      <>
                        Send Reset Link <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-white/30 font-medium">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Back to sign in */}
                  <Link
                    to="/login"
                    className="w-full h-11 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.75)',
                    }}
                  >
                    <ArrowLeft size={14} /> Back to Sign In
                  </Link>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Below card */}
        <p className="text-center text-white/40 text-sm mt-5">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-primary-300 font-bold hover:text-primary-200 transition-colors"
          >
            Create one free →
          </Link>
        </p>
      </div>

      {/* Bottom stats bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div
          className="flex justify-center gap-10 py-4 px-6"
          style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {[
            { val: '5,000+', label: 'Happy Customers' },
            { val: '30 min', label: 'Avg Delivery' },
            { val: '50+',    label: 'Partner Stores' },
            { val: '4.9★',   label: 'App Rating' },
          ].map((s) => (
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
