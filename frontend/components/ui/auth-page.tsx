'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    if (isLogin) {
      // For login, use the email as username
      const result = await login(email, password)
      setLoading(false)

      if (result.success) {
        router.push('/admin')
      } else {
        setError(result.error || 'Login failed')
      }
    } else {
      // Registration would go here - for now just show error
      setError('Registration is not available yet')
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isAuthenticated) {
    router.replace('/admin')
    return null
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Animated Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-muted/30">
        {/* Animated paths background */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.3)" />
              <stop offset="100%" stopColor="hsl(var(--secondary) / 0.3)" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.2)" />
              <stop offset="100%" stopColor="hsl(var(--secondary) / 0.2)" />
            </linearGradient>
          </defs>

          {/* Floating paths animation */}
          <motion.path
            d="M0 200 Q 100 150 200 200 T 400 200"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }}
          />
          <motion.path
            d="M0 400 Q 150 350 300 400 T 400 400"
            fill="none"
            stroke="url(#gradient2)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.5 }}
          />
          <motion.path
            d="M0 600 Q 100 550 200 600 T 400 600"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1.5 }}
          />
          <motion.path
            d="M100 0 Q 150 100 100 200 T 100 400"
            fill="none"
            stroke="url(#gradient2)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.8 }}
          />
          <motion.path
            d="M300 0 Q 350 100 300 200 T 300 400"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.8, repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.3 }}
          />
        </svg>

        {/* Content on left side */}
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-md">
              Sign in to access your admin dashboard and manage your portfolio content.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div
            className="mt-12 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[
              'Manage your projects and case studies',
              'Update blog posts and articles',
              'Customize portfolio settings',
              'View analytics and stats',
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile header */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your admin panel
            </p>
          </div>

          {/* Form container */}
          <div className="bg-background/50 backdrop-blur-sm border border-border/60 rounded-2xl p-6 lg:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {isLogin ? 'Sign in to your account' : 'Create an account'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isLogin
                  ? 'Enter your credentials to access your dashboard'
                  : 'Get started with your new account'}
              </p>
            </div>


            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 bg-destructive/10 text-destructive rounded-lg px-3 py-2.5 text-sm mb-4"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium">{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email or Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin"
                    className="pl-10 h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="pl-10 h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      autoComplete="new-password"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-end">
                  <Link
                    href="#"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      setError('Password reset not available')
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 text-sm font-medium rounded-lg"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Toggle login/register */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{' '}
            <Link href="#" className="underline hover:text-primary" onClick={(e) => e.preventDefault()}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="underline hover:text-primary" onClick={(e) => e.preventDefault()}>
              Privacy Policy
            </Link>
          </p>

          {/* Back to portfolio */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowRight className="h-3 w-3 rotate-180" />
              Back to portfolio
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
