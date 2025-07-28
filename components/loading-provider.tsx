"use client"

import { createContext, useContext, ReactNode, useMemo } from 'react'
import { GlobalLoading } from '@/components/ui/global-loading'
import { useGlobalLoading } from '@/hooks/use-loading'

const LoadingContext = createContext<ReturnType<typeof useGlobalLoading> | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const loading = useGlobalLoading()
  
  const contextValue = useMemo(() => loading, [
    loading.isLoading,
    loading.message,
    loading.progress,
    loading.startGlobalLoading,
    loading.stopGlobalLoading,
    loading.updateGlobalMessage,
    loading.updateGlobalProgress
  ])

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <GlobalLoading 
        isLoading={contextValue.isLoading}
        message={contextValue.message}
        progress={contextValue.progress}
      />
    </LoadingContext.Provider>
  )
}

export function useLoadingContext() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoadingContext must be used within a LoadingProvider')
  }
  return context
}