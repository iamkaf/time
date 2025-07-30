'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ExportHistory, ExportHistoryInsert } from '@/types/supabase'

interface CreateExportHistoryParams {
  exportType: string
  format: string
  sessionCount: number
  dateRangeStart: Date
  dateRangeEnd: Date
  fieldsExported: string[]
  fileName: string
  fileSizeBytes?: number
}

export function useExportHistory() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Set up real-time subscription for export history
  useEffect(() => {
    const subscription = supabase
      .channel('export_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'export_history'
        },
        (payload) => {
          console.log('Real-time export history change:', payload)
          // Invalidate and refetch export history data
          queryClient.invalidateQueries({ queryKey: ['export-history'] })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient, supabase])

  // Fetch export history for the current user
  const {
    data: exportHistory = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['export-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('export_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100) // Limit to last 100 exports
      
      if (error) throw error
      return data as ExportHistory[]
    }
  })

  // Create export history entry
  const createExportHistory = useMutation({
    mutationFn: async (params: CreateExportHistoryParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const exportHistoryInsert: ExportHistoryInsert = {
        user_id: user.id,
        export_type: params.exportType,
        format: params.format,
        session_count: params.sessionCount,
        date_range_start: params.dateRangeStart.toISOString(),
        date_range_end: params.dateRangeEnd.toISOString(),
        fields_exported: params.fieldsExported,
        file_name: params.fileName,
        file_size_bytes: params.fileSizeBytes || null
      }

      const { data, error } = await supabase
        .from('export_history')
        .insert(exportHistoryInsert)
        .select()
        .single()

      if (error) throw error
      return data as ExportHistory
    },
    onSuccess: () => {
      // Invalidate and refetch export history
      queryClient.invalidateQueries({ queryKey: ['export-history'] })
    }
  })

  // Delete export history entry
  const deleteExportHistory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('export_history')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-history'] })
    }
  })

  // Clear all export history for current user
  const clearExportHistory = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('export_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records for user (RLS handles user filtering)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-history'] })
    }
  })

  return {
    exportHistory,
    isLoading,
    error,
    createExportHistory: createExportHistory.mutateAsync,
    deleteExportHistory: deleteExportHistory.mutateAsync,
    clearExportHistory: clearExportHistory.mutateAsync,
    isCreating: createExportHistory.isPending,
    isDeleting: deleteExportHistory.isPending,
    isClearing: clearExportHistory.isPending
  }
}

// Hook to get export statistics
export function useExportStats() {
  const { exportHistory, isLoading } = useExportHistory()

  const stats = {
    totalExports: exportHistory.length,
    totalSessionsExported: exportHistory.reduce((sum, export_) => sum + export_.session_count, 0),
    totalFileSizeBytes: exportHistory.reduce((sum, export_) => sum + (export_.file_size_bytes || 0), 0),
    mostRecentExport: exportHistory[0] || null,
    exportsByFormat: exportHistory.reduce((acc, export_) => {
      acc[export_.format] = (acc[export_.format] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    exportsByType: exportHistory.reduce((acc, export_) => {
      acc[export_.export_type] = (acc[export_.export_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return {
    stats,
    isLoading,
    exportHistory
  }
}