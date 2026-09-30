'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { FormEvent, useState } from 'react'
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react'

type AuthMode = 'login' | 'signup'
type FormErrors = Partial<Record<'name' | 'email' | 'password' | 'terms' | 'form', string>>

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const isSignup = mode === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = () => {
    const nextErrors: FormErrors = {}
    if (isSignup && name.trim().length < 2) nextErrors.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Enter a valid work email.'
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (isSignup && !acceptedTerms) nextErrors.terms = 'Please accept the terms to continue.'
    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()

  const nextErrors = validate()
  setErrors(nextErrors)

  if (Object.keys(nextErrors).length) {
    setStatus('idle')
    return
  }

  setStatus('loading')

  try {
    if (isSignup) {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({
          form: data.error ?? 'Unable to create your account.',
        })
        setStatus('error')
        return
      }

      window.location.href = '/auth/login'
      return
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (!result || result.error) {
      setErrors({
        form: 'Invalid email or password.',
      })
      setStatus('error')
      return
    }

    window.location.href = '/dashboard'
  } catch {
    setErrors({
      form: 'We couldn’t connect to LOOP right now. Please try again.',
    })
    setStatus('error')
  }
}

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Link className="auth-brand" href="/" aria-label="LOOP home"><span className="brand-mark">l</span><span>loop</span></Link>
        <div className="auth-brand-copy">
          <p className="eyebrow">CUSTOMER INTELLIGENCE</p>
          <h1>Make every customer signal count.</h1>
          <p>Bring feedback, context, and action into one thoughtful workspace.</p>
        </div>
        <div className="auth-signal-card">
          <div className="signal-card-head"><span><i /> LIVE SIGNAL</span><span>THIS WEEK</span></div>
          <strong>“The reporting view gives our team exactly what we need each Monday.”</strong>
          <div className="signal-card-foot"><span className="person-avatar mint">AL</span><span><b>Ava Lewis</b><small>Kinetic Health</small></span><span className="signal-score"><Check size={13} /> Positive</span></div>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><Link className="auth-brand" href="/" aria-label="LOOP home"><span className="brand-mark">l</span><span>loop</span></Link></div>
          <p className="eyebrow">{isSignup ? 'GET STARTED' : 'WELCOME BACK'}</p>
          <h2>{isSignup ? 'Create your workspace' : 'Sign in to LOOP'}</h2>
          <p className="auth-subtitle">{isSignup ? 'Start making sense of your customer feedback.' : 'Your customer intelligence workspace is ready.'}</p>
          <form onSubmit={handleSubmit} noValidate>
            {isSignup && <AuthField id="name" label="Full name" value={name} onChange={setName} placeholder="Olivia Chen" icon={<UserRound size={16} />} error={errors.name} />}
            <AuthField id="email" label="Work email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" icon={<Mail size={16} />} error={errors.email} />
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className={`auth-input ${errors.password ? 'has-error' : ''}`}><LockKeyhole size={16} /><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" aria-invalid={Boolean(errors.password)} /><button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            {isSignup && <label className="terms-check"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} /><span>I agree to the <a href="/">Terms of Service</a> and <a href="/">Privacy Policy</a>.</span></label>}
            {errors.terms && <p className="field-error terms-error">{errors.terms}</p>}
            {!isSignup && <div className="auth-options"><label className="remember-check"><input type="checkbox" /> Remember me</label><a href="/auth/login">Forgot password?</a></div>}
            {status === 'error' && <p className="auth-error" role="alert">We couldn&apos;t connect to LOOP right now. Please try again.</p>}
            <button className="auth-submit" type="submit" disabled={status === 'loading'}>{status === 'loading' ? <><LoaderCircle className="spin" size={17} /> {isSignup ? 'Creating workspace...' : 'Signing you in...'}</> : <>{isSignup ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></>}</button>
          </form>
          <p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to LOOP?'} <Link href={isSignup ? '/auth/login' : '/auth/signup'}>{isSignup ? 'Sign in' : 'Create an account'}</Link></p>
          <p className="auth-note">Ready for Auth.js integration. Your session and provider configuration can be connected here later.</p>
        </div>
      </section>
    </main>
  )
}

function AuthField({ id, label, type = 'text', value, onChange, placeholder, icon, error }: { id: string; label: string; type?: string; value: string; onChange: (value: string) => void; placeholder: string; icon: React.ReactNode; error?: string }) {
  return <div className="auth-field"><label htmlFor={id}>{label}</label><div className={`auth-input ${error ? 'has-error' : ''}`}>{icon}<input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-invalid={Boolean(error)} /></div>{error && <span className="field-error">{error}</span>}</div>
}
