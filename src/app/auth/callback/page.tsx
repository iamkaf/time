'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, Suspense } from 'react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    // Prevent double execution
    if (hasRun.current) return
    hasRun.current = true

    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      try {
        const code = searchParams.get('code')
        
        if (code) {
          console.log('Processing auth code:', code)
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Error exchanging code for session:', error)
            
            // If the error is about code already used, check for existing session
            if (error.message.includes('invalid') || error.message.includes('expired')) {
              console.log('Code may have been used already, checking for existing session...')
              const { data: { user } } = await supabase.auth.getUser()
              
              if (user) {
                console.log('Found existing session, redirecting to dashboard')
                setStatus('success')
                router.push('/dashboard')
                return
              }
            }
            
            setStatus('error')
            setErrorMessage(error.message)
            return
          }

          if (data.user) {
            console.log('Successfully authenticated user:', data.user.email)
            setStatus('success')
            // Redirect to dashboard after successful login
            router.push('/dashboard')
            return
          }
        }

        // If no code, check for existing session
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          console.log('Found existing user session, redirecting to dashboard')
          setStatus('success')
          router.push('/dashboard')
        } else {
          setStatus('error')
          setErrorMessage('No authentication data received')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unexpected error occurred')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Completing authentication...
          </p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {errorMessage || 'Something went wrong during authentication.'}
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Authentication successful! Redirecting...
        </p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}