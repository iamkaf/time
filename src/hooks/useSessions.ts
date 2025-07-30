'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session, SessionInsert } from '@/types/supabase'

export function useSessions() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'sessions'
        },
        (payload) => {
          console.log('Real-time session change:', payload)
          // Invalidate and refetch sessions data
          queryClient.invalidateQueries({ queryKey: ['sessions'] })
          queryClient.invalidateQueries({ queryKey: ['session-stats'] })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient, supabase])

  // Fetch sessions for the current user
  const {
    data: sessions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('start_timestamp', { ascending: false })
      
      if (error) throw error
      return data as Session[]
    }
  })

  // Create a new session
  const createSession = useMutation({
    mutationFn: async (sessionData: {
      startTime: Date
      endTime: Date
      durationSeconds: number
      name: string | null
      tags: string[] | null
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const sessionInsert: SessionInsert = {
        user_id: user.id,
        name: sessionData.name,
        tags: sessionData.tags,
        start_timestamp: sessionData.startTime.toISOString(),
        end_timestamp: sessionData.endTime.toISOString(),
        duration_seconds: sessionData.durationSeconds
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionInsert)
        .select()
        .single()

      if (error) throw error
      return data as Session
    },
    onSuccess: () => {
      // Invalidate and refetch sessions
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    }
  })

  // Update session
  const updateSession = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string
      updates: Partial<Pick<Session, 'name' | 'tags' | 'start_timestamp' | 'end_timestamp' | 'duration_seconds'>>
    }) => {
      let finalUpdates = { ...updates }

      // If timestamps are being updated, recalculate duration
      if (updates.start_timestamp || updates.end_timestamp) {
        // First get the current session to have all timestamps
        const { data: currentSession, error: fetchError } = await supabase
          .from('sessions')
          .select('start_timestamp, end_timestamp')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError

        const startTime = updates.start_timestamp ? new Date(updates.start_timestamp) : new Date(currentSession.start_timestamp)
        const endTime = updates.end_timestamp ? new Date(updates.end_timestamp) : new Date(currentSession.end_timestamp)

        // Validate timestamps
        if (startTime >= endTime) {
          throw new Error('Start time must be before end time')
        }

        // Calculate new duration in seconds
        const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
        
        if (durationSeconds <= 0) {
          throw new Error('Session duration must be positive')
        }

        // Add calculated duration to updates
        finalUpdates = {
          ...finalUpdates,
          duration_seconds: durationSeconds
        }
      }

      const { data, error } = await supabase
        .from('sessions')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Session
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['session-stats'] })
    }
  })

  // Delete session
  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    }
  })

  // Bulk delete sessions
  const bulkDeleteSessions = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .in('id', ids)

      if (error) throw error
      return ids.length
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['session-stats'] })
    }
  })

  return {
    sessions,
    isLoading,
    error,
    createSession: createSession.mutateAsync,
    updateSession: updateSession.mutateAsync,
    deleteSession: deleteSession.mutateAsync,
    bulkDeleteSessions: bulkDeleteSessions.mutateAsync,
    isCreating: createSession.isPending,
    isUpdating: updateSession.isPending,
    isDeleting: deleteSession.isPending,
    isBulkDeleting: bulkDeleteSessions.isPending
  }
}

// Hook for session statistics
export function useSessionStats() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Set up real-time subscription for stats
  useEffect(() => {
    const subscription = supabase
      .channel('sessions_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'sessions'
        },
        (payload) => {
          console.log('Real-time session stats change:', payload)
          // Invalidate and refetch session stats
          queryClient.invalidateQueries({ queryKey: ['session-stats'] })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient, supabase])

  return useQuery({
    queryKey: ['session-stats'],
    queryFn: async () => {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('duration_seconds, start_timestamp, tags')
        .not('end_timestamp', 'is', null)

      if (error) throw error

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())

      const todaySessions = sessions.filter(session => 
        new Date(session.start_timestamp) >= today
      )

      const weekSessions = sessions.filter(session => 
        new Date(session.start_timestamp) >= weekStart
      )

      const todayTotal = todaySessions.reduce((sum, session) => 
        sum + (session.duration_seconds || 0), 0
      )

      const weekTotal = weekSessions.reduce((sum, session) => 
        sum + (session.duration_seconds || 0), 0
      )

      // Calculate tag statistics
      const tagStats: Record<string, number> = {}
      sessions.forEach(session => {
        if (session.tags) {
          session.tags.forEach((tag: string) => {
            tagStats[tag] = (tagStats[tag] || 0) + (session.duration_seconds || 0)
          })
        }
      })

      return {
        totalSessions: sessions.length,
        todaySeconds: todayTotal,
        weekSeconds: weekTotal,
        tagStats
      }
    }
  })
}

// Hook for getting unique tags from session history
export function useSessionTags() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['session-tags'],
    queryFn: async () => {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('tags')
        .not('tags', 'is', null)

      if (error) throw error

      // Extract and flatten all unique tags
      const allTags = sessions.flatMap(session => session.tags || [])
      const uniqueTags = Array.from(new Set(allTags)).sort()
      
      return uniqueTags
    }
  })
}