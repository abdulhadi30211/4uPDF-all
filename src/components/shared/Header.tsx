'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X, Menu, FileText, Zap } from 'lucide-react'
import { TOOLS, TOOL_CATEGORIES, getToolsByCategory, POPULAR_TOOLS } from '@/lib/tools-data'

interface HeaderProps {
  currentPath?: string
}

export default function Header({ currentPath = '/' }: HeaderProps) {
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('popular')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Search filter
  const filteredTools = searchQuery
    ? TOOLS.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.desc.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 12)
    : []

  const currentCategoryTools = getToolsByCategory(activeCategory)

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-white">4uPDF<span className="text-blue-500">-all</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPath === '/' ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              Home
            </Link>

            {/* Tools Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${toolsOpen ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                All Tools
                <ChevronDown size={14} className={`transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  {/* Category Tabs */}
                  <div className="flex gap-0 border-b border-slate-700 overflow-x-auto px-2 pt-2">
                    {TOOL_CATEGORIES.map(cat => {
                      const Icon = cat.icon
                      const count = getToolsByCategory(cat.id).length
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${activeCategory === cat.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                          <Icon size={13} />
                          {cat.name}
                          <span className="text-[10px] text-slate-600">({count})</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Tools Grid */}
                  <div className="p-4 max-h-[360px] overflow-y-auto">
                    {activeCategory === 'popular' && (
                      <div className="mb-4 px-2">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap size={14} className="text-yellow-500" />
                          <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wider">Most Popular Tools</span>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {currentCategoryTools.map((tool, i) => {
                        const Icon = tool.icon
                        return (
                          <a
                            key={i}
                            href={tool.href}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-700/50 transition-all group"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                              style={{ backgroundColor: tool.color + '20' }}
                            >
                              <Icon size={16} style={{ color: tool.color }} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-white text-sm font-medium truncate group-hover:text-blue-400 transition-colors">{tool.name}</div>
                              <div className="text-slate-500 text-[10px] truncate">{tool.desc}</div>
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-700 px-4 py-3 flex items-center justify-between">
                    <span className="text-slate-500 text-xs">{TOOLS.length} tools available</span>
                    <Link
                      href="/#tools"
                      onClick={() => setToolsOpen(false)}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                    >
                      View All Tools
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPath.startsWith('/blog') ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              Blog
            </Link>
          </nav>

          {/* Right Section - Search & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Search size={18} />
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-[400px] bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="p-3">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tools, features, articles..."
                        className="w-full pl-9 pr-9 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {searchQuery && (
                    <div className="border-t border-slate-700 max-h-[320px] overflow-y-auto">
                      {filteredTools.length > 0 ? (
                        <div className="p-2">
                          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tools</div>
                          {filteredTools.map((tool, i) => {
                            const Icon = tool.icon
                            return (
                              <a
                                key={i}
                                href={tool.href}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-all group"
                              >
                                <div
                                  className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: tool.color + '20' }}
                                >
                                  <Icon size={14} style={{ color: tool.color }} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">{tool.name}</div>
                                  <div className="text-slate-500 text-[10px]">{tool.desc}</div>
                                </div>
                              </a>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-slate-500 text-sm">No results for &ldquo;{searchQuery}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!searchQuery && (
                    <div className="border-t border-slate-700 p-3">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Popular Tools</div>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_TOOLS.slice(0, 6).map((tool, i) => {
                          const Icon = tool.icon
                          return (
                            <a
                              key={i}
                              href={tool.href}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-300 hover:text-blue-400 hover:bg-slate-700 transition-all"
                            >
                              <Icon size={12} style={{ color: tool.color }} />
                              {tool.name}
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0f172a]">
          <div className="px-4 py-3">
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {searchQuery ? (
              <div className="max-h-[300px] overflow-y-auto space-y-1">
                {filteredTools.map((tool, i) => {
                  const Icon = tool.icon
                  return (
                    <a
                      key={i}
                      href={tool.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 transition-all"
                    >
                      <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: tool.color + '20' }}>
                        <Icon size={14} style={{ color: tool.color }} />
                      </div>
                      <span className="text-white text-sm">{tool.name}</span>
                    </a>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-1">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800 transition-all">Home</Link>
                <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800 transition-all">Blog</Link>
                <div className="pt-2 border-t border-slate-800 mt-2">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Popular Tools</div>
                  {POPULAR_TOOLS.slice(0, 8).map((tool, i) => {
                    const Icon = tool.icon
                    return (
                      <a key={i} href={tool.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 transition-all">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: tool.color + '20' }}>
                          <Icon size={14} style={{ color: tool.color }} />
                        </div>
                        <span className="text-white text-sm">{tool.name}</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
