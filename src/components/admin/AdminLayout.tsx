'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from './AdminSidebar'

interface AdminSession {
  email: string
  name: string
  role: string
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/verify')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated && data.session) {
            setSession(data.session)
          } else {
            router.replace('/admin/login')
            return
          }
        } else {
          router.replace('/admin/login')
          return
        }
      } catch {
        router.replace('/admin/login')
        return
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    window.location.href = '/admin/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <AdminSidebar onLogout={handleLogout} loggingOut={loggingOut} />
      <main className="flex-1 min-h-screen overflow-x-hidden">
        <div className="lg:pl-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  )
}
