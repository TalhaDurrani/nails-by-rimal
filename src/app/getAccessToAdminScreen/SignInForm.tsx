'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'

export default function SignInForm() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (loading) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const normalizedEmail = email.trim().toLowerCase()

      if (!normalizedEmail || !password) {
        setError('Please enter your email and password.')
        setLoading(false)
        return
      }

      // ==================================================
      // 1. Authenticate with Supabase
      // ==================================================

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })

      if (signInError) {
        console.error('Supabase sign-in error:', signInError)

        setError(
          'Invalid email or password. Please check your credentials and try again.'
        )

        setLoading(false)
        return
      }

      if (!data.user) {
        setError('Unable to authenticate your account.')
        setLoading(false)
        return
      }

      // ==================================================
      // 2. Check admin role
      // ==================================================

      const { data: profile, error: profileError } =
        await supabase
          .from('profiles')
          .select('profile_id, role')
          .eq('profile_id', data.user.id)
          .maybeSingle()

      if (profileError) {
        console.error(
          'Profile lookup error:',
          profileError
        )

        await supabase.auth.signOut()

        setError(
          'Unable to verify your admin privileges. Please try again.'
        )

        setLoading(false)
        return
      }

      // ==================================================
      // 3. Verify admin
      // ==================================================

      const isAdmin =
        profile?.role?.toLowerCase() === 'admin'

      if (!isAdmin) {
        await supabase.auth.signOut()

        setError(
          'Access denied. Admin privileges are required.'
        )

        setLoading(false)
        return
      }

      // ==================================================
      // 4. Admin login successful
      // ==================================================

      /*
       * replace() prevents the login page from remaining
       * in browser history.
       */
      router.replace('/admin')
    } catch (err) {
      console.error('Unexpected sign-in error:', err)

      setError(
        'Something went wrong while signing in. Please try again.'
      )

      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/20">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Admin Portal
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Secure access to your administration dashboard
          </p>
        </div>

        {/* Card */}
        <Card className="overflow-hidden border-slate-200 bg-white shadow-xl shadow-slate-200/60">

          <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-6 py-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Welcome back
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sign in with your administrator account.
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-7">

            <form
              onSubmit={handleSignIn}
              className="space-y-5"
            >

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email address
                </Label>

                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)

                      if (error) {
                        setError('')
                      }
                    }}
                    disabled={loading}
                    required
                    className="h-11 border-slate-200 bg-white pl-10 pr-3 focus-visible:ring-2 focus-visible:ring-slate-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </Label>

                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)

                      if (error) {
                        setError('')
                      }
                    }}
                    disabled={loading}
                    required
                    className="h-11 border-slate-200 bg-white pl-10 pr-11 focus-visible:ring-2 focus-visible:ring-slate-900"
                  />

                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span className="leading-5">
                    {error}
                  </span>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-slate-900 font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Sign in to Admin
                  </>
                )}
              </Button>

            </form>

            {/* Security notice */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <LockKeyhole className="h-3.5 w-3.5" />
              <span>Secure administrator access</span>
            </div>

          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Authorized administrators only
        </p>

      </div>
    </main>
  )
}
