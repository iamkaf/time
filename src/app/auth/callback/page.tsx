'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function AuthCallback() {
  const router = useRouter()
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Prevent double processing
    if (hasProcessed.current) return
    hasProcessed.current = true

    const handleCallback = async () => {
      try {
        const supabase = createClient()
        
        // Wait a moment for Supabase to process the OAuth callback
        // The client automatically handles the callback on initialization
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          // Don't show error for PKCE-related issues, just redirect
          router.push('/dashboard')
          return
        }
        
        if (session) {
          console.log('Session established, redirecting to dashboard')
          router.push('/dashboard')
        } else {
          console.log('No session found, redirecting to login')
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Unexpected error in callback:', error)
        // On any error, try to go to dashboard (middleware will redirect if needed)
        router.push('/dashboard')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Completing authentication...
        </p>
      </div>
    </div>
  )
}