'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Search,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

interface AdminSidebarProps {
  onLogout: () => void
  loggingOut: boolean
}

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Blog Posts', href: '/admin/blogs', icon: FileText },
  { label: 'New Post', href: '/admin/blogs/new', icon: PlusCircle },
  { label: 'SEO Settings', href: '/admin/seo', icon: Search },
]

export default function AdminSidebar({ onLogout, loggingOut }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard' || pathname === '/admin'
    if (href === '/admin/blogs') return pathname === '/admin/blogs' || pathname.startsWith('/admin/blogs/')
    return pathname === href
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-lg font-bold text-white whitespace-nowrap">4uPDF <span className="text-blue-500">Admin</span></span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-[#1e293b] text-white shadow-lg shadow-blue-500/5'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />
              )}
            </Link>
          )
        })}

        <div className="pt-3 mt-3 border-t border-slate-700/50">
          <Link
            href="/"
            target="_blank"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
            title={collapsed ? 'View Site' : undefined}
          >
            <ExternalLink className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">View Site</span>}
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700/50">
        <button
          onClick={onLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full disabled:opacity-50"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>}
        </button>
      </div>

      {/* Collapse Toggle - desktop only */}
      <div className="hidden lg:block px-3 py-3 border-t border-slate-700/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#1e293b] border border-slate-700 rounded-xl flex items-center justify-center text-white hover:bg-slate-700 transition-all"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full bg-[#0f172a] border-r border-slate-700/50 z-50 transition-transform duration-300 w-64 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block flex-shrink-0 bg-[#0f172a] border-r border-slate-700/50 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
