import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './LoginPage.css'

function LoginPage({ onAuthenticated, initialError = '' }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      if (mode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim() },
          },
        })

        if (signupError) {
          throw signupError
        }

        if (!data.session) {
          setMessage('Check your email to confirm your account, then log in.')
        } else {
          await onAuthenticated()
        }
        return
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (loginError) {
        throw loginError
      }

      await onAuthenticated()
    } catch (submitError) {
      console.error('Authentication failed:', submitError)
      setError(submitError.message || 'Authentication failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setError('')
    setMessage('')
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <p className="eyebrow">Campus issue tracker</p>
        <h1>Smart Campus</h1>
        <p>
          Report broken lights, dirty washrooms, Wi-Fi problems, and other campus
          issues in one place. Admins can track, assign, and resolve them.
        </p>
      </section>

      <section className="auth-card card">
        <h2>{mode === 'signup' ? 'Create your account' : 'Log in'}</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {(error || initialError) && (
            <p className="form-error">{error || initialError}</p>
          )}
          {message && <p className="auth-message">{message}</p>}

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Please wait...'
              : mode === 'signup'
                ? 'Sign up'
                : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'signup' ? 'Already have an account?' : 'New to Smart Campus?'}{' '}
          <button
            type="button"
            onClick={() => changeMode(mode === 'signup' ? 'login' : 'signup')}
          >
            {mode === 'signup' ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
